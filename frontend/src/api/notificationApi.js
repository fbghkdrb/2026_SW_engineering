import axiosInstance from "./axiosInstance";

export const getNotifications = () => axiosInstance.get("/api/notifications");

export const markNotificationRead = (id) =>
  axiosInstance.patch(`/api/notifications/${id}/read`);
