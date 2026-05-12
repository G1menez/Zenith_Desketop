// RegistroELogin.jsx — Premium Split-Card Authentication
// Design: Dark page + split card (white left / dark right) — Stripe/Linear/Vercel inspired
// All logic, Firebase, and Framer Motion preserved from original

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { auth, db } from "../../services/firebase"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth"
import { doc, setDoc, addDoc, collection } from "firebase/firestore"
import {
  FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser,
  FaIdCard, FaSeedling, FaLeaf, FaMapMarkerAlt, FaPhone,
  FaCalendarAlt, FaRulerCombined, FaChevronRight, FaCheckCircle
} from "react-icons/fa"

/* ─── DESIGN TOKENS ───────────────────────────────────────────────────────── */
const T = {
  // Page background
  pageBg: "#080f0a",
  // Card sides
  formBg: "#ffffff",
  visualBg: "#0a0f0b",
  // Brand
  green: "#16a34a",
  greenLight: "#22c55e",
  greenGlow: "rgba(34,197,94,0.15)",
  greenBorder: "rgba(34,197,94,0.3)",
  // Form text
  labelColor: "#6b7280",
  headingColor: "#0f1a12",
  bodyColor: "#374151",
  placeholderColor: "#9ca3af",
  // Input
  inputBg: "#f9fafb",
  inputBorder: "#e5e7eb",
  inputBorderFocus: "#16a34a",
  // Visual panel
  visualText: "#ffffff",
  visualSub: "rgba(255,255,255,0.6)",
  // Utility
  radius: "28px",
  radiusSm: "12px",
  radiusXs: "8px",
  font: "'DM Sans', 'Sora', system-ui, sans-serif",
  shadow: "0 32px 80px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.35)"
}

