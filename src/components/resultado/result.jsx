import React, { useContext } from "react";
import AuthContext from "../../context/authContext";
import "./reuslt.css";

const Result = ({ isGameOver, result, saveMatch }) => {
  const { user } = useContext(AuthContext);

  if (!isGameOver) return null;

  const isButtonDisabled = !user; // Desactivar si no hay usuario

  return (
    <div className="result-overlay">
      <div className="result-modal">
        <h3 className="result-text">{result}</h3>

        <button
          className="result-button"
          onClick={saveMatch}
          disabled={isButtonDisabled} // ✅ desactivado si no hay user
          title={isButtonDisabled ? "Debes iniciar sesión para guardar la partida" : ""}
        >
          Guardar partida
        </button>
      </div>
    </div>
  );
};

export default Result;
