import "../styles/menustyle.css";
import { useContext, useEffect, useRef, useState } from 'react'
import { Chess } from 'chess.js';
import MatchCard from '../../components/matchCard/matchCard';
import AsideMenu from '../../components/asideMenu/aside';
import { getMatches, deleteMatch, saveMatch } from '../../services/match.service';
import AuthContext from '../../context/authContext';

const getPgnTag = (pgnText, tagName) => {
  const regex = new RegExp(`\\[${tagName}\\s+"([^"]+)"\\]`, 'i');
  const match = pgnText.match(regex);
  return match?.[1] || null;
};

const getWinnerFromResultTag = (resultTag) => {
  if (resultTag === '1-0') return 'white';
  if (resultTag === '0-1') return 'black';
  if (resultTag === '1/2-1/2') return 'draw';
  return 'draw';
};

const inferPlayerColorFromTags = (pgnText) => {
  const whiteTag = (getPgnTag(pgnText, 'White') || '').toLowerCase();
  const blackTag = (getPgnTag(pgnText, 'Black') || '').toLowerCase();

  if (whiteTag.includes('jugador')) return 'white';
  if (blackTag.includes('jugador')) return 'black';
  if (whiteTag.includes('stockfish')) return 'black';
  if (blackTag.includes('stockfish')) return 'white';

  return 'white';
};

const getResultReason = (chess, winner) => {
  if (chess.isCheckmate()) return 'checkmate';
  if (winner === 'draw' && chess.isStalemate()) return 'stalemate';
  if (winner === 'draw') return 'draw';
  return 'resignation';
};

const Historial = () => {
  const { user } = useContext(AuthContext);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const isLoggedIn = !!user;
  const fileInputRef = useRef(null);

  useEffect(() => {
  if (!user) {
    setMatches([]);
    setError(null);
    setLoading(false);
    return;
  }

  setLoading(true);

  const fetchMatches = async () => {
    try {
      const response = await getMatches();

      setMatches(response.data);
    } catch (err) {
      console.error("Error al cargar", err);
      setError('Error al cargar el historial de partidas');
    } finally {
      setLoading(false);
    }
  };

  fetchMatches();
}, [user]);

  // -- ELIMINAR PARTIDA --
  const handleDelete = async (matchId) => {
    if (!window.confirm('¿Seguro que quieres borrar esta partida?')) return;

    try {
      await deleteMatch(matchId);
      setMatches((prevMatches) => prevMatches.filter(m => m.id !== matchId));
    } catch (err) {
      console.error("Error al eliminar partida:", err);
      alert("No se pudo eliminar la partida. Inténtalo de nuevo.");
    }
  };

  const getUserId = () => user?._id || user?.user?._id;

  const handleImportClick = () => {

    fileInputRef.current?.click();
  };

  const handleImportPGN = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    const userId = getUserId();
    if (!userId) {
      alert('No se pudo identificar el usuario. Inicia sesión de nuevo.');
      return;
    }

    setIsImporting(true);

    try {
      const rawPgnText = await file.text();
      const pgnText = rawPgnText.replace(/^\uFEFF/, '').trim();

      if (!pgnText) {
        throw new Error('El archivo PGN está vacío.');
      }

      const chess = new Chess();
      // En chess.js v1.x loadPgn puede no devolver booleano; si falla, lanza error.
      chess.loadPgn(pgnText, { strict: false });

      const moveHistory = chess.history();
      if (!moveHistory.length) {
        throw new Error('El PGN no contiene movimientos válidos.');
      }

      const resultTag = getPgnTag(pgnText, 'Result');
      const winner = getWinnerFromResultTag(resultTag);
      const resultReason = getResultReason(chess, winner);
      const difficultyTag = Number(getPgnTag(pgnText, 'Difficulty'));
      const difficulty = Number.isFinite(difficultyTag) ? difficultyTag : 3;

      const matchData = {
        user: userId,
        playerColor: inferPlayerColorFromTags(pgnText),
        winner,
        resultReason,
        moveHistory,
        totalMoves: moveHistory.length,
        difficulty,
        finalFen: chess.fen(),
      };

      const response = await saveMatch(matchData);
      const importedMatch = response?.data?.match;

      if (importedMatch) {
        setMatches((prev) => [importedMatch, ...prev]);
      } else {
        const refreshed = await getMatches();
        setMatches(refreshed.data || []);
      }
    } catch (importError) {
      console.error('Error al importar PGN:', importError);
    } finally {
      setIsImporting(false);
    }
  };

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

        <div className="col-xl-10 col-md-9 col-12 d-flex flex-column align-items-center justify-content-start py-4">
          <h2 className="text-white mb-4 match-history-tittle">Historial de Partidas</h2>
          <button
            type="button"
            className="btn btn-success mb-4"
            onClick={handleImportClick}
            disabled={!isLoggedIn || isImporting}
          >
            {isImporting ? 'Importando...' : 'Importar partida'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pgn"
            style={{ display: 'none' }}
            onChange={handleImportPGN}
          />

          {!isLoggedIn && (
            <div className="text-white text-center">
              <p>Debes estar logueado</p>
            </div>
          )}

          {isLoggedIn && !loading && !error && matches.length === 0 && (
            <div className="text-white text-center">
              <p>No tienes partidas guardadas aún</p>
              <p>¡Juega tu primera partida!</p>
            </div>
          )}

          {isLoggedIn && !loading && matches.length > 0 && (
            <div 
              className="w-100"
              style={{ 
                maxHeight: '80vh', 
                overflowY: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',  // ← clave
                gap: '16px',
                padding: '0 8px'
              }}
            >
              {matches.map((match) => (
                <MatchCard 
                  key={match.id}
                  match={match} 
                  onDelete={handleDelete}
                  //onExportPGN={/* tu función */} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Historial;

