// components/App/Home/ProfileSidebar.jsx
import { useNavigate } from "react-router-dom"

export default function ProfileSidebar({ userData, farmData }) {
  const navigate = useNavigate()

  const formatDocument = (doc, type) => {
    if (!doc) return "Não informado"
    if (type === "CPF" && doc.length === 11) {
      return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    } else if (type === "PJ" && doc.length === 14) {
      return doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
    }
    return doc
  }

  const formatPhone = (phone) => {
    if (!phone) return "Não informado"
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    } else if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
    }
    return phone
  }

  const getMemberTime = () => {
    if (!userData?.createdAt) return "Hoje"
    const created = new Date(userData.createdAt)
    const now = new Date()
    const diffDays = Math.ceil((now - created) / (1000 * 60 * 60 * 24))
    if (diffDays < 30) return `${diffDays} dias`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses`
    return `${Math.floor(diffDays / 365)} anos`
  }

  return (
    <div className="profile-sidebar">
      {/* Card de Perfil Pessoal */}
      <div className="profile-card">
        <div className="profile-header-content" style={{ marginBottom: '20px', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div className="profile-avatar-container" style={{ marginBottom: '12px' }}>
            <div className="profile-avatar">
              {userData?.profileIcon || "👨‍🌾"}
            </div>
          </div>
          <div>
            <h2 className="profile-title" style={{ fontSize: '22px', marginBottom: '6px' }}>
              {userData?.name || "Agricultor"}
            </h2>
            <div className="profile-badge-tech">
              <span className="material-symbols-outlined">calendar_today</span>
              <span className="membro">Membro há {getMemberTime()}</span>
            </div>
          </div>
        </div>

        <div className="info-item-tech">
          <div className="info-label">
            <span className="material-symbols-outlined">mail</span>
            <span>Email</span>
          </div>
          <div className="info-value" style={{ maxWidth: '100%', wordBreak: 'break-all' }}>
            {userData?.email || "Não informado"}
          </div>
        </div>

        <div className="info-item-tech">
          <div className="info-label">
            <span className="material-symbols-outlined">badge</span>
            <span>Documento</span>
          </div>
          <div className="info-value">{formatDocument(userData?.document, userData?.type)}</div>
        </div>

        <div className="info-item-tech">
          <div className="info-label">
            <span className="material-symbols-outlined">phone</span>
            <span>Telefone</span>
          </div>
          <div className="info-value">{formatPhone(userData?.phone)}</div>
        </div>

        <div className="info-item-tech">
          <div className="info-label">
            <span className="material-symbols-outlined">location_on</span>
            <span>Localização</span>
          </div>
          <div className="info-value">
            {userData?.city && userData?.state 
              ? `${userData.city}/${userData.state}` 
              : "Não informado"}
          </div>
        </div>

        <button 
          className="edit-farm-btn"
          onClick={() => navigate("/profile")}
        >
          <span className="material-symbols-outlined">edit</span>
          Editar Perfil
        </button>
      </div>

      {/* Card da Fazenda (se existir) */}
      {farmData && (
        <div className="profile-card">
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <div className="header-icon" style={{ width: '40px', height: '40px' }}>
              <span className="material-symbols-outlined">agriculture</span>
            </div>
            <h3 style={{ fontSize: '18px' }}>Minha Fazenda</h3>
          </div>

          <div className="info-item-tech">
            <div className="info-label">
              <span className="material-symbols-outlined">tag</span>
              <span>Nome</span>
            </div>
            <div className="info-value">{farmData.name}</div>
          </div>

          <div className="info-item-tech">
            <div className="info-label">
              <span className="material-symbols-outlined">location_on</span>
              <span>Localização</span>
            </div>
            <div className="info-value">{farmData.municipio}/{farmData.uf}</div>
          </div>

          <div className="info-item-tech">
            <div className="info-label">
              <span className="material-symbols-outlined">grass</span>
              <span>Plantação</span>
            </div>
            <div className="info-value">{farmData.plantacao || "Não informado"}</div>
          </div>

          <div className="info-item-tech">
            <div className="info-label">
              <span className="material-symbols-outlined">square_foot</span>
              <span>Área Total</span>
            </div>
            <div className="info-value">{farmData.area_total} ha</div>
          </div>
        </div>
      )}
    </div>
  )
}