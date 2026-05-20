export default function DiagnosisResult({ result, onRestart }) {
  const probabilities = result?.probabilidades || result?.probabilities || {}

  const probabilityList = Object.entries(probabilities)
    .map(([name, value]) => ({
      name: name.replaceAll("_", " "),
      value: typeof value === 'number' ? value : parseFloat(value) || 0
    }))
    .sort((a, b) => b.value - a.value)

  const diseaseRaw =
    result?.doenca ||
    result?.disease ||
    (probabilityList.length > 0 ? probabilityList[0].name : null) ||
    "Não identificado"

  const disease = diseaseRaw.replaceAll("_", " ")

  let confidence = result?.confianca || result?.confidence
  if (confidence === undefined || confidence === null) {
    confidence = probabilityList.length > 0 ? probabilityList[0].value : 0
  }
  confidence = Math.round(Number(confidence) || 0)

  const getRecommendations = (diseaseName) => {
    const lowerName = diseaseName.toLowerCase()
    if (lowerName.includes("ferrugem")) {
      return [
        "Aplicar fungicidas específicos (triazóis + estrobilurinas)",
        "Monitorar a lavoura a cada 7 dias",
        "Remover plantas infectadas",
        "Evitar plantio adensado"
      ]
    } else if (lowerName.includes("cercospora")) {
      return [
        "Usar fungicidas à base de benzimidazol",
        "Rotação de culturas (evitar soja por 2 safras)",
        "Eliminar restos culturais"
      ]
    } else if (lowerName.includes("saudavel")) {
      return [
        "Manter monitoramento preventivo",
        "Adubação equilibrada (N, P, K)",
        "Controle de plantas daninhas"
      ]
    } else if (lowerName.includes("lagarta")) {
      return [
        "Aplicar inseticidas biológicos (Bacillus thuringiensis)",
        "Controlar a população com armadilhas luminosas",
        "Incentivar inimigos naturais (vespas, joaninhas)"
      ]
    } else {
      return [
        "Consultar um engenheiro agrônomo",
        "Coletar amostras para análise laboratorial",
        "Isolar a área afetada"
      ]
    }
  }

  const recommendations = getRecommendations(disease)

  return (
    <div className="result-container animate-fade-in">
      <div className="result-title">
        <span className="material-symbols-outlined">analytics</span>
        <h1>Resultado da Análise</h1>
      </div>

      <div className="result-grid">
        {/* Coluna 1: Doença + Confiança */}
        <div className="col-left">
          <div className="premium-card disease-box">
            <span className="material-symbols-outlined icon-highlight">eco</span>
            <div className="disease-info">
              <div className="box-label">DOENÇA ENCONTRADA</div>
              <div className="box-value">{disease}</div>
            </div>
          </div>
          
          <div className="premium-card confidence-box">
            <span className="material-symbols-outlined icon-highlight">speed</span>
            <div className="confidence-info">
              <div className="box-label">NÍVEL DE CONFIANÇA</div>
              <div className="box-value-wrapper">
                <div className="box-value font-neon">{confidence}%</div>
              </div>
              <div className="confidence-bar-container">
                <div className="confidence-fill" style={{ width: `${confidence}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Coluna 2: Distribuição de Probabilidade */}
        <div className="col-center">
          <div className="premium-card probability-box">
            <div className="prob-header">
              <span className="material-symbols-outlined">donut_large</span>
              <span>DISTRIBUIÇÃO DE PROBABILIDADE</span>
            </div>
            <div className="probability-list">
              {probabilityList.length === 0 ? (
                <div className="no-data-wrapper">
                  <span className="material-symbols-outlined no-data-icon">bar_chart_off</span>
                  <div className="no-data">Nenhum dado disponível</div>
                </div>
              ) : (
                probabilityList.map((item, idx) => (
                  <div key={idx} className="prob-item">
                    <div className="prob-name">
                      <span className="material-symbols-outlined">eco</span>
                      <span>{item.name}</span>
                    </div>
                    <div className="prob-bar-wrapper">
                      <div className="prob-bar">
                        <div className="prob-fill" style={{ width: `${item.value}%` }} />
                      </div>
                      <div className="prob-value">{item.value}%</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Coluna 3: Recomendações */}
        <div className="col-right">
          <div className="premium-card recommendations-card">
            <div className="rec-header">
              <span className="material-symbols-outlined">help</span>
              <span>O QUE FAZER?</span>
            </div>
            <ul className="rec-list">
              {recommendations.map((rec, idx) => (
                <li key={idx}>
                  <span className="material-symbols-outlined list-check">check_circle</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <button className="restart-btn-premium" onClick={onRestart}>
        <span className="material-symbols-outlined">refresh</span>
        Novo diagnóstico
      </button>

      <style jsx>{`
        .result-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          background: transparent;
          display: flex;
          flex-direction: column;
        }

        .result-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 2.5rem;
        }

        .result-title span {
          font-size: 2.5rem;
          color: #00ffaa;
          filter: drop-shadow(0 0 8px rgba(0, 255, 170, 0.4));
        }

        .result-title h1 {
          font-size: 2.2rem;
          font-weight: 700;
          color: #f0f4f8;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .result-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-bottom: 3rem;
          width: 100%;
        }

        .premium-card {
          position: relative;
          background: #111720;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 1.75rem;
          transition: all 0.3s ease;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
        }

        .premium-card:hover {
          border-color: rgba(0, 255, 170, 0.3);
          box-shadow: 0 0 0 1px rgba(0, 255, 170, 0.2), 0 0 24px rgba(0, 255, 170, 0.15), 0 8px 40px rgba(0, 0, 0, 0.5);
          transform: translateY(-3px);
        }

        .col-left {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .disease-box,
        .confidence-box {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          flex: 1;
        }

        .icon-highlight {
          font-size: 2.5rem;
          color: #00ffaa !important;
          background: rgba(0, 255, 170, 0.08);
          padding: 0.5rem;
          border-radius: 12px;
          border: 1px solid rgba(0, 255, 170, 0.2);
          flex-shrink: 0;
        }

        .box-label {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #788896;
          margin-bottom: 0.5rem;
        }

        .box-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #f0f4f8;
          line-height: 1.2;
          word-break: break-word;
        }

        .font-neon {
          color: #00ffaa;
          text-shadow: 0 0 10px rgba(0, 255, 170, 0.4);
        }

        .confidence-info {
          width: 100%;
        }

        .confidence-bar-container {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 999px;
          margin-top: 0.75rem;
          overflow: hidden;
        }

        .confidence-fill {
          height: 100%;
          background: linear-gradient(90deg, #00cc88 0%, #00ffaa 100%);
          border-radius: 999px;
          transition: width 0.6s ease;
        }

        .prob-header,
        .rec-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .prob-header span:first-child,
        .rec-header span:first-child {
          color: #00ffaa;
          font-size: 1.5rem;
        }

        .prob-header span:last-child,
        .rec-header span:last-child {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #f0f4f8;
        }

        .probability-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .prob-item {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .prob-name {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #8fa3b8;
        }

        .prob-name span:first-child {
          font-size: 1.1rem;
          color: #00ffaa !important;
        }

        .prob-bar-wrapper {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .prob-bar {
          flex: 1;
          height: 6px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 999px;
          overflow: hidden;
        }

        .prob-fill {
          height: 100%;
          background: #00ffaa;
          border-radius: 999px;
          transition: width 0.5s ease;
        }

        .prob-value {
          font-size: 0.85rem;
          font-weight: 600;
          color: #00ffaa !important;
          min-width: 40px;
          text-align: right;
        }

        .no-data-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          gap: 0.75rem;
        }

        .no-data-icon {
          font-size: 2.5rem;
          color: #56687a;
        }

        .no-data {
          color: #8fa3b8;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .rec-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .rec-list li {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.95rem;
          color: #8fa3b8;
          line-height: 1.4;
        }

        .list-check {
          color: #00ffaa !important;
          font-size: 1.25rem;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .restart-btn-premium {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          max-width: 320px;
          padding: 1rem 2rem;
          background: #0d7c4b;
          border: none;
          border-radius: 999px;
          font-weight: 700;
          font-size: 1rem;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.3s ease;
          align-self: center;
          box-shadow: 0 4px 20px rgba(13, 124, 75, 0.3);
        }

        .restart-btn-premium:hover {
          background: #0e9c5e;
          box-shadow: 0 6px 24px rgba(13, 124, 75, 0.5);
          transform: translateY(-3px);
        }

        .restart-btn-premium span {
          font-size: 1.3rem;
          transition: transform 0.4s ease;
        }

        .restart-btn-premium:hover span {
          transform: rotate(180deg);
        }

        .animate-fade-in {
          animation: fadeInUp 0.5s ease forwards;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1100px) {
          .result-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          .col-left {
            flex-direction: row;
          }
          .disease-box,
          .confidence-box {
            flex: 1;
          }
        }

        @media (max-width: 768px) {
          .result-container {
            padding: 1rem;
          }
          .result-title h1 {
            font-size: 1.8rem;
          }
          .col-left {
            flex-direction: column;
          }
          .premium-card {
            padding: 1.25rem;
          }
        }
      `}</style>
    </div>
  )
}