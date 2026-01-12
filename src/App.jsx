import {  Routes, Route } from "react-router-dom";
import Registrarse from "./views/inicioApp/registrarse/registrarse"
import Sesion from "./views/inicioApp/inicioSesion/inicioSesion"
import Inicio from "./views/inicioApp/mainInicio/mainInicio"
import Historial from "./views/history/history"
import Juego from "./views/game/game"
import Ejercicios from "./views/exercises/exercises"
import Reglas from "./views/rules/rules"

function App() {
  return (
   <>
      <div>
        <Routes>
          <Route path="/registrarse" element={<Registrarse />} />
          <Route path="/inicioSesion" element={<Sesion />} />
          {/*<Route path="/user/:id" element={<UserDetail />} />*/}

          <Route path="/mainInicio" element={<Inicio />} />
          <Route path="/game" element={<Juego />} />
          <Route path="/history" element={<Historial />} />
          <Route path="/exercises" element={<Ejercicios />} />
          <Route path="/rules" element={<Reglas />} />
          <Route path="*" element={
            <Inicio />
          } />
        </Routes>
        
      </div>
    </>
  )
}

export default App