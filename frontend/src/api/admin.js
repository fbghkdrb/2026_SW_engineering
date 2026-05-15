import axiosInstance from "./axiosInstance";

export const getAdminUsers = () => axiosInstance.get("/api/admin/users");

export const patchUserRole = (userId) =>
  axiosInstance.patch(`/api/admin/users/${userId}/role`);
