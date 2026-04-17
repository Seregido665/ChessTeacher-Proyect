import apiClient from "./baseService";

export const registerUser = (userData) => {
  return apiClient.post("/register", userData);
};

export const loginUser = (userData) => {
  return apiClient.post("/login", userData);
};

export const getUserProfile = () => {
  return apiClient.get("/profile");
};

export const deleteUser = (id) => {
  return apiClient.delete(`/user/${id}`);
};

export const editUser = (id) => {
  return apiClient.patch(`/user/${id}`);
};