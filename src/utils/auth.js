// --- USOS DEL TOKEN ---

// -- OBTENER TOKEN --
export const getToken = () => {
  return localStorage.getItem("jwt_token");
};

// -- GUARDAR TOKEN --
export const setToken = (token) => {
  localStorage.setItem("jwt_token", token);
};

// -- ELIMINAR TOKEN --
export const removeToken = () => {
  localStorage.removeItem("jwt_token");
};

// -- OBTENER EL PAYLOAD (INFORMACION) DEL TOKEN --
export const getTokenPayload = (token) => {
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (error) {
    console.error("Error al decodificar el payload del token:", error);
    return null;
  }
};

// -- VERIFICAR SI EL USUARIO ESTA AUTENTICADO --
export const isAuthenticated = () => {
  const token = getToken();
  return token;
};
