import { createContext, useCallback, useEffect, useState } from 'react';
import { getUserProfile } from '../services/user.service';
import { getToken, setToken, removeToken } from '../utils/auth';

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);

  // --- ESTABLECER USUARIO Y TOKEN AL LOGUEAR ---
  const handleSetUser = useCallback((authData) => {
    if (authData.token) {
      setToken(authData.token);     
      setTokenState(authData.token); 
    }
    if (authData.user) {
      const normalizedUser = authData.user.user ? authData.user.user : authData.user;
      setUser(normalizedUser);
    }
  }, []);

  // --- LOGOUT ---
  const handleLogout = useCallback(() => {
    removeToken();
    setTokenState(null);
    setUser(null);
  }, []);

  // --- AL CARGAR LA APP, COMPROBAMOS SI HAY TOKEN ---
  useEffect(() => {
    const checkToken = async () => {
      const storedToken = getToken();

      setTokenState(storedToken);
      try {
        const profileResponse = await getUserProfile(storedToken); 
        const profileData = profileResponse.data; 
        const normalizedUser = profileData.user ? profileData.user : profileData;
        
        setUser(normalizedUser); // Ahora es { _id, name, email }
      } catch (err) {
        handleLogout();
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
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;