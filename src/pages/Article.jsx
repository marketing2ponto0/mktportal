import Banner from "../components/Banner.jsx";

export default function Article({ article, onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "system-ui,sans-serif" }}>
      <header style={{ background: "#080808", padding: "12px 16px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#C8A96E", fontSize: 20, cursor: "pointer", padding: 0 }}>←</button>
          <h1 style={{ color: "#C8A96E", fontWeight: 900, fontSize: 18, margin: 0 }}>📰 PORTAL 2.0</h1>
        </div>
      </header>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "12px" }}>
        <Banner position="top" style={{ marginBottom: 12 }} />

        {article.image && (
          <img src={article.image} alt="" style={{ width: "100%", borderRadius: 12, marginBottom: 12, objectFit: "cover", maxHeight: 260 }} onError={e=>e.target.style.display="none"} />
        )}

        <div style={{ background: "#fff", borderRadius: 12, padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: 12 }}>
          {article.category && (
            <span style={{ background: "#A01313", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "2px 8px", marginBottom: 10, display: "inline-block" }}>
              {article.category}
            </span>
          )}
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#111", margin: "8px 0 12px", lineHeight: 1.3 }}>{article.title}</h1>
          <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "#888" }}>🕐 {article.time}</span>
            <span style={{ fontSize: 11, color: "#888" }}>· {article.source}</span>
            {article.location && <span style={{ fontSize: 11, color: "#888" }}>📍 {article.location}</span>}
          </div>
          <p style={{ fontSize: 14, color: "#333", lineHeight: 1.7, marginBottom: 16 }}>{article.summary}</p>

          <Banner position="middle" style={{ margin: "16px 0" }} />

          <a href={article.url} target="_blank" rel="noopener noreferrer"
            style={{ display: "block", background: "#A01313", color: "#fff", textAlign: "center", padding: "12px", borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: "none", marginTop: 8 }}>
            📰 Ler matéria completa →
          </a>
        </div>

        {/* Google AdSense */}
        <div style={{ background: "#f0f0f0", borderRadius: 8, padding: 16, textAlign: "center", minHeight: 90, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <p style={{ color: "#aaa", fontSize: 11 }}>Google AdSense — Em breve</p>
        </div>

        <button onClick={onBack} style={{ width: "100%", background: "#fff", border: "1px solid #ddd", borderRadius: 10, padding: 12, color: "#333", fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 16 }}>
          ← Voltar às notícias
        </button>
      </div>
    </div>
  );
}
