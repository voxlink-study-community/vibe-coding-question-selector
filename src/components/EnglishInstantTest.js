import React, { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 200px;
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  resize: vertical;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  margin-right: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }

  &:last-child {
    background-color: #6c757d;

    &:hover {
      background-color: #545b62;
    }
  }
`;

const Card = styled.div`
  flex: 1;
  padding: 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const QuestionText = styled.h4`
  font-size: 2.5rem;
  color: #2c3e50;
  margin: 40px 0;
  text-align: center;
  line-height: 1.4;
  font-weight: 600;
`;

const AnswerContainer = styled.div`
  min-height: 100px;
  margin: 20px 0;
  position: relative;
`;

const AnswerText = styled.p`
  font-size: 1.1rem;
  color: #28a745;
  line-height: 1.6;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #28a745;
  opacity: ${(props) => (props.show ? 1 : 0)};
  transition: opacity 0.2s ease;
  position: absolute;
  width: 100%;
  visibility: ${(props) => (props.show ? "visible" : "hidden")};
`;

const TopContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  position: absolute;
  top: 20px;
  left: 20px;
`;

const HintToggle = styled.button`
  background: none;
  border: none;
  color: #28a745;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(40, 167, 69, 0.1);
  }

  svg {
    transition: transform 0.3s ease;
    transform: rotate(${(props) => (props.isOpen ? "180deg" : "0deg")});
  }
`;

const HintText = styled.div`
  font-size: 1rem;
  color: #6c757d;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin: 10px 0 20px;
  border-left: 4px solid #28a745;
  max-height: ${(props) => (props.isOpen ? "200px" : "0")};
  opacity: ${(props) => (props.isOpen ? "1" : "0")};
  overflow: hidden;
  transition: all 0.3s ease;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
`;

const ProgressText = styled.h3`
  color: #6c757d;
  margin-bottom: 20px;
  font-size: 1rem;
  text-align: center;
`;

const QuestionListModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 1000;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const QuestionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    padding: 10px;
    border-bottom: 1px solid #eee;

    &:last-child {
      border-bottom: none;
    }
  }
`;

const EnglishInstantTest = () => {
  const [inputText, setInputText] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showQuestionList, setShowQuestionList] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const parseText = (text) => {
    const lines = text.split("\n");
    const parsedQuestions = [];
    let currentHint = "";

    console.log("입력된 텍스트:", text);
    console.log("분리된 라인들:", lines);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) continue;

      if (line.startsWith("**") && line.endsWith("**")) {
        currentHint = line.slice(2, -2).trim();
        console.log("힌트 발견:", currentHint);
        continue;
      }

      // 두 개 이상의 공백으로 분리
      const parts = line
        .split(/\s{2,}/)
        .map((part) => part.trim())
        .filter(Boolean);
      console.log("파싱된 부분들:", parts);

      if (parts.length >= 2) {
        parsedQuestions.push({
          hint: currentHint,
          question: parts[0],
          answer: parts[1],
        });
        console.log("질문 추가됨:", {
          hint: currentHint,
          question: parts[0],
          answer: parts[1],
        });
      }
    }

    if (parsedQuestions.length === 0) {
      console.log("경고: 파싱된 질문이 없습니다!");
    }

    return parsedQuestions;
  };

  const handleStart = () => {
    const parsedQuestions = parseText(inputText);
    console.log("Total questions:", parsedQuestions.length);
    setQuestions(parsedQuestions);
    setCurrentIndex(0);
    setIsStarted(true);
    setShowAnswer(false);
  };

  const handleNext = () => {
    if (showAnswer && currentIndex < questions.length - 1) {
      setShowAnswer(false);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 200);
    } else {
      setShowAnswer(true);
    }
  };

  const handleEnd = () => {
    setShowQuestionList(true);
  };

  const handleCopyAndClose = () => {
    const questionList = questions.map((q) => q.question).join("\n");
    navigator.clipboard.writeText(questionList);
    alert("영어 문장 목록이 클립보드에 복사되었습니다!");
    setShowQuestionList(false);
    setIsStarted(false);
    setShowAnswer(false);
    setCurrentIndex(0);
  };

  return (
    <Container>
      {!isStarted ? (
        <>
          <TextArea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="다음과 같은 형식으로 입력하세요:&#10;&#10;**I'm on ~  ~하는 중이에요 / ~ 상태예요**&#10;I'm on a diet.   나 다이어트 중이야.&#10;I'm on a break.   나 쉬는 중이야."
          />
          <Button onClick={handleStart}>테스트 시작</Button>
        </>
      ) : (
        <Card>
          {questions.length > 0 && (
            <>
              <TopContainer>
                <Button onClick={handleEnd}>종료</Button>
                {questions[currentIndex].hint && (
                  <HintToggle
                    onClick={() => setShowHint(!showHint)}
                    isOpen={showHint}
                  >
                    힌트 {showHint ? "접기" : "보기"}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 10l5 5 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </HintToggle>
                )}
              </TopContainer>

              <ProgressText>
                문제 {currentIndex + 1} / {questions.length}
              </ProgressText>

              {questions[currentIndex].hint && (
                <HintText isOpen={showHint}>
                  {questions[currentIndex].hint}
                </HintText>
              )}

              <div>
                <QuestionText>{questions[currentIndex].question}</QuestionText>
                <AnswerContainer>
                  <AnswerText show={showAnswer}>
                    {questions[currentIndex].answer}
                  </AnswerText>
                </AnswerContainer>
              </div>

              <ButtonContainer>
                <Button onClick={handleNext}>
                  {showAnswer && currentIndex < questions.length - 1
                    ? "다음"
                    : "답변"}
                </Button>
              </ButtonContainer>
            </>
          )}
        </Card>
      )}

      {showQuestionList && (
        <>
          <Overlay onClick={() => setShowQuestionList(false)} />
          <QuestionListModal>
            <h3>학습한 문장 목록</h3>
            <QuestionList>
              {questions.map((q, index) => (
                <li key={index}>{q.question}</li>
              ))}
            </QuestionList>
            <ButtonContainer>
              <Button onClick={handleCopyAndClose}>복사하고 종료</Button>
            </ButtonContainer>
          </QuestionListModal>
        </>
      )}
    </Container>
  );
};

export default EnglishInstantTest;
