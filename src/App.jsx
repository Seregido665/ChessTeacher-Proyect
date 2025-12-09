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



// METER Stockfish
// QUE EL TABLERO PUEDA GIRARSE SI EL JUGADOS ES NEGRAS.
//--> QUE LA NOTACION SEA LA OFICIAL DE LAS PARTIDAS DE AJEDREZ: Nf3, exd5, 0-0...
// HISTORIAL DE MOVIMIENTOS Y NUMERACION
//--> RESALTAR CASILLA DEL REY SI ESTA EN JAQUE.
//--> PREMOVER, ARRASTRAR PIEZA EN VEZ DE click-click
// MOSTRAR PIEZAS CAPTURADAS
// REGLA DE 50 JUGADAS SIN CAPTURA/MOVERPEON --> TABLAS
// TRIPLE REPETICION DE JUGADAS --> TABLAS
// MATERIAL INSUFICIENTE (SOLO REYES) --> TABLAS
// EXPORTAR PGN