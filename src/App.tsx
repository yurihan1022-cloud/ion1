import React, { useState, useEffect, useRef } from "react";

// Google Fonts 및 인쇄 스타일 설정
const styleTag = document.createElement("style");
styleTag.innerHTML = `
  @import url('https://fonts.googleapis.com/css2?family=Gowun+Dodum&display=swap');
  body { font-family: 'Gowun Dodum', sans-serif; }
  @media print {
    .no-print { display: none !important; }
    .print-break { page-break-after: always; }
  }
  .electron-draggable {
    touch-action: none;
    cursor: grab;
  }
  .electron-draggable:active {
    cursor: grabbing;
  }
`;
document.head.appendChild(styleTag);

const App = () => {
  const [studentInfo, setStudentInfo] = useState({ number: "", name: "" });
  const [selectedWord, setSelectedWord] = useState(null);
  const [answers, setAnswers] = useState({});
  const [shuffledWords, setShuffledWords] = useState([]);

  // 이온 시뮬레이션 상태 (전자의 개수 관리)
  // cation: 나트륨(1), 마그네슘(2) - 원자 상태의 최외각 전자 수
  // anion: 플루오린(7), 산소(6) - 원자 상태의 최외각 전자 수
  const [simData, setSimData] = useState({
    Na: {
      outer: 1,
      lost: 0,
      target: 0,
      name: "나트륨",
      symbol: "Na",
      protons: 11,
    },
    Mg: {
      outer: 2,
      lost: 0,
      target: 0,
      name: "마그네슘",
      symbol: "Mg",
      protons: 12,
    },
    F: {
      outer: 7,
      supply: 3,
      target: 8,
      name: "플루오린",
      symbol: "F",
      protons: 9,
    },
    O: {
      outer: 6,
      supply: 3,
      target: 8,
      name: "산소",
      symbol: "O",
      protons: 8,
    },
  });

  const wordBank = [
    "양이온",
    "음이온",
    "전자",
    "양성자",
    "전하",
    "잃어",
    "얻어",
    "+",
    "-",
    "중성",
    "오른쪽 위",
  ];

  const correctAnswers = {
    blank1: "전자",
    blank2: "전하",
    blank3: "중성",
    blank4: "잃어",
    blank5: "+",
    blank6: "얻어",
    blank7: "음이온",
    blank8: "오른쪽 위",
    blank9: "양성자",
    blank10: "-",
  };

  useEffect(() => {
    setShuffledWords([...wordBank].sort(() => Math.random() - 0.5));
  }, []);

  const handleWordClick = (word) => {
    setSelectedWord(word === selectedWord ? null : word);
  };

  const handleBlankClick = (id) => {
    if (selectedWord) {
      setAnswers((prev) => ({ ...prev, [id]: selectedWord }));
      setSelectedWord(null);
    } else if (answers[id]) {
      const newAnswers = { ...answers };
      delete newAnswers[id];
      setAnswers(newAnswers);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // 전자를 잃는 시뮬레이션 (금속)
  const loseElectron = (key) => {
    setSimData((prev) => {
      if (prev[key].outer > 0) {
        return {
          ...prev,
          [key]: {
            ...prev[key],
            outer: prev[key].outer - 1,
            lost: prev[key].lost + 1,
          },
        };
      }
      return prev;
    });
  };

  // 전자를 얻는 시뮬레이션 (비금속)
  const gainElectron = (key) => {
    setSimData((prev) => {
      if (prev[key].outer < 8) {
        return {
          ...prev,
          [key]: {
            ...prev[key],
            outer: prev[key].outer + 1,
            supply: prev[key].supply - 1,
          },
        };
      }
      return prev;
    });
  };

  const resetSim = (key) => {
    const initial = {
      Na: {
        outer: 1,
        lost: 0,
        target: 0,
        name: "나트륨",
        symbol: "Na",
        protons: 11,
      },
      Mg: {
        outer: 2,
        lost: 0,
        target: 0,
        name: "마그네슘",
        symbol: "Mg",
        protons: 12,
      },
      F: {
        outer: 7,
        supply: 3,
        target: 8,
        name: "플루오린",
        symbol: "F",
        protons: 9,
      },
      O: {
        outer: 6,
        supply: 3,
        target: 8,
        name: "산소",
        symbol: "O",
        protons: 8,
      },
    };
    setSimData((prev) => ({ ...prev, [key]: initial[key] }));
  };

  const Blank = ({ id, width = "w-24" }) => {
    const isCorrect = answers[id] === correctAnswers[id];
    const isFilled = !!answers[id];
    const isSelected = !!selectedWord && !isFilled;

    return (
      <span
        onClick={() => handleBlankClick(id)}
        className={`
          inline-flex items-center justify-center h-8 mx-1 border-2 rounded-lg cursor-pointer transition-all duration-300
          ${width}
          ${
            isFilled
              ? isCorrect
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "bg-red-50 border-red-500 text-red-600 animate-pulse"
              : "bg-white border-gray-300"
          }
          ${
            isSelected
              ? "border-yellow-400 border-dashed animate-bounce bg-yellow-50"
              : ""
          }
        `}
      >
        {answers[id] || ""}
      </span>
    );
  };

  // 원자 모형 컴포넌트
  const AtomModel = ({ atomKey, data }) => {
    const isCation = atomKey === "Na" || atomKey === "Mg";
    const isComplete = isCation ? data.outer === 0 : data.outer === 8;

    return (
      <div className="flex flex-col items-center p-6 bg-white rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        {isComplete && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] px-2 py-1 rounded-full animate-bounce">
            완성!
          </div>
        )}

        <div className="relative w-40 h-40 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-full mb-4">
          {/* 전자 껍질 (안쪽) */}
          <div className="absolute w-24 h-24 border border-blue-50 rounded-full"></div>
          {/* 전자 껍질 (최외각) */}
          <div className="absolute w-36 h-36 border border-blue-100 rounded-full border-dashed"></div>

          {/* 원자핵 */}
          <div className="w-12 h-12 bg-red-400 rounded-full flex flex-col items-center justify-center text-white z-10 shadow-lg">
            <span className="text-[10px] leading-none">원자핵</span>
            <span className="font-bold text-sm">{data.protons}+</span>
          </div>

          {/* 최외각 전자들 */}
          {[...Array(data.outer)].map((_, i) => {
            const angle = (i * 360) / (data.outer || 1);
            return (
              <div
                key={i}
                onClick={() => isCation && loseElectron(atomKey)}
                className={`absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm z-20 transition-all duration-500 ${
                  isCation ? "cursor-pointer hover:scale-125" : ""
                }`}
                style={{
                  transform: `rotate(${angle}deg) translate(68px) rotate(-${angle}deg)`,
                }}
              ></div>
            );
          })}

          {/* 안쪽 껍질 전자들 (고정 8개 + 2개 예시 시각화) */}
          {[...Array(data.protons > 10 ? 8 : 2)].map((_, i) => {
            const angle = (i * 360) / (data.protons > 10 ? 8 : 2);
            return (
              <div
                key={`inner-${i}`}
                className="absolute w-3 h-3 bg-blue-300 rounded-full border border-white z-10"
                style={{
                  transform: `rotate(${angle}deg) translate(46px) rotate(-${angle}deg)`,
                }}
              ></div>
            );
          })}
        </div>

        <div className="text-center w-full">
          <div className="flex justify-center items-baseline gap-1 mb-2">
            <span className="font-bold text-lg text-gray-800">{data.name}</span>
            <span className="text-xs text-gray-400">({data.symbol})</span>
            {isComplete && (
  <span className="ml-2 text-blue-600 font-black">
    {data.symbol}
    <sup>
      {isCation 
        ? (data.lost > 1 ? `${data.lost}+` : "+") 
        : (8 - (simData[atomKey].outer - (isCation ? 0 : 0)) > 1 // 아래 더 직관적인 코드로 제안합니다.
      )}
    </sup>
  </span>
)}
          </div>

          {/* 조작 버튼 */}
          <div className="flex flex-col gap-2 mt-2">
            {!isCation && data.supply > 0 && (
              <button
                onClick={() => gainElectron(atomKey)}
                className="w-full py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-bold rounded-xl transition-all"
              >
                외부 전자 가져오기 ({data.supply})
              </button>
            )}
            {isCation && data.outer > 0 && (
              <p className="text-[10px] text-red-500 font-bold animate-pulse">
                전자를 터치하여 밖으로 버리기!
              </p>
            )}
            <button
              onClick={() => resetSim(atomKey)}
              className="text-[10px] text-gray-400 underline"
            >
              다시 시작
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      translate="no"
      className="min-h-screen bg-slate-50 text-gray-800 p-4 md:p-8"
    >
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-blue-600 p-6 rounded-3xl text-white shadow-lg">
        <div>
          <h1 className="text-2xl font-bold mb-1">IV. 물질의 구성</h1>
          <h2 className="text-lg opacity-90">
            03. 전하를 띠는 입자 - 이온의 형성
          </h2>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0 bg-white/20 p-3 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">학번</span>
            <input
              type="text"
              className="w-16 bg-white rounded-md text-gray-900 px-2 py-1 text-center font-bold"
              value={studentInfo.number}
              onChange={(e) =>
                setStudentInfo({ ...studentInfo, number: e.target.value })
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">이름</span>
            <input
              type="text"
              className="w-20 bg-white rounded-md text-gray-900 px-2 py-1 text-center font-bold"
              value={studentInfo.name}
              onChange={(e) =>
                setStudentInfo({ ...studentInfo, name: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* 안내 문구 */}
      <div className="max-w-4xl mx-auto mb-6 px-4 py-3 bg-blue-50 border-l-4 border-blue-400 text-blue-800 text-sm rounded-r-xl shadow-sm">
        📍 <strong>안내:</strong> 아래 단어장의 단어를 터치한 후, 본문의 빈칸을
        터치하여 완성함. <br />
        📍 <strong>실험:</strong> 원자 모형에서 전자를 터치하거나 버튼을 눌러
        이동시켜 이온을 만듦.
      </div>

      {/* Sticky Word Bank */}
      <div className="sticky top-4 z-50 max-w-4xl mx-auto mb-8 no-print">
        <div className="bg-yellow-100 p-4 rounded-3xl shadow-md border-2 border-yellow-200">
          <div className="text-xs font-bold text-yellow-700 mb-2 flex items-center gap-1">
            <span className="text-lg">📦</span> 단어장
          </div>
          <div className="flex flex-wrap gap-2">
            {shuffledWords.map((word, idx) => (
              <button
                key={idx}
                onClick={() => handleWordClick(word)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border-2
                  ${
                    selectedWord === word
                      ? "bg-yellow-400 border-yellow-600 scale-105 shadow-inner text-yellow-900"
                      : "bg-white border-yellow-300 hover:border-yellow-400 text-gray-700 shadow-sm"
                  }`}
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto space-y-10 pb-20">
        {/* 1. 학습 목표 */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
              1
            </div>
            <h3 className="text-xl font-bold">학습 목표</h3>
          </div>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 font-medium">
            <li>원자가 전자를 잃거나 얻어 이온이 형성됨을 설명함.</li>
            <li>양이온과 음이온의 형성 과정을 모형으로 나타냄.</li>
          </ul>
        </section>

        {/* 2. 이온의 형성 원리 */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
              2
            </div>
            <h3 className="text-xl font-bold">이온의 형성 원리</h3>
          </div>

          <div className="space-y-6">
            <div className="p-5 bg-gray-50 rounded-2xl border-l-4 border-gray-300 text-gray-700 leading-loose">
              원자는 (+)전하를 띠는 <Blank id="blank9" width="w-24" />와
              (-)전하를 띠는 <Blank id="blank1" width="w-24" />의 수가 같아
              전기적으로 <Blank id="blank3" width="w-20" /> 상태임. 하지만
              전자를 잃거나 얻으면 <Blank id="blank2" width="w-20" />를 띠게
              되는데, 이를 <strong>이온</strong>이라고 함.
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-red-50 p-5 rounded-3xl border border-red-100">
                <h4 className="font-bold text-red-700 mb-4 flex items-center gap-2">
                  🔴 양이온 형성
                </h4>
                <div className="space-y-3 text-sm text-gray-700">
                  <p>
                    원자가 전자를 <Blank id="blank4" width="w-20" /> 형성됨.
                  </p>
                  <p>
                    (+)전하량 &gt; (-)전하량 이므로 전체적으로{" "}
                    <Blank id="blank5" width="w-24" /> 전하를 띰.
                  </p>
                </div>
              </div>
              <div className="bg-blue-50 p-5 rounded-3xl border border-blue-100">
                <h4 className="font-bold text-blue-700 mb-4 flex items-center gap-2">
                  🔵 음이온 형성
                </h4>
                <div className="space-y-3 text-sm text-gray-700">
                  <p>
                    원자가 전자를 <Blank id="blank6" width="w-20" /> 형성됨.
                  </p>
                  <p>
                    (+)전하량 &lt; (-)전하량 이므로 전체적으로{" "}
                    <Blank id="blank10" width="w-24" /> 전하를 띰.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 이온 형성 시뮬레이션 */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
              3
            </div>
            <h3 className="text-xl font-bold">이온 형성 가상 실험</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AtomModel atomKey="Na" data={simData.Na} />
            <AtomModel atomKey="Mg" data={simData.Mg} />
            <AtomModel atomKey="F" data={simData.F} />
            <AtomModel atomKey="O" data={simData.O} />
          </div>
        </section>

        {/* 4. 이온의 표현 */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
              4
            </div>
            <h3 className="text-xl font-bold">이온의 표현 방법</h3>
          </div>
          <div className="bg-blue-50 p-8 rounded-3xl">
            <div className="flex justify-center mb-6">
              <div className="bg-white px-10 py-6 rounded-2xl shadow-inner border-2 border-blue-100 text-center">
                <span className="text-5xl font-black text-gray-800 tracking-widest">
                  Na<sup className="text-blue-600"> +</sup>
                </span>
              </div>
            </div>
            <p className="text-center text-gray-700 mb-6 font-medium">
              원소 기호의 <Blank id="blank8" width="w-32" />에 잃거나 얻은 전자
              수와 전하 종류를 표시함.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm text-sm">
                <span className="font-bold text-blue-600">이름 붙이기:</span>
                <br />
                - 양이온: 원소 이름 뒤에 '이온' (예: 나트륨 이온)
                <br />- 음이온: 원소 이름 뒤에 '화 이온' (예: 염화 이온)
              </div>
              <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm text-sm">
                <span className="font-bold text-red-500">주의사항:</span>
                <br />
                - 전자 수가 1개일 때는 숫자 1을 생략함.
                <br />- 산소는 '산소화 이온'이 아니라 '산화 이온'임.
              </div>
            </div>
          </div>
        </section>

        {/* 하단 버튼 및 참고 */}
        <footer className="mt-12 space-y-6">
          <div className="p-6 bg-slate-800 text-slate-300 rounded-3xl">
            <h4 className="text-white font-bold mb-2">📌 오늘의 핵심 요약</h4>
            <p className="text-sm opacity-80 leading-relaxed">
              모든 원자는 안정한 상태(최외각 전자 8개)가 되려는 성질이 있음.
              금속 원자는 전자를 버리고 (+)전하를 띠는 <strong>양이온</strong>이
              되기 쉽고, 비금속 원자는 전자를 채워 (-)전하를 띠는{" "}
              <strong>음이온</strong>이 되기 쉬움.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-lg transition-all no-print flex items-center justify-center gap-2 text-lg"
          >
            🖨️ 활동지 PDF 저장 및 인쇄하기
          </button>
        </footer>
      </main>
    </div>
  );
};

export default App;
