import "./aside.css";
import '../bbuttons/button.css';
import "../../views/styles/menustyle.css";
import { useNavigate } from "react-router-dom";
import { ButtonLeft, ButtonLeftExit } from '../bbuttons/buttonSideMenu';
import Button from '../bbuttons/button';
import { useContext } from 'react'; 
import AuthContext from "../../context/authContext";

export default function AsideMenu() {
  const navigate = useNavigate();

  const { user, handleLogout } = useContext(AuthContext);
  const isLoggedIn = !!user;
  
  const onLogout = () => {
    handleLogout(); 
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
          type="butStyle2"
          text="INFO.APP"
          action={() => navigate("/rules")}
        />
      </nav>

      <div className="spacer"></div>

      <div className="bottons-button">
        {!isLoggedIn && (
          <>
            <Button
              type="enPlay"
              text={<><span className="auth-label-full">REGISTRARSE</span><span className="auth-label-short">R</span></>}
              color="verde"
              action={() => navigate("/registrarse")}
            />
            <Button
              type="enPlay"
              text={<><span className="auth-label-full">INICIAR SESIÓN</span><span className="auth-label-short">I</span></>}
              color="azul"
              action={() => navigate("/inicioSesion")}
            />
          </>
        )}

        
      </div>
      <ButtonLeftExit
          typeExit="exit"
          text={<><span className="exit-label">Salir</span><img className="exit-icon" src="/Off.png" alt="Salir" /></>}
          action={isLoggedIn ? onLogout : () => navigate("/mainInicio")}
        />
    </div>
  );
}