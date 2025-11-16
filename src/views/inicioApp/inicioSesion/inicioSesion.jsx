import "../../styles/menustyle.css";
import { useNavigate } from "react-router-dom";
import Button from '../../../components/bbuttons/button'


const Sesion = () => {
    const navigate = useNavigate();

    return (
        <div className="fondo img-fondo1">
            <div>
                <div className="row w-100 m-0">
                    <div className="col-xl-5 col-md-5 col-12"></div>
                    <div className="col-xl-7 col-md-7 col-12 d-flex align-items-center">
                        <section className="inicioSesion">
                            <div className="pb-3"> 
                                <img className="imgLogo" src="../../img/logoChessW.png"/> 
                            </div>
                            <section className="marco">
                                <h1 className="titulo pt-4 pb-2">Iniciar Sesión.</h1>
                                <form action="/inicioSesion" class="formul" method="post">
                                    <label htmlFor="nombre" className="subtitulo">Nombre de usuario:</label><br />
                                    <input type="text" id="nombre" name="nombre" required /><br /><br />

                                    <label htmlFor="password" className="subtitulo">Contraseña:</label><br />
                                    <input type="password" id="password" name="password" required /><br /><br />
                                </form>
                            </section>
                            <div className="pt-4">
                                <Button
                                    size="large"
                                    type="primary"
                                    text="INICIAR SESIÓN"
                                    color="azul"
                                    //action={() => console.log('Botón presionado')}
                                />
                            </div>
                            <div className="pt-2">
                                <button 
                                    className="simple" 
                                    onClick={() => navigate("/game")}>
                                    Probar juego.
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sesion;