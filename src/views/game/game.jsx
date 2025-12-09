import "../styles/menustyle.css";
import "../../components/chessboard/board.css";
import Board from '../../components/chessboard/board';
import AsideMenu from '../../components/asideMenu/aside';

const Juego = () => {
    return (
        <div className="vh-100 d-flex img-fondo2">
            <div className="row w-100 m-0 flex-grow-1">

                <div className="col-xl-2 col-md-3 col-12 px-0 d-flex">
                    <aside className="menuLateral">
                        <AsideMenu />
                    </aside>
                </div>

                <div className="col-xl-6 col-md-6 col-12 flex-column d-flex align-items-center justify-content-center">
                    <div className="all-data">
                    <div className="board-header">
                        <div>
                            <span className="username">Oponente</span>
                        </div>
                        <div className="right">
                            <span id="top-timer" className="tiempo">00:00</span>
                        </div>
                    </div>
                    <div>
                        <Board />
                    </div>
                    <div className="board-footer">
                        <div>
                            <span className="username">Seregido665</span>
                        </div>
                        <div className="right">
                            <span id="bottom-timer" className="tiempo">00:00</span>
                        </div>
                    </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-3 col-12">
                    <section>
                    </section>
                </div>
                <div className="col-xl-1"></div>
            </div>
        </div>
    );
};

export default Juego;
