import axiosInstance from "./axiosInstance";

export const getCharacter = () => axiosInstance.get("/api/character");

export const reviveCharacter = () => axiosInstance.post("/api/character/revive");
