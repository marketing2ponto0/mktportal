import { useState, useEffect } from "react";
import Banner from "../components/Banner.jsx";

const CITIES = ["Franco da Rocha","Caieiras","Francisco Morato","Mairiporã","Cajamar","São Paulo"];
const CATS = ["Todos","Política","Segurança","Saúde","Obras","Entretenimento","Eventos","Legislação"];

export default function Home({ onArticle }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("Franco da Rocha");
  const [cat, setCat] = useState("Todos");
  const [search, setSearch] = useState("");

  useEffect(() => { fetchNews(city); }, [city]);

  async function fetchNews(c) {
    setLoading(true);
    try {
      const res = await fetch(`/api/news?city=${encodeURIComponent(c)}`);
      const d = await res.json();
      setNews(d.news || []);
    } catch { setNews([]); }
    finally { setLoading(false); }
  }

  const filtered = news.filter(n => {
    const matchCat = cat === "Todos" || n.category === cat;
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const half = Math.floor(filtered.length / 2);

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "system-ui,sans-serif" }}>
      {/* Header */}
      <header style={{ background: "#080808", padding: "12px 16px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ color: "#C8A96E", fontWeight: 900, fontSize: 18, margin: 0, letterSpacing: 1 }}>📰 PORTAL 2.0</h1>
            <p style={{ color: "#666", fontSize: 10, margin: 0 }}>portal2ponto0.com.br</p>
          </div>
          <a href="#/admin" style={{ color: "#444", fontSize: 10, textDecoration: "none" }}>Admin</a>
        </div>
      </header>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 12px" }}>

        {/* Banner Topo */}
        <Banner position="top" style={{ marginTop: 12, marginBottom: 4 }} />

        {/* Filtros cidade */}
        <div style={{ overflowX: "auto", display: "flex", gap: 6, padding: "10px 0", scrollbarWidth: "none" }}>
          {CITIES.map(c => (
            <button key={c} onClick={() => setCity(c)}
              style={{ whiteSpace: "nowrap", background: city===c ? "#A01313" : "#fff", color: city===c ? "#fff" : "#333", border: `1px solid ${city===c?"#A01313":"#ddd"}`, borderRadius: 20, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontWeight: city===c?700:400 }}>
              {c}
            </button>
          ))}
        </div>

        {/* Busca */}
        <div style={{ marginBottom: 8 }}>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="🔍 Buscar notícias..."
            style={{ width: "100%", padding: "9px 12px", border: "1px solid #ddd", borderRadius: 10, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>

        {/* Filtro categoria */}
        <div style={{ overflowX: "auto", display: "flex", gap: 5, paddingBottom: 10, scrollbarWidth: "none" }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              style={{ whiteSpace: "nowrap", background: cat===c?"#A01313":"#fff", color: cat===c?"#fff":"#666", border: `1px solid ${cat===c?"#A01313":"#eee"}`, borderRadius: 20, padding: "4px 10px", fontSize: 10, cursor: "pointer" }}>
              {c}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ width: 32, height: 32, border: "3px solid #eee", borderTop: "3px solid #A01313", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 8px" }} />
            <p style={{ color: "#999", fontSize: 13 }}>Buscando notícias...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* News list com banner no meio */}
        {!loading && filtered.length > 0 && (
          <>
            {filtered.slice(0, half).map(n => <NewsCard key={n.id} n={n} onClick={() => onArticle(n)} />)}
            <Banner position="middle" style={{ margin: "10px 0" }} />
            {filtered.slice(half).map(n => <NewsCard key={n.id} n={n} onClick={() => onArticle(n)} />)}
          </>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 40 }}>
            <p style={{ fontSize: 32 }}>📭</p>
            <p style={{ color: "#999" }}>Nenhuma notícia encontrada</p>
          </div>
        )}

        {/* Google AdSense Banner Rodapé */}
        <div style={{ margin: "16px 0", background: "#f0f0f0", borderRadius: 8, padding: 16, textAlign: "center", minHeight: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "#aaa", fontSize: 11 }}>Google AdSense — Em breve</p>
          {/* Adicionar código do AdSense aqui quando aprovado */}
        </div>

        <footer style={{ textAlign: "center", padding: "16px 0", borderTop: "1px solid #eee", marginTop: 8 }}>
          <p style={{ fontSize: 11, color: "#aaa" }}>© Portal 2.0 — Marketing 2.0 Agency</p>
        </footer>
      </div>
    </div>
  );
}

function NewsCard({ n, onClick }) {
  const catColors = {
    "Política":"#1e40af","Segurança":"#dc2626","Saúde":"#16a34a",
    "Obras":"#d97706","Entretenimento":"#7c3aed","Eventos":"#db2777",
    "Legislação":"#0891b2","Notícia":"#374151"
  };
  const color = catColors[n.category] || "#374151";

  return (
    <div onClick={onClick} style={{ background: "#fff", borderRadius: 12, marginBottom: 10, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", cursor: "pointer", border: "1px solid #f0f0f0" }}>
      {n.image && <img src={n.image} alt="" style={{ width: "100%", height: 160, objectFit: "cover" }} onError={e=>e.target.style.display="none"} />}
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <span style={{ background: color, color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 6, padding: "2px 7px" }}>{n.category}</span>
          <span style={{ fontSize: 10, color: "#aaa" }}>🕐 {n.time}</span>
          <span style={{ fontSize: 10, color: "#aaa" }}>· {n.source}</span>
        </div>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: "0 0 6px", lineHeight: 1.4 }}>{n.title}</h2>
        <p style={{ fontSize: 12, color: "#666", margin: 0, lineHeight: 1.5 }}>{(n.summary||"").substring(0,120)}{n.summary?.length>120?"...":""}</p>
      </div>
    </div>
  );
}
