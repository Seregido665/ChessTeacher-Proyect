import "../../styles/menustyle.css";
import { useNavigate } from "react-router-dom";
import Button from '../../../components/bbuttons/button'


const Inicio = () => {
    const navigate = useNavigate();

    return (
      <div className="fondo img-fondo1">
          <div>
            <div className="row w-100 m-0">
              <div className="col-xl-5 col-md-5 col-12"></div>
              <div className="col-xl-7 col-md-7 col-12 d-flex align-items-center">
                <section className="inicioSesion">
                  <div>
                    <img className="imgLogo" src="./../img/logoChessW.png"/>    
                  </div>
                  <div className="pb-3 pt-3">
                    <p className="intro">
                      Bienvenido a tu entrenador <br />
                      de ajedrez.
                    </p>
                  </div>
                  <div>
                    <Button
                      type="primary"
                      text="REGISTRARSE"
                      color="verde"
                      action={() => navigate("/registrarse" )}
                    />
                    <Button
                      type="primary"
                      text="INICIAR SESIÓN"
                      color="azul"
                      action={() => navigate("/inicioSesion" )}
                    />
                  </div>
                  <div>
                      <button 
                        className="simple" 
                        onClick={() => navigate("/game")}>
                          Jugar.
                      </button>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
    )
}
 
export default Inicio
