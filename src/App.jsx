import { Routes, Route } from "react-router-dom";
import Registrarse from "./views/inicioApp/registrarse/registrarse"
import Sesion from "./views/inicioApp/inicioSesion/inicioSesion"
import Inicio from "./views/inicioApp/mainInicio/mainInicio"
import Historial from "./views/history/history"
import Juego from "./views/game/game"
import Ejercicios from "./views/exercises/exercises"
import Documentation from "./views/rules/documentation"
import Analisis from "./views/analisis/analisis"
import { PublicRoute } from './components/ProtectedRoutes';       // LIMITA EL ACCESO A CIERTAS VENTANAS.

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

          
          <Route path="/game" element={<Juego />} />
          <Route path="/history" element={<Historial />} />
          <Route path="/exercises" element={<Ejercicios />} />
          <Route path="/rules" element={<Documentation />} />
          <Route path="/analysis" element={<Analisis />} />
          <Route path="*" element={<Inicio />} />
        </Routes>
        
      </div>
    </>
  )
}

export default App