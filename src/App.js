import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [usedQuestions, setUsedQuestions] = useState(new Map());

  useEffect(() => {
    // test.txt 파일에서 질문 데이터 로드
    fetch('/test.txt')
      .then(response => response.text())
      .then(data => {
        const questionList = data
          .split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.trim());
        setQuestions(questionList);
      });
  }, []);

  const getRandomQuestion = () => {
    const roundQuestions = usedQuestions.get(currentRound) || new Set();
    const availableQuestions = questions.filter(q => !roundQuestions.has(q));
    
    if (availableQuestions.length === 0) {
      return '이 회차의 모든 질문을 확인했습니다.';
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];
    
    const updatedRoundQuestions = new Set(roundQuestions);
    updatedRoundQuestions.add(selectedQuestion);
    
    const newUsedQuestions = new Map(usedQuestions);
    newUsedQuestions.set(currentRound, updatedRoundQuestions);
    
    setUsedQuestions(newUsedQuestions);
    return selectedQuestion;
  };

  const handleSelectQuestion = () => {
    const question = getRandomQuestion();
    setCurrentQuestion(question);
  };

  const getCurrentDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + (currentRound - 1) * 7); // 회차당 1주일 간격
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>코딩 면접 질문 선택기</h1>
        <div className="round-selector">
          <button 
            onClick={() => setCurrentRound(prev => Math.max(1, prev - 1))}
            disabled={currentRound === 1}
          >
            이전 회차
          </button>
          <div className="round-info">
            <h2>{currentRound}회차</h2>
            <p>{getCurrentDate()}</p>
          </div>
          <button 
            onClick={() => setCurrentRound(prev => prev + 1)}
          >
            다음 회차
          </button>
        </div>
        
        <button className="question-button" onClick={handleSelectQuestion}>
          질문 선택하기
        </button>
        
        <div className="question-display">
          {currentQuestion && (
            <p className="question-text">{currentQuestion}</p>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
