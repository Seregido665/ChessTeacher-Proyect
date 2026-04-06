import "../styles/menustyle.css";
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import AsideMenu from '../../components/asideMenu/aside';
import MatchMenu from '../../components/gameMenu/matchMenu';

const Analisis = () => {
    const location = useLocation();
    const { match } = location.state || {};
    const [game, setGame] = useState(new Chess());
    const [boardOrientation, setBoardOrientation] = useState('white');
    const [boardWidth, setBoardWidth] = useState(400);
    
    useEffect(() => {
        if (match && match.moveHistory) {
            const newGame = new Chess();
            // Aplicar los movimientos de la partida
            match.moveHistory.forEach(move => {
                try {
                    newGame.move(move);
                } catch (e) {
                    console.error('Error al aplicar movimiento:', e);
                }
            });
            setGame(newGame);
            setBoardOrientation(match.playerColor || 'white');
        }
    }, [match]);

    // Responsive board size (mismo que en ChessGame)
    useEffect(() => {
        const updateBoardSize = () => {
            const heightBased = window.innerHeight * 0.8;
            const widthBased = window.innerWidth * 0.9;
            setBoardWidth(Math.min(heightBased, widthBased));
        };

        updateBoardSize();
        window.addEventListener('resize', updateBoardSize);
        return () => window.removeEventListener('resize', updateBoardSize);
    }, []);

    return (
      <div className="vh-100 d-flex img-fondo2">
        <div className="row w-100 m-0 flex-grow-1">

            <div className="col-xl-2 col-md-3 col-12 px-0 d-flex">
                <aside className="menuLateral">
                    <AsideMenu />
                </aside>
            </div>

            <div className="col-xl-6 col-md-6 col-12 flex-row d-flex align-items-center justify-content-center">
                <div className="">
                    <div className="board-header">
                        <span className="username">Oponente</span>
                    </div>
                    
                    {/* TABLERO DE AJEDREZ */}
                    <Chessboard 
                        position={game.fen()}
                        boardOrientation={boardOrientation}
                        arePixelsAnimated={true}
                        boardWidth={boardWidth}
                    />
                    
                    <div className="board-footer">
                        <span className="username">
                            {match ? `${match.winner === 'draw' ? 'Empate' : match.winner === match.playerColor ? 'Victoria' : 'Derrota'}` : 'Jugador'}
                        </span>
                        <div className="right">
                            <span className="tiempo">
                                {match ? `Movimientos: ${match.moveHistory?.length || 0}` : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-xl-3 col-md-3 col-12 d-flex align-items-center justify-content-center">
                <MatchMenu 
                    isAnalysisMode={true}
                    match={match}
                    moveHistory={match?.moveHistory || []}
                />
            </div>
            <div className="col-xl-1"></div>
        </div>
    </div>
    )
}
 
export default Analisis;
