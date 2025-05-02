import React, { useState, useEffect } from "react";
import "./App.css";

/** 카테고리별 TXT 파일 경로 매핑 */
const CATEGORY_FILES = {
  "SP,PV": [
    "/vibe-coding-question-selector/en_sp_db.txt",
    "/vibe-coding-question-selector/en_pv_db.txt",
  ],
};

/** 카테고리 이름 매핑 */
const CATEGORY_NAMES = {
  "SP,PV": "Sentence Pattern & Phrasal Verbs",
};

/** 영어 학습 컴포넌트 */
function En() {
  // ──────────────────────────────── 상태 정의 ────────────────────────────────
  const [category] = useState("SP,PV");
  const [patterns, setPatterns] = useState([]); // 패턴 목록
  const [currentRound, setCurrentRound] = useState(1);
  const [currentPattern, setCurrentPattern] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [isRoundStarted, setIsRoundStarted] = useState(false);

  // key 형식: "round-{number}", value: Set(이미 사용한 패턴)
  const [usedPatterns, setUsedPatterns] = useState(new Map());

  // 현재 회차에 사용한 패턴 수와 전체 패턴 수 추적
  const [usedCount, setUsedCount] = useState(0);

  // ──────────────────────────────── 데이터 로드 ────────────────────────────────
  useEffect(() => {
    Promise.all(
      CATEGORY_FILES[category].map((file) =>
        fetch(file)
          .then((res) => res.text())
          .then((data) => {
            const filePatterns = [];
            let currentPattern = null;
            let examples = [];

            data.split("\n").forEach((line) => {
              line = line.trim();
              if (!line) return;

              if (line.startsWith("**")) {
                // 패턴 줄: "**I'm going to ~~할 거예요**" 형식
                if (currentPattern) {
                  patterns.push({ pattern: currentPattern, examples });
                }
                currentPattern = line;
                examples = [];
              } else if (line) {
                // 예문 줄: "I'm going to work.  나 일하러 갈 거야." 형식
                const parts = line
                  .split("  ")
                  .map((s) => s.trim())
                  .filter((s) => s);
                if (parts.length >= 2) {
                  examples.push({ english: parts[0], korean: parts[1] });
                }
              }
            });

            // 마지막 패턴 추가
            if (currentPattern) {
              patterns.push({ pattern: currentPattern, examples });
            }

            return filePatterns;
          })
      )
    )
      .then((allPatterns) => {
        // 모든 패턴을 하나의 배열로 합치기
        setPatterns(allPatterns.flat());
      })
      .catch((err) => {
        console.error("[PatternLoader]", err);
        setPatterns([]);
      });
  }, [category]);

  // 현재 회차에 대한 사용 패턴 수 업데이트
  useEffect(() => {
    const key = `round-${currentRound}`;
    const roundPatterns = usedPatterns.get(key) || new Set();
    setUsedCount(roundPatterns.size);
  }, [usedPatterns, currentRound]);

  // ──────────────────────────────── 무작위 패턴 선택 ────────────────────────────────
  const getRandomPattern = () => {
    const key = `round-${currentRound}`;
    const roundPatterns = usedPatterns.get(key) || new Set();
    const available = patterns.filter((p) => !roundPatterns.has(p.pattern));

    if (available.length === 0) return null;

    const selected = available[Math.floor(Math.random() * available.length)];

    // 사용된 패턴 기록 업데이트
    const newRoundPatterns = new Set(roundPatterns);
    newRoundPatterns.add(selected.pattern);
    const nextUsed = new Map(usedPatterns);
    nextUsed.set(key, newRoundPatterns);
    setUsedPatterns(nextUsed);

    return selected;
  };

  /** 버튼 클릭 핸들러 */
  const handleSelectPattern = () => {
    const p = getRandomPattern();
    setCurrentPattern(p);
    setShowAnswer(false);
    setCurrentExampleIndex(0);
    setIsRoundStarted(true);
  };

  /** 이전/다음 예문 이동 */
  const handlePrevExample = () => {
    setCurrentExampleIndex((prev) => Math.max(0, prev - 1));
    setShowAnswer(false);
  };

  const handleNextExample = () => {
    if (
      currentPattern &&
      currentExampleIndex < currentPattern.examples.length - 1
    ) {
      setCurrentExampleIndex((prev) => prev + 1);
      setShowAnswer(false);
    }
  };

  /** 회차를 기준으로 날짜 계산 */
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
          <h2 className="app-title">영어 회화 질문 선택기</h2>

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
                onClick={() => {
                  setCurrentRound((prev) => Math.max(1, prev - 1));
                  setIsRoundStarted(false);
                }}
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
                onClick={() => {
                  setCurrentRound((prev) => prev + 1);
                  setIsRoundStarted(false);
                }}
                className="round-button"
              >
                &gt;
              </button>
            </div>

            <div className="stats">
              <p>
                학습한 패턴: {usedCount} / {patterns.length}
              </p>
            </div>
          </div>

          {/* 패턴 선택 버튼 */}
          <div className="sidebar-section">
            <button
              className="question-button"
              onClick={handleSelectPattern}
              disabled={isRoundStarted}
              style={{
                opacity: isRoundStarted ? 0.6 : 1,
                cursor: isRoundStarted ? "not-allowed" : "pointer",
              }}
            >
              오늘 복습하기
            </button>
            <button
              className="question-button mode-switch"
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: "#575757",
                color: "white",
                border: "2px solid #575757",
                marginTop: "18rem",
                padding: "0.7rem 1rem",
                fontSize: "0.9rem",
              }}
            >
              면접 질문 모드로 전환
            </button>
          </div>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="main-content">
          <div className="content-header">
            <h2>영어 회화 질문 선택기 - {currentRound}회차</h2>
          </div>

          <div className="question-display">
            {currentPattern ? (
              <div className="english-content">
                <div className="pattern-section">
                  <p className="pattern-text">
                    {currentPattern.pattern
                      .split("**")
                      .map((part, index) =>
                        index % 2 === 0 ? (
                          part
                        ) : (
                          <strong key={index}>{part}</strong>
                        )
                      )}
                  </p>
                </div>
                <div className="examples-section">
                  {currentPattern && currentPattern.examples.length > 0 && (
                    <div
                      className="example-item"
                      style={{
                        backgroundColor: "white",
                        padding: "15px",
                        borderRadius: "8px",
                        marginBottom: "10px",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <p className="question-text">
                        {currentPattern.examples[currentExampleIndex].korean}
                      </p>
                      {showAnswer && (
                        <p
                          className="answer-text"
                          style={{
                            color: "#2E8B57",
                            marginTop: "10px",
                          }}
                        >
                          {currentPattern.examples[currentExampleIndex].english}
                        </p>
                      )}
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <button
                      onClick={handlePrevExample}
                      disabled={currentExampleIndex === 0 && !showAnswer}
                      style={{
                        padding: "8px 15px",
                        fontSize: "16px",
                        border: "none",
                        backgroundColor:
                          currentExampleIndex === 0 ? "#ddd" : "#575757",
                        color: "white",
                        borderRadius: "4px",
                        cursor:
                          currentExampleIndex === 0 ? "default" : "pointer",
                      }}
                    >
                      &lt;
                    </button>
                    <button
                      className="answer-toggle-button"
                      onClick={() => setShowAnswer(!showAnswer)}
                    >
                      {showAnswer ? "정답 숨기기" : "정답 보기"}
                    </button>
                    <button
                      onClick={handleNextExample}
                      disabled={
                        !currentPattern ||
                        currentExampleIndex >=
                          currentPattern.examples.length - 1
                      }
                      style={{
                        padding: "8px 15px",
                        fontSize: "16px",
                        border: "none",
                        backgroundColor:
                          !currentPattern ||
                          currentExampleIndex >=
                            currentPattern.examples.length - 1
                            ? "#ddd"
                            : "#575757",
                        color: "white",
                        borderRadius: "4px",
                        cursor:
                          !currentPattern ||
                          currentExampleIndex >=
                            currentPattern.examples.length - 1
                            ? "default"
                            : "pointer",
                      }}
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="placeholder-text">
                {isRoundStarted
                  ? "모든 문제를 완료했습니다!"
                  : "왼쪽에서 '오늘 복습하기'를 눌러주세요"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default En;
