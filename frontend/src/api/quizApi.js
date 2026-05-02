import axiosInstance from "./axiosInstance";

export const fetchQuizQuestions = (day, type) =>
  axiosInstance.get("/api/quiz", { params: { day, type } });

export const startQuiz = (day, type) =>
  axiosInstance.post("/api/quiz/start", { day, type });

export const submitAnswer = (quizId, wordId, userAnswer) =>
  axiosInstance.post(`/api/quiz/${quizId}/answer`, { wordId, userAnswer });

export const submitQuiz = (quizId) =>
  axiosInstance.post(`/api/quiz/${quizId}/submit`);
