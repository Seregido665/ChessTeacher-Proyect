import "../../styles/menustyle.css";
import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from "../../../services/user.service";
import AuthContext from "../../../context/userContext"
import Button from '../../../components/bbuttons/button'


const Sesion = () => {
    const navigate = useNavigate();
    const { userLogin } = useContext(AuthContext)
    const [errors, setErrors] = useState({});
    const [loginData, setFormData] = useState({
      email: '',
      password: ''
    })

    useEffect(() => {
        if (localStorage.getItem('user')) {
            navigate('/game');
        }
    }, [navigate]);     // EJECUTA useEffect CUANDO navigate CAMBIE

    const handleChange = (e) => {
    const { name, value } = e.target
        setFormData(prev => ({
        ...prev,
        [name]: value
        }))
    }

const handleLogin = (e) => {
  e.preventDefault();

  const newErrors = {};
  if (!loginData.email) { newErrors.email = { message: "Falta el email." }; }
  if (!loginData.password) { newErrors.password = { message: "Falta la contraseña." }; }

  const emailRegex = /^[\w.-]+@[\w.-]+\.\w{2,3}$/;
  if (loginData.email && !emailRegex.test(loginData.email)) {
    newErrors.email = { message: "Estructura incorrecta" };
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  loginUser(loginData)
    .then((user) => {
      //localStorage.setItem('authUser', JSON.stringify(response.data.user));
      console.log(user)
      setErrors({});
      userLogin(user)
      console.log("LOGUEADO");
      navigate('/game');
    })
    .catch((err) => {
      console.log('ERROR EN EL LOGIN:', err);
      
      const serverMessage = err.response?.data?.message;
      if (serverMessage === "El usuario no existe") {
        setErrors({ email: { message: serverMessage } });
      } else if (serverMessage === "Contraseña incorrecta") {
        setErrors({ password: { message: serverMessage } });
      } else {
        setErrors({ general: { message: serverMessage || "Error al conectar" } });
      }
    });
};

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
                                <form onSubmit={handleLogin} className="formul">
                                    <input
                                        type="text"
                                        name="email"
                                        value={loginData.email}
                                        onChange={handleChange}
                                        placeholder="Email"
                                    />
                                    {errors.email && (<div className="text-danger">{errors.email.message}</div>)}
                                    <input
                                        className="mt-2"
                                        type="password"
                                        name="password"
                                        value={loginData.password}
                                        onChange={handleChange}
                                        placeholder="Password"
                                    />
                                    {errors.password && (<div className="text-danger">{errors.password.message}</div>)}
                                    <div className="pt-4">
                                        <Button
                                            size="large"
                                            type="submit"
                                            text="INICIAR SESIÓN"
                                            color="azul"
                                            action={() => console.log('Botón presionado')}
                                        />
                                    </div>
                                </form>
                            </section>
                            
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