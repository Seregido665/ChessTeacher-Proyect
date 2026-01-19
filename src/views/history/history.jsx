import "../styles/menustyle.css";
import { useEffect, useState } from 'react'
import MatchCard from '../../components/matchCard/matchCard';
import AsideMenu from '../../components/asideMenu/aside';
import { getMatches } from '../../services/match.service'

const Historial = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getMatches()
      .then((response) => {
        console.log('Matches fetched:', response.data);
        setMatches(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching matches:', error);
        setError('Error al cargar el historial de partidas');
        setLoading(false);
      });
  }, []);

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

        <div className="col-xl-6 col-md-6 col-12 d-flex flex-column align-items-center justify-content-start py-4">
          <h2 className="text-white mb-4">Historial de Partidas</h2>
          
          {loading && (
            <div className="text-white">Cargando partidas...</div>
          )}

          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          {!loading && !error && matches.length === 0 && (
            <div className="text-white text-center">
              <p>No tienes partidas guardadas aún</p>
              <p>¡Juega tu primera partida!</p>
            </div>
          )}

          {!loading && matches.length > 0 && (
            <div className="w-100 d-flex flex-column align-items-center" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              {matches.map((match) => (
                <MatchCard key={match._id} match={match} />
              ))}
            </div>
          )}
        </div>

        <div className="col-xl-3 col-md-3 col-12">
          <section>
            {/* Aquí puedes agregar estadísticas o filtros */}
          </section>
        </div>
        
        <div className="col-xl-1"></div>
      </div>
    </div>
  );
};

export default Historial;