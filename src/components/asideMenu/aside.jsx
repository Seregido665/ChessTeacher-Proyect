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
            img="/img/logoChessW.png"
            type="butStyle"
            text="HISTORIAL"
            //color="azul"
            //action={() => console.log('Botón presionado')}
        />
        <ButtonLeft
            img="/img/logoChessW.png"
            type="butStyle"
            text="EJERCICIOS"
            //color="azul"
            //action={() => console.log('Botón presionado')}
        />
        <ButtonLeft
            img="/img/logoChessW.png"
            type="butStyle"
            text="REGLAS BÁSICAS"
            //color="azul"
            //action={() => console.log('Botón presionado')}
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
            type="exit enPlay"
            text="SALIR"
            color="rojo"
            action={() => navigate("/mainInicio" )}
        />
      </div>
    </div>
  );
}