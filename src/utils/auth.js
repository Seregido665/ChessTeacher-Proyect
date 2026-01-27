// --- USOS DEL TOKEN EN EL FRONTEND ---

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

// -- VERIFICAR SI EL TOKEN HA EXPIRADO --
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));  // PARA DECODIFICAR EL payload DEL TOKEN
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;       // VERIFICA SI HA PASADO EL LIMITE DE TIEMPO
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return true;
  }
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
  return token && !isTokenExpired(token);
};
