import axiosInstance from "./axiosInstance";

// axiosInstance interceptor가 Authorization 헤더를 자동으로 추가함
export const postAttendance = () => axiosInstance.post("/api/attendance");

export const getAttendance = () => axiosInstance.get("/api/attendance");
