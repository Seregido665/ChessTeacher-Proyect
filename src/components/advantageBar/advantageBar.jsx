import "./advantageBar.css";

const EvaluationBar = ({ evaluation, playerColor = "white" }) => {
  // La evaluación de Stockfish siempre es desde la perspectiva de las blancas:
  // Positivo = ventaja blancas, Negativo = ventaja negras
  
  // Limitar evaluación entre -2000 y 2000
  const clampedEval = Math.max(-2000, Math.min(2000, evaluation));

  // Determinar colores según la orientación del tablero
  // Si juegas con blancas: tus piezas están abajo, las negras arriba
  // Si juegas con negras: tus piezas están abajo, las blancas arriba
  const opponentColor = playerColor === "white" ? "black" : "white";
  
  // Calcular ventaja desde la perspectiva del jugador
  // Si juegas con blancas: eval positivo = tu ventaja
  // Si juegas con negras: eval negativo = tu ventaja (por eso invertimos)
  const playerEvaluation = playerColor === "white" ? clampedEval : -clampedEval;
  
  // Convertir a porcentaje (50% = igualdad, >50% = ventaja jugador, <50% = ventaja oponente)
  const playerPercentage = 50 + (playerEvaluation / 2000) * 50;
  const opponentPercentage = 100 - playerPercentage;

  return (
    <div className="evaluation-bar">
      <div className="eval-bar-container">
        {/* Oponente arriba (parte superior del tablero) */}
        <div
          className={`eval-section ${opponentColor}`}
          style={{ height: `${opponentPercentage}%` }}
        />
        {/* Jugador abajo (parte inferior del tablero) */}
        <div
          className={`eval-section ${playerColor}`}
          style={{ height: `${playerPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default EvaluationBar;