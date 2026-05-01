import axiosInstance from "./axiosInstance";

export const getMe = () =>
  axiosInstance.get("/api/users/me");

export const updateNickname = (nickname) =>
  axiosInstance.patch("/api/users/me/nickname", { nickname });

export const deleteAccount = () =>
  axiosInstance.delete("/api/users/me");

export const checkUsername = (username) =>
  axiosInstance.get(`/api/users/check?username=${username}`);
