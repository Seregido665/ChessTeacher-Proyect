import "../styles/menustyle.css";
import "./exercises.css";
import AsideMenu from '../../components/asideMenu/aside';


const Ejercicios = () => {
    return (
      <div className="vh-100 img-fondo2">
            <div className="row w-100 h-100 m-0">
              <div className="col-xl-2 col-md-1 col-12 px-0 d-flex">
                <aside className="menuLateral">
                  <AsideMenu />
                </aside>
              </div>
            <div className="body-maintenance col-xl-6 col-md-6 col-12 d-flex align-items-center justify-content-center">
                <div className="exercises-maintenance">
                    <img
                        src="/Mantenimiento.png"
                        alt="Mantenimiento"
                        className="exercises-maintenance-image"
                    />
                    <p className="exercises-maintenance-message">Estamos trabajando en ello</p>
                </div>
            </div>

            <div className="col-xl-3 col-md-3 col-12">
                <section>
                </section>
            </div>
            <div className="col-xl-1"></div>
        </div>
    </div>
    )
}
 
export default Ejercicios
