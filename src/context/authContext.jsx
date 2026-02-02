import { createContext, useCallback, useEffect, useState } from 'react';
import { getUserProfile } from '../services/user.service';
import { getToken, setToken, removeToken } from '../utils/auth';

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // --- Establecer usuario y token al login ---
  const handleSetUser = useCallback((authData) => {
    if (authData.token) {
      setToken(authData.token);     
      setTokenState(authData.token); 
    }
    if (authData.user) {
      // ✅ Normalizar: extrae el user si wrapped (e.g., authData.user.user), o directo
      const normalizedUser = authData.user.user ? authData.user.user : authData.user;
      setUser(normalizedUser);
    }
  }, []);

  // --- Logout ---
  const handleLogout = useCallback(() => {
    removeToken();
    setTokenState(null);
    setUser(null);
  }, []);

  // --- Al cargar la app, comprobamos si hay token ---
  useEffect(() => {
    const checkToken = async () => {
      const storedToken = getToken();
      console.log("[AUTH CHECK] Token encontrado en localStorage:", !!storedToken);
      console.log("[AUTH CHECK] Token value (primeros 20 chars):", storedToken?.substring(0, 20) || "NO TOKEN");

      if (storedToken) {
        setTokenState(storedToken);
        try {
          console.log("[AUTH CHECK] Intentando fetch profile con token...");
          const profileResponse = await getUserProfile(storedToken); // Renombré para claridad
          console.log("[AUTH CHECK] Profile response completa (Axios):", profileResponse);

          // ✅ Corrige aquí: extrae solo el data (el usuario real)
          const profileData = profileResponse.data; // { _id, name, email }
          console.log("[AUTH CHECK] Profile data extraída:", profileData);

          // ✅ Normalizar adicional si wrapped en "user:"
          const normalizedUser = profileData.user ? profileData.user : profileData;
          console.log("[AUTH CHECK] User normalizado final:", normalizedUser);
          
          setUser(normalizedUser); // Ahora setea { _id, name, email }
        } catch (err) {
          console.error("[AUTH CHECK] ERROR al obtener profile:", err);
          console.error("[AUTH CHECK] Status:", err.response?.status);
          console.error("[AUTH CHECK] Mensaje:", err.response?.data?.message || err.message);
          handleLogout();
        } finally {
          setIsAuthLoading(false);
          console.log("[AUTH CHECK] Finalizó chequeo. isAuthLoading ahora false");
        }
      } else {
        console.log("[AUTH CHECK] No hay token → no autenticado");
        setIsAuthLoading(false);
      }
    };

    checkToken();
  }, [handleLogout]);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      handleSetUser,
      handleLogout,
      isAuthenticated,
      isAuthLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;