import axiosInstance from "./axiosInstance";

export const getWrongNotes = () =>
  axiosInstance.get("/api/wrong-notes");

export const getWrongNoteQuiz = () =>
  axiosInstance.get("/api/wrong-notes/quiz");

export const submitWrongNoteQuiz = (answers) =>
  axiosInstance.post("/api/wrong-notes/quiz/submit", { answers });
