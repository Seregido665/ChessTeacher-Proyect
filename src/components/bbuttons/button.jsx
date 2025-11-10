import './button.css'

const Button = ({ type, size, text, action ,color }) => {
  return (
    <button
      className={`btn-special ${type} ${size} ${color}`}
      onClick={() => action()}
    >
      {text}
    </button>
  )
}

export default Button


//<img className="imgLogo" src="./img/logoChessW.png"/>    