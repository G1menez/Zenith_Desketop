// components/App/Home/ActivitiesList.jsx
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function ActivitiesList({ hasFarm, onViewAll, onRegister }) {
  const navigate = useNavigate()
  const [recentDiagnostics, setRecentDiagnostics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Simula carregamento de dados (substitua pela sua lógica real)
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem("diagnosticHistory")
        if (saved) {
          const history = JSON.parse(saved)
          setRecentDiagnostics(history.slice(0, 3))
        } else {
          setRecentDiagnostics([])
        }
        setError(null)
      } catch (err) {
        setError("Erro ao carregar atividades.")
      } finally {
        setLoading(false)
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  // Estado vazio (sem fazenda ou sem atividades)
  if (!hasFarm) {
    return (
      <div className="act-empty">
        <span className="material-symbols-outlined act-empty-icon">inbox</span>
        <h3>Nenhuma atividade registrada</h3>
        <p>Cadastre uma fazenda para começar a monitorar suas atividades em tempo real</p>
        <button className="act-empty-btn" onClick={onRegister}>
          <span className="material-symbols-outlined">add</span>
          Cadastrar Fazenda
        </button>
      </div>
    )
  }

  // Estado de carregamento
  if (loading) {
    return (
      <div className="act-loading">
        <div className="act-spinner"></div>
        <p>Carregando atividades...</p>
      </div>
    )
  }

  // Estado de erro
  if (error) {
    return (
      <div className="act-error">
        <span className="material-symbols-outlined">error</span>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Tentar novamente</button>
      </div>
    )
  }

  // Lista de atividades mock (substitua pela lógica real conforme necessidade)
  const activities = [
    {
      id: 1,
      type: "diagnostic",
      icon: "assignment",
      title: "Atividades do Campo",
      description: "Gerencie todas as tarefas da fazenda",
      status: "pendente",
      action: () => navigate("/explore", { state: { activeTab: "atividades" } })
    },
    {
      id: 2,
      type: "history",
      icon: "history",
      title: "Diagnósticos Recentes",
      description: recentDiagnostics.length > 0
        ? recentDiagnostics.slice(0,2).map(d => `${d.disease} (${d.confidence}%)`).join(" • ")
        : "Nenhum diagnóstico salvo",
      status: recentDiagnostics.length > 0 ? "concluido" : "vazio",
      action: () => navigate("/explore", { state: { activeTab: "diagnostico", showHistory: true } })
    },
    {
      id: 3,
      type: "flight",
      icon: "flight_takeoff",
      title: "Voo de Mapeamento",
      description: "Visualize áreas mapeadas no mapa interativo",
      status: "concluido",
      action: () => navigate("/explore", { state: { activeTab: "mapa" } })
    }
  ]

  return (
    <>
      <div className="act-grid">
        {activities.map((act, idx) => {
          let statusClass = ""
          let statusLabel = ""
          if (act.status === "pendente") {
            statusClass = "act-status-pending"
            statusLabel = "Pendente"
          } else if (act.status === "concluido") {
            statusClass = "act-status-done"
            statusLabel = "Concluída"
          } else if (act.status === "vazio") {
            statusClass = "act-status-empty"
            statusLabel = "Vazio"
          }

          return (
            <div
              key={act.id}
              className="act-card"
              onClick={act.action}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className={`act-icon ${act.type}`}>
                <span className="material-symbols-outlined">{act.icon}</span>
              </div>
              <div className="act-content">
                <div className="act-header">
                  <h4 className="act-title">{act.title}</h4>
                  <span className={`act-tag ${statusClass}`}>{statusLabel}</span>
                </div>
                <p className="act-desc">{act.description}</p>
              </div>
            </div>
          )
        })}
      </div>
      {hasFarm && (
        <div className="act-footer">
          <button className="act-view-all" onClick={onViewAll}>
            <span>Ver todas as atividades</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      )}
    </>
  )
}