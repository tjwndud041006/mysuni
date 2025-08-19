import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { Upload, Download, BarChart3, FileSpreadsheet, TrendingUp, Users, UserCheck,  Bell, User, Settings, MessageSquare, Tag, Hash, Zap, X, Briefcase, Home, Filter, Calendar, Building2, Award, CheckCircle2, AlertCircle, ArrowRight, Activity, Sparkles, Eye } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// ✨ [수정] LLM 분석 전용으로 API 호출 함수 간소화
const runKeywordAnalysis = async (data, columnName, onProgress) => {
  // 분석할 유효한 데이터만 필터링
  const itemsToProcess = data
    .map(row => ({ id: row.uniqueId, text: row[columnName] }))
    .filter(item => item.text && typeof item.text === 'string' && item.text.trim().length >= 5);

  if (itemsToProcess.length === 0) {
    if (onProgress) onProgress(1, 1);
    return {};
  }

  // LLM 모드는 전체 데이터를 한번에 백엔드로 전송
  const endpoint = '/extract-keywords-llm-batch';
  const payload = {
    data: data, // uniqueId를 포함한 전체 원본 데이터 전달
    column_name: columnName,
  };

  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      // API 실패 시 모든 항목을 빈 배열로 처리
      const allKeywordData = {};
      itemsToProcess.forEach(item => { allKeywordData[item.id] = []; });
      return allKeywordData;
    }
  } catch (error) {
    console.error("LLM Batch analysis error:", error);
    const allKeywordData = {};
    itemsToProcess.forEach(item => { allKeywordData[item.id] = []; });
    return allKeywordData;
  } finally {
    // 이 단계의 분석이 완료되었음을 알림
    if (onProgress) onProgress(1, 1);
  }
};