/* ─── STYLES ──────────────────────────────────────────────────────────────── */
const S = {
  // ── PAGE ──
  page: {
    display: "flex",
    minHeight: "100vh",
    width: "100vw",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: T.font,
    background: T.pageBg,
    position: "relative",
    overflow: "hidden",
    padding: "20px"
  },

  // Ambient glow orbs behind card
  glowOrb: (x, y, color, size) => ({
    position: "absolute",
    left: x, top: y,
    width: size, height: size,
    borderRadius: "50%",
    background: color,
    filter: "blur(80px)",
    pointerEvents: "none",
    zIndex: 0
  }),

  // ── CARD ──
  card: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    width: "100%",
    maxWidth: 980,
    height: "min(88vh, 780px)",
    borderRadius: T.radius,
    overflow: "hidden",
    boxShadow: T.shadow,
    border: "1px solid rgba(255,255,255,0.06)"
  },

  // ── LEFT — FORM PANEL ──
  formPanel: {
    width: "52%",
    minWidth: 340,
    background: T.formBg,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "2.5rem 3rem",
    overflowY: "auto",
    overflowX: "hidden",
    position: "relative",
    zIndex: 2
  },

  formPanelInner: {
    width: "100%",
    maxWidth: 400
  },

  // ── LOGO ──
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: "2rem"
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    objectFit: "cover",
    boxShadow: `0 0 0 2px ${T.greenBorder}`
  },
  logoText: {
    fontSize: 15,
    fontWeight: 700,
    color: T.headingColor,
    letterSpacing: "-0.2px"
  },
  logoBadge: {
    fontSize: 10,
    fontWeight: 600,
    color: T.green,
    background: "rgba(22,163,74,0.08)",
    border: "1px solid rgba(22,163,74,0.2)",
    borderRadius: 30,
    padding: "2px 8px",
    letterSpacing: "0.4px",
    textTransform: "uppercase",
    marginLeft: 4
  },

  // ── TABS ──
  tabs: {
    display: "flex",
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 3,
    marginBottom: "1.75rem",
    gap: 2
  },
  tab: (active) => ({
    flex: 1,
    padding: "9px 0",
    borderRadius: 9,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.1px",
    transition: "all 0.25s ease",
    background: active ? "#ffffff" : "transparent",
    color: active ? T.headingColor : T.labelColor,
    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)" : "none",
    fontFamily: "inherit"
  }),

  // ── HEADINGS ──
  heading: {
    fontSize: 22,
    fontWeight: 800,
    color: T.headingColor,
    marginBottom: 4,
    letterSpacing: "-0.4px",
    lineHeight: 1.25
  },
  subheading: {
    fontSize: 13,
    color: T.labelColor,
    marginBottom: "1.5rem",
    lineHeight: 1.55
  },

  // ── STEP INDICATOR ──
  steps: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: "1.25rem"
  },
  stepDot: (active, done) => ({
    width: 26,
    height: 26,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
    transition: "all 0.3s ease",
    background: done
      ? T.green
      : active
      ? "rgba(22,163,74,0.12)"
      : "#f3f4f6",
    border: done
      ? "none"
      : active
      ? `1.5px solid ${T.green}`
      : "1.5px solid #d1d5db",
    color: done ? "#fff" : active ? T.green : "#9ca3af"
  }),
  stepLine: (done) => ({
    flex: 1,
    height: 1.5,
    borderRadius: 2,
    background: done ? T.green : "#e5e7eb",
    transition: "background 0.4s ease"
  }),

  // ── INPUT GROUP ──
  inputGroup: {
    marginBottom: "0.9rem"
  },
  inputLabel: {
    display: "block",
    fontSize: 11.5,
    fontWeight: 600,
    color: T.labelColor,
    marginBottom: 5,
    letterSpacing: "0.4px",
    textTransform: "uppercase"
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  },
  inputIcon: {
    position: "absolute",
    left: 13,
    color: "#9ca3af",
    fontSize: 13,
    pointerEvents: "none",
    zIndex: 1
  },
  input: {
    width: "100%",
    padding: "11px 13px 11px 38px",
    background: T.inputBg,
    border: `1.5px solid ${T.inputBorder}`,
    borderRadius: T.radiusXs,
    color: T.headingColor,
    fontSize: 13.5,
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
    boxSizing: "border-box"
  },
  select: {
    width: "100%",
    padding: "11px 13px 11px 38px",
    background: T.inputBg,
    border: `1.5px solid ${T.inputBorder}`,
    borderRadius: T.radiusXs,
    color: T.headingColor,
    fontSize: 13.5,
    fontFamily: "inherit",
    outline: "none",
    appearance: "none",
    cursor: "pointer",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box"
  },
  inputRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.65rem"
  },

  // ── BUTTONS ──
  btnPrimary: {
    width: "100%",
    padding: "12.5px",
    borderRadius: T.radiusSm,
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: "0.1px",
    fontFamily: "inherit",
    background: `linear-gradient(135deg, ${T.greenLight} 0%, ${T.green} 100%)`,
    color: "#ffffff",
    marginTop: "0.4rem",
    transition: "opacity 0.2s, transform 0.15s, box-shadow 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    boxShadow: `0 4px 14px rgba(22,163,74,0.35)`
  },
  btnSecondary: {
    padding: "11.5px 18px",
    borderRadius: T.radiusXs,
    border: "1.5px solid #e5e7eb",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "inherit",
    background: "transparent",
    color: T.labelColor,
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: 5
  },
  btnRow: {
    display: "flex",
    gap: "0.65rem",
    marginTop: "0.4rem"
  },

  // ── ALERT ──
  alert: (type) => ({
    padding: "9px 13px",
    borderRadius: T.radiusXs,
    fontSize: 12.5,
    marginBottom: "0.65rem",
    display: "flex",
    alignItems: "center",
    gap: 7,
    background: type === "error" ? "rgba(239,68,68,0.07)" : "rgba(22,163,74,0.07)",
    border: type === "error"
      ? "1px solid rgba(239,68,68,0.25)"
      : "1px solid rgba(22,163,74,0.25)",
    color: type === "error" ? "#dc2626" : T.green
  }),

  // ── DIVIDER ──
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: "0.9rem 0"
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "#f3f4f6"
  },
  dividerText: {
    fontSize: 10.5,
    color: "#9ca3af",
    letterSpacing: "0.8px",
    fontWeight: 500
  },

  // ── MISC ──
  forgotLink: {
    fontSize: 12,
    color: T.green,
    textDecoration: "none",
    cursor: "pointer",
    fontWeight: 500
  },
  rememberRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.9rem"
  },
  rememberLabel: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: T.labelColor,
    cursor: "pointer"
  },

  // ── SPINNER ──
  spinner: {
    width: 15,
    height: 15,
    border: "2px solid rgba(255,255,255,0.25)",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite"
  },

  // ── RIGHT — VISUAL PANEL ──
  visualPanel: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: "2.5rem",
    width: "100%",
    height: "85vh"
  },
  visualOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(160deg, rgba(10,15,11,0.5) 0%, rgba(10,15,11,0.15) 40%, rgba(10,15,11,0.85) 100%)",
    zIndex: 1
  },
  visualGrid: {
    position: "absolute",
    inset: 0,
    zIndex: 1,
    backgroundImage: `
      linear-gradient(rgba(34,197,94,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(34,197,94,0.04) 1px, transparent 1px)
    `,
    backgroundSize: "52px 52px"
  },
  visualContent: {
    position: "relative",
    zIndex: 2
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "4px 11px",
    borderRadius: 30,
    background: "rgba(34,197,94,0.12)",
    border: `1px solid ${T.greenBorder}`,
    color: T.greenLight,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "1.2px",
    textTransform: "uppercase",
    marginBottom: "1rem"
  },
  visualHeading: {
    fontSize: "clamp(22px, 2.5vw, 34px)",
    fontWeight: 800,
    color: "#fff",
    lineHeight: 1.18,
    marginBottom: "0.85rem",
    letterSpacing: "-0.4px"
  },
  visualSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.65,
    maxWidth: 380,
    marginBottom: "2rem"
  },
  statRow: {
    display: "flex",
    gap: "1.5rem",
    flexWrap: "wrap"
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    gap: 2
  },
  statNum: {
    fontSize: 22,
    fontWeight: 800,
    color: T.greenLight,
    letterSpacing: "-0.5px"
  },
  statLabel: {
    fontSize: 10.5,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: "0.4px",
    textTransform: "uppercase"
  }
}

