import '../asideMenu/aside.css'

const ButtonLeft = ({ text, action, img, type, typeExit }) => {
  return (
    <div>
        <button
        className={`menu-btn ${typeExit} ${type}`}
        onClick={() => action()}
        >
        <img src={img} className="imgBut" />
        {text}
        </button>
    </div>
  )
}

export default ButtonLeft