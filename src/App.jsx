import {  Routes, Route } from "react-router-dom";
import Registrarse from "./views/inicioApp/registrarse/registrarse"
import Sesion from "./views/inicioApp/inicioSesion/inicioSesion"
import Inicio from "./views/inicioApp/mainInicio/mainInicio"
import Juego from "./views/game/game"
import './App.css'

function App() {
  return (
   <>
      <div>
        <Routes>
          <Route path="/registrarse" element={<Registrarse />} />
          <Route path="/inicioSesion" element={<Sesion />} />
          <Route path="/mainInicio" element={<Inicio />} />
          <Route path="/game" element={<Juego />} />
          <Route path="*" element={
            <Inicio />
          } />
        </Routes>
        
      </div>
    </>
  )
}

export default App