// ButtonLeft.jsx

export const ButtonLeft = ({ text, action, img, type, typeExit }) => {
  return (
    <div>
      <button
        className={`menu-btn ${typeExit} ${type}`}
        onClick={() => action()}
      >
        <img src={img} className="imgBut" />
        <p className="text-but">{text}</p>
      </button>
    </div>
  );
};

export const ButtonLeftExit = ({ text, action, type, typeExit }) => {
  return (
    <div>
      <button
        className={`menu-btn ${typeExit} ${type}`}
        onClick={() => action()}
      >
        <p className="text-but">{text}</p>
      </button>
    </div>
  );
};