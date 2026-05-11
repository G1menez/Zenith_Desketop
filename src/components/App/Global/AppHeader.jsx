import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../../../styles/Global/AppHeader.css";

const navItems = [
  { label: "Início", href: "/home" },
  { label: "Serviços", href: "/explore" },
  { label: "Puta que pariu", href: "/profile" }
];

export default function Header() {
  const [active, setActive] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`header ${scrolled ? "scrolled" : ""}`}
      >
        <div className="container">

          {/* LOGO */}
          <motion.div
            className="logo"
            whileHover={{ scale: 1.05 }}
          >
            <span className="logo-text">
              ZENI<span className="accent">TH</span>
            </span>
            <div className="logo-glow" />
          </motion.div>

          {/* NAV */}
          <nav className="nav">
            {navItems.map((item, index) => (
              <div
                key={index}
                className="nav-item"
                onMouseEnter={() => setActive(index)}
              >
                <a href={item.href}>{item.label}</a>

                {active === index && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="nav-indicator"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30
                    }}
                  />
                )}
              </div>
            ))}
          </nav>

          {/* RIGHT */}
          <div className="right">

            <motion.a
              href="#contact"
              className="cta"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Começar</span>
              <div className="cta-bg" />
            </motion.a>

            <button
              className={`menu-toggle ${menuOpen ? "active" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span />
              <span />
            </button>

          </div>
        </div>
      </motion.header>

      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="mobile-panel"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {navItems.map((item, i) => (
                <motion.a
                  key={i}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  whileHover={{ scale: 1.05 }}
                >
                  {item.label}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}