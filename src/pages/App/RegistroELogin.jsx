// AuthPage.jsx — Unified Authentication System
// Dependencies: framer-motion, react-icons/fa, react-router-dom, firebase
// Usage: <AuthPage /> — replace your Login and CadastroCompleto routes with this single component

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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

/* ─── STYLES ──────────────────────────────────────────────────────────────── */
const S = {
  /* Outer wrapper */
  page: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    fontFamily: "'Sora', 'DM Sans', system-ui, sans-serif",
    background: "#060e08"
  },

  /* LEFT — form panel */
  formPanel: {
    position: "relative",
    width: "48%",
    minWidth: 420,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem 3.5rem",
    overflowY: "auto",
    overflowX: "hidden",
    background: "linear-gradient(160deg, #060e08 0%, #091209 60%, #0a1a0c 100%)",
    zIndex: 2
  },

  formPanelInner: {
    width: "100%",
    maxWidth: 440
  },

  /* Logo */
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: "2.5rem"
  },
  logoIcon: {
    width: 100,
    height: 100,
    borderRadius: "100%",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    color: "#060e08",
    fontWeight: 800
  },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    color: "#e8f5e0",
    letterSpacing: "-0.3px"
  },

  /* Tab switcher */
  tabs: {
    display: "flex",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: 4,
    marginBottom: "2rem",
    gap: 2
  },
  tab: (active) => ({
    flex: 1,
    padding: "10px 0",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontSize: 13.5,
    fontWeight: 600,
    letterSpacing: "0.2px",
    transition: "all 0.3s ease",
    background: active
      ? "linear-gradient(135deg, #1aff7a 0%, #00c850 100%)"
      : "transparent",
    color: active ? "#060e08" : "rgba(255,255,255,0.45)",
    fontFamily: "inherit"
  }),

  /* Headings */
  heading: {
    fontSize: 26,
    fontWeight: 800,
    color: "#e8f5e0",
    marginBottom: 4,
    letterSpacing: "-0.5px",
    lineHeight: 1.2
  },
  subheading: {
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
    marginBottom: "1.75rem",
    lineHeight: 1.5
  },

  /* Step indicator */
  steps: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: "1.5rem"
  },
  stepDot: (active, done) => ({
    width: done ? 26 : 26,
    height: 26,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    transition: "all 0.3s ease",
    background: done
      ? "linear-gradient(135deg, #1aff7a, #00c850)"
      : active
      ? "rgba(26,255,122,0.15)"
      : "rgba(255,255,255,0.06)",
    border: done
      ? "none"
      : active
      ? "1.5px solid #1aff7a"
      : "1.5px solid rgba(255,255,255,0.1)",
    color: done ? "#060e08" : active ? "#1aff7a" : "rgba(255,255,255,0.3)"
  }),
  stepLine: (done) => ({
    flex: 1,
    height: 1.5,
    borderRadius: 2,
    background: done
      ? "linear-gradient(90deg, #1aff7a, #00c850)"
      : "rgba(255,255,255,0.08)",
    transition: "background 0.4s ease"
  }),

  /* Input group */
  inputGroup: {
    marginBottom: "1rem"
  },
  inputLabel: {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 6,
    letterSpacing: "0.5px",
    textTransform: "uppercase"
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    color: "rgba(255,255,255,0.25)",
    fontSize: 14,
    pointerEvents: "none",
    zIndex: 1
  },
  input: {
    width: "100%",
    padding: "13px 14px 13px 40px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    color: "#e8f5e0",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.25s, background 0.25s, box-shadow 0.25s",
    boxSizing: "border-box"
  },
  select: {
    width: "100%",
    padding: "13px 14px 13px 40px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    color: "#e8f5e0",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    appearance: "none",
    cursor: "pointer",
    transition: "border-color 0.25s",
    boxSizing: "border-box"
  },

  /* Row */
  inputRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.75rem"
  },

  /* Buttons */
  btnPrimary: {
    width: "100%",
    padding: "14px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontSize: 14.5,
    fontWeight: 700,
    letterSpacing: "0.2px",
    fontFamily: "inherit",
    background: "linear-gradient(135deg, #1aff7a 0%, #00c850 100%)",
    color: "#060e08",
    marginTop: "0.5rem",
    transition: "opacity 0.2s, transform 0.15s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  btnSecondary: {
    padding: "13px 20px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.1)",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "inherit",
    background: "transparent",
    color: "rgba(255,255,255,0.5)",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: 6
  },
  btnRow: {
    display: "flex",
    gap: "0.75rem",
    marginTop: "0.5rem"
  },

  /* Alert */
  alert: (type) => ({
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 13,
    marginBottom: "0.75rem",
    display: "flex",
    alignItems: "center",
    gap: 8,
    background:
      type === "error"
        ? "rgba(255,70,70,0.1)"
        : "rgba(26,255,122,0.08)",
    border:
      type === "error"
        ? "1px solid rgba(255,70,70,0.25)"
        : "1px solid rgba(26,255,122,0.2)",
    color: type === "error" ? "#ff6b6b" : "#1aff7a"
  }),

  /* Divider */
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    margin: "1rem 0"
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "rgba(255,255,255,0.07)"
  },
  dividerText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.25)",
    letterSpacing: "1px"
  },

  /* Extras */
  forgotLink: {
    fontSize: 12,
    color: "rgba(26,255,122,0.7)",
    textDecoration: "none",
    cursor: "pointer"
  },
  rememberRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem"
  },
  rememberLabel: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    cursor: "pointer"
  },

  /* RIGHT — visual panel */
  visualPanel: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: "3rem",
     height: "100vh",   // ← adicione isso
    width: "100%" 
  },

  visualOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(135deg, rgba(6,14,8,0.75) 0%, rgba(6,14,8,0.3) 50%, rgba(6,14,8,0.8) 100%)",
    zIndex: 1
  },

  visualContent: {
    position: "relative",
    zIndex: 2
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 12px",
    borderRadius: 30,
    background: "rgba(26,255,122,0.12)",
    border: "1px solid rgba(26,255,122,0.3)",
    color: "#1aff7a",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "1px",
    textTransform: "uppercase",
    marginBottom: "1rem"
  },

  visualHeading: {
    fontSize: "clamp(28px, 3vw, 40px)",
    fontWeight: 800,
    color: "#fff",
    lineHeight: 1.15,
    marginBottom: "1rem",
    letterSpacing: "-0.5px"
  },

  visualSub: {
    fontSize: 15,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 1.65,
    maxWidth: 420,
    marginBottom: "2rem"
  },

  statRow: {
    display: "flex",
    gap: "1.5rem"
  },

  stat: {
    display: "flex",
    flexDirection: "column",
    gap: 2
  },

  statNum: {
    fontSize: 22,
    fontWeight: 800,
    color: "#1aff7a"
  },

  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: "0.5px"
  },

  /* Spinner */
  spinner: {
    width: 16,
    height: 16,
    border: "2px solid rgba(0,0,0,0.2)",
    borderTop: "2px solid #060e08",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite"
  }
}

/* ─── ANIMATION VARIANTS ──────────────────────────────────────────────────── */
const fadeSlide = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
}

const stagger = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } }
}

const item = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
}

const imageTransition = {
  initial: { opacity: 0, scale: 1.06 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.55, ease: "easeIn" } }
}

/* ─── IMAGES (Unsplash — change to your CDN paths as needed) ─────────────── */
const IMAGES = {
  login:
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80", // drone over fields
  register:
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80"  // lush green crops
}

/* ─── UTILITY HOOKS ───────────────────────────────────────────────────────── */
function useFocusStyle() {
  return {
    onFocus: (e) => {
      e.target.style.borderColor = "rgba(26,255,122,0.5)"
      e.target.style.background = "rgba(26,255,122,0.05)"
      e.target.style.boxShadow = "0 0 0 3px rgba(26,255,122,0.08)"
    },
    onBlur: (e) => {
      e.target.style.borderColor = "rgba(255,255,255,0.08)"
      e.target.style.background = "rgba(255,255,255,0.04)"
      e.target.style.boxShadow = "none"
    }
  }
}

function formatDocument(value, type) {
  const n = value.replace(/\D/g, "")
  if (type === "CPF")
    return n.slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  return n.slice(0, 14).replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2")
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

/* ─── SMART INPUT ─────────────────────────────────────────────────────────── */
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
function LoginForm({ onSuccess, setAppLoading }) {
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
      setAlert({ type: "error", text: "Preencha todos os campos para entrar! 🌾" })
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
        "auth/user-not-found": "Usuário não encontrado. Crie sua conta primeiro! 🌱",
        "auth/wrong-password": "Senha incorreta. Tente novamente. 🔒",
        "auth/invalid-email": "Email inválido. 📧",
        "auth/too-many-requests": "Muitas tentativas. Aguarde um momento. ⏳",
        "auth/invalid-credential": "Credenciais inválidas. Verifique e tente novamente."
      }
      setAlert({ type: "error", text: msgs[err.code] || "Erro ao fazer login. Tente novamente." })
    } finally {
      setLoading(false)
    }
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
            position: "absolute", right: 14, background: "none",
            border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)",
            fontSize: 15, display: "flex", padding: 0
          }}
        >
          {showPwd ? <FaEye /> : <FaEyeSlash />}
        </button>
      </Field>

      <motion.div variants={item} style={S.rememberRow}>
        <label style={S.rememberLabel}>
          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
            style={{ accentColor: "#1aff7a" }} />
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
          whileHover={{ opacity: 0.92, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? <><Spinner /> Entrando...</> : <>Entrar na plataforma <FaChevronRight size={12} /></>}
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
      setTimeout(() => { setStep(2); setAlert({ type: "", text: "" }) }, 1400)
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
    <motion.div key="register" initial="initial" animate="animate" exit="exit">
      {/* Step indicator */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
        style={S.steps}
      >
        <div style={S.stepDot(step === 1, step > 1)}>
          {step > 1 ? <FaCheckCircle size={11} /> : "1"}
        </div>
        <div style={S.stepLine(step > 1)} />
        <div style={S.stepDot(step === 2, false)}>2</div>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div key="s1" variants={stagger} initial="initial" animate="animate" exit={{ opacity: 0, x: -30, transition: { duration: 0.25 } }}>
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
                <motion.div key={alert.text} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={S.alert(alert.type)}>
                  {alert.type === "success" ? <FaCheckCircle /> : "⚠️"} {alert.text}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={item}>
              <motion.button style={S.btnPrimary} onClick={handleStep1} disabled={loading}
                whileHover={{ opacity: 0.92, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                {loading ? <><Spinner /> Criando conta...</> : <>Próximo passo <FaChevronRight size={12} /></>}
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div key="s2" variants={stagger} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22,1,0.36,1] } }} exit={{ opacity: 0, x: -30, transition: { duration: 0.25 } }}>
            <motion.h1 variants={item} style={S.heading}>Sua fazenda</motion.h1>
            <motion.p variants={item} style={S.subheading}>
              Dados da propriedade rural — etapa 2 de 2
            </motion.p>

            <Field label="Nome da Fazenda" icon={FaLeaf}>
              <input style={S.input} name="name" placeholder="Ex: Fazenda Esperança"
                value={farm.name} onChange={fc} {...focus} />
            </Field>

            <motion.div variants={item} style={S.inputRow}>
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
            </motion.div>

            <motion.div variants={item} style={S.inputRow}>
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
            </motion.div>

            <motion.div variants={item} style={S.inputRow}>
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
            </motion.div>

            <motion.div variants={item} style={S.inputRow}>
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
            </motion.div>

            <Field label="Principal Plantação" icon={FaSeedling}>
              <select style={S.select} name="plantacao" value={farm.plantacao} onChange={fc} {...focus}>
                <option value="">Selecione a cultura</option>
                {["Soja","Tomate","Café","Milho","Feijão"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>

            <AnimatePresence mode="wait">
              {alert.text && (
                <motion.div key={alert.text} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={S.alert(alert.type)}>
                  {alert.type === "success" ? <FaCheckCircle /> : "⚠️"} {alert.text}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={item} style={S.btnRow}>
              <motion.button style={S.btnSecondary} onClick={() => setStep(1)}
                whileHover={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)" }}
                whileTap={{ scale: 0.97 }}>
                ← Voltar
              </motion.button>
              <motion.button style={{ ...S.btnPrimary, flex: 1, marginTop: 0 }}
                onClick={handleStep2} disabled={loading}
                whileHover={{ opacity: 0.92, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                {loading ? <><Spinner /> Cadastrando...</> : <>Finalizar cadastro 🌾</>}
              </motion.button>
            </motion.div>
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
      badge: "🌱 Bem-vindo ao agro digital",
      headline: "Transforme sua propriedade com inteligência agrícola",
      sub: "Junte-se a milhares de agricultores que já utilizam tecnologia de precisão para maximizar resultados, reduzir perdas e gerenciar safras com excelência.",
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

      {/* Decorative grid lines */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        backgroundImage: `
          linear-gradient(rgba(26,255,122,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(26,255,122,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px"
      }} />

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode + "content"}
          style={S.visualContent}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2, ease: [0.22,1,0.36,1] } }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
        >
          <div style={S.badge}>
            <span>{c.badge}</span>
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
  const [mode, setMode] = useState("login") // "login" | "register"

  return (
    <>
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(26,255,122,0.2);border-radius:4px}
        input::placeholder,select option{color:rgba(255,255,255,0.2)}
        select option{background:#091209;color:#e8f5e0}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.4)}
        @media(max-width:860px){
          .auth-visual{display:none!important}
          .auth-form-panel{width:100%!important;min-width:unset!important;padding:2rem 1.5rem!important}
        }
      `}</style>

      <div style={S.page}>
        {/* LEFT */}
        <div className="auth-form-panel" style={S.formPanel}>
          <div style={S.formPanelInner}>

            {/* Logo */}
            <motion.div
              style={S.logo}
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
            >
              <div><img style={S.logoIcon} src="assets/image/Logo-redonda.png" alt="" /></div>
              <span style={S.logoText}>Agricultura inteligente</span>
            </motion.div>

            {/* Tab switcher */}
            <motion.div
              style={S.tabs}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.45, delay: 0.1 } }}
            >
              {[["login","Entrar"],["register","Cadastrar"]].map(([id, label]) => (
                <button
                  key={id}
                  style={S.tab(mode === id)}
                  onClick={() => { setMode(id) }}
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

            {/* Divider + switch CTA */}
            <motion.div
              style={S.divider}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.6 } }}
            >
              <div style={S.dividerLine} />
              <span style={S.dividerText}>
                {mode === "login" ? "NÃO TEM CONTA?" : "JÁ TEM CONTA?"}
              </span>
              <div style={S.dividerLine} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.65 } }}
              style={{ textAlign: "center" }}
            >
              <button
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "rgba(26,255,122,0.75)", fontSize: 13.5, fontWeight: 600,
                  fontFamily: "inherit", letterSpacing: "0.2px",
                  transition: "color 0.2s"
                }}
                onMouseEnter={e => e.target.style.color = "#1aff7a"}
                onMouseLeave={e => e.target.style.color = "rgba(26,255,122,0.75)"}
              >
                {mode === "login" ? "Criar conta gratuita →" : "← Entrar na minha conta"}
              </button>
            </motion.div>

          </div>
        </div>

        {/* RIGHT — visual */}
        <div className="auth-visual" style={{ flex: 1, position: "relative", height: 800 }}>
          <SidePanel mode={mode} />
        </div>
      </div>
    </>
  )
}