import axiosInstance from "./axiosInstance";

export const getProgress = () => axiosInstance.get("/api/stats/progress");
