import "../styles/menustyle.css";
import { useContext, useEffect, useState } from 'react'
import MatchCard from '../../components/matchCard/matchCard';
import AsideMenu from '../../components/asideMenu/aside';
import { getMatches, deleteMatch } from '../../services/match.service';
import AuthContext from '../../context/authContext';

const Historial = () => {
  const { user } = useContext(AuthContext);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  if (!user) return;

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
          {!loading && !error && matches.length === 0 && (
            <div className="text-white text-center">
              <p>No tienes partidas guardadas aún</p>
              <p>¡Juega tu primera partida!</p>
            </div>
          )}

          {!loading && matches.length > 0 && (
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

