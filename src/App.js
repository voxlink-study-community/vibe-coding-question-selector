import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Paper,
  Card,
  CardContent,
  IconButton,
  useTheme,
  Grid,
  Divider,
} from "@mui/material";
import { ArrowBack, ArrowForward, Casino } from "@mui/icons-material";
import "./App.css";

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [usedQuestions, setUsedQuestions] = useState({});
  const [category, setCategory] = useState("딥러닝"); // 기본 카테고리
  const [isRolling, setIsRolling] = useState(false);
  const rouletteRef = useRef(null);
  const theme = useTheme();

  const categories = [
    { id: "딥러닝", file: "test.txt" },
    { id: "CS", file: "test2.txt" },
    { id: "영어회화", file: "test3.txt" },
  ];

  // 카테고리 변경 시 질문 데이터 초기화
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    setSelectedQuestion("");
  };

  // 선택된 카테고리에 맞는 파일 이름 가져오기
  const getFileNameByCategory = () => {
    const selectedCategory = categories.find((c) => c.id === category);
    return selectedCategory ? selectedCategory.file : "test.txt";
  };

  // 질문 데이터 로드
  useEffect(() => {
    const fileName = getFileNameByCategory();

    fetch(`/${fileName}`)
      .then((response) => response.text())
      .then((data) => {
        const questionList = data
          .split("\n")
          .filter((line) => line.trim().startsWith("-"))
          .map((line) => line.trim());
        setQuestions(questionList);
      })
      .catch((error) =>
        console.error(`Error loading questions from ${fileName}:`, error)
      );
  }, [category]); // 카테고리가 변경될 때마다 질문 다시 로드

  // 룰렛 효과를 위한 함수
  const startRoulette = () => {
    if (isRolling) return;
    setIsRolling(true);

    const roundCategoryKey = `${currentRound}-${category}`;
    const roundQuestions = usedQuestions[roundCategoryKey] || [];
    const availableQuestions = questions.filter(
      (q) => !roundQuestions.includes(q)
    );

    if (availableQuestions.length === 0) {
      setSelectedQuestion("이 회차의 모든 질문을 확인했습니다.");
      setIsRolling(false);
      return;
    }

    // 최종 선택될 질문
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const finalQuestion = availableQuestions[randomIndex];

    // 룰렛 효과를 위한 변수
    let iterations = 0;
    const maxIterations = 20; // 룰렛이 돌아가는 횟수
    const interval = 1500 / maxIterations; // 점점 느려지는 효과를 위한 간격

    const roulette = setInterval(() => {
      const tempIndex = Math.floor(Math.random() * questions.length);
      const tempQuestion = questions[tempIndex];
      setSelectedQuestion(tempQuestion);

      iterations++;

      if (iterations >= maxIterations) {
        clearInterval(roulette);
        setSelectedQuestion(finalQuestion);

        // 사용된 질문 기록
        setUsedQuestions((prev) => ({
          ...prev,
          [roundCategoryKey]: [
            ...(prev[roundCategoryKey] || []),
            finalQuestion,
          ],
        }));

        setIsRolling(false);
      }
    }, interval);
  };

  // 회차별 날짜 계산
  const getRoundDate = (round) => {
    const startDate = new Date("2024-03-20"); // 시작 날짜
    const roundDate = new Date(startDate);
    roundDate.setDate(startDate.getDate() + (round - 1) * 7); // 7일마다 새로운 회차
    return roundDate.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Box className="app-container">
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* 왼쪽 사이드바 - 카테고리 및 회차 선택 */}
          <Grid item xs={12} sm={4} md={3}>
            <Paper elevation={0} className="sidebar-paper">
              <Typography variant="h6" component="h2" gutterBottom>
                면접 질문 선택기
              </Typography>

              <Box mb={3}>
                <FormControl variant="outlined" fullWidth size="small">
                  <InputLabel id="category-select-label">카테고리</InputLabel>
                  <Select
                    labelId="category-select-label"
                    id="category-select"
                    value={category}
                    onChange={handleCategoryChange}
                    label="카테고리"
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.id}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box className="round-selector-mui">
                <Box className="round-header">
                  <Typography variant="subtitle2" color="textSecondary">
                    회차 선택
                  </Typography>
                </Box>

                <Box className="round-controls">
                  <IconButton
                    onClick={() =>
                      setCurrentRound((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentRound === 1}
                    color="primary"
                    size="small"
                  >
                    <ArrowBack fontSize="small" />
                  </IconButton>

                  <Box className="round-info-mui">
                    <Typography variant="h6" color="primary">
                      {currentRound}회차
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {getRoundDate(currentRound)}
                    </Typography>
                  </Box>

                  <IconButton
                    onClick={() => setCurrentRound((prev) => prev + 1)}
                    color="primary"
                    size="small"
                  >
                    <ArrowForward fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              <Box mt={3}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={startRoulette}
                  disabled={isRolling}
                  startIcon={<Casino />}
                  className="select-button-mui"
                >
                  {isRolling ? "선택 중..." : `질문 선택하기`}
                </Button>
              </Box>

              <Box mt={2} className="category-info">
                <Typography variant="body2" color="textSecondary">
                  현재 선택: {category}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* 오른쪽 메인 영역 - 질문 표시 */}
          <Grid item xs={12} sm={8} md={9} className="question-grid">
            <Box className="question-container" ref={rouletteRef}>
              {selectedQuestion ? (
                <Card
                  variant="outlined"
                  className={`question-card-large ${
                    isRolling ? "rolling" : ""
                  }`}
                >
                  <CardContent className="question-content-large">
                    <Typography
                      variant="h4"
                      component="p"
                      className="question-text"
                    >
                      {selectedQuestion}
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <Box className="no-question-message">
                  <Typography variant="h5" color="textSecondary">
                    왼쪽의 '질문 선택하기' 버튼을 클릭하세요
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default App;
