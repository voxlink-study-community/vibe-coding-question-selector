import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * ──────────────────────────────────────────────────────────────────────
 *  React 기본 개념 미니 가이드 (주요 용어와 동작 흐름)
 * ---------------------------------------------------------------------
 * 1. Component (컴포넌트)
 *    - UI를 캡슐화한 재사용 가능한 단위. 함수형 컴포넌트(App) 사용.
 * 2. JSX
 *    - JavaScript XML. 선언적으로 UI를 서술하며 Babel이 JS 코드로 변환.
 * 3. State & setState / useState 훅
 *    - 컴포넌트 내부의 변경 가능한 데이터. setState 호출 시 리렌더링.
 * 4. props (Property)
 *    - 부모 → 자식 컴포넌트로 전달되는 읽기 전용 데이터.
 * 5. Hook
 *    - 함수형 컴포넌트에서 React 기능을 사용하게 해주는 특수 함수.
 *      대표: useState(상태), useEffect(부수효과), useContext 등.
 * 6. useEffect 훅
 *    - 데이터 fetch, 구독, 타이머 등 "렌더링 외" 부수효과를 수행.
 *      두 번째 인자인 dependency 배열에 지정한 값이 변할 때 재실행.
 * ──────────────────────────────────────────────────────────────────────
 */

/** 카테고리별 TXT 파일 경로 매핑 */
const CATEGORY_FILES = {
  DL: "/dl_db.txt", // Deep‑Learning 면접 질문
  CS: "/cs_db.txt", // Computer‑Science 면접 질문
  EN: "/en_db.txt", // 영어회화 문장
};

/** 카테고리 이름 매핑 */
const CATEGORY_NAMES = {
  DL: "딥러닝",
  CS: "컴퓨터 사이언스",
  EN: "영어회화",
};

/** 루트 컴포넌트 */
function App() {
  // ──────────────────────────────── 상태 정의(useState) ────────────────────────────────
  const [category, setCategory] = useState("DL"); // 현재 카테고리
  const [questions, setQuestions] = useState([]); // 로드된 질문 배열
  const [currentRound, setCurrentRound] = useState(1); // 회차(1주 단위)
  const [currentQuestion, setCurrentQuestion] = useState(""); // 선택된 질문

  // key 형식: "{category}-{round}", value: Set(이미 사용한 질문)
  const [usedQuestions, setUsedQuestions] = useState(new Map());

  // 현재 회차에 사용한 질문 수와 전체 질문 수 추적
  const [usedCount, setUsedCount] = useState(0);

  // ──────────────────────────────── 데이터 로드(useEffect) ────────────────────────────────
  useEffect(() => {
    const filePath = CATEGORY_FILES[category];

    // 카테고리 전환 시 UI 초기화
    setCurrentRound(1);
    setCurrentQuestion("");
    setUsedQuestions(new Map());
    setUsedCount(0);

    fetch(filePath)
      .then((res) => res.text())
      .then((data) => {
        // "-" 로 시작하는 라인만 추출
        const list = data
          .split("\n")
          .filter((line) => line.trim().startsWith("-"))
          .map((line) => line.trim().substring(1).trim()); // "-" 기호 제거 및 앞뒤 공백 제거
        setQuestions(list);
      })
      .catch((err) => {
        console.error("[QuestionLoader]", err);
        setQuestions([]);
      });
  }, [category]);

  // 현재 회차에 대한 사용 질문 수 업데이트
  useEffect(() => {
    const key = `${category}-${currentRound}`;
    const roundQuestions = usedQuestions.get(key) || new Set();
    setUsedCount(roundQuestions.size);
  }, [usedQuestions, category, currentRound]);

  // ──────────────────────────────── 무작위 질문 선택 ────────────────────────────────
  const getRandomQuestion = () => {
    const key = `${category}-${currentRound}`;
    const roundQuestions = usedQuestions.get(key) || new Set();
    const available = questions.filter((q) => !roundQuestions.has(q));

    if (available.length === 0) return "이 회차의 모든 질문을 확인했습니다.";

    const selected = available[Math.floor(Math.random() * available.length)];

    // 사용된 질문 기록 업데이트(불변성 유지)
    const newRoundQuestions = new Set(roundQuestions);
    newRoundQuestions.add(selected);
    const nextUsed = new Map(usedQuestions);
    nextUsed.set(key, newRoundQuestions);
    setUsedQuestions(nextUsed);

    return selected;
  };

  /** 버튼 클릭 핸들러 */
  const handleSelectQuestion = () => {
    const q = getRandomQuestion();
    setCurrentQuestion(q);
  };

  /** 회차를 기준으로 날짜 계산(1회차=오늘, 2회차=+7일) */
  const getCurrentDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + (currentRound - 1) * 7);
    return d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ──────────────────────────────── JSX 반환 ────────────────────────────────
  return (
    <div className="App">
      <div className="app-container">
        {/* 왼쪽 사이드바 */}
        <div className="sidebar">
          <h2 className="app-title">면접 질문 선택기</h2>

          {/* 카테고리 선택 */}
          <div className="sidebar-section">
            <h3 className="section-title">카테고리</h3>
            <div className="category-selector">
              {Object.keys(CATEGORY_FILES).map((cat) => (
                <button
                  key={cat}
                  className={`category-button ${
                    category === cat ? "active" : ""
                  }`}
                  onClick={() => setCategory(cat)}
                >
                  {CATEGORY_NAMES[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* 회차 선택 */}
          <div className="sidebar-section">
            <h3 className="section-title">회차 (날짜)</h3>
            <div className="round-selector">
              <button
                onClick={() => setCurrentRound((prev) => Math.max(1, prev - 1))}
                disabled={currentRound === 1}
                className="round-button"
              >
                &lt;
              </button>

              <div className="round-info">
                <h4>{currentRound}회차</h4>
                <p>{getCurrentDate()}</p>
              </div>

              <button
                onClick={() => setCurrentRound((prev) => prev + 1)}
                className="round-button"
              >
                &gt;
              </button>
            </div>

            <div className="stats">
              <p>
                사용된 질문: {usedCount} / {questions.length}
              </p>
            </div>
          </div>

          {/* 질문 선택 버튼 */}
          <div className="sidebar-section">
            <button className="question-button" onClick={handleSelectQuestion}>
              새 질문 선택하기
            </button>
          </div>
        </div>

        {/* 메인 콘텐츠 영역 - 질문 표시 */}
        <div className="main-content">
          <div className="content-header">
            <h2>
              {CATEGORY_NAMES[category]} - {currentRound}회차 질문
            </h2>
          </div>

          <div className="question-display">
            {currentQuestion ? (
              <p className="question-text">{currentQuestion}</p>
            ) : (
              <p className="placeholder-text">왼쪽에서 질문을 선택해주세요</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
