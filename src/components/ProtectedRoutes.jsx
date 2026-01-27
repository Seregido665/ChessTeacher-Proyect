import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/authContext';

// --- PARA RUTAS QUE REQUIERAN AUTENTIFICACIÓN ---
export const ProtectedRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="loading-container" 
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
          }}
      >
        <p>Cargando...</p>
      </div>
    );
  }
  return isAuthenticated && user ? children : <Navigate to="/inicioSesion" replace />;
};


// --- RUTAS INACCESIBLES SI YA ESTÁS LOGUEADO ---
export const PublicRoute = ({ children }) => {
  const { loading, isAuthenticated } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="loading-container" 
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
          }}
      >
        <p>Cargando...</p>
      </div>
    );
  }
  return isAuthenticated ? <Navigate to="/game" replace /> : children;
};
