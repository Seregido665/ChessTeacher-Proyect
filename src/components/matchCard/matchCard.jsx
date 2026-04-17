import './matchCard.css';
import { useNavigate } from 'react-router-dom';
import { exportMatchAsPGN } from '../../utils/exportPGN';

const MatchCard = ({ match, onDelete, onExportPGN }) => {
  const navigate = useNavigate();
  const playerWon = match.winner === match.playerColor;
  const isDraw = match.winner === 'draw';

  const handleExportPGN = () => {
    const pgnText = exportMatchAsPGN(match);
    onExportPGN?.(match, pgnText);
  };

  const handleAnalyze = () => {
    navigate('/analysis', { state: { match } });
  };

  return (
    <div className={`match-card ${isDraw ? 'draw' : playerWon ? 'victory' : 'defeat'}`}>
      <div className="match-card-main">
          <h4>
            {isDraw ? 'EMPATE' : playerWon ? 'VICTORIA' : 'DERROTA'}
          </h4>

          <div className="match-actions">
            <button 
            className="btn-action btn-analyze" 
            onClick={handleAnalyze}
          >
            Analizar
          </button>
          <button 
            className="btn-action btn-export" 
            onClick={handleExportPGN}
          >
            Exportar PGN
          </button>
          <button 
            className="btn-action btn-delete" 
            onClick={() => onDelete?.(match.id)}
          >
            Borrar
          </button>
        </div>
      </div>

      {/* Detalles expandibles */}
      <details className="move-details">
        <summary>Movimientos ({match.moveHistory?.length || 0})</summary>
        <div className="move-history">
          {match.moveHistory?.map((move, index) => (
            <span key={index}>
              {index % 2 === 0 && `${Math.floor(index / 2) + 1}. `}
              {move}
            </span>
          ))}
        </div>
      </details>
    </div>
  );
};

export default MatchCard;
