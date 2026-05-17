import axiosInstance from "./axiosInstance";

export const getProgress = () => axiosInstance.get("/api/stats/progress");

export const getQuizAccuracy = () => axiosInstance.get("/api/stats/quiz-accuracy");

export const getWeeklyStats = () => axiosInstance.get("/api/stats/weekly");
