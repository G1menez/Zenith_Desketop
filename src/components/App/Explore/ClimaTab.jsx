import { useState, useEffect } from "react"
import { useFarm } from "./hooks/useFarm"

const API_KEY = "d77668673cf15b7d0488f921007cbd6b"

export default function ClimaTab() {
  const { farmData, loading: farmLoading } = useFarm()
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchWeather = async () => {
    if (!farmData) { 
      setError("Nenhuma fazenda cadastrada"); 
      setLoading(false); 
      return; 
    }
    if (!farmData.municipio || !farmData.uf) { 
      setError("Localização da fazenda incompleta"); 
      setLoading(false); 
      return; 
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const city = encodeURIComponent(farmData.municipio);
      const state = farmData.uf;
      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},${state},BR&appid=${API_KEY}&units=metric&lang=pt_br`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city},${state},BR&appid=${API_KEY}&units=metric&lang=pt_br`)
      ]);
      const weather = await weatherRes.json();
      const forecast = await forecastRes.json();
      let minTempDay = weather.main.temp;
      let maxTempDay = weather.main.temp;
      
      if (forecast.cod === "200") {
        const today = new Date().toISOString().split("T")[0];
        const todayList = forecast.list.filter(item => item.dt_txt.startsWith(today));
        if (todayList.length > 0) {
          const temps = todayList.map(item => item.main.temp);
          minTempDay = Math.min(...temps);
          maxTempDay = Math.max(...temps);
        }
      }
      
      if (weather.cod === 200) {
        setWeatherData({
          city: weather.name, 
          state, 
          farmName: farmData.name,
          temperature: Math.round(weather.main.temp), 
          feelsLike: Math.round(weather.main.feels_like),
          tempMin: Math.round(minTempDay), 
          tempMax: Math.round(maxTempDay),
          humidity: weather.main.humidity, 
          pressure: weather.main.pressure,
          windSpeed: weather.wind.speed, 
          windDeg: weather.wind.deg, 
          windGust: weather.wind.gust || 0,
          rain: weather.rain?.["1h"] || 0, 
          description: weather.weather[0].description,
          icon: weather.weather[0].icon, 
          clouds: weather.clouds.all,
          visibility: weather.visibility / 1000,
          sunrise: new Date(weather.sys.sunrise * 1000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          sunset: new Date(weather.sys.sunset * 1000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          date: new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
        });
      } else {
        setError("Cidade não encontrada");
      }
    } catch (err) { 
      console.error(err);
      setError("Erro ao buscar clima"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    if (!farmLoading) fetchWeather(); 
  }, [farmData, farmLoading]);

  const getWindDirection = (deg) => {
    const dirs = ["N", "NE", "L", "SE", "S", "SO", "O", "NO"];
    return dirs[Math.round(deg / 45) % 8];
  };

  const getRecommendations = () => {
    if (!weatherData) return [];
    const recs = [];
    if (weatherData.humidity < 50 && weatherData.rain === 0) {
      recs.push({ type: "warning", icon: "water_drop", title: "Solo seco", msg: "Irrigação recomendada" });
    }
    if (weatherData.humidity > 80) {
      recs.push({ type: "warning", icon: "humidity_high", title: "Alta umidade", msg: "Risco de fungos. Monitore as plantas" });
    }
    if (weatherData.temperature > 32) {
      recs.push({ type: "warning", icon: "whatshot", title: "Calor intenso", msg: "Proteja plantas sensíveis do sol forte" });
    }
    if (weatherData.temperature < 15) {
      recs.push({ type: "warning", icon: "ac_unit", title: "Temperatura baixa", msg: "Risco de geada. Proteja as plantas" });
    }
    if (weatherData.windSpeed > 8) {
      recs.push({ type: "warning", icon: "wind_power", title: "Vento forte", msg: "Evite pulverização e verifique estruturas" });
    }
    if (weatherData.rain > 5) {
      recs.push({ type: "info", icon: "rainy", title: "Chuva forte", msg: "Suspenda irrigação e verifique drenagem" });
    }
    if (weatherData.humidity >= 50 && weatherData.humidity <= 70 && weatherData.temperature >= 20 && weatherData.temperature <= 30 && weatherData.windSpeed <= 5 && weatherData.rain === 0) {
      recs.push({ type: "success", icon: "sentiment_satisfied", title: "Condições ideais", msg: "Perfeito para atividades no campo" });
    }
    if (recs.length === 0) {
      recs.push({ type: "info", icon: "agriculture", title: "Clima estável", msg: "Condições normais para as atividades agrícolas" });
    }
    return recs;
  };

  // RETORNO DE LOADING DO CÓDIGO ANTIGO (Mantido igual)
  if (loading || farmLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--primary)' }}>cloud</span>
          </div>
          <h3 style={styles.loadingTitle}>Buscando clima</h3>
          <p style={styles.loadingText}>
            {farmData ? `Obtendo dados para ${farmData.municipio}...` : 'Carregando...'}
          </p>
        </div>
      </div>
    )
  }

  // RETORNO DE ERRO DO CÓDIGO ANTIGO (Mantido igual)
  if (error || !weatherData) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--danger)' }}>error</span>
          </div>
          <h3 style={styles.errorTitle}>Ops!</h3>
          <p style={styles.errorText}>{error || "Não foi possível obter os dados"}</p>
          {farmData && (
            <button style={styles.retryButton} onClick={fetchWeather}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
              Tentar novamente
            </button>
          )}
        </div>
      </div>
    )
  }

  const recommendations = getRecommendations();

  return (
    <div className="clima-premium-dashboard animate-fade-in">
      
      {/* INJEÇÃO DE CSS (Garantido com ponto e vírgula padrão de folhas CSS) */}
      <style>{`
        .clima-premium-dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .clima-main-desktop-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 1.5rem;
          align-items: stretch;
        }
        .clima-hero-card-solid {
          background: #0a1810;
          border: 2px solid #162a20;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 2rem;
        }
        .clima-hero-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .clima-geo-container {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .geo-icon-neon {
          font-size: 2.5rem !important;
          color: #00ffaa;
          filter: drop-shadow(0 0 8px rgba(0, 255, 170, 0.3));
        }
        .clima-geo-container h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }
        .clima-geo-date {
          font-size: 0.85rem;
          color: #8fa098;
          margin: 4px 0 0 0;
        }
        .clima-refresh-action-btn {
          background: #050a07;
          border: 1px solid #162a20;
          color: #ffffff;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s ease;
        }
        .clima-refresh-action-btn:hover {
          border-color: #00ffaa;
          color: #00ffaa;
          transform: rotate(60deg);
        }
        .clima-display-temp-wrapper {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 1.5rem;
        }
        .clima-temp-badge-glow {
          background: linear-gradient(135deg, #00ffaa, #0066ff);
          padding: 1.5rem 2.25rem;
          border-radius: 24px;
          display: flex;
          align-items: flex-start;
          box-shadow: 0 0 30px rgba(0, 255, 170, 0.2);
        }
        .clima-temp-number {
          font-size: 4rem;
          font-weight: 850;
          color: #050a07;
          line-height: 1;
        }
        .clima-temp-symbol {
          font-size: 1.5rem;
          font-weight: 700;
          color: #050a07;
          margin-top: 4px;
        }
        .clima-temp-meta-stack {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .clima-condition-text-description {
          font-size: 1.4rem;
          font-weight: 700;
          color: #ffffff;
          text-transform: capitalize;
        }
        .clima-feels-like-text {
          font-size: 0.95rem;
          color: #8fa098;
        }
        .clima-feels-like-text strong {
          color: #00ffaa;
        }
        .clima-minmax-pills-row {
          display: flex;
          gap: 1rem;
        }
        .clima-pill-stat {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: #050a07;
          border: 1px solid #162a20;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .clima-pill-stat.item-min { color: #00ccff; }
        .clima-pill-stat.item-max { color: #ff4d4d; }
        
        .clima-side-recommendations-wrapper {
          background: #0a1810;
          border: 2px solid #162a20;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
          display: flex;
          flex-direction: column;
        }
        .clima-section-title-label {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.05em;
          margin: 0 0 1.25rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #162a20;
        }
        .clima-section-title-label span {
          color: #00ffaa;
        }
        .clima-rec-scrollable-container {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          overflow-y: auto;
          max-height: 250px;
          padding-right: 4px;
        }
        .clima-premium-rec-box {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 12px;
          background: #050a07;
          border: 1px solid #162a20;
        }
        .rec-box-icon {
          font-size: 1.8rem !important;
          flex-shrink: 0;
        }
        .rec-box-details strong {
          display: block;
          font-size: 0.95rem;
          color: #ffffff;
          margin-bottom: 2px;
        }
        .rec-box-details p {
          font-size: 0.85rem;
          color: #8fa098;
          margin: 0;
        }
        .clima-premium-rec-box.type-warning { border-left: 4px solid #ffaa00; }
        .clima-premium-rec-box.type-warning .rec-box-icon { color: #ffaa00; }
        .clima-premium-rec-box.type-success { border-left: 4px solid #00ffaa; }
        .clima-premium-rec-box.type-success .rec-box-icon { color: #00ffaa; }
        .clima-premium-rec-box.type-info { border-left: 4px solid #00ccff; }
        .clima-premium-rec-box.type-info .rec-box-icon { color: #00ccff; }

        .clima-technical-details-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .clima-technical-grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1rem;
        }
        .clima-technical-metric-card {
          background: #0a1810;
          border: 1px solid #162a20;
          border-radius: 14px;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.2s ease;
        }
        .clima-technical-metric-card:hover {
          border-color: #00ffaa;
          transform: translateY(-2px);
        }
        .metric-icon-indicator {
          font-size: 1.8rem !important;
          color: #00ffaa;
          background: #050a07;
          padding: 0.5rem;
          border-radius: 10px;
        }
        .metric-meta-values {
          display: flex;
          flex-direction: column;
        }
        .metric-meta-values small {
          font-size: 0.75rem;
          color: #8fa098;
          text-transform: uppercase;
        }
        .metric-meta-values strong {
          font-size: 1.1rem;
          color: #ffffff;
          margin-top: 2px;
        }
        .clima-dashboard-footer-meta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: #8fa098;
          margin-top: 0.5rem;
        }
        .animate-fade-in {
          animation: climaFadeIn 0.5s ease forwards;
        }
        @keyframes climaFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 950px) {
          .clima-main-desktop-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      
      {/* SEÇÃO PRINCIPAL EM GRID */}
      <div className="clima-main-desktop-grid">
        
        {/* CARD HERO - CLIMA ATUAL */}
        <div className="clima-hero-card-solid">
          <div className="clima-hero-header">
            <div className="clima-geo-container">
              <span className="material-symbols-outlined geo-icon-neon">location_on</span>
              <div>
                <h2>{weatherData.city}</h2>
                <p className="clima-geo-date">{weatherData.date}</p>
              </div>
            </div>
            <button className="clima-refresh-action-btn" onClick={fetchWeather} title="Atualizar clima">
              <span className="material-symbols-outlined">refresh</span>
            </button>
          </div>

          <div className="clima-hero-body">
            <div className="clima-display-temp-wrapper">
              <div className="clima-temp-badge-glow">
                <span className="clima-temp-number">{weatherData.temperature}</span>
                <span className="clima-temp-symbol">°C</span>
              </div>
              <div className="clima-temp-meta-stack">
                <span className="clima-condition-text-description">{weatherData.description}</span>
                <span className="clima-feels-like-text">Sensação térmica: <strong>{weatherData.feelsLike}°C</strong></span>
              </div>
            </div>

            <div className="clima-minmax-pills-row">
              <div className="clima-pill-stat item-min">
                <span className="material-symbols-outlined">arrow_downward</span>
                <span>Mínima: {weatherData.tempMin}°C</span>
              </div>
              <div className="clima-pill-stat item-max">
                <span className="material-symbols-outlined">arrow_upward</span>
                <span>Máxima: {weatherData.tempMax}°C</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOX DE RECOMENDAÇÕES DE MANEJO */}
        <div className="clima-side-recommendations-wrapper">
          <h3 className="clima-section-title-label">
            <span className="material-symbols-outlined">psychology</span>
            RECOMENDAÇÕES DE MANEJO
          </h3>
          <div className="clima-rec-scrollable-container">
            {recommendations.map((rec, i) => (
              <div key={i} className={`clima-premium-rec-box type-${rec.type}`}>
                <span className="material-symbols-outlined rec-box-icon">{rec.icon}</span>
                <div className="rec-box-details">
                  <strong>{rec.title}</strong>
                  <p>{rec.msg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* METRICAS DETALHADAS */}
      <div className="clima-technical-details-section">
        <h3 className="clima-section-title-label">
          <span className="material-symbols-outlined">analytics</span>
          MÉTRICAS METEOROLÓGICAS DETALHADAS
        </h3>
        
        <div className="clima-technical-grid-layout">
          {[
            { icon: "humidity_percentage", label: "Umidade", value: `${weatherData.humidity}%` },
            { icon: "air", label: "Vento", value: `${weatherData.windSpeed} m/s ${getWindDirection(weatherData.windDeg)}` },
            { icon: "speed", label: "Pressão", value: `${weatherData.pressure} hPa` },
            { icon: "rainy", label: "Chuva (1h)", value: `${weatherData.rain} mm` },
            { icon: "airwave", label: "Rajada Vento", value: `${weatherData.windGust} m/s` },
            { icon: "visibility", label: "Visibilidade", value: `${weatherData.visibility} km` },
            { icon: "cloud", label: "Nuvens", value: `${weatherData.clouds}%` },
            { icon: "sunny", label: "Nascer do Sol", value: weatherData.sunrise },
            { icon: "nightlight", label: "Pôr do Sol", value: weatherData.sunset }
          ].map((item, i) => (
            <div key={i} className="clima-technical-metric-card">
              <span className="material-symbols-outlined metric-icon-indicator">{item.icon}</span>
              <div className="metric-meta-values">
                <small>{item.label}</small>
                <strong>{item.value}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="clima-dashboard-footer-meta">
        <span className="material-symbols-outlined">update</span>
        <span>Monitoramento agroecológico em tempo real • Atualizado agora</span>
      </div>

    </div>
  )
}

// Estilos em objeto JS dedicados estritamente aos estados de Loading e Erro antigos
const styles = {
  loadingContainer: {
    minHeight: '70vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    width: '100%',
    boxSizing: 'border-box',
  },
  loadingCard: {
    background: 'rgba(18, 22, 28, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '28px',
    padding: '32px 24px',
    textAlign: 'center',
    width: '100%',
    maxWidth: '280px',
  },
  loadingIcon: {
    marginBottom: '14px',
  },
  loadingTitle: {
    color: '#fff',
    margin: '0 0 6px 0',
    fontSize: '1.2rem',
  },
  loadingText: {
    color: '#a0a8b4',
    margin: 0,
    fontSize: '0.9rem',
  },
  errorCard: {
    background: 'rgba(18, 22, 28, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,68,68,0.2)',
    borderRadius: '28px',
    padding: '32px 24px',
    textAlign: 'center',
    width: '100%',
    maxWidth: '280px',
  },
  errorIcon: {
    marginBottom: '14px',
  },
  errorTitle: {
    color: '#ff4d4d',
    margin: '0 0 6px 0',
    fontSize: '1.2rem',
  },
  errorText: {
    color: '#a0a8b4',
    margin: '0 0 16px 0',
    fontSize: '0.9rem',
  },
  retryButton: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '26px',
    padding: '10px 20px',
    color: '#fff',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
}