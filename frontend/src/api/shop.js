import axiosInstance from "./axiosInstance";

export const getShopItems = () =>
  axiosInstance.get("/api/shop/items");

export const buyItem = (itemType) =>
  axiosInstance.post("/api/shop/buy", { itemType });

export const consumeItem = (itemType) =>
  axiosInstance.post("/api/shop/use", { itemType });

export const getCoinHistory = () =>
  axiosInstance.get("/api/coins/history");

export const getInventory = () =>
  axiosInstance.get("/api/shop/inventory");
