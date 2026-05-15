import axiosInstance from "./axiosInstance";

export const fetchQuizQuestions = (day, type) =>
  axiosInstance.get("/api/quiz", { params: { day, type } });

export const fetchMultipleQuizQuestions = (day, direction) =>
  axiosInstance.get("/api/quiz", { params: { day, type: "MULTIPLE", direction } });

export const fetchBlankQuizQuestions = (day) =>
  axiosInstance.get("/api/quiz", { params: { day, type: "BLANK" } });

export const startQuiz = (day, type) =>
  axiosInstance.post("/api/quiz/start", { day, type });

export const submitAnswer = (quizId, wordId, userAnswer) =>
  axiosInstance.post(`/api/quiz/${quizId}/answer`, { wordId, userAnswer });

export const submitQuiz = (quizId) =>
  axiosInstance.post(`/api/quiz/${quizId}/submit`);

export const fetchTodayPassStatus = () =>
  axiosInstance.get("/api/quiz/today-pass");
