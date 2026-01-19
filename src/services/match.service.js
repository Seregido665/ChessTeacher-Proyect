import apiClient from "./baseService";

export const saveMatch = (userData) => {
  return apiClient.post("/save", userData);
};

export const getMatches = () => {
  return apiClient.get("/matches");
};