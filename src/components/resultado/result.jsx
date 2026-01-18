import React from "react";
import "./reuslt.css";

const Result = ({ isGameOver, result, onRestart }) => {
  if (!isGameOver) return null;

  return (
    <div className="result-overlay">
      <div className="result-modal">
        <h3 className="result-text">{result}</h3>

        {onRestart && (
          <button className="result-button" onClick={onRestart}>
            Nueva partida
          </button>
        )}
      </div>
    </div>
  );
};

export default Result;
