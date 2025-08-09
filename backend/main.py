import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import json
import os

# ✨ OpenAI 라이브러리 import
import openai

# ✨ dotenv 라이브러리 import
from dotenv import load_dotenv

# ✨ .env 파일에서 환경 변수를 로드
load_dotenv()


# --- Pydantic 모델 정의 (변경 없음) ---
class TextIn(BaseModel):
    text: str

class InterviewDataIn(BaseModel):
    data: List[Dict[str, Any]]

class BatchAnalysisIn(BaseModel):
    data: List[Dict[str, Any]]
    column_name: str


# --- FastAPI 앱 및 CORS 설정 (변경 없음) ---
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- OpenAI 클라이언트 설정 (변경 없음) ---
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

try:
    if not OPENAI_API_KEY:
        raise ValueError("OpenAI API 키가 설정되지 않았습니다. .env 파일을 확인하세요.")

    openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)
    GPT_MODEL_NAME = "gpt-4o-mini" # 추천: 비용 효율적인 고성능 모델
    print("✅ OpenAI (GPT) 클라이언트 초기화 성공!")

except Exception as e:
    print(f"💥 OpenAI 클라이언트 초기화 실패: {e}")
    openai_client = None


# --- 엔드포인트 1: GPT 기반 키워드 추출 (배치 처리) (변경 없음) ---
@app.post("/extract-keywords-llm-batch")
async def extract_keywords_llm_batch(payload: BatchAnalysisIn):
    """
    전체 데이터와 분석할 컬럼명을 받아, 10개씩 묶어 GPT로 키워드를 추출하고 결과를 한 번에 반환합니다.
    """
    if not openai_client:
        raise HTTPException(status_code=500, detail="OpenAI 클라이언트가 초기화되지 않았습니다.")

    column = payload.column_name
    
    entries = [
        (row['uniqueId'], row.get(column, ''))
        for row in payload.data
        if row.get(column) and isinstance(row.get(column), str) and row.get(column).strip()
    ]
    if not entries:
        return {}

    chunks = [entries[i:i + 10] for i in range(0, len(entries), 10)]
    final_result = {}

    for chunk in chunks:
        user_prompt = "\n\n".join(
            [f"--- ID: {uid} ---\n{opinion}" for uid, opinion in chunk]
        )

        system_prompt = f"""
당신은 SK엔무브의 HR 데이터 분석 전문가입니다.
아래에 제시된 각 구성원의 의견(`{column}`)에서 핵심 키워드를 각각 추출하세요.
키워드는 해당 구성원의 핵심적인 의견, 요구사항을 나타내야 합니다.
반드시 아래 요청된 JSON 형식으로만 응답해야 하며, 다른 설명은 포함하지 마세요.

- 각 키워드는 'word'와 'score'를 키로 갖는 객체여야 합니다.
- 최종 결과는 각 'ID'를 키로 하고, 키워드 객체 배열을 값으로 하는 JSON 객체여야 합니다.

[응답 형식 예시]
{{
  "row_0": [ {{"word": "성장", "score": 0.91}}, {{"word": "프로젝트", "score": 0.85}} ],
  "row_1": [ {{"word": "리더십", "score": 0.87}}, {{"word": "소통", "score": 0.82}} ],
  "row_2": [ {{"word": "보상", "score": 0.95}} ]
}}
"""

        try:
            response = openai_client.chat.completions.create(
                model=GPT_MODEL_NAME,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
            )
            content = response.choices[0].message.content
            batch_result = json.loads(content)
            final_result.update(batch_result)

        except Exception as e:
            print(f"Batch 처리 중 오류 발생 (Chunk: {[uid for uid, _ in chunk]}): {e}")
            for uid, _ in chunk:
                final_result[uid] = []

    return final_result


# --- ✨ [추가] 엔드포인트: 인사이동 희망 여부 분석 ---
@app.post("/analyze-transfer-intent")
async def analyze_transfer_intent(payload: InterviewDataIn):
    transfer_keywords = ['이동', '변경']
    hopefuls = []
    others = []
    try:
        for row in payload.data:
            # 💡 아래 컬럼명은 실제 데이터에 맞게 확인/수정해야 합니다.
            opinion_text = row.get('(2) 성장/역량/커리어-구성원 의견', '')
            if opinion_text and any(keyword in opinion_text for keyword in transfer_keywords):
                hopefuls.append(row)
            else:
                others.append(row)
        return {
            "transfer_hopefuls": hopefuls,
            "others": others
        }
    except Exception as e:
        print(f"💥 인사이동 분석 오류: {e}")
        raise HTTPException(status_code=500, detail=f"인사이동 희망 여부 분석 중 오류 발생: {e}")


# --- 엔드포인트 5: GPT 기반 HR 추천안 생성 (변경 없음) ---
@app.post("/generate-suggestion")
async def generate_suggestion(data: TextIn):
    if not openai_client:
        raise HTTPException(status_code=500, detail="OpenAI 클라이언트가 초기화되지 않았습니다.")

    system_prompt = """
당신은 SK엔무브(SK enmove)의 HR 전문 컨설턴트입니다. 당신의 역할은 구성원의 의견을 분석하여, HR 담당자가 즉시 실행할 수 있는 구체적인 개선 방안을 제안하는 것입니다.
제안은 반드시 아래에 명시된 'SK엔무브 구성원 성장지원 프로그램'을 기반으로 해야 합니다.
--- SK엔무브 구성원 성장지원 프로그램 ---
1. 일을 통한 성장 (경험)
   - 자기 주도적 Career 설계 및 실행 지원
   - TF 등을 통한 필요한 전문성의 자유로운 활용/육성
2. 역할을 통한 성장
   - 리더로 성장을 위한 선제적이고 체계적인 육성 프로그램 참여
   - 리더십 개발 및 조직개발 프로그램 지원
3. 학습을 통한 성장
   - 미래 필요 역량 및 공통역량 강화 지원
   - 중장기 Biz 수행 역량 개발 및 전문성 강화 지원 (연수 프로그램 등)
   - Global 역량 개발 지원
4. 역량 발휘 환경 지원
   - 구성원 Mental Care (구성원 심리 상담, Newcomer Counseling 등)
   - 구성원 Physical Care (사내 헬스 트레이닝 지원 등)
---
지시사항: 아래 구성원의 의견을 바탕으로, 위 프로그램 중 가장 적합한 해결책을 찾아 구체적인 실행 방안을 **한국어 한 문장**으로 제안하세요.
출력 예시: "새로운 프로젝트 리딩 경험을 쌓고 싶다는 의견에 따라, 유관 부서의 신규 TF에 참여하여 전문성을 활용하고 리더십을 키울 기회를 제공하는 것을 고려해볼 수
있겠습니다."
"""
    user_prompt = f"다음 SK엔무브 구성원의 의견에 대한 맞춤형 HR 추천안을 지시사항에 맞게 한 문장으로 만들어주세요:\n\n{data.text}"

    try:
        response = openai_client.chat.completions.create(
            model=GPT_MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
        )
        suggestion = response.choices[0].message.content.strip()

        if not suggestion:
            return {"suggestion": "AI 추천안을 생성할 수 없습니다."}

        return {"suggestion": suggestion}

    except openai.APIError as e:
        raise HTTPException(status_code=503, detail=f"OpenAI API 호출에 실패했습니다: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"추천안 생성 중 서버 오류 발생: {e}")


@app.get("/")
def read_root():
    return {"message": "HR 면담 분석 API, 3개 엔드포인트 실행 중"}

# uvicorn 서버 실행 (로컬 테스트용)
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)