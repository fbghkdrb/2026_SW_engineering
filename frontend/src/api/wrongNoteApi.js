import axiosInstance from "./axiosInstance";

export const getWrongNotes = () =>
  axiosInstance.get("/api/wrong-notes");

export const getWrongNoteQuiz = () =>
  axiosInstance.get("/api/wrong-notes/quiz");

export const submitWrongNoteQuiz = (answers) =>
  axiosInstance.post("/api/wrong-notes/quiz/submit", { answers });

// 오답 퀴즈 진입 조건 체크 (서버 응답 기준)
export const checkWrongNoteQuizEntry = () =>
  axiosInstance.get("/api/wrong-notes/quiz");

export const deleteWrongNote = (wordId) =>
  axiosInstance.delete(`/api/wrong-notes/${wordId}`);
