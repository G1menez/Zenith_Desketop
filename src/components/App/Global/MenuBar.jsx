import { useNavigate, useLocation } from "react-router-dom"
import "../../../styles/Global/MenuBar.css"

export default function MenuBar() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="menu-bar">

      <div
        className={`menu-item ${isActive("/home") ? "active" : ""}`}
        onClick={() => navigate("/home")}
      >
        <span className="material-symbols-outlined">home</span>
      </div>

      <div
        className={`menu-item ${isActive("/explore") ? "active" : ""}`}
        onClick={() => navigate("/explore")}
      >
        <span className="material-symbols-outlined">explore</span>
      </div>

      <div
        className={`menu-item ${isActive("/profile") ? "active" : ""}`}
        onClick={() => navigate("/profile")}
      >
        <span className="material-symbols-outlined">person</span>
      </div>

    </nav>
  )
}