const FileUploader = ({ onFileUpload }) => { 
     const [isDragging, setIsDragging] = useState(false); 
     const handleDragEnter = (e) => { e.preventDefault(); setIsDragging(true); }; 
     const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); }; 
     const handleDragOver = (e) => { e.preventDefault(); }; 
     const handleDrop = (e) => { 
       e.preventDefault(); 
       setIsDragging(false); 
       const files = e.dataTransfer.files; 
       if (files.length > 0) onFileUpload(files[0]); 
     }; 
     const handleFileSelect = (e) => { 
       const file = e.target.files[0]; 
       if (file) onFileUpload(file); 
     }; 
      
     return ( 
       <div className="w-full max-w-2xl mx-auto"> 
         <div className="text-center mb-8"> 
           <h2 className="text-2xl font-bold text-gray-900 mb-2">면담 데이터 분석 시작</h2> 
           <p className="text-gray-600">Excel 파일을 업로드하여 AI 기반 분석을 시작하세요</p> 
         </div> 
          
         <div 
           className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer group ${ 
             isDragging  
               ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl scale-105"  
               : "border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 hover:shadow-lg" 
           }`} 
           onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} 
           onClick={() => document.getElementById("fileInput").click()} 
         > 
           <div className="flex flex-col items-center space-y-6"> 
             <div className={`p-4 rounded-full transition-all duration-300 ${ 
               isDragging  
                 ? "bg-blue-100 scale-110 shadow-lg"  
                 : "bg-gray-100 group-hover:bg-blue-100 group-hover:scale-105" 
             }`}> 
               <Upload className={`w-12 h-12 transition-all duration-300 ${ 
                 isDragging ? "text-blue-600 animate-bounce" : "text-gray-500 group-hover:text-blue-600" 
               }`} /> 
             </div> 
              
             <div className="space-y-4"> 
               <div> 
                 <h3 className="text-xl font-bold text-gray-900 mb-2"> 
                   {isDragging ? "파일을 여기에 놓으세요" : "Excel 파일 업로드"} 
                 </h3> 
                 <p className="text-gray-600 mb-6"> 
                   .xlsx 또는 .xls 파일을 드래그하여 놓거나 클릭하여 선택하세요 
                 </p> 
               </div> 
                
               <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"> 
                 <FileSpreadsheet className="w-5 h-5 mr-2" /> 
                 파일 선택하기 
               </button> 
             </div> 
              
             <div className="flex items-center space-x-6 text-sm text-gray-500"> 
               <div className="flex items-center"> 
                 <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" /> 
                 빠른 업로드 
               </div> 
               <div className="flex items-center"> 
                 <Sparkles className="w-4 h-4 mr-1 text-purple-500" /> 
                 AI 분석 
               </div> 
               <div className="flex items-center"> 
                 <Award className="w-4 h-4 mr-1 text-yellow-500" /> 
                 실시간 결과 
               </div> 
             </div> 
           </div> 
           <input id="fileInput" type="file" accept=".xlsx,.xls" onChange={handleFileSelect} className="hidden" /> 
         </div> 
       </div> 
     ); 
 }; 
 const OpinionCard = ({ item }) => {
  const [suggestion, setSuggestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleCardClick = async () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && !suggestion) {
      setIsLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/generate-suggestion`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: item.opinion }),
        });
        if (response.ok) {
          const data = await response.json();
          setSuggestion(data.suggestion);
        } else {
          setSuggestion("AI 추천안을 불러오는 데 실패했습니다.");
        }
      } catch (error) {
        console.error("Suggestion fetch error:", error);
        setSuggestion("AI 추천안 로딩 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div 
      className="bg-gradient-to-r from-white to-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={handleCardClick}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-center mb-3"> 
            <div className="p-2 bg-blue-100 rounded-full mr-3"> 
              <User className="w-4 h-4 text-blue-600"/> 
            </div> 
            <div> 
              <span className="font-bold text-gray-800">{item.name}</span> 
              {/* ▼▼▼▼▼ [수정된 부분] ▼▼▼▼▼ */}
              <div className="flex items-center mt-1 text-sm text-gray-600"> 
                <Building2 className="w-3 h-3 mr-1" /> 
                <span>{item.job}</span> 
                <Calendar className="w-3 h-3 ml-3 mr-1" /> 
                <span>{item.year}</span>
                <Tag className="w-3 h-3 ml-3 mr-1 text-green-600" />
                <span className="font-semibold">{item.quarter}</span>
              </div>
              {/* ▲▲▲▲▲ [수정된 부분] ▲▲▲▲▲ */}
            </div> 
          </div> 
          <div className="bg-white p-3 rounded-lg border border-gray-100"> 
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap"> 
              {item.opinion} 
            </p> 
          </div> 
        </div>
        {isExpanded && (
          <div className="lg:w-2/5 flex flex-col">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 h-full flex flex-col">
              <h6 className="font-bold text-sm text-blue-800 mb-3 flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
                AI 기반 맞춤 제안
              </h6>
              <div className="flex-grow flex items-center justify-center">
                {isLoading ? (
                  <p className="text-sm text-gray-500 animate-pulse">AI가 제안을 생성 중입니다...</p>
                ) : (
                  <p className="text-sm text-gray-800 leading-relaxed">{suggestion}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
// App.jsx 또는 관련 컴포넌트 파일
const KeywordDashboard = ({ title, icon: Icon, filteredData, allKeywordData, opinionColumn }) => { 
  const [localJob, setLocalJob] = useState('all'); 
  const [localYear, setLocalYear] = useState('all'); 
  const [selectedKeyword, setSelectedKeyword] = useState(null); 
  const [relatedOpinions, setRelatedOpinions] = useState([]); 
  const localJobOptions = useMemo(() => ["all", ...new Set(filteredData.map(item => item.직무 || ""))].filter(Boolean), [filteredData]); 
  const localYearOptions = useMemo(() => ["all", ...new Set(filteredData.map(item => item.직무연차 || ""))].filter(Boolean), [filteredData]); 

  const groupedKeywords = useMemo(() => { 
      const locallyFilteredData = filteredData.filter(item => { 
          const jobMatch = localJob === 'all' || item.직무 === localJob; 
          const yearMatch = localYear === 'all' || item.직무연차 === localYear; 
          return jobMatch && yearMatch; 
      }); 

      if (locallyFilteredData.length === 0 || !allKeywordData || Object.keys(allKeywordData).length === 0) { 
          return {}; 
      } 

      const keywordMap = locallyFilteredData.reduce((acc, row) => { 
          const groupKey = (localJob === 'all' && localYear === 'all') ? '전체' : row['직무'] || '기타'; 
          
          if (!acc[groupKey]) acc[groupKey] = {}; 
          const keywords = allKeywordData[row.uniqueId]; 
          
          if (keywords && keywords.length > 0) { 
              keywords.forEach(({ word, score }) => { 
                  if (!acc[groupKey][word]) acc[groupKey][word] = { totalScore: 0, count: 0 }; 
                  acc[groupKey][word].totalScore += score; 
                  acc[groupKey][word].count += 1; 
              }); 
          } 
          return acc; 
      }, {}); 

      const finalGroupedKeywords = {}; 
      for (const group in keywordMap) { 
          finalGroupedKeywords[group] = Object.entries(keywordMap[group]) 
              .map(([word, data]) => ({ 
                  word, 
                  score: data.totalScore / data.count, 
                  count: data.count, 
              })) 
              .sort((a, b) => b.count - a.count || b.score - a.score) 
              .slice(0, 15); 
      } 
      return finalGroupedKeywords; 
  }, [filteredData, allKeywordData, localJob, localYear]); 

  const handleKeywordClick = (keyword) => { 
      if (selectedKeyword === keyword) { 
          setSelectedKeyword(null); 
          setRelatedOpinions([]); 
          return; 
      } 
      
      const currentlyVisibleIds = new Set(
        filteredData
            .filter(item => {
                const jobMatch = localJob === 'all' || item.직무 === localJob;
                const yearMatch = localYear === 'all' || item.직무연차 === localYear;
                return jobMatch && yearMatch;
            })
            .map(item => item.uniqueId)
      );

      const opinionIdsWithKeyword = Object.entries(allKeywordData)
          .filter(([uniqueId, keywords]) => 
              currentlyVisibleIds.has(uniqueId) && 
              keywords.some(kw => kw.word === keyword)
          )
          .map(([uniqueId]) => uniqueId);

      // ▼▼▼▼▼ [수정된 부분] ▼▼▼▼▼
      const opinions = filteredData
          .filter(row => opinionIdsWithKeyword.includes(row.uniqueId))
          .map((row, index) => ({
              id: `${row.uniqueId}_${index}`,
              name: row.이름,
              job: row.직무,
              year: row.직무연차,
              quarter: row.분기, // '분기' 정보를 여기에 추가합니다.
              opinion: row[opinionColumn]
          }));
      // ▲▲▲▲▲ [수정된 부분] ▲▲▲▲▲
      
      setRelatedOpinions(opinions);
      setSelectedKeyword(keyword);
    };

  const KeywordBarChart = ({ keywords, groupName }) => { 
    const top5Keywords = keywords.slice(0, 5); 
    const maxCount = top5Keywords.length > 0 ? Math.max(...top5Keywords.map(k => k.count)) : 1; 
    return ( 
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 h-full flex flex-col border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-gray-900 flex items-center text-lg">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                {groupName}
              </h4>
              <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">TOP 5</div>
            </div>
            <div className="space-y-4 flex-grow">
              {top5Keywords.map(({ word, count }, index) => (
                <div key={word} className="group">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' : index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' : 'bg-gradient-to-r from-blue-400 to-blue-500'}`}>
                        {index + 1}
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{word}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-gray-700 mr-2">{count}</span>
                      <span className="text-xs text-gray-500">회</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out shadow-sm" style={{ width: `${(count / maxCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
        </div> 
    ); 
  }; 
  
  const numGroups = Object.keys(groupedKeywords).length; 

  return ( 
    <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"> 
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4"> 
            <div className="flex items-center"> 
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mr-4 shadow-lg"> 
                    <Icon className="w-6 h-6 text-white" /> 
                </div> 
                <div> 
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3> 
                    <p className="text-sm text-gray-600 mt-1">AI가 분석한 주요 키워드를 확인하세요</p> 
                </div> 
            </div> 
            <div className="flex items-center gap-3"> 
                <div className="flex items-center bg-gray-50 rounded-lg p-1"> 
                    <Filter className="w-4 h-4 text-gray-500 ml-2" /> 
                    <select value={localJob} onChange={(e) => setLocalJob(e.target.value)} className="bg-transparent border-0 text-sm font-medium text-gray-700 focus:ring-0 px-2"> 
                        {localJobOptions.map(option => <option key={option} value={option}>{option === 'all' ? '전체 직무' : option}</option>)} 
                    </select> 
                </div> 
                <div className="flex items-center bg-gray-50 rounded-lg p-1"> 
                    <Calendar className="w-4 h-4 text-gray-500 ml-2" /> 
                    <select value={localYear} onChange={(e) => setLocalYear(e.target.value)} className="bg-transparent border-0 text-sm font-medium text-gray-700 focus:ring-0 px-2"> 
                        {localYearOptions.map(option => <option key={option} value={option}>{option === 'all' ? '전체 연차' : option}</option>)} 
                    </select> 
                </div> 
            </div> 
        </div> 
        
        {numGroups > 0 ? ( 
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> 
                {Object.entries(groupedKeywords).map(([group, keywords]) => ( 
                    <React.Fragment key={group}> 
                        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200"> 
                            <div className="flex items-center justify-between mb-4"> 
                                <h4 className="font-bold text-gray-900 text-lg flex items-center"> 
                                    <div className="p-2 bg-white rounded-lg mr-3 shadow-sm"> 
                                        <Tag className="w-5 h-5 text-blue-600" /> 
                                    </div> 
                                    {group} 
                                </h4> 
                                <div className="px-3 py-1 bg-white text-gray-700 text-xs font-semibold rounded-full shadow-sm">{keywords.length}개 키워드</div> 
                            </div> 
                            <div className="flex flex-wrap gap-2"> 
                                {keywords.map(({ word, count }, index) => ( 
                                    <button key={word} title={`클릭하여 관련 의견 보기 (빈도: ${count})`} onClick={() => handleKeywordClick(word)} className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold cursor-pointer border-2 transition-all duration-200 transform hover:scale-105 hover:shadow-md ${selectedKeyword === word ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg' : index < 3 ? 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}> 
                                        <Hash className="w-3 h-3 mr-1" />{word}<span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">{count}</span> 
                                    </button> 
                                ))} 
                            </div> 
                        </div> 
                        {numGroups === 1 && <KeywordBarChart keywords={keywords} groupName={group} />} 
                    </React.Fragment> 
                ))} 
            </div> 
        ) : ( 
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl"> 
                <div className="p-4 bg-white rounded-full w-20 h-20 mx-auto mb-4 shadow-lg"><MessageSquare className="w-12 h-12 text-gray-400" /></div> 
                <p className="text-gray-600 font-medium text-lg">해당 조건의 분석 데이터가 없습니다</p> 
                <p className="text-gray-500 text-sm mt-1">다른 필터 조건을 선택해보세요</p> 
            </div> 
        )} 

        {selectedKeyword && ( 
            <div className="mt-6 pt-6 border-t-2 border-gray-100"> 
                <div className="flex justify-between items-center mb-6"> 
                    <div className="flex items-center"> 
                        <div className="p-2 bg-blue-100 rounded-lg mr-3"><Eye className="w-5 h-5 text-blue-600" /></div> 
                        <div> 
                            <h4 className="font-bold text-gray-900 text-lg"> 
                                <span className="text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-bold">"{selectedKeyword}"</span> 관련 상세 정보
                            </h4> 
                            <p className="text-sm text-gray-600 mt-1">{relatedOpinions.length}건의 관련 의견을 찾았습니다</p> 
                        </div> 
                    </div> 
                    <button onClick={() => setSelectedKeyword(null)} className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"> 
                        <X className="w-6 h-6 text-gray-500" /> 
                    </button> 
                </div>
                <div className="space-y-4 max-h-[40rem] overflow-y-auto pr-2">
                    {relatedOpinions.length > 0 ? (
                        relatedOpinions.map((item) => (
                            <OpinionCard key={item.id} item={item} />
                        ))
                    ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-xl"> 
                            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" /> 
                            <p className="text-gray-500">관련 의견을 찾을 수 없습니다</p> 
                        </div>
                    )}
                </div>
            </div> 
        )} 
    </div> 
  ); 
};
  
const TransferAnalysis = ({ filteredData, analysisResult, totalUniqueEmployees }) => { 
  const [selectedUser, setSelectedUser] = useState(null); 
  const [localJob, setLocalJob] = useState('all'); 
  const [localYear, setLocalYear] = useState('all'); 
  const localJobOptions = useMemo(() => ["all", ...new Set(filteredData.map(item => item.직무 || ""))].filter(Boolean), [filteredData]); 
  const localYearOptions = useMemo(() => ["all", ...new Set(filteredData.map(item => item.직무연차 || ""))].filter(Boolean), [filteredData]); 
  
  const displayData = useMemo(() => {
    const locallyFilteredData = filteredData.filter(item => {
      const jobMatch = localJob === 'all' || item.직무 === localJob;
      const yearMatch = localYear === 'all' || item.직무연차 === localYear;
      return jobMatch && yearMatch;
    });

    const filteredUniqueEmployees = new Set(locallyFilteredData.map(item => item.이름)).size;
    
    const uniqueHopefulsMap = analysisResult.transfer_hopefuls.reduce((acc, user) => {
        if (user.이름 && !acc[user.이름]) {
            acc[user.이름] = user;
        }
        return acc;
    }, {});
    const uniqueHopefuls = Object.values(uniqueHopefulsMap);
    
    const hopefulUniqueIds = new Set(uniqueHopefuls.map(user => user.이름));

    const hopefulCountInFilter = new Set(
        locallyFilteredData
            .filter(item => hopefulUniqueIds.has(item.이름))
            .map(item => item.이름)
    ).size;
    
    return { 
      hopefuls: uniqueHopefuls.filter(user => {
          const userInData = locallyFilteredData.find(item => item.이름 === user.이름);
          return !!userInData;
      }),
      total: filteredUniqueEmployees,
      hopeCount: hopefulCountInFilter,
      hopePercentage: filteredUniqueEmployees > 0 ? Math.round((hopefulCountInFilter / filteredUniqueEmployees) * 100) : 0, 
    }; 
  }, [filteredData, analysisResult, localJob, localYear]); 

  const selectedUserOpinions = useMemo(() => {
    if (!selectedUser) return [];
    
    const transferKeywords = ['이동', '변경'];
    return filteredData.filter(row => 
      row.이름 === selectedUser.이름 &&
      row['(2) 성장/역량/커리어-구성원 의견'] &&
      transferKeywords.some(keyword => row['(2) 성장/역량/커리어-구성원 의견'].includes(keyword))
    );
  }, [selectedUser, filteredData]);
  
  const jobSpecificData = useMemo(() => {
    const locallyFilteredData = filteredData.filter(item => {
        const jobMatch = localJob === 'all' || item.직무 === localJob;
        const yearMatch = localYear === 'all' || item.직무연차 === localYear;
        return jobMatch && yearMatch;
    });
    const hopefulIds = new Set(analysisResult.transfer_hopefuls.map(u => u.이름));
    const statsByJob = {};
    locallyFilteredData.forEach(item => {
        const job = item.직무 || "기타";
        if (!statsByJob[job]) {
            statsByJob[job] = { total: 0, hopefuls: 0 };
        }
        statsByJob[job].total++;
        if (hopefulIds.has(item.이름)) {
            statsByJob[job].hopefuls++;
        }
    });
    return Object.entries(statsByJob).map(([job, data]) => ({
        job,
        ...data,
        percentage: data.total > 0 ? Math.round((data.hopefuls / data.total) * 100) : 0,
    })).sort((a, b) => b.hopefuls - a.hopefuls);
  }, [filteredData, analysisResult, localJob, localYear]);

  const DonutChart = ({ percentage }) => ( 
    <div className="relative w-28 h-28 flex items-center justify-center"> 
      <svg className="w-full h-full" viewBox="0 0 36 36" transform="rotate(-90)"> 
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3" /> 
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="url(#gradient)" strokeWidth="3" strokeDasharray={`${percentage}, 100`} /> 
        <defs> 
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%"> 
            <stop offset="0%" stopColor="#3b82f6" /> 
            <stop offset="100%" stopColor="#1d4ed8" /> 
          </linearGradient> 
        </defs> 
      </svg> 
      <div className="absolute text-center"> 
        <span className="block text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{displayData.hopePercentage}%</span> 
        <span className="text-xs text-gray-600 font-semibold">희망</span> 
      </div> 
    </div> 
  ); 

  const downloadHopefulsCSV = () => { 
    if (displayData.hopefuls.length === 0) { 
        alert("다운로드할 인사이동 희망자 데이터가 없습니다."); 
        return; 
    } 
    const dataToExport = displayData.hopefuls.map(({ uniqueId, ...rest }) => rest); 
    const csv = Papa.unparse(dataToExport); 
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" }); 
    const url = URL.createObjectURL(blob); 
    const link = document.createElement("a"); 
    link.href = url; 
    link.download = "transfer_hopefuls_data.csv"; 
    link.click(); 
    URL.revokeObjectURL(url); 
  }; 

  return ( 
    <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"> 
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4"> 
        <div className="flex items-center"> 
          <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mr-4 shadow-lg"> 
            <UserCheck className="w-6 h-6 text-white" /> 
          </div> 
          <div> 
            <h3 className="text-xl font-bold text-gray-900">인사이동 희망 여부 분석</h3> 
            <p className="text-sm text-gray-600 mt-1">AI가 분석한 인사이동 희망 현황을 확인하세요</p> 
          </div> 
        </div> 
        <div className="flex items-center gap-3"> 
          <div className="flex items-center bg-gray-50 rounded-lg p-1"> 
            <Filter className="w-4 h-4 text-gray-500 ml-2" /> 
            <select value={localJob} onChange={(e) => setLocalJob(e.target.value)} className="bg-transparent border-0 text-sm font-medium text-gray-700 focus:ring-0 px-2"> 
              {localJobOptions.map(option => <option key={option} value={option}>{option === 'all' ? '전체 직무' : option}</option>)} 
            </select> 
          </div> 
          <div className="flex items-center bg-gray-50 rounded-lg p-1"> 
            <Calendar className="w-4 h-4 text-gray-500 ml-2" /> 
            <select value={localYear} onChange={(e) => setLocalYear(e.target.value)} className="bg-transparent border-0 text-sm font-medium text-gray-700 focus:ring-0 px-2"> 
              {localYearOptions.map(option => <option key={option} value={option}>{option === 'all' ? '전체 연차' : option}</option>)} 
            </select> 
          </div> 
          <button onClick={downloadHopefulsCSV} className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"> 
            <Download className="w-4 h-4 mr-2" /> 
            CSV 다운로드 
          </button> 
        </div> 
      </div> 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8"> 
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200 space-y-6"> 
          <div>
            <div className="flex items-center justify-between mb-6"> 
              <h4 className="font-bold text-gray-800 text-lg">전체 현황</h4> 
              <Activity className="w-6 h-6 text-blue-600" /> 
            </div> 
            <div className="flex items-center justify-center space-x-8"> 
              <div className="text-center"> 
                <div className="p-3 bg-white rounded-full shadow-lg mb-3 inline-block"><UserCheck className="w-8 h-8 text-green-500" /></div> 
                <div className="font-bold text-2xl text-green-600 mb-1">{displayData.hopeCount}</div> 
                <div className="text-sm text-gray-600 font-semibold">희망자</div> 
              </div> 
              <DonutChart percentage={displayData.hopePercentage} /> 
              <div className="text-center"> 
                <div className="p-3 bg-white rounded-full shadow-lg mb-3 inline-block"><User className="w-8 h-8 text-gray-400" /></div> 
                <div className="font-bold text-2xl text-gray-600 mb-1">{displayData.total - displayData.hopeCount}</div> 
                <div className="text-sm text-gray-600 font-semibold">기타</div> 
              </div> 
            </div> 
            <div className="mt-6 pt-4 border-t border-blue-200"> 
              <div className="flex justify-between text-sm"> 
                <span className="text-gray-600">전체 인원</span> 
                <span className="font-bold text-gray-800">{displayData.total}명</span> 
              </div> 
            </div> 
          </div>
          {localJob === 'all' && jobSpecificData.length > 1 && (
            <div className="pt-6 border-t-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-800 text-lg">직무별 희망 현황</h4>
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {jobSpecificData.map(job => (
                  <div key={job.job}>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="font-semibold text-gray-700">{job.job}</span>
                      <span className="font-bold text-gray-800">{job.hopefuls}명 / <span className="text-gray-600">{job.total}명</span></span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full" style={{ width: `${job.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div> 
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <div className="flex items-center justify-between mb-4"> 
                    <h4 className="font-bold text-gray-800 text-lg flex items-center"><Users className="w-5 h-5 mr-2 text-blue-600" />희망자 목록</h4> 
                    <div className="px-4 py-2 bg-blue-100 text-blue-800 font-bold rounded-full">{displayData.hopefuls.length}명</div> 
                </div> 
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2"> 
                    {displayData.hopefuls.length > 0 ? ( 
                    displayData.hopefuls.map(user => ( 
                        <div 
                            key={user.이름} 
                            onClick={() => setSelectedUser(user)} 
                            className={`group p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer flex items-center ${
                                selectedUser?.이름 === user.이름 
                                ? 'bg-blue-100 border-blue-400 shadow-md' 
                                : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg'
                            }`}
                        > 
                            <div className="flex-shrink-0 mr-3"> 
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${selectedUser?.이름 === user.이름 ? 'bg-blue-500' : 'bg-gray-100 group-hover:bg-blue-100'}`}> 
                                    <User className={`w-5 h-5 ${selectedUser?.이름 === user.이름 ? 'text-white' : 'text-blue-600'}`} /> 
                                </div> 
                            </div> 
                            <div className="flex-grow min-w-0"> 
                                <p className="font-bold text-gray-800 truncate">{user.이름}</p> 
                                <div className="flex items-center mt-1 text-xs text-gray-500"> 
                                    <span className="truncate">{user.직무} • {user.직무연차}</span> 
                                </div> 
                            </div> 
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" /> 
                        </div> 
                    )) 
                    ) : ( 
                    <div className="flex items-center justify-center h-40 bg-gray-50 rounded-xl"> 
                        <div className="text-center"> 
                            <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" /> 
                            <p className="text-gray-500 text-sm">해당 조건의 희망자가 없습니다</p> 
                        </div> 
                    </div> 
                    )} 
                </div> 
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col">
                {selectedUser ? (
                    <>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center">
                                <div className="p-2 bg-white rounded-lg mr-3 shadow-sm">
                                    <MessageSquare className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">{selectedUser.이름}님의 상세 의견</h4>
                                    <p className="text-xs text-gray-500 mt-1">{selectedUser.직무} • {selectedUser.직무연차}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="flex-grow bg-white p-4 rounded-lg border border-gray-200 overflow-y-auto space-y-4">
                            {selectedUserOpinions.map((opinionRow) => (
                                <div key={opinionRow.uniqueId} className="pb-4 border-b border-gray-100 last:border-b-0">
                                    <p className="text-sm text-gray-500 font-semibold mb-2">{opinionRow.분기} 면담</p>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {opinionRow['(2) 성장/역량/커리어-구성원 의견']}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500">
                        <Eye className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="font-semibold">세부 의견 보기</p>
                        <p className="text-sm">왼쪽 목록에서 구성원을 선택하여<br />모든 이동 희망 의견을 확인하세요.</p>
                    </div>
                )}
            </div>
        </div>
      </div> 
    </div> 
  ); 
};








const StatCard = ({ title, value, subtitle, icon: Icon, color = "blue", trend }) => ( 
   <div className={`bg-gradient-to-br from-white to-${color}-50 rounded-xl p-6 shadow-lg border border-${color}-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}> 
     <div className="flex items-center justify-between"> 
       <div> 
         <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</p> 
         <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p> 
         {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>} 
         {trend && ( 
           <div className={`flex items-center mt-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}> 
             <TrendingUp className="w-4 h-4 mr-1" /> 
             <span className="font-semibold">{trend > 0 ? '+' : ''}{trend}%</span> 
           </div> 
         )} 
       </div> 
       <div className={`p-4 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-xl shadow-lg`}> 
         <Icon className="w-8 h-8 text-white" /> 
       </div> 
     </div> 
   </div> 
 );

 // App.jsx 파일 내부

const ChartSection = ({  
  filteredData,  
  transferAnalysisData,  
  workKeywords,  
  growthKeywords,  
  envKeywords  
}) => { 
  const totalUniqueEmployees = useMemo(() => 
      new Set(filteredData.map(item => item.이름)).size, 
      [filteredData]
  );
  
  const uniqueJobs = useMemo(() => 
      new Set(filteredData.map(item => item.직무)).size, 
      [filteredData]
  );
  
  // ✨ [수정] 백엔드에서 받은 고유 희망자 목록의 길이를 사용합니다.
  const transferHopefulsCount = transferAnalysisData 
       ? new Set(transferAnalysisData.transfer_hopefuls.map(user => user.이름)).size 
       : 0;
  
  return ( 
    <div className="space-y-8"> 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> 
        <StatCard 
          title="총 면담 인원" 
          value={totalUniqueEmployees} 
          subtitle="명"
          icon={Users} 
          color="blue" 
        /> 
        <StatCard 
          title="직무 유형" 
          value={uniqueJobs} 
          subtitle="개 직무" 
          icon={Building2} 
          color="green" 
        /> 
        <StatCard 
          title="인사이동 희망" 
          value={transferHopefulsCount} 
          subtitle="명" 
          icon={UserCheck} 
          color="purple" 
        /> 
      </div> 
      {transferAnalysisData && ( 
        <TransferAnalysis 
          totalUniqueEmployees={totalUniqueEmployees}
          filteredData={filteredData} 
          analysisResult={transferAnalysisData} 
        /> 
      )} 
      {workKeywords &&  
          <KeywordDashboard  
              title="업무 관련 키워드 분석"  
              icon={Briefcase} 
              filteredData={filteredData}  
              allKeywordData={workKeywords} 
              opinionColumn="(1) 업무-구성원 의견" 
          /> 
      } 
      {growthKeywords &&  
          <KeywordDashboard  
              title="성장/역량 관련 키워드 분석"  
              icon={TrendingUp} 
              filteredData={filteredData}  
              allKeywordData={growthKeywords} 
              opinionColumn="(2) 성장/역량/커리어-구성원 의견" 
          /> 
      } 
      {envKeywords &&  
          <KeywordDashboard  
              title="업무환경 관련 키워드 분석"  
              icon={Home} 
              filteredData={filteredData}  
              allKeywordData={envKeywords} 
              opinionColumn="(3) 업무환경조성-구성원 의견" 
          /> 
      } 
    </div> 
  ); 
};
const App = () => {
  const [data, setData] = useState([]);
  const [transferAnalysisData, setTransferAnalysisData] = useState(null);
  const [workKeywords, setWorkKeywords] = useState(null);
  const [growthKeywords, setGrowthKeywords] = useState(null);
  const [envKeywords, setEnvKeywords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isAnalysisEnabled, setIsAnalysisEnabled] = useState(true);
  
  const [progress, setProgress] = useState(0);

  const [selectedJob, setSelectedJob] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  const jobOptions = useMemo(() => ["all", ...new Set(data.map((item) => item.직무 || ""))].filter(Boolean), [data]);
  const yearOptions = useMemo(() => ["all", ...new Set(data.map((item) => item.직무연차 || ""))].filter(Boolean), [data]);

  const filteredData = useMemo(() => data.filter((item) => {
    const jobMatch = selectedJob === "all" || item.직무 === selectedJob;
    const yearMatch = selectedYear === "all" || item.직무연차 === selectedYear;
    return jobMatch && yearMatch;
  }), [data, selectedJob, selectedYear]);
  
  const handleReset = () => {
    setData([]);
    setTransferAnalysisData(null);
    setWorkKeywords(null);
    setGrowthKeywords(null);
    setEnvKeywords(null);
    setLoading(false);
    setLoadingMessage("");
    setProgress(0);
    setSelectedJob("all");
    setSelectedYear("all");
  };

  const handleFileUpload = async (file) => {
    setLoading(true);
    setProgress(0);
    setLoadingMessage("Excel 파일을 파싱 중입니다...");

    try {
        const reader = new FileReader();
        const fileData = await new Promise((resolve, reject) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsBinaryString(file);
        });

        setProgress(5);
        setLoadingMessage("데이터를 변환 중입니다...");
        const workbook = XLSX.read(fileData, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        let jsonData = XLSX.utils.sheet_to_json(sheet);
        jsonData = jsonData.map((row, index) => ({ ...row, uniqueId: `row_${index}` }));
        setProgress(10);
        
        if (isAnalysisEnabled) {
            setLoadingMessage("업무 관련 의견을 분석 중입니다...");
            const workResult = await runKeywordAnalysis(jsonData, '(1) 업무-구성원 의견', (processed, total) => {
              setProgress(10 + Math.round((processed / total) * 25));
            });
            setWorkKeywords(workResult);

            setLoadingMessage("성장/역량 관련 의견을 분석 중입니다...");
            const growthResult = await runKeywordAnalysis(jsonData, '(2) 성장/역량/커리어-구성원 의견', (processed, total) => {
                setProgress(35 + Math.round((processed / total) * 25));
            });
            setGrowthKeywords(growthResult);

            setLoadingMessage("업무환경 관련 의견을 분석 중입니다...");
            const envResult = await runKeywordAnalysis(jsonData, '(3) 업무환경조성-구성원 의견', (processed, total) => {
                setProgress(60 + Math.round((processed / total) * 25));
            });
            setEnvKeywords(envResult);
        } else {
            setWorkKeywords(null);
            setGrowthKeywords(null);
            setEnvKeywords(null);
        }
        
        setProgress(85);

        setLoadingMessage("인사이동 희망 여부를 분석 중입니다...");
        const transferResponse = await fetch(`${BACKEND_URL}/analyze-transfer-intent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: jsonData }),
        });
        if (!transferResponse.ok) throw new Error('인사이동 분석 API 실패');
        const transferResult = await transferResponse.json();
        setTransferAnalysisData(transferResult);
        setProgress(95);

        setLoadingMessage("대시보드를 준비 중입니다...");
        setData(jsonData);
        setProgress(100);

    } catch (error) {
        console.error("파일 처리 에러:", error);
        alert(`파일 처리 중 오류가 발생했습니다: ${error.message}`);
        handleReset();
    } finally {
        setTimeout(() => {
            setLoading(false);
        }, 500);
    }
  };
    
   const downloadCSV = () => { 
     const csv = Papa.unparse(filteredData); 
     const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" }); 
     const url = URL.createObjectURL(blob); 
     const link = document.createElement("a"); 
     link.href = url; 
     link.download = "filtered_interview_data.csv"; 
     link.click(); 
     URL.revokeObjectURL(url); 
   }; 

   // ▼▼▼▼▼ [추가된 부분] ▼▼▼▼▼
   const handleSampleDownload = () => {
       const fileUrl = '/sample_interview_data.xlsx'; 
       const link = document.createElement('a');
       link.href = fileUrl;
       link.setAttribute('download', '면담데이터_분석_샘플.xlsx');
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
   };
   // ▲▲▲▲▲ [추가된 부분] ▲▲▲▲▲

   const SkLogo = () => ( 
     <img src="/logo.svg" alt="Logo" className="w-16 h-16" /> 
   ); 

   const ToggleSwitch = ({ isChecked, onChange, children }) => ( 
     <div className="flex items-center justify-center space-x-3 cursor-pointer group" onClick={() => onChange(!isChecked)}> 
       {children} 
       <div className={`relative inline-flex items-center h-7 rounded-full w-12 transition-all duration-300 shadow-lg ${ 
         isChecked ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-200' : 'bg-gray-300 shadow-gray-200' 
       }`}> 
         <span className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 shadow-md ${ 
           isChecked ? 'translate-x-6' : 'translate-x-1' 
         }`} /> 
       </div> 
     </div> 
   ); 

   return ( 
     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50"> 
       <nav className="bg-white shadow-xl border-b border-gray-200 backdrop-blur-sm bg-opacity-95"> 
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> 
           <div className="flex justify-between items-center h-20"> 
              <div  
               className="flex items-center space-x-4 cursor-pointer" 
               onClick={handleReset} 
             > 
               <div className="flex items-center space-x-4"> 
                 <SkLogo /> 
                 <div> 
                   <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"> 
                     EnSight
                   </h1> 
                   <p className="text-sm text-gray-600 mt-1">SK엔무브 HR 분석 시스템</p> 
                 </div> 
               </div> 
             </div> 
             <div className="flex items-center space-x-4"> 
               <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"> 
                 <Bell className="w-5 h-5" /> 
               </button> 
               <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"> 
                 <Settings className="w-5 h-5" /> 
               </button> 
               <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg"> 
                 <User className="w-5 h-5 text-white" /> 
               </div> 
             </div> 
           </div> 
         </div> 
       </nav> 
        
       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {data.length === 0 ? (
          <div className="max-w-4xl mx-auto">
            <FileUploader onFileUpload={handleFileUpload} />
            
            {loading ? (
                <div className="mt-8 flex flex-col items-center bg-white rounded-xl p-8 shadow-lg border border-gray-200">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
                        </div>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">AI 분석 진행 중</h3>
                    <p className="mt-2 text-sm text-gray-600 text-center max-w-md">{loadingMessage}</p>
                    <div className="w-full max-w-md mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <p className="text-center text-sm font-semibold text-blue-700 mt-2">{progress}%</p>
                    </div>
                </div>
            ) : (
              <div className="mt-8 flex flex-col md:flex-row justify-center items-start gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 w-full md:w-auto">
                  <ToggleSwitch isChecked={isAnalysisEnabled} onChange={setIsAnalysisEnabled}>
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 transition-all duration-200 ${
                        isAnalysisEnabled ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Zap className={`w-6 h-6 transition-colors duration-200 ${
                          isAnalysisEnabled ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <span className={`text-lg font-bold ${
                          isAnalysisEnabled ? 'text-gray-800' : 'text-gray-500'
                        }`}>
                          AI 키워드 분석
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          {isAnalysisEnabled ? '고품질 LLM 분석을 통해 인사이트 도출' : '기본 분석만 수행'}
                        </p>
                      </div>
                    </div>
                  </ToggleSwitch>
                </div>
                
                {/* ▼▼▼▼▼ [수정된 부분] ▼▼▼▼▼ */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 w-full md:w-auto">
                    <div className="flex items-center">
                        <div className="p-2 rounded-lg mr-3 bg-green-100">
                            <FileSpreadsheet className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <span className="text-lg font-bold text-gray-800">
                                샘플 파일 다운로드
                            </span>
                            <p className="text-sm text-gray-600 mt-1">
                                분석에 필요한 Excel 양식을 확인하세요.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleSampleDownload}
                        className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        샘플 다운로드
                    </button>
                </div>
                {/* ▲▲▲▲▲ [수정된 부분] ▲▲▲▲▲ */}

              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mb-8 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-center">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-4 shadow-lg">
                            <Filter className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">데이터 필터링</h2>
                            <p className="text-sm text-gray-600 mt-1">조건을 선택하여 원하는 데이터를 분석하세요</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                        <div className="min-w-0 flex-1 sm:max-w-xs">
                            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">직무</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select 
                                    value={selectedJob} 
                                    onChange={(e) => setSelectedJob(e.target.value)} 
                                    className="block w-full pl-10 pr-4 py-3 text-sm border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                                >
                                    {jobOptions.map((option) => 
                                        <option key={option} value={option}>
                                            {option === "all" ? "전체 직무" : option}
                                        </option>
                                    )}
                                </select>
                            </div>
                        </div>
                        <div className="min-w-0 flex-1 sm:max-w-xs">
                            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">연차</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select 
                                    value={selectedYear} 
                                    onChange={(e) => setSelectedYear(e.target.value)} 
                                    className="block w-full pl-10 pr-4 py-3 text-sm border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                                >
                                    {yearOptions.map((option) => 
                                        <option key={option} value={option}>
                                            {option === "all" ? "전체 연차" : option}
                                        </option>
                                    )}
                                </select>
                            </div>
                        </div>
                        {filteredData.length > 0 && (
                            <div className="flex items-end">
                                <button 
                                    onClick={downloadCSV} 
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <Download className="w-4 h-4 mr-2" /> 
                                    CSV 다운로드
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {filteredData.length === 0 ? (
                <div className="bg-white rounded-xl p-16 text-center shadow-lg border border-gray-200">
                    <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6">
                        <AlertCircle className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">데이터가 없습니다</h3>
                    <p className="text-gray-600 mb-6">선택된 필터 조건에 맞는 데이터가 없습니다.</p>
                    <button 
                        onClick={() => {setSelectedJob("all"); setSelectedYear("all");}}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        필터 초기화
                    </button>
                </div>
            ) : (
                <ChartSection 
                  filteredData={filteredData} 
                  transferAnalysisData={transferAnalysisData}
                  workKeywords={workKeywords}
                  growthKeywords={growthKeywords}
                  envKeywords={envKeywords}
                />
            )}
          </>
        )}
      </main>
     </div> 
   ); 
 };



 export default App;

 //sunic