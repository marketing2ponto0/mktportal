export default function Header({ go, active = "home" }) {
  return (
    <header style={{ background: "#080808", borderBottom: "3px solid #A01313", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 12px" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0 6px" }}>
          <div onClick={() => go("")} style={{ cursor: "pointer" }}>
            <h1 style={{ color: "#fff", fontWeight: 900, fontSize: 22, margin: 0, letterSpacing: -0.5 }}>
              <span style={{ color: "#A01313" }}>PORTAL</span> <span style={{ color: "#C8A96E" }}>2.0</span>
            </h1>
            <p style={{ color: "#555", fontSize: 9, margin: 0, letterSpacing: 2, textTransform: "uppercase" }}>portal2ponto0.com.br</p>
          </div>
          <span onClick={() => go("#/admin")} style={{ color: "#333", fontSize: 10, cursor: "pointer" }}>⚙️</span>
        </div>
        {/* Nav */}
        <nav style={{ display: "flex", gap: 0, borderTop: "1px solid #1a1a1a" }}>
          {[
            { label: "📰 Notícias", hash: "", key: "home" },
            { label: "🎭 Só Curtindo", hash: "#/so-curtindo", key: "scv" },
          ].map(n => (
            <button key={n.key} onClick={() => go(n.hash)}
              style={{ background: "none", border: "none", borderBottom: active === n.key ? "2px solid #A01313" : "2px solid transparent", color: active === n.key ? "#fff" : "#888", fontSize: 12, fontWeight: active === n.key ? 700 : 400, padding: "8px 14px", cursor: "pointer", transition: "all 0.2s" }}>
              {n.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
