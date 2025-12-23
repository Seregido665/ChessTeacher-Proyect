import "./alert.css";

const Alerta = ({ result, onClose }) => {
  if (!result) return null;

  const getText = () => {
    switch (result.type) {
      case "checkmate":
        return `¡JAQUE MATE! Ganan las ${result.winner === "white" ? "BLANCAS" : "NEGRAS"}`;
      case "stalemate":
        return "¡TABLAS por ahogado!";
      case "fifty-move":
        return "¡TABLAS por regla de 50 movimientos!";
      case "repetition":
        return "¡TABLAS por repetición!";
      case "material":
        return "¡TABLAS por material insuficiente!";
      default:
        return "";
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{getText()}</h2>
        <button onClick={onClose}>Aceptar</button>
      </div>
    </div>
  );
};

export default Alerta;
