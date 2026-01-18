import "./advantageBar.css";

const EvaluationBar = ({ evaluation, playerColor = "white" }) => {
  // Limitar evaluación
  const clampedEval = Math.max(-2000, Math.min(2000, evaluation));

  // Porcentaje de ventaja de la IA
  const aiPercentage = 50 + (clampedEval / 2000) * 50;
  const playerPercentage = 100 - aiPercentage;

  // Colores visuales
  const aiColorClass = playerColor === "white" ? "black" : "white"; // IA = contrario jugador
  const playerColorClass = playerColor; // jugador = color elegido

  return (
    <div className="evaluation-bar">
      <div className="eval-bar-container">
        {/* IA arriba, porcentaje basado en ventaja de IA */}
        <div
          className={`eval-section ${aiColorClass}`}
          style={{ height: `${aiPercentage}%` }}
        />
        {/* Jugador abajo, porcentaje inverso */}
        <div
          className={`eval-section ${playerColorClass}`}
          style={{ height: `${playerPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default EvaluationBar;
