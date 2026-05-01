import axiosInstance from "./axiosInstance";

export const getDays = () =>
  axiosInstance.get("/api/words/days");

export const getWords = (day) =>
  axiosInstance.get("/api/words", { params: { day } });

export const toggleKnown = (wordId) =>
  axiosInstance.patch(`/api/words/${wordId}/known`);

export const toggleFavorite = (wordId) =>
  axiosInstance.patch(`/api/words/${wordId}/favorite`);
