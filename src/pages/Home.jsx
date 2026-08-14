import { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import Banner from "../components/Banner.jsx";
import { SUPABASE_URL, SUPABASE_ANON } from "../App.jsx";

const CITIES = ["Todas","Franco da Rocha","Caieiras","Francisco Morato","Mairiporã","Cajamar","Jundiaí","São Paulo"];
const CATS = ["Todas","Política","Segurança","Saúde","Obras","Entretenimento","Eventos","Legislação"];

export default function Home({ go }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("Todas");
  const [cat, setCat] = useState("Todas");
  const [search, setSearch] = useState("");

  useEffect(() => { loadArticles(); }, []);

  async function loadArticles() {
    setLoading(true);
    try {
      let url = `${SUPABASE_URL}/rest/v1/articles?section=eq.news&order=published_at.desc&limit=50`;
      const r = await fetch(url, { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } });
      const d = await r.json();
      setArticles(Array.isArray(d) ? d : []);
    } catch { setArticles([]); }
    setLoading(false);
  }

  const filtered = articles.filter(a => {
    const matchCity = city === "Todas" || a.city === city;
    const matchCat = cat === "Todas" || a.category === cat;
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase());
    return matchCity && matchCat && matchSearch;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);
  const firstHalf = rest.slice(0, Math.floor(rest.length / 2));
  const secondHalf = rest.slice(Math.floor(rest.length / 2));

  const CAT_COLORS = {
    "Política": "#1e40af", "Segurança": "#dc2626", "Saúde": "#16a34a",
    "Obras": "#d97706", "Entretenimento": "#7c3aed", "Eventos": "#db2777",
    "Legislação": "#0891b2", "Notícia": "#374151"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f4", fontFamily: "'Georgia', serif" }}>
      <Header go={go} active="home" />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 12px" }}>
        <Banner position="top" />

        {/* Filtros */}
        <div style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", marginBottom: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar notícias..."
            style={{ width: "100%", padding: "8px 0", border: "none", borderBottom: "1px solid #eee", fontSize: 13, outline: "none", fontFamily: "inherit", marginBottom: 10, boxSizing: "border-box" }} />
          <div style={{ overflowX: "auto", display: "flex", gap: 5, scrollbarWidth: "none" }}>
            {CITIES.map(c => (
              <button key={c} onClick={() => setCity(c)}
                style={{ whiteSpace: "nowrap", background: city===c ? "#A01313" : "none", color: city===c ? "#fff" : "#555", border: `1px solid ${city===c?"#A01313":"#ddd"}`, borderRadius: 20, padding: "3px 10px", fontSize: 10, cursor: "pointer", fontWeight: city===c?700:400 }}>
                {c}
              </button>
            ))}
          </div>
          <div style={{ overflowX: "auto", display: "flex", gap: 5, scrollbarWidth: "none", marginTop: 6 }}>
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)}
                style={{ whiteSpace: "nowrap", background: cat===c ? "#080808" : "none", color: cat===c ? "#fff" : "#555", border: `1px solid ${cat===c?"#080808":"#ddd"}`, borderRadius: 20, padding: "3px 10px", fontSize: 10, cursor: "pointer" }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Título seção */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ width: 4, height: 18, background: "#A01313", borderRadius: 2, display: "inline-block" }} />
          <h2 style={{ fontSize: 12, fontWeight: 700, color: "#333", margin: 0, textTransform: "uppercase", letterSpacing: 1, fontFamily: "system-ui" }}>Últimas Notícias</h2>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ width: 32, height: 32, border: "3px solid #eee", borderTop: "3px solid #A01313", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }} />
            <p style={{ color: "#999", fontSize: 13 }}>Carregando notícias...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, background: "#fff", borderRadius: 10 }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>📭</p>
            <p style={{ color: "#999", fontSize: 14 }}>Nenhuma notícia publicada ainda</p>
            <p style={{ color: "#bbb", fontSize: 12 }}>Publique pelo Agente de Notícias 2.0</p>
          </div>
        )}

        {/* Destaque principal */}
        {featured && (
          <div onClick={() => go(`#/artigo/${encodeURIComponent(featured.slug||featured.id)}`)}
            style={{ cursor: "pointer", marginBottom: 12, borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", position: "relative" }}>
            {featured.image_url
              ? <img src={featured.image_url} alt="" style={{ width: "100%", height: 240, objectFit: "cover", display: "block" }} onError={e=>e.target.style.display="none"} />
              : <div style={{ width: "100%", height: 180, background: "linear-gradient(135deg,#A01313,#080808)" }} />
            }
            <div style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.92))", padding: "40px 14px 14px", marginTop: -80, position: "relative" }}>
              <span style={{ background: CAT_COLORS[featured.category]||"#374151", color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 4, padding: "2px 8px", marginBottom: 6, display: "inline-block", textTransform: "uppercase" }}>{featured.category}</span>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: "4px 0 6px", lineHeight: 1.3, fontFamily: "system-ui" }}>{featured.title}</h2>
              <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>{new Date(featured.published_at).toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})}</p>
            </div>
          </div>
        )}

        {/* Lista primeira metade */}
        {firstHalf.map(a => <NewsCard key={a.id} a={a} go={go} catColors={CAT_COLORS} />)}

        <Banner position="middle" />

        {/* Lista segunda metade */}
        {secondHalf.map(a => <NewsCard key={a.id} a={a} go={go} catColors={CAT_COLORS} />)}

        {/* Google AdSense */}
        <div style={{ background: "#e8e8e8", borderRadius: 8, minHeight: 90, display: "flex", alignItems: "center", justifyContent: "center", margin: "12px 0" }}>
          <p style={{ color: "#aaa", fontSize: 11 }}>Espaço publicitário — Google AdSense</p>
        </div>

        <footer style={{ textAlign: "center", padding: "16px 0", borderTop: "1px solid #e0e0e0", marginTop: 8 }}>
          <p style={{ fontSize: 11, color: "#aaa", fontFamily: "system-ui" }}>© Portal 2.0 — Marketing 2.0 Agency</p>
        </footer>
      </div>
    </div>
  );
}

function NewsCard({ a, go, catColors }) {
  return (
    <div onClick={() => go(`#/artigo/${encodeURIComponent(a.slug||a.id)}`)}
      style={{ background: "#fff", borderRadius: 8, marginBottom: 8, overflow: "hidden", cursor: "pointer", display: "flex", gap: 10, padding: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", alignItems: "flex-start" }}>
      {a.image_url && (
        <img src={a.image_url} alt="" style={{ width: 90, height: 65, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} onError={e=>e.target.style.display="none"} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ background: catColors[a.category]||"#374151", color:"#fff", fontSize:8, fontWeight:700, borderRadius:4, padding:"1px 6px", textTransform:"uppercase" }}>{a.category}</span>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111", margin: "4px 0 4px", lineHeight: 1.35, fontFamily: "system-ui" }}>{a.title}</h3>
        <p style={{ fontSize: 10, color: "#aaa", margin: 0, fontFamily: "system-ui" }}>{new Date(a.published_at).toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})}</p>
      </div>
    </div>
  );
}
