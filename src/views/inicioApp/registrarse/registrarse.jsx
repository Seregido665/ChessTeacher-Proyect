import "../../styles/menustyle.css";
import { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../../services/user.service";
import Button from '../../../components/bbuttons/button'


const Registrarse = () => {
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [registerData, setRegisterData] = useState({
      name: '',
      email: '',
      password: '',
      passwordConfirm: ''
    })

    const handleChange = (e) => {
    const { name, value } = e.target
        setRegisterData(prev => ({
        ...prev,
        [name]: value
        }))
    }

    const handleRegistration = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!registerData.name) {newErrors.name = { message: "Falta el nombre." };}
    if (!registerData.email) {newErrors.email = { message: "Falta el email." };}
    if (!registerData.password) {newErrors.password = { message: "Falta la contraseña." };}
    if (!registerData.passwordConfirm) {newErrors.passwordConfirm = { message: "Confirma la contraseña." };}

    if (registerData.password !== registerData.passwordConfirm) {
        newErrors.passwordConfirm = {
        message: "Las contraseñas no coinciden."
        };
    }

    const emailRegex = /^[\w.-]+@[\w.-]+\.\w{2,3}$/;
    if (registerData.email && !emailRegex.test(registerData.email)) {
        newErrors.email = { message: "Estructura incorrecta" };
    }

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    registerUser(registerData)
        .then(() => {
        setErrors({});
        navigate('/game');
        })
        .catch(err => {
        setErrors(err.response?.data?.errors || {});
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
                                <h4 className="titulo pt-4 pb-3">Registro de Usuario</h4>
                                <form onSubmit={handleRegistration} className="formul">
                                    <input 
                                        type="text"
                                        name="name"
                                        value={registerData.name}
                                        onChange={handleChange}
                                        placeholder="Nombre"
                                    />
                                    {errors.name && (<div className="text-danger">{errors.name.message}</div>)}
                         
                                    <input
                                        className="mt-4"
                                        name="email"
                                        value={registerData.email}
                                        onChange={handleChange}
                                        placeholder="Email"
                                    />
                                    {errors.email && (<div className="text-danger">{errors.email.message}</div>)}

                                    <input
                                        className="mt-4"
                                        type="password"
                                        name="password"
                                        value={registerData.password}
                                        onChange={handleChange}
                                        placeholder="Contraseña"
                                    />
                                    {errors.password && (<div className="text-danger">{errors.password.message}</div>)}
                                    
                                    <input
                                        className="mt-4"
                                        type="password"
                                        name="passwordConfirm"
                                        value={registerData.passwordConfirm}
                                        onChange={handleChange}
                                        placeholder="Confirmar contraseña"
                                    />
                                    {errors.passwordConfirm && (<div className="text-danger">{errors.passwordConfirm.message}</div>)}
                                <div className="pt-4">
                                <Button
                                    size="large"
                                    type="submit"
                                    text="REGISTRARSE"
                                    color="verde"
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

export default Registrarse;