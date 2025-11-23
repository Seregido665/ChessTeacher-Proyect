import '../asideMenu/aside.css'

const ButtonLeft = ({ text, action, img, type }) => {
  return (
    <div>
        <button
        className={`menu-btn ${type}`}
        onClick={() => action()}
        >
        <img src={img} className="imgBut" />
        {text}
        </button>
    </div>
  )
}

export default ButtonLeft