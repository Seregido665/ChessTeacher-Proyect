import { createContext, useCallback, useEffect, useState } from 'react';
import { getUserProfile } from '../services/user.service';
import { getToken, setToken, removeToken } from '../utils/auth';

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Establecer usuario y token al login ---
  const handleSetUser = useCallback((authData) => {
    if (authData.token) {
      setToken(authData.token);     
      setTokenState(authData.token); 
    }
    if (authData.user) {
      setUser(authData.user);
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
      if (storedToken) {
        setTokenState(storedToken); // ✅ Esto ya no causa warning
        try {
          const profileData = await getUserProfile(storedToken);
          setUser(profileData);
        } catch (err) {
          console.error('Error fetching profile data:', err);
          handleLogout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkToken(); // Ejecutamos la función asíncrona
  }, [handleLogout]);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      handleSetUser,
      handleLogout,
      isAuthenticated,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
