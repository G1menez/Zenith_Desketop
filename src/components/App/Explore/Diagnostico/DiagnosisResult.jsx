export default function DiagnosisResult({ result, onRestart }) {
  const disease = result?.doenca || result?.disease || "Não identificado"
  const confidence = Math.round(result?.confianca || result?.confidence || 0)
  const probabilities = result?.probabilidades || result?.probabilities || {}
  const probabilityList = Object.entries(probabilities).map(([name, value]) => ({
    name,
    value: typeof value === 'number' ? value : parseFloat(value) || 0
  }))

  return (
    <div className="result-container">
      <div className="result-title">
        <span className="material-symbols-outlined">analytics</span>
        <h1>Resultado da Análise</h1>
      </div>

      <div className="result-split">
        <div className="left-column">
          <div className="disease-box">
            <span className="material-symbols-outlined">eco</span>
            <div className="disease-info">
              <div className="box-label">DOENÇA ENCONTRADA</div>
              <div className="box-value">{disease}</div>
            </div>
          </div>
          <div className="confidence-box">
            <span className="material-symbols-outlined">speed</span>
            <div className="confidence-info">
              <div className="box-label">NÍVEL DE CONFIANÇA</div>
              <div className="box-value">{confidence}%</div>
              <div className="confidence-bar">
                <div className="confidence-fill" style={{ width: `${confidence}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="right-column">
          <div className="probability-box">
            <div className="prob-header">
              <span className="material-symbols-outlined">donut_large</span>
              <span>DISTRIBUIÇÃO DE PROBABILIDADE</span>
            </div>
            <div className="probability-list">
              {probabilityList.length === 0 ? (
                <div className="no-data">Nenhum dado disponível</div>
              ) : (
                probabilityList.map((item, idx) => (
                  <div key={idx} className="prob-item">
                    <div className="prob-name">
                      <span className="material-symbols-outlined">leaf</span>
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
      </div>

      <button className="restart-btn" onClick={onRestart}>
        <span className="material-symbols-outlined">refresh</span>
        Novo diagnóstico
      </button>

      <style jsx>{`
        .result-container {
          max-width: 1000px;
          display: flex;
          flex-direction: column;
          margin: 0 auto;
          padding: 0.2rem 2rem 1.5rem; /* padding-top reduzido */
          background: transparent;
        }

        .result-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 1rem; /* espaço reduzido */
        }
        .result-title span {
          font-size: 36px;
          color: #00ffaa;
        }
        .result-title h1 {
          font-size: 1.8rem;
          font-weight: 600;
          color: #00ffaa;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .result-split {
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .left-column {
          flex: 1;
          min-width: 250px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .right-column {
          flex: 1;
          min-width: 280px;
        }

        .disease-box, .confidence-box {
          background: rgba(0, 255, 170, 0.06);
          border: 1px solid rgba(0, 255, 170, 0.25);
          border-radius: 28px;
          padding: 1.2rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.2s ease;
        }
        .disease-box:hover, .confidence-box:hover {
          border-color: #00ffaa;
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,255,170,0.2);
        }
        .disease-box span, .confidence-box span {
          font-size: 36px;
          color: #00ffaa;
        }
        .box-label {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 1px;
          color: #8fa3b8;
          margin-bottom: 0.25rem;
        }
        .box-value {
          font-size: 1.3rem;
          font-weight: 700;
          color: #fff;
          word-break: break-word;
        }
        .confidence-bar {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          margin-top: 0.5rem;
          overflow: hidden;
        }
        .confidence-fill {
          height: 100%;
          background: #00ffaa;
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .probability-box {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 255, 170, 0.25);
          border-radius: 28px;
          padding: 1.2rem 1.5rem;
          height: 100%;
          transition: all 0.2s ease;
        }
        .probability-box:hover {
          border-color: #00ffaa;
          box-shadow: 0 8px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,255,170,0.2);
        }
        .prob-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.2rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(0, 255, 170, 0.3);
        }
        .prob-header span:first-child {
          font-size: 22px;
          color: #00ffaa;
        }
        .prob-header span:last-child {
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 1px;
          color: #00ffaa;
        }
        .probability-list {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }
        .prob-item {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .prob-name {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          color: #cbd5e1;
        }
        .prob-name span:first-child {
          font-size: 16px;
          color: #00ffaa;
        }
        .prob-bar-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .prob-bar {
          flex: 1;
          height: 5px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }
        .prob-fill {
          height: 100%;
          background: #00ffaa;
          border-radius: 3px;
        }
        .prob-value {
          font-size: 0.75rem;
          font-weight: 600;
          color: #00ffaa;
          min-width: 45px;
          text-align: right;
        }
        .no-data {
          text-align: center;
          color: #8fa3b8;
          font-size: 0.85rem;
          padding: 1rem;
        }

        .restart-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          max-width: 300px;
          margin: 1rem auto 0;
          padding: 0.8rem 1.5rem;
          background: #00ffaa;
          border: none;
          border-radius: 40px;
          font-weight: 700;
          font-size: 0.9rem;
          color: #000;
          cursor: pointer;
          transition: all 0.2s;
        }
        .restart-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(0, 255, 170, 0.4);
          background: #00e68a;
        }
        .restart-btn span {
          font-size: 20px;
        }

        @media (max-width: 750px) {
          .result-container {
            padding: 0.2rem 1rem 1rem;
          }
          .result-split {
            flex-direction: column;
            gap: 1rem;
          }
          .result-title h1 {
            font-size: 1.4rem;
          }
        }
      `}</style>
    </div>
  )
}