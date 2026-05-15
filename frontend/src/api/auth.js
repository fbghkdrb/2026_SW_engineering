import axiosInstance from "./axiosInstance";

export const signup = (data) =>
  axiosInstance.post("/api/auth/signup", data);

export const login = (data) =>
  axiosInstance.post("/api/auth/login", data);

export const refreshToken = (refreshToken) =>
  axiosInstance.post("/api/auth/refresh", { refreshToken });

export const logout = () =>
  axiosInstance.post("/api/auth/logout");
