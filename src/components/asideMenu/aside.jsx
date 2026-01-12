import "./aside.css";
import '../bbuttons/button.css';
import "../../views/styles/menustyle.css";
import { useNavigate } from "react-router-dom";
import { ButtonLeft, ButtonLeftExit } from '../bbuttons/buttonSideMenu';
import Button from '../bbuttons/button';
import { useState } from 'react'; // ← Añadido para leer localStorage reactivamente

export default function AsideMenu() {
  const navigate = useNavigate();
  
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('authUser'));
  
  const handleLogout = () => {
    localStorage.removeItem('authUser');
    setIsLoggedIn(false);
    navigate("/mainInicio"); 
  };
  return (
    <div className="menuLateral">
      <div className="logo-container">
        <img className="logo" src="./../img/logoChessW.png" alt="Logo" />
      </div>

      <nav className="menuNav">
        <ButtonLeft
          img="/menuIcons/PlayW.png"
          type="butStyle"
          text="JUGAR"
          action={() => navigate("/game")}
        />
        <ButtonLeft
          img="/menuIcons/HistorialW.png"
          type="butStyle"
          text="HISTORIAL"
          action={() => navigate("/history")}
        />
        <ButtonLeft
          img="/menuIcons/PuzzleW.png"
          type="butStyle"
          text="EJERCICIOS"
          action={() => navigate("/exercises")}
        />
        <ButtonLeft
          img="/menuIcons/RulesW.png"
          type="butStyle"
          text="REGLAS"
          action={() => navigate("/rules")}
        />
      </nav>

      <div className="spacer"></div>

      <div className="bottons-button">
        {!isLoggedIn && (
          <>
            <Button
              type="enPlay"
              text="REGISTRARSE"
              color="verde"
              action={() => navigate("/registrarse")}
            />
            <Button
              type="enPlay"
              text="INICIAR SESIÓN"
              color="azul"
              action={() => navigate("/inicioSesion")}
            />
          </>
        )}

        
      </div>
      <ButtonLeftExit
          typeExit="exit"
          text={isLoggedIn ? "LogOut" : "Salir"}
          action={isLoggedIn ? handleLogout : () => navigate("/mainInicio")}
        />
    </div>
  );
}