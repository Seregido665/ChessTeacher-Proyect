import "./advantageBar.css";

const EvaluationBar = ({ evaluation, playerColor = "white" }) => {
  // Evaluación positiva = ventaja para blancas
  const clampedEval = Math.max(-2000, Math.min(2000, evaluation));

  const whiteAdvantagePercentage = 50 + (clampedEval / 2000) * 50;

  let playerPercentage;
  let playerColorClass;
  let opponentColorClass;

  if (playerColor === "white") {
    playerPercentage = whiteAdvantagePercentage;
    playerColorClass = "white";
    opponentColorClass = "black";
  } else {
    playerPercentage = 100 - whiteAdvantagePercentage;
    playerColorClass = "black";
    opponentColorClass = "white";
  }

  return (
    <div className="evaluation-bar">
      <div className="eval-bar-container">
        <div
          className={`eval-section ${opponentColorClass}`}
          style={{ height: `${100 - playerPercentage}%` }}
        />
        <div
          className={`eval-section ${playerColorClass}`}
          style={{ height: `${playerPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default EvaluationBar;