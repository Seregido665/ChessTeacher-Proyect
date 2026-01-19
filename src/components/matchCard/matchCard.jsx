import './matchCard.css';

const MatchCard = ({ match }) => {
  // Determinar si el jugador ganó
  const playerWon = match.winner === match.playerColor;
  const isDraw = match.winner === 'draw';

  // Formatear la fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Traducir razón del resultado
  const translateReason = (reason) => {
    const reasons = {
      'checkmate': 'Jaque Mate',
      'resignation': 'Rendición',
      'time': 'Tiempo Agotado',
      'stalemate': 'Tablas por Ahogado',
      'insufficient': 'Material Insuficiente',
      'threefold': 'Triple Repetición',
      'fifty': 'Regla de 50 Movimientos',
      'unknown': 'Desconocido'
    };
    return reasons[reason] || reason;
  };

  // Traducir dificultad
  const translateDifficulty = (diff) => {
    const difficulties = {
      1: 'Muy Fácil',
      2: 'Fácil',
      3: 'Medio',
      4: 'Difícil',
      5: 'Muy Difícil'
    };
    return difficulties[diff] || `Nivel ${diff}`;
  };

  return (
    <div className={`match-card ${isDraw ? 'draw' : playerWon ? 'victory' : 'defeat'}`}>
      {/* Header con resultado */}
      <div className="match-card-header">
        <div className="result-badge">
          {isDraw ? '=' : playerWon ? '✓' : '✗'}
        </div>
        <div className="result-text">
          <h3>{isDraw ? 'EMPATE' : playerWon ? 'VICTORIA' : 'DERROTA'}</h3>
          <span className="reason">{translateReason(match.resultReason)}</span>
        </div>
      </div>

      {/* Información de la partida */}
      <div className="match-card-body">
        <div className="match-info-row">
          <div className="info-item">
            <span className="info-label">Tu Color</span>
            <div className="color-indicator">
              <div className={`color-circle ${match.playerColor}`}></div>
              <span>{match.playerColor === 'white' ? 'Blancas' : 'Negras'}</span>
            </div>
          </div>

          <div className="info-item">
            <span className="info-label">Ganador</span>
            <div className="color-indicator">
              <div className={`color-circle ${match.winner === 'draw' ? 'draw' : match.winner}`}></div>
              <span>
                {match.winner === 'draw' 
                  ? 'Empate' 
                  : match.winner === 'white' ? 'Blancas' : 'Negras'}
              </span>
            </div>
          </div>
        </div>

        <div className="match-info-row">
          <div className="info-item">
            <span className="info-label">Movimientos</span>
            <span className="info-value">{match.totalMoves}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Dificultad</span>
            <span className="info-value">{translateDifficulty(match.difficulty)}</span>
          </div>
        </div>

        <div className="match-date">
          <span className="date-icon">📅</span>
          <span>{formatDate(match.createdAt)}</span>
        </div>
      </div>

      {/* Footer opcional con historial de movimientos resumido */}
      {match.moveHistory && match.moveHistory.length > 0 && (
        <div className="match-card-footer">
          <details>
            <summary>Ver movimientos ({match.moveHistory.length})</summary>
            <div className="move-history">
              {match.moveHistory.map((move, index) => (
                <span key={index} className="move-notation">
                  {index % 2 === 0 && `${Math.floor(index / 2) + 1}. `}
                  {move}
                </span>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default MatchCard;