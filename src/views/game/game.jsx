import "../styles/menustyle.css";
//import Button from '../../../components/bbuttons/button'


const Juego = () => {
    
    return (
        <div className="fondo img-fondo2">
            <div>
                <div className="row w-100 m-0">
                    <div className="col-xl-5 col-md-5 col-12"></div>
                    <div className="col-xl-7 col-md-7 col-12 d-flex align-items-center">
                        <section className="inicioSesion">
                            <div className="pb-3"> 
                                <img className="imgLogo" src="../../img/logoChessW.png"/> 
                            </div>
                            <form action="/inicioSesion" class="formul" method="post">
                                    <label htmlFor="nombre" className="subtitulo">Nombre de usuario:</label><br />
                                    <input type="text" id="nombre" name="nombre" required /><br /><br />

                                    <label htmlFor="password" className="subtitulo">Contraseña:</label><br />
                                    <input type="password" id="password" name="password" required /><br /><br />
                                </form>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Juego;