/* ─── ANIMATION VARIANTS ──────────────────────────────────────────────────── */
const fadeSlide = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1, y: 0,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] }
  },
  exit: {
    opacity: 0, y: -16,
    transition: { duration: 0.28, ease: "easeIn" }
  }
}

const stagger = {
  animate: { transition: { staggerChildren: 0.065, delayChildren: 0.08 } }
}

const item = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } }
}

const slideInRight = {
  initial: { opacity: 0, x: 28 },
  animate: {
    opacity: 1, x: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] }
  },
  exit: {
    opacity: 0, x: -28,
    transition: { duration: 0.26, ease: "easeIn" }
  }
}

const imageTransition = {
  initial: { opacity: 0, scale: 1.06 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.95, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.5, ease: "easeIn" } }
}

/* ─── IMAGES ──────────────────────────────────────────────────────────────── */
const IMAGES = {
  login: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80",
  register: "/assets/image/imagem-registro.jpg"
}

/* ─── FOCUS STYLE HOOK ────────────────────────────────────────────────────── */
function useFocusStyle() {
  return {
    onFocus: (e) => {
      e.target.style.borderColor = T.inputBorderFocus
      e.target.style.background = "#fff"
      e.target.style.boxShadow = `0 0 0 3px rgba(22,163,74,0.12)`
    },
    onBlur: (e) => {
      e.target.style.borderColor = T.inputBorder
      e.target.style.background = T.inputBg
      e.target.style.boxShadow = "none"
    }
  }
}

/* ─── UTILITY ─────────────────────────────────────────────────────────────── */
function formatDocument(value, type) {
  const n = value.replace(/\D/g, "")
  if (type === "CPF")
    return n.slice(0, 11)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  return n.slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
}

/* ─── SPINNER ─────────────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={S.spinner} />
    </>
  )
}

/* ─── FIELD ───────────────────────────────────────────────────────────────── */
function Field({ label, icon: Icon, children }) {
  return (
    <motion.div variants={item} style={S.inputGroup}>
      <label style={S.inputLabel}>{label}</label>
      <div style={S.inputWrapper}>
        {Icon && <Icon style={S.inputIcon} />}
        {children}
      </div>
    </motion.div>
  )
}

