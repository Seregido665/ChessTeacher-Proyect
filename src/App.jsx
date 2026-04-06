import { Routes, Route } from "react-router-dom";
import Registrarse from "./views/inicioApp/registrarse/registrarse"
import Sesion from "./views/inicioApp/inicioSesion/inicioSesion"
import Inicio from "./views/inicioApp/mainInicio/mainInicio"
import Historial from "./views/history/history"
import Juego from "./views/game/game"
import Ejercicios from "./views/exercises/exercises"
import Reglas from "./views/rules/rules"
import Analisis from "./views/analisis/analisis"
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoutes';

function App() {
  return (
   <>
      <div>
        <Routes>
          <Route 
            path="/mainInicio" 
            element={
              <PublicRoute>
                <Inicio />
              </PublicRoute>
            } 
          />
          <Route 
            path="/registrarse" 
            element={
              <PublicRoute>
                <Registrarse />
              </PublicRoute>
            } 
          />
          <Route 
            path="/inicioSesion" 
            element={
              <PublicRoute>
                <Sesion />
              </PublicRoute>
            } 
          />
          {/*<Route path="/user/:id" element={<UserDetail />} />*/}
          {/*<Route 
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />*/}

          
          <Route path="/game" element={<Juego />} />
          <Route path="/history" element={<Historial />} />
          <Route path="/exercises" element={<Ejercicios />} />
          <Route path="/rules" element={<Reglas />} />
          <Route path="/analysis" element={<Analisis />} />
          <Route path="*" element={<Inicio />} />
        </Routes>
        
      </div>
    </>
  )
}

export default App