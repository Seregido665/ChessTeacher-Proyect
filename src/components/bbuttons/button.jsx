import './button.css'

const Button = ({ type, text, action ,color }) => {
  return (
    <button
      className={`btn-special ${type} ${color}`}
      onClick={() => action()}
    >
      {text}
    </button>
  )
}

export default Button  