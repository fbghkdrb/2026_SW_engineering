import axiosInstance from "./axiosInstance";

export const getAdminWords = (day) => {
  const params = day !== "" && day !== null && day !== undefined ? { day } : {};
  return axiosInstance.get("/api/admin/words", { params });
};

export const addAdminWord = (data) =>
  axiosInstance.post("/api/admin/words", data);

export const updateAdminWord = (wordId, data) =>
  axiosInstance.put(`/api/admin/words/${wordId}`, data);

export const deleteAdminWord = (wordId) =>
  axiosInstance.delete(`/api/admin/words/${wordId}`);

export const uploadAdminWordCsv = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axiosInstance.post("/api/admin/words/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
