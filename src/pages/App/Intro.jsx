// Intro.jsx — Landing Page Desktop Premium
// Estilo alinhado com AuthPage / RegistroELogin
// Dependências: framer-motion, react-router-dom
// CSS externo: Intro.css

import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import "../../styles/App/Intro.css"
import {
  FaPlane
} from "react-icons/fa"

import Logo from "/public/assets/image/Logo-redonda.png"

/* ─── ANIMATION VARIANTS ─────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
  }),
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11 } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

/* ─── DATA ───────────────────────────────────────────────────────────────── */
const STATS = [
  { num: "98%",  label: "Precisão na detecção"   },
  { num: "24/7", label: "Monitoramento contínuo"  },
  { num: "−40%", label: "Perdas evitadas"         },
]

const FEATURES = [
  {
    icon: <FaPlane />,
    title: "Análise do Solo",
    desc: "Umidade, nutrientes e saúde do solo em tempo real",
  },
  {
    icon: "🔍",
    title: "Detecção de Pragas",
    desc: "IA avançada identifica 50+ tipos de pragas e doenças",
  },
  {
    icon: "🚁",
    title: "Voo Autônomo",
    desc: "Rotas inteligentes e mapeamento 3D da plantação",
  },
  {
    icon: "📊",
    title: "Relatórios",
    desc: "Dashboards interativos com insights acionáveis",
  },
]

const TRUST = [
  "Garantia de resultados",
  "Dados seguros e criptografados",
  "Suporte 24/7",
]

/* ─── PARTICLES ──────────────────────────────────────────────────────────── */
const PARTICLE_COLORS = [
  "rgba(26,255,122,0.5)",
  "rgba(0,200,80,0.4)",
  "rgba(255,255,255,0.3)",
  "rgba(26,255,122,0.25)",
]

function Particles({ count = 22 }) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 5 + 1.5,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 18 + 12,
      delay: Math.random() * 8,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    }))
  ).current

  return (
    <div className="intro-particles">
      {particles.map((p) => (
        <div
          key={p.id}
          className="intro-particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            animationName: "floatUp",
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
          }}
        />
      ))}
    </div>
  )
}

/* ─── FEATURE CARD ───────────────────────────────────────────────────────── */
function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div variants={cardVariant} className="intro-feature-card">
      <div className="intro-feature-card__top-line" />
      <span className="intro-feature-card__icon">{icon}</span>
      <span className="intro-feature-card__title">{title}</span>
      <p className="intro-feature-card__desc">{desc}</p>
    </motion.div>
  )
}

/* ─── LEFT PANEL ─────────────────────────────────────────────────────────── */
function LeftPanel({ onNavigate }) {
  return (
    <div className="intro-left">
      <div className="intro-left__inner">

        {/* Logo */}
        <motion.div
          className="intro-logo"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
        >
          <div className="intro-logo__icon">
            <img src={Logo} alt="Zenith" />
          </div>
          <div>
            <div className="intro-logo__sub">A sua precisão agrícola no ponto mais alto</div>
          </div>
        </motion.div>

        {/* Status badge */}
        <motion.div
          className="intro-badge"
          custom={0.15}
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          <span className="intro-badge__dot" />
          <span className="intro-badge__text">Sistema ativo e operacional</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="intro-headline"
          custom={0.25}
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          Monitoramento
          <br />
          <span className="intro-headline__accent">Inteligente</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="intro-subtitle"
          custom={0.35}
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          Drones autônomos com IA para detecção precoce de pragas e doenças.
          Aumente sua produtividade e reduza perdas com dados em tempo real.
        </motion.p>

        {/* Stats */}
        <motion.div
          className="intro-stats"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {STATS.map((s) => (
            <motion.div key={s.num} className="intro-stats__item" variants={cardVariant}>
              <span className="intro-stats__num">{s.num}</span>
              <span className="intro-stats__label">{s.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="intro-actions"
          custom={0.5}
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          <motion.button
            className="intro-btn intro-btn--primary"
            onClick={() => onNavigate("/login")}
            whileHover={{ opacity: 0.92, scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
          >
            Acessar Plataforma
            <span>→</span>
          </motion.button>

          <motion.button
            className="intro-btn intro-btn--secondary"
            onClick={() => onNavigate("/register")}
            whileTap={{ scale: 0.98 }}
          >
            Começar gratuitamente
            <span>🌿</span>
          </motion.button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          className="intro-trust"
          custom={0.65}
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          {TRUST.map((t) => (
            <div key={t} className="intro-trust__item">
              <span className="intro-trust__check">✓</span>
              {t}
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  )
}

/* ─── RIGHT PANEL ────────────────────────────────────────────────────────── */
function RightPanel() {
  return (
    <div className="intro-right">

      {/* Glow spheres */}
      <div className="intro-sphere intro-sphere--top" />
      <div className="intro-sphere intro-sphere--bottom" />

      {/* Grid & particles */}
      <div className="intro-grid" />
      <Particles count={22} />

      {/* Main content */}
      <div className="intro-right__content">

        {/* Top badge */}
        <motion.div
          className="intro-right__badge"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
        >
          <span>🛰️ &nbsp;Plataforma Integrada de Precisão</span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          className="intro-right__headline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
        >
          Tudo que sua lavoura
          <br />
          <span className="intro-right__headline--accent">precisa, em um só lugar</span>
        </motion.h2>

        {/* Description */}
        <motion.p
          className="intro-right__desc"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.5, duration: 0.5 } }}
        >
          Da análise de solo ao relatório gerencial — todo o ciclo de monitoramento
          agrícola com inteligência artificial e precisão milimétrica.
        </motion.p>

        {/* Feature cards */}
        <motion.div
          className="intro-features"
          variants={stagger}
          initial="hidden"
          animate="show"
          transition={{ delayChildren: 0.55 }}
        >
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </motion.div>

        {/* Status bar */}
        <motion.div
          className="intro-status-bar"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.9, duration: 0.5 } }}
        >
          <div className="intro-status-bar__left">
            <div className="intro-status-bar__dot" />
            <span className="intro-status-bar__label">Drones ativos monitorando agora</span>
          </div>
          <div className="intro-status-bar__right">
            <span className="intro-status-bar__count">247</span>
            <span className="intro-status-bar__unit">em operação</span>
          </div>
        </motion.div>

      </div>

      {/* Decorative rings */}
      <div className="intro-ring intro-ring--inner" />
      <div className="intro-ring intro-ring--outer" />

    </div>
  )
}

/* ─── ROOT EXPORT ────────────────────────────────────────────────────────── */
export default function Intro() {
  const navigate = useNavigate()

  return (
    <div className="intro-page">
      <LeftPanel onNavigate={navigate} />
      <RightPanel />
    </div>
  )
}