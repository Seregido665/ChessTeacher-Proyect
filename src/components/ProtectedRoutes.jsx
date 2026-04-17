import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/authContext';


// --- RUTAS INACCESIBLES SI YA ESTÁS LOGUEADO ---
export const PublicRoute = ({ children }) => {
  const { loading, isAuthenticated } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="loading-container">
        <p>Cargando...</p>
      </div>
    );
  }
  return isAuthenticated ? <Navigate to="/game" replace /> : children;
};
