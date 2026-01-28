import './matchCard.css';

const MatchCard = ({ match, onDelete, onExportPGN }) => {
  const playerWon = match.winner === match.playerColor;
  const isDraw = match.winner === 'draw';

  return (
    <div className={`match-card ${isDraw ? 'draw' : playerWon ? 'victory' : 'defeat'}`}>
      <div className="match-card-main">
        {/* Resultado + Dificultad + Movimientos */}
       
          <h4>
            {isDraw ? 'EMPATE' : playerWon ? 'VICTORIA' : 'DERROTA'}
          </h4>

          

          <div className="match-actions">
            <button 
            className="btn-action btn-analyze" 
            //onClick={}
          >
            Analizar
          </button>
          <button 
            className="btn-action btn-export" 
            onClick={() => onExportPGN?.(match)}
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
