import "./advantageBar.css";

const EvaluationBar = ({ evaluation, playerColor = "white" }) => {
  
  // Limitar evaluación entre -2000 y 2000
  const clampedEval = Math.max(-2000, Math.min(2000, evaluation));

  const opponentColor = playerColor === "white" ? "black" : "white";
  const playerEvaluation = playerColor === "white" ? clampedEval : -clampedEval;
  const playerPercentage = 50 + (playerEvaluation / 2000) * 50;
  const opponentPercentage = 100 - playerPercentage;

  return (
    <div className="evaluation-bar">
      <div className="eval-bar-container">
        <div
          className={`eval-section ${opponentColor}`}
          style={{ height: `${opponentPercentage}%` }}
        />
        <div
          className={`eval-section ${playerColor}`}
          style={{ height: `${playerPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default EvaluationBar;