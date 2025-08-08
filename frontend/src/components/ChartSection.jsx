import React from "react";
import Plot from "react-plotly.js";

// 공통 차트 스타일을 정의할 수도 있음 (선택)
const chartLayout = (title) => ({
  title,
  xaxis: { title: "키워드" },
  yaxis: { title: "빈도 수" },
  height: 400,
});

const ChartSection = ({ filteredData }) => {
  if (!filteredData || filteredData.length === 0) {
    return <p className="text-center text-gray-500">시각화할 데이터가 없습니다.</p>;
  }

  // 1. 키워드 집계 예시 (성장 관련 키워드 분석 등)
  const keywordCounts = {};
  filteredData.forEach((row) => {
    const keyword = row["(2) 성장/역량/커리어-구성원 의견"];
    if (keyword) {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    }
  });

  const keywords = Object.keys(keywordCounts);
  const counts = Object.values(keywordCounts);

  const keywordTrace = {
    type: "bar",
    x: keywords,
    y: counts,
    marker: { color: "lightseagreen" },
  };

  // 2. 구성원-리더 유사도 분석 예시 (단순 텍스트 비교 기준)
  const similarityScores = filteredData.map((row) => {
    const member = row["(1) 업무-구성원 의견"] || "";
    const leader = row["(1) 업무-리더 의견"] || "";
    return member && leader ? computeSimilarity(member, leader) : null;
  }).filter((score) => score !== null);

  const similarityTrace = {
    x: similarityScores,
    type: "histogram",
    marker: { color: "cornflowerblue" },
  };

  return (
    <div className="space-y-10">
      <Plot
        data={[keywordTrace]}
        layout={chartLayout("성장 키워드 빈도 분석")}
      />
      <Plot
        data={[similarityTrace]}
        layout={{
          title: "구성원-리더 의견 유사도 분포",
          xaxis: { title: "유사도 (0~1)" },
          yaxis: { title: "빈도" },
          height: 400,
        }}
      />
    </div>
  );
};

// 아주 간단한 유사도 함수 (Jaccard 유사도 기반)
function computeSimilarity(str1, str2) {
  const set1 = new Set(str1.split(/\s+/));
  const set2 = new Set(str2.split(/\s+/));
  const intersection = new Set([...set1].filter((w) => set2.has(w)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size || 0;
}

export default ChartSection;
