import "../styles/menustyle.css";
//import Chessboard from '../../components/chessboard/board';
import AsideMenu from '../../components/asideMenu/aside';


const Historial = () => {
    //const navigate = useNavigate();

    return (
      <div className="vh-100 d-flex img-fondo2">
        <div className="row w-100 m-0 flex-grow-1">

            <div className="col-xl-2 col-md-3 col-12 px-0 d-flex">
                <aside className="menuLateral w-100">
                    <div className="d-flex flex-column">
                        <AsideMenu />
                    </div>
                </aside>
            </div>

            <div className="col-xl-6 col-md-6 col-12 d-flex align-items-center justify-content-center">
                {/*}
                <div>
                    <div className="board-header">
                        <div className="left">
                            <img src="" className="profile-pic" />
                        </div>
                        <div>
                            <span className="username fw-bold">Oponente</span>
                        </div>
                        <div className="right">
                            <span id="top-timer" className="tiempo">00:00</span>
                        </div>
                    </div>
                    <div>
                        <Chessboard />
                    </div>
                    <div className="board-footer">
                        <div className="left">
                            <img src="" className="profile-pic" />
                        </div>
                        <div>
                            <span className="username fw-bold">Seregido665</span>
                        </div>
                        <div className="right">
                            <span id="bottom-timer" className="tiempo">00:00</span>
                        </div>
                    </div>
                </div>*/}
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
 
export default Historial
