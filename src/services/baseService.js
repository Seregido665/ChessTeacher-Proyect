import axios from "axios";
import { getToken } from "../utils/auth";

const apiClient = axios.create({
  baseURL: "http://localhost:3000",
});


// -- ASI AL RECARGAR LA PAGINA EL TOKEN PERSISTIRA --
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;   // Gracias a esto
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;