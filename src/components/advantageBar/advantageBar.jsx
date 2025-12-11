import "./advantageBar.css";

const EvaluationBar = ({ evaluation }) => {
  const normalizeEvaluation = (evalValue) => {
    const clampedEval = Math.max(-2000, Math.min(2000, evalValue));
    return 50 + (clampedEval / 2000) * 50;
  };

  const whitePercentage = normalizeEvaluation(evaluation);

  return (
    <div className={`evaluation-bar`}>
      <div className="eval-bar-container">
        <div
          className="eval-section white"
          style={{ height: `${whitePercentage}%` }}
        />
        <div
          className="eval-section black"
          style={{ height: `${100 - whitePercentage}%` }}
        />
        
      </div>
    </div>
  );
};

export default EvaluationBar;
