import "./aside.css"
import '../bbuttons/button.css'
import "../../views/styles/menustyle.css"
import { useNavigate } from "react-router-dom";
import ButtonLeft from '../bbuttons/buttonSideMenu'
import Button from '../bbuttons/button'


export default function AsideMenu() {
  const navigate = useNavigate();
  return (
    <div className="menuLateral" >
      <div className="logo-container">
        <img className="logo" src="./../img/logoChessW.png"/>    
      </div>
      <nav className="menuNav">
        <ButtonLeft
            img="/menuIcons/PlayW.png"
            type="butStyle"
            text="JUGAR"
            action={() => navigate("/game" )}
        />
        <ButtonLeft
            img="/menuIcons/HistorialW.png"
            type="butStyle"
            text="HISTORIAL"
            action={() => navigate("/history" )}
        />
        <ButtonLeft
            img="/menuIcons/PuzzleW.png"
            type="butStyle"
            text="EJERCICIOS"
            action={() => navigate("/exercises" )}
        />
        <ButtonLeft
            img="/menuIcons/RulesW.png"
            type="butStyle"
            text="REGLAS"
            action={() => navigate("/rules" )}
        />
      </nav>
      <div className="spacer"></div>
      <div className="bottons-button">
        <Button
          type="enPlay"
          text="REGISTRARSE"
          color="verde"
          action={() => navigate("/registrarse" )}
        />
        <Button
          type="enPlay"
          text="INICIAR SESIÓN"
          color="azul"
          action={() => navigate("/inicioSesion" )}
        />
        <ButtonLeft
            img="/img/logoChessW.png"
            typeExit="exit"
            text="SALIR"
            action={() => navigate("/mainInicio" )}
        />
      </div>
    </div>
  );
}