import {  Routes, Route } from "react-router-dom";
import Registrarse from "./views/inicioApp/registrarse/registrarse"
import Sesion from "./views/inicioApp/inicioSesion/inicioSesion"
import Inicio from "./views/inicioApp/mainInicio/mainInicio"
import './App.css'

function App() {

/*const App = () => {
  const { pathname } = useLocation()        ----->  PARA SABER LA UBICACION EN LA QUE ESTAS 
                                            --> Y EVITAR QUE ACCEDAN ANTES DE TIEMPO A
  return (
    <div>
      {pathname !== '/404' && <Navbar />}

      <Routes>
        <Route path="/todos" element={<Todos />} />
        <Route path="/users" element={<Users />} />
        <Route path="/404" element={<Error404 />} />
        <Route path="*" element={
          <div>
            <h1>Welcome to the App</h1>
          </div>
        } />
      </Routes>
    </div>
  )
}*/



  return (
   <>
      <div>
        <Routes>
          <Route path="/registrarse" element={<Registrarse />} />
          <Route path="/inicioSesion" element={<Sesion />} />
          <Route path="/mainInicio" element={<Inicio />} />
          <Route path="*" element={
            <Inicio />
          } />
        </Routes>
        
      </div>
    </>
  )
}

export default App