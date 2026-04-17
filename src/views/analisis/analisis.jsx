import "../styles/menustyle.css";
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import AsideMenu from '../../components/asideMenu/aside';
import MatchMenu from '../../components/gameMenu/matchMenu';
import EvaluationBar from '../../components/advantageBar/advantageBar';
import useStockAnalisis from './stockAnalisis';

const Analisis = () => {
    const location = useLocation();
    const { match } = location.state || {};
    const [game, setGame] = useState(new Chess());
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [boardOrientation, setBoardOrientation] = useState('white');
    const [boardWidth, setBoardWidth] = useState(400);
    const { bestMoveArrow, boardEvaluation, moveQualities } = useStockAnalisis({ game, match });
    
    // --- RECONSTRUYE EL ESTADO DEL TABLERO SEGÚN EL MOVIMIENTO ACTUAL ---
    useEffect(() => {
        const history = match?.moveHistory || [];
        const boundedIndex = Math.max(0, Math.min(currentMoveIndex, history.length));
        const newGame = new Chess();

        history.slice(0, boundedIndex).forEach(move => {
            try {
                newGame.move(move);
            } catch (e) {
                console.error(e);
            }
        });

        setGame(newGame);
        setBoardOrientation(match?.playerColor || 'white');

        if (boundedIndex !== currentMoveIndex) {
            setCurrentMoveIndex(boundedIndex);
        }
    }, [match, currentMoveIndex]);

    // --- RESETEA EL JUEGO SI CAMBIA LA PARTIDA ANALIZADA ---
    useEffect(() => {
        const historyLength = match?.moveHistory?.length || 0;
        setCurrentMoveIndex(historyLength);
    }, [match]);

    // --- AJUSTA EL TAMAÑO DEL TABLERO AL TAMAÑO DE LA VENTANA ---
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
      <div className="vh-100 img-fondo2">
        <div className="row w-100 h-100 m-0">
            <div className="col-xl-2 col-md-1 col-12 px-0 d-flex">
                <aside className="menuLateral">
                    <AsideMenu />
                </aside>
            </div>
            <div className="col-xl-6 col-md-7 col-12 d-flex align-items-center justify-content-center">
                <div className="game-board-layout">
                    <EvaluationBar
                        evaluation={boardEvaluation}
                        playerColor={match?.playerColor || 'white'}
                    />
                    <div className="">
                        <div className="board-header">
                            <span className="username">Dificultad {match?.difficulty ?? '-'}</span>
                        </div>
                        
                        {/* TABLERO DE AJEDREZ */}
                        <Chessboard 
                            position={game.fen()}
                            boardOrientation={boardOrientation}
                            arePixelsAnimated={true}
                            boardWidth={boardWidth}
                            customArrows={bestMoveArrow}
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
            </div>

            <div className="col-xl-4 col-md-4 col-12 d-flex align-items-center justify-content-center">
                <MatchMenu 
                    isAnalysisMode={true}
                    match={match}
                    moveHistory={match?.moveHistory || []}
                    currentMoveIndex={currentMoveIndex}
                    onGoStart={() => setCurrentMoveIndex(0)}
                    onPrevMove={() => setCurrentMoveIndex(prev => Math.max(prev - 1, 0))}
                    onNextMove={() => setCurrentMoveIndex(prev => Math.min(prev + 1, (match?.moveHistory?.length || 0)))}
                    onGoEnd={() => setCurrentMoveIndex(match?.moveHistory?.length || 0)}
                    onSelectMove={(moveIndex) => setCurrentMoveIndex(moveIndex)}
                    moveQualities={moveQualities}
                />
            </div>
        </div>
    </div>
    )
}
 
export default Analisis;
