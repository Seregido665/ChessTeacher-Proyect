import "../styles/menustyle.css";
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import AsideMenu from '../../components/asideMenu/aside';
import MatchMenu from '../../components/gameMenu/matchMenu';
import EvaluationBar from '../../components/advantageBar/advantageBar';

const parseStockfishScore = (line) => {
    if (typeof line !== 'string' || !line.includes(' score ')) {
        return null;
    }

    const cpMatch = line.match(/score cp (-?\d+)/);
    if (cpMatch) {
        return Number(cpMatch[1]);
    }

    const mateMatch = line.match(/score mate (-?\d+)/);
    if (mateMatch) {
        return Number(mateMatch[1]) > 0 ? 2000 : -2000;
    }

    return null;
};

const classifyMoveByDelta = (deltaCp) => {
    if (deltaCp >= -50) return 'Buena';
    if (deltaCp >= -150) return 'ErrorLeve';
    return 'ErrorGrade';
};

const evaluateFenWithWorker = (worker, fen) =>
    new Promise((resolve) => {
        let lastScore = 0;
        let hasScore = false;

        const onMessage = (event) => {
            const line = event.data;
            const score = parseStockfishScore(line);

            if (score !== null) {
                lastScore = score;
                hasScore = true;
            }

            if (typeof line === 'string' && line.startsWith('bestmove')) {
                worker.removeEventListener('message', onMessage);
                resolve(hasScore ? lastScore : 0);
            }
        };

        worker.addEventListener('message', onMessage);
        worker.postMessage(`position fen ${fen}`);
        worker.postMessage('go depth 10');
    });

const Analisis = () => {
    const location = useLocation();
    const { match } = location.state || {};
    const [game, setGame] = useState(new Chess());
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [boardOrientation, setBoardOrientation] = useState('white');
    const [boardWidth, setBoardWidth] = useState(400);
    const [bestMoveArrow, setBestMoveArrow] = useState([]);
    const [boardEvaluation, setBoardEvaluation] = useState(0);
    const [moveQualities, setMoveQualities] = useState([]);
    const stockfishRef = useRef(null);
    
    useEffect(() => {
        const history = match?.moveHistory || [];
        const boundedIndex = Math.max(0, Math.min(currentMoveIndex, history.length));
        const newGame = new Chess();

        // Aplicar movimientos hasta el índice seleccionado para navegar la partida.
        history.slice(0, boundedIndex).forEach(move => {
            try {
                newGame.move(move);
            } catch (e) {
                console.error('Error al aplicar movimiento:', e);
            }
        });

        setGame(newGame);
        setBoardOrientation(match?.playerColor || 'white');

        if (boundedIndex !== currentMoveIndex) {
            setCurrentMoveIndex(boundedIndex);
        }
    }, [match, currentMoveIndex]);

    useEffect(() => {
        const historyLength = match?.moveHistory?.length || 0;
        setCurrentMoveIndex(historyLength);
    }, [match]);

    // Inicializar Stockfish para análisis en vista de partida.
    useEffect(() => {
        const worker = new Worker('/stockfish.js');
        stockfishRef.current = worker;

        worker.postMessage('uci');
        worker.postMessage('isready');

        const handleStockfishMessage = (e) => {
            const line = e.data;
            const score = parseStockfishScore(line);

            if (score !== null) {
                setBoardEvaluation(score);
            }

            if (typeof line === 'string' && line.startsWith('bestmove')) {
                const bestMove = line.split(' ')[1];

                if (bestMove && bestMove !== '(none)' && bestMove.length >= 4) {
                    const from = bestMove.slice(0, 2);
                    const to = bestMove.slice(2, 4);
                    setBestMoveArrow([[from, to, 'rgba(255, 80, 80, 0.85)']]);
                } else {
                    setBestMoveArrow([]);
                }
            }
        };

        worker.addEventListener('message', handleStockfishMessage);

        return () => {
            worker.removeEventListener('message', handleStockfishMessage);
            worker.terminate();
            stockfishRef.current = null;
        };
    }, []);

    // Analizar cada vez que cambie la posición actual del tablero.
    useEffect(() => {
        if (!stockfishRef.current) return;

        if (game.isGameOver()) {
            setBestMoveArrow([]);
            return;
        }

        stockfishRef.current.postMessage(`position fen ${game.fen()}`);
        stockfishRef.current.postMessage('go depth 12');
    }, [game]);

    useEffect(() => {
        const history = match?.moveHistory || [];

        if (!history.length) {
            setMoveQualities([]);
            return;
        }

        let isCancelled = false;
        const worker = new Worker('/stockfish.js');

        const analyzeMoveQualities = async () => {
            try {
                worker.postMessage('uci');
                worker.postMessage('isready');

                const analysisGame = new Chess();
                const qualities = [];

                for (let i = 0; i < history.length; i += 1) {
                    if (isCancelled) return;

                    const evalBeforeMove = await evaluateFenWithWorker(worker, analysisGame.fen());

                    try {
                        analysisGame.move(history[i]);
                    } catch (error) {
                        console.error('Movimiento inválido en análisis:', error);
                        qualities.push('ErrorLeve');
                        continue;
                    }

                    const evalAfterMove = await evaluateFenWithWorker(worker, analysisGame.fen());

                    // Stockfish evalúa desde el lado al turno: tras mover, el score se invierte para el jugador que movió.
                    const deltaForMover = (-evalAfterMove) - evalBeforeMove;
                    qualities.push(classifyMoveByDelta(deltaForMover));
                }

                if (!isCancelled) {
                    setMoveQualities(qualities);
                }
            } catch (error) {
                console.error('Error analizando calidad de jugadas:', error);
                if (!isCancelled) {
                    setMoveQualities(history.map(() => 'Buena'));
                }
            }
        };

        analyzeMoveQualities();

        return () => {
            isCancelled = true;
            worker.terminate();
        };
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

            <div className="col-xl-3 col-md-3 col-12 d-flex align-items-center justify-content-center">
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
            <div className="col-xl-1"></div>
        </div>
    </div>
    )
}
 
export default Analisis;
