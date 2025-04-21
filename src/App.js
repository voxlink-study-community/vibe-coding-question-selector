import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [usedQuestions, setUsedQuestions] = useState(new Map());
  const [currentCategory, setCurrentCategory] = useState('DL'); // 기본 카테고리

  const categories = [
    { value: 'DL', label: '딥러닝' },
    { value: 'CS', label: '컴퓨터공학' },
    { value: 'ENG', label: '영어회화' }
  ];

  useEffect(() => {
    loadQuestions();
  }, [currentCategory]);

  const loadQuestions = () => {
    // 카테고리별 파일 매핑
    const categoryFiles = {
      'DL': '/dl.txt',
      'CS': '/cs.txt',
      'ENG': '/eng.txt'
    };

    // 선택된 카테고리의 파일 로드
    fetch(categoryFiles[currentCategory])
      .then(response => response.text())
      .then(data => {
        const questionList = data
          .split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.trim());
        setQuestions(questionList);
        // 카테고리가 변경되면 현재 질문 초기화
        setCurrentQuestion('');
      })
      .catch(error => {
        console.error('Error loading questions:', error);
        setQuestions([]);
      });
  };

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

  const handleCategoryChange = (event) => {
    setCurrentCategory(event.target.value);
    // 카테고리가 변경되면 사용된 질문 초기화
    setUsedQuestions(new Map());
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
        
        <div className="category-selector">
          <select 
            value={currentCategory} 
            onChange={handleCategoryChange}
            className="category-dropdown"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

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
