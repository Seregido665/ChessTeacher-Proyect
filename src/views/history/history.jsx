import "../styles/menustyle.css";
import { useContext, useEffect, useRef, useState } from 'react'
import MatchCard from '../../components/matchCard/matchCard';
import AsideMenu from '../../components/asideMenu/aside';
import { getMatches, deleteMatch, saveMatch } from '../../services/match.service';
import AuthContext from '../../context/authContext';
import { buildMatchDataFromPgnFile } from '../../utils/importPGN';

const Historial = () => {
  const { user } = useContext(AuthContext);
  const [matches, setMatches] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const isLoggedIn = !!user;
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await getMatches();
        setMatches(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMatches();
  }, [user]);

  // -- ELIMINAR PARTIDA --
  const handleDelete = async (matchId) => {
    try {
      await deleteMatch(matchId);
      setMatches((prevMatches) => prevMatches.filter(m => m.id !== matchId));
    } catch (err) {
      console.error(err);
    }
  };

  const getUserId = () => user?._id || user?.user?._id;

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportPGN = async (event) => {
    const file = event.target.files?.[0];
    const userId = getUserId();

    try {
      const matchData = await buildMatchDataFromPgnFile(file, userId);
      const response = await saveMatch(matchData);
      const importedMatch = response?.data?.match;

      if (importedMatch) {
        setMatches((prev) => [importedMatch, ...prev]);
      }
      
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="vh-100 img-fondo2">
          <div className="row w-100 h-100 m-0">
            <div className="col-xl-2 col-md-1 col-12 px-0 d-flex">
              <aside className="menuLateral">
                <AsideMenu />
              </aside>
            </div>

        <div className="historyMenu col-xl-10 col-md-9 col-12 d-flex flex-column align-items-center justify-content-start py-4">
          <h2 className="text-white mb-4 match-history-tittle">Historial de Partidas</h2>
          <button
            type="button"
            className="import-btn mb-4"
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

          {isLoggedIn && matches.length === 0 && (
            <div className="text-white text-center">
              <p>No tienes partidas guardadas aún</p>
              <p>¡Juega tu primera partida!</p>
            </div>
          )}

          {isLoggedIn && matches.length > 0 && (
            <div 
              className="matchList w-100"
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