/* ─── LOGIN FORM ──────────────────────────────────────────────────────────── */
function LoginForm({ setAppLoading }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ type: "", text: "" })
  const focus = useFocusStyle()

  useEffect(() => {
    const saved = localStorage.getItem("rememberedEmail")
    if (saved) { setEmail(saved); setRemember(true) }
  }, [])

  const handleLogin = async () => {
    if (!email || !password) {
      setAlert({ type: "error", text: "Preencha todos os campos para entrar!" })
      return
    }
    setLoading(true)
    setAlert({ type: "", text: "" })
    try {
      await signInWithEmailAndPassword(auth, email, password)
      if (remember) localStorage.setItem("rememberedEmail", email)
      else localStorage.removeItem("rememberedEmail")
      setAlert({ type: "success", text: "Bem-vindo de volta, produtor! 🚁" })
      if (setAppLoading) setAppLoading(true)
      setTimeout(() => navigate("/home"), 1800)
    } catch (err) {
      const msgs = {
        "auth/user-not-found": "Usuário não encontrado. Crie sua conta primeiro!",
        "auth/wrong-password": "Senha incorreta. Tente novamente.",
        "auth/invalid-email": "Email inválido.",
        "auth/too-many-requests": "Muitas tentativas. Aguarde um momento.",
        "auth/invalid-credential": "Credenciais inválidas. Verifique e tente novamente."
      }
      setAlert({ type: "error", text: msgs[err.code] || "Erro ao fazer login. Tente novamente." })
    } finally { setLoading(false) }
  }

  return (
    <motion.div key="login" variants={stagger} initial="initial" animate="animate" exit="exit">
      <motion.h1 variants={item} style={S.heading}>Bem-vindo de volta</motion.h1>
      <motion.p variants={item} style={S.subheading}>
        Acesse sua plataforma de gestão agrícola inteligente
      </motion.p>

      <Field label="Email" icon={FaEnvelope}>
        <input
          style={S.input}
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
          {...focus}
        />
      </Field>

      <Field label="Senha" icon={FaLock}>
        <input
          style={{ ...S.input, paddingRight: 44 }}
          type={showPwd ? "text" : "password"}
          placeholder="Sua senha segura"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
          {...focus}
        />
        <button
          onClick={() => setShowPwd(!showPwd)}
          style={{
            position: "absolute", right: 13, background: "none",
            border: "none", cursor: "pointer", color: "#9ca3af",
            fontSize: 14, display: "flex", padding: 0, transition: "color 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.color = T.green}
          onMouseLeave={e => e.currentTarget.style.color = "#9ca3af"}
        >
          {showPwd ? <FaEye /> : <FaEyeSlash />}
        </button>
      </Field>

      <motion.div variants={item} style={S.rememberRow}>
        <label style={S.rememberLabel}>
          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
            style={{ accentColor: T.green }} />
          Lembrar-me
        </label>
        <a href="/forgot-password" style={S.forgotLink}>Esqueceu a senha?</a>
      </motion.div>

      <AnimatePresence mode="wait">
        {alert.text && (
          <motion.div
            key={alert.text}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={S.alert(alert.type)}
          >
            {alert.type === "success" ? <FaCheckCircle /> : "⚠️"} {alert.text}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={item}>
        <motion.button
          style={S.btnPrimary}
          onClick={handleLogin}
          disabled={loading}
          whileHover={{ opacity: 0.92, scale: 1.015, boxShadow: "0 6px 20px rgba(22,163,74,0.45)" }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? <><Spinner /> Entrando...</> : <>Entrar na plataforma <FaChevronRight size={11} /></>}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

/* ─── REGISTER FORM ───────────────────────────────────────────────────────── */
function RegisterForm() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ type: "", text: "" })
  const [userId, setUserId] = useState(null)
  const focus = useFocusStyle()

  const [user, setUser] = useState({
    name: "", age: "", type: "", document: "", email: "", password: ""
  })
  const [farm, setFarm] = useState({
    name: "", tipo_proprietario: "", data_aquisicao: "", cep: "",
    bairro: "", municipio: "", uf: "", area_total: "", telefone: "", plantacao: ""
  })

  const uc = (e) => { setUser(p => ({ ...p, [e.target.name]: e.target.value })); setAlert({ type: "", text: "" }) }
  const fc = (e) => setFarm(p => ({ ...p, [e.target.name]: e.target.value }))

  const buscarCEP = async (cep) => {
    const c = cep.replace(/\D/g, "")
    if (c.length !== 8) return
    try {
      const r = await fetch(`https://viacep.com.br/ws/${c}/json/`)
      const d = await r.json()
      if (!d.erro) setFarm(p => ({ ...p, bairro: d.bairro || "", municipio: d.localidade || "", uf: d.uf || "" }))
    } catch {}
  }

  const validate1 = () => {
    if (!user.name || !user.age || !user.type || !user.document || !user.email || !user.password) {
      setAlert({ type: "error", text: "Preencha todos os campos do agricultor!" }); return false
    }
    if (user.password.length < 6) {
      setAlert({ type: "error", text: "Senha deve ter mínimo 6 caracteres." }); return false
    }
    return true
  }

  const validate2 = () => {
    const keys = ["name","tipo_proprietario","data_aquisicao","cep","bairro","municipio","uf","area_total","telefone","plantacao"]
    if (keys.some(k => !farm[k])) {
      setAlert({ type: "error", text: "Preencha todos os dados da fazenda!" }); return false
    }
    return true
  }

  const handleStep1 = async () => {
    if (!validate1()) return
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, user.email, user.password)
      await setDoc(doc(db, "users", cred.user.uid), {
        name: user.name, age: parseInt(user.age), type: user.type,
        document: user.document, email: user.email, hectares: 0,
        createdAt: new Date().toISOString(), profileIcon: "👨‍🌾"
      })
      setUserId(cred.user.uid)
      setAlert({ type: "success", text: "Conta criada! Agora cadastre sua fazenda 🌱" })
      setTimeout(() => { setAlert({ type: "", text: "" }); setStep(2) }, 1500)
    } catch (err) {
      setAlert({
        type: "error",
        text: err.code === "auth/email-already-in-use" ? "Email já cadastrado!" : "Erro no cadastro. Tente novamente."
      })
    } finally { setLoading(false) }
  }

  const handleStep2 = async () => {
    if (!validate2()) return
    setLoading(true)
    try {
      await addDoc(collection(db, "farms"), {
        ...farm, ownerId: userId, ownerName: user.name,
        area_total: farm.area_total, createdAt: new Date()
      })
      await setDoc(doc(db, "users", userId), { hectares: parseFloat(farm.area_total) || 0 }, { merge: true })
      setAlert({ type: "success", text: "Fazenda cadastrada com sucesso! 🌾" })
      setTimeout(() => navigate("/home"), 2000)
    } catch {
      setAlert({ type: "error", text: "Erro ao cadastrar fazenda." })
    } finally { setLoading(false) }
  }

  return (
    <motion.div key="register" variants={fadeSlide} initial="initial" animate="animate" exit="exit">
      {/* Step indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.35 } }}
        style={S.steps}
      >
        <div style={S.stepDot(step === 1, step > 1)}>
          {step > 1 ? <FaCheckCircle size={10} /> : "1"}
        </div>
        <div style={S.stepLine(step > 1)} />
        <div style={S.stepDot(step === 2, false)}>2</div>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="s1"
            variants={stagger}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, x: -30, transition: { duration: 0.25 } }}
          >
            <motion.h1 variants={item} style={S.heading}>Criar conta</motion.h1>
            <motion.p variants={item} style={S.subheading}>
              Dados pessoais do agricultor — etapa 1 de 2
            </motion.p>

            <Field label="Nome Completo" icon={FaUser}>
              <input style={S.input} name="name" placeholder="Seu nome completo"
                value={user.name} onChange={uc} {...focus} />
            </Field>

            <motion.div variants={item} style={S.inputRow}>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Idade</label>
                <div style={S.inputWrapper}>
                  <input style={S.input} name="age" type="number" placeholder="Idade"
                    value={user.age} onChange={uc} {...focus} />
                </div>
              </div>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Tipo</label>
                <div style={S.inputWrapper}>
                  <select style={S.select} name="type" value={user.type} onChange={uc} {...focus}>
                    <option value="">Selecione</option>
                    <option value="CPF">Pessoa Física</option>
                    <option value="PJ">Pessoa Jurídica</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {user.type && (
              <Field label={user.type === "CPF" ? "CPF" : "CNPJ"} icon={FaIdCard}>
                <input style={S.input} name="document"
                  placeholder={user.type === "CPF" ? "000.000.000-00" : "00.000.000/0000-00"}
                  value={user.document}
                  onChange={e => uc({ target: { name: "document", value: formatDocument(e.target.value, user.type) } })}
                  {...focus} />
              </Field>
            )}

            <Field label="Email" icon={FaEnvelope}>
              <input style={S.input} name="email" type="email" placeholder="seu@email.com"
                value={user.email} onChange={uc} {...focus} />
            </Field>

            <Field label="Senha" icon={FaLock}>
              <input style={S.input} name="password" type="password" placeholder="Mínimo 6 caracteres"
                value={user.password} onChange={uc} {...focus} />
            </Field>

            <AnimatePresence mode="wait">
              {alert.text && (
                <motion.div key={alert.text}
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }} style={S.alert(alert.type)}>
                  {alert.type === "success" ? <FaCheckCircle /> : "⚠️"} {alert.text}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={item}>
              <motion.button style={S.btnPrimary} onClick={handleStep1} disabled={loading}
                whileHover={{ opacity: 0.92, scale: 1.015, boxShadow: "0 6px 20px rgba(22,163,74,0.45)" }}
                whileTap={{ scale: 0.98 }}>
                {loading ? <><Spinner /> Criando conta...</> : <>Próximo passo <FaChevronRight size={11} /></>}
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="s2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, x: -30, transition: { duration: 0.25 } }}
          >
            <motion.h1 style={S.heading}>Sua fazenda</motion.h1>
            <motion.p style={S.subheading}>Dados da propriedade rural — etapa 2 de 2</motion.p>

            <Field label="Nome da Fazenda" icon={FaLeaf}>
              <input style={S.input} name="name" placeholder="Ex: Fazenda Esperança"
                value={farm.name} onChange={fc} {...focus} />
            </Field>

            <div style={S.inputRow}>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Tipo Proprietário</label>
                <div style={S.inputWrapper}>
                  <select style={S.select} name="tipo_proprietario" value={farm.tipo_proprietario} onChange={fc} {...focus}>
                    <option value="">Selecione</option>
                    <option value="PF">Pessoa Física</option>
                    <option value="PJ">Pessoa Jurídica</option>
                  </select>
                </div>
              </div>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Aquisição</label>
                <div style={S.inputWrapper}>
                  <FaCalendarAlt style={S.inputIcon} />
                  <input style={S.input} name="data_aquisicao" type="date"
                    value={farm.data_aquisicao} onChange={fc} {...focus} />
                </div>
              </div>
            </div>

            <div style={S.inputRow}>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>CEP</label>
                <div style={S.inputWrapper}>
                  <FaMapMarkerAlt style={S.inputIcon} />
                  <input style={S.input} name="cep" placeholder="00000-000"
                    value={farm.cep}
                    onChange={e => { fc(e); buscarCEP(e.target.value) }}
                    {...focus} />
                </div>
              </div>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>UF</label>
                <div style={S.inputWrapper}>
                  <input style={S.input} name="uf" placeholder="SP" maxLength={2}
                    value={farm.uf} onChange={fc} {...focus} />
                </div>
              </div>
            </div>

            <div style={S.inputRow}>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Bairro</label>
                <div style={S.inputWrapper}>
                  <input style={S.input} name="bairro" placeholder="Bairro"
                    value={farm.bairro} onChange={fc} {...focus} />
                </div>
              </div>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Município</label>
                <div style={S.inputWrapper}>
                  <input style={S.input} name="municipio" placeholder="Cidade"
                    value={farm.municipio} onChange={fc} {...focus} />
                </div>
              </div>
            </div>

            <div style={S.inputRow}>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Área Total (ha)</label>
                <div style={S.inputWrapper}>
                  <FaRulerCombined style={S.inputIcon} />
                  <select style={S.select} name="area_total" value={farm.area_total} onChange={fc} {...focus}>
                    <option value="">Selecione</option>
                    <option value="1-6">1–6 ha</option>
                    <option value="7-12">7–12 ha</option>
                    <option value="13-20">13–20 ha</option>
                    <option value="21-29">21–29 ha</option>
                    <option value="30-40">30–40 ha</option>
                  </select>
                </div>
              </div>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Telefone</label>
                <div style={S.inputWrapper}>
                  <FaPhone style={S.inputIcon} />
                  <input style={S.input} name="telefone" placeholder="(00) 00000-0000"
                    value={farm.telefone} onChange={fc} {...focus} />
                </div>
              </div>
            </div>

            <div style={S.inputGroup}>
              <label style={S.inputLabel}>Principal Plantação</label>
              <div style={S.inputWrapper}>
                <FaSeedling style={S.inputIcon} />
                <select style={S.select} name="plantacao" value={farm.plantacao} onChange={fc} {...focus}>
                  <option value="">Selecione a cultura</option>
                  {["Soja","Tomate","Café","Milho","Feijão"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {alert.text && (
                <motion.div key={alert.text}
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }} style={S.alert(alert.type)}>
                  {alert.type === "success" ? <FaCheckCircle /> : "⚠️"} {alert.text}
                </motion.div>
              )}
            </AnimatePresence>

            <div style={S.btnRow}>
              <motion.button
                style={S.btnSecondary}
                onClick={() => setStep(1)}
                whileHover={{ borderColor: "#d1d5db", color: T.headingColor }}
                whileTap={{ scale: 0.97 }}
              >
                ← Voltar
              </motion.button>
              <motion.button
                style={{ ...S.btnPrimary, flex: 1, marginTop: 0 }}
                onClick={handleStep2}
                disabled={loading}
                whileHover={{ opacity: 0.92, scale: 1.01, boxShadow: "0 6px 20px rgba(22,163,74,0.45)" }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? <><Spinner /> Cadastrando...</> : <>Finalizar cadastro 🌾</>}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── SIDE PANEL ──────────────────────────────────────────────────────────── */
function SidePanel({ mode }) {
  const content = {
    login: {
      badge: "Tecnologia Agro",
      headline: "Zenith: A sua precisão agrícola no ponto mais alto",
      sub: "Monitore, analise e tome decisões inteligentes para sua propriedade rural com tecnologia de ponta em gestão de drones e sensoriamento remoto.",
      stats: [
        { num: "98%", label: "Precisão de dados" },
        { num: "3.4×", label: "Produtividade média" },
        { num: "12k+", label: "Produtores ativos" }
      ]
    },
    register: {
      badge: "Registre-se na Zenith",
      headline: "Transforme sua propriedade com inteligência agrícola",
      sub: "Junte-se a milhares de agricultores que já utilizam tecnologia de precisão para maximizar resultados e gerenciar safras com excelência.",
      stats: [
        { num: "40%", label: "Redução de insumos" },
        { num: "R$ 2M+", label: "Economizados" },
        { num: "5 min", label: "Para começar" }
      ]
    }
  }
  const c = content[mode]

  return (
    <div style={S.visualPanel}>
      {/* Background image with cinematic transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          variants={imageTransition}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${IMAGES[mode]})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
      </AnimatePresence>

      {/* Overlay */}
      <div style={S.visualOverlay} />

      {/* Grid lines */}
      <div style={S.visualGrid} />

      {/* Floating ambient light */}
      <div style={{
        position: "absolute", bottom: "30%", right: "10%",
        width: 200, height: 200, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)",
        zIndex: 1, filter: "blur(20px)", pointerEvents: "none"
      }} />

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode + "content"}
          style={S.visualContent}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
        >
          <div style={S.badge}>
            <span style={{
              width: 5, height: 5, borderRadius: "50%",
              background: T.greenLight, display: "inline-block", marginRight: 2
            }} />
            {c.badge}
          </div>

          <h2 style={S.visualHeading}>{c.headline}</h2>
          <p style={S.visualSub}>{c.sub}</p>

          <div style={S.statRow}>
            {c.stats.map((s, i) => (
              <motion.div
                key={s.num}
                style={S.stat}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.4 + i * 0.1, duration: 0.4 } }}
              >
                <span style={S.statNum}>{s.num}</span>
                <span style={S.statLabel}>{s.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ─── AUTH PAGE (root export) ─────────────────────────────────────────────── */
export default function AuthPage({ setAppLoading }) {
  const [mode, setMode] = useState("login")

  const switchMode = (next) => setMode(next)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* Scrollbar — form panel */
        .auth-form-panel::-webkit-scrollbar { width: 4px; }
        .auth-form-panel::-webkit-scrollbar-track { background: transparent; }
        .auth-form-panel::-webkit-scrollbar-thumb { background: rgba(22,163,74,0.2); border-radius: 4px; }

        /* Placeholder */
        .auth-form-panel input::placeholder,
        .auth-form-panel select::placeholder { color: #9ca3af; }
        select option { background: #fff; color: #0f1a12; }
        input[type=date]::-webkit-calendar-picker-indicator { opacity: 0.45; cursor: pointer; }

        /* Mobile */
        @media (max-width: 800px) {
          .auth-visual { display: none !important; }
          .auth-form-panel {
            width: 100% !important;
            min-width: unset !important;
            padding: 2rem 1.75rem !important;
          }
          .auth-card {
            height: auto !important;
            min-height: 90vh;
            border-radius: 20px !important;
          }
        }
        @media (max-width: 480px) {
          .auth-card { border-radius: 0 !important; min-height: 100vh; margin: 0; }
          .auth-page { padding: 0 !important; }
        }
      `}</style>

      <div className="auth-page" style={S.page}>
        {/* Ambient background glow orbs */}
        <div style={S.glowOrb("5%", "10%", "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)", 500)} />
        <div style={S.glowOrb("60%", "70%", "radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)", 400)} />
        <div style={S.glowOrb("80%", "5%", "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)", 350)} />

        {/* ── SPLIT CARD ── */}
        <motion.div
          className="auth-card"
          style={S.card}
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
        >
          {/* LEFT — Form */}
          <div className="auth-form-panel" style={S.formPanel}>
            <div style={S.formPanelInner}>

              {/* Logo */}
              <motion.div
                style={S.logo}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.45 } }}
              >
                <img style={S.logoIcon} src="assets/image/Logo-redonda.png" alt="Zenith" />
                <div>
                  <span style={S.logoText}>Zenith Agrícola</span>
                  <span style={S.logoBadge}>Beta</span>
                </div>
              </motion.div>

              {/* Tab switcher */}
              <motion.div
                style={S.tabs}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.08 } }}
              >
                {[["login", "Entrar"], ["register", "Cadastrar"]].map(([id, label]) => (
                  <button
                    key={id}
                    style={S.tab(mode === id)}
                    onClick={() => switchMode(id)}
                  >
                    {label}
                  </button>
                ))}
              </motion.div>

              {/* Forms */}
              <AnimatePresence mode="wait">
                {mode === "login" ? (
                  <LoginForm key="login" setAppLoading={setAppLoading} />
                ) : (
                  <RegisterForm key="register" />
                )}
              </AnimatePresence>

              {/* Divider */}
              <motion.div
                style={S.divider}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.55 } }}
              >
                <div style={S.dividerLine} />
                <span style={S.dividerText}>
                  {mode === "login" ? "NÃO TEM CONTA?" : "JÁ TEM CONTA?"}
                </span>
                <div style={S.dividerLine} />
              </motion.div>

              {/* Switch CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.6 } }}
                style={{ textAlign: "center" }}
              >
                <motion.button
                  onClick={() => switchMode(mode === "login" ? "register" : "login")}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: T.green, fontSize: 13, fontWeight: 600,
                    fontFamily: "inherit", letterSpacing: "0.1px"
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {mode === "login" ? "Criar conta gratuita →" : "← Entrar na minha conta"}
                </motion.button>
              </motion.div>

            </div>
          </div>

          {/* RIGHT — Visual */}
          <div className="auth-visual" style={{ flex: 1, position: "relative" }}>
            <SidePanel mode={mode} />
          </div>
        </motion.div>
      </div>
    </>
  )
}