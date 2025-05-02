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

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
`;

const TopContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  position: absolute;
  top: 20px;
  left: 20px;
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

const InstantTest = () => {
  const [inputText, setInputText] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showQuestionList, setShowQuestionList] = useState(false);

  const parseText = (text) => {
    const lines = text.split("\n").filter((line) => line.trim());
    const parsedQuestions = [];

    for (let i = 0; i < lines.length; i += 2) {
      if (i + 1 < lines.length) {
        parsedQuestions.push({
          question: lines[i],
          answer: lines[i + 1],
        });
      }
    }

    return parsedQuestions;
  };

  const handleStart = () => {
    const parsedQuestions = parseText(inputText);
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
    alert("질문 목록이 클립보드에 복사되었습니다!");
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
            placeholder="질문과 답변을 번갈아가며 입력하세요.&#10;예시:&#10;알고리즘이란?&#10;알고리즘은 어떤겁니다"
          />
          <Button onClick={handleStart}>테스트 시작</Button>
        </>
      ) : (
        <Card>
          {questions.length > 0 && (
            <>
              <TopContainer>
                <Button onClick={handleEnd}>종료</Button>
              </TopContainer>

              <ProgressText>
                문제 {currentIndex + 1} / {questions.length}
              </ProgressText>

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
            <h3>학습한 문제 목록</h3>
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

export default InstantTest;
