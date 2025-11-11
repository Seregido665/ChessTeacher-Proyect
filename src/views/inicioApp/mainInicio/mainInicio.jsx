import '../../../App.css';
import { useNavigate } from "react-router-dom";
import Button from '../../../components/bbuttons/button'


const Inicio = () => {

    const navigate = useNavigate();

    return (
        <div>
            <div>
          <div className="row w-100 m-0">
            <div className="col-xl-5 col-md-5 col-12"></div>
            <div className="col-xl-7 col-md-7 col-12 d-flex align-items-center">
              <section className="inicioSesion">

                <div>
                  <img className="imgLogo" src="./../img/logoChessW.png"/>    
                </div>

                <div className="pb-5 pt-3">
                  <p className="intro">
                    Bienvenido a tu entrenador <br />
                    personal de ajedrez.
                  </p>
                </div>

                  <Button
                    size="large"
                    type="primary"
                    text="REGISTRARSE"
                    color="verde"
                    action={() => navigate("/registrarse" )}
                  />
                  <Button
                    size="large"
                    type="primary"
                    text="INICIAR SESIÓN"
                    color="azul"
                    action={() => navigate("/inicioSesion" )}
                  />

              </section>
            </div>
          </div>
        </div>
        </div>
    )
}
 
export default Inicio
