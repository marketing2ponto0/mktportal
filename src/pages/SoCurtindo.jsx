import { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import Banner from "../components/Banner.jsx";
import { SUPABASE_URL, SUPABASE_ANON } from "../App.jsx";

const CATS_SCV = ["Todos","Eventos","Shows","Gastronomia","Cinema","Teatro","Festivais","Arte & Cultura","Esportes","Lazer"];

export default function SoCurtindo({ go }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("Todos");
  const [search, setSearch] = useState("");

  useEffect(() => { loadArticles(); }, []);

  async function loadArticles() {
    setLoading(true);
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/articles?section=eq.scv&order=published_at.desc&limit=50`, {
        headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` }
      });
      const d = await r.json();
      setArticles(Array.isArray(d) ? d : []);
    } catch { setArticles([]); }
    setLoading(false);
  }

  const filtered = articles.filter(a => {
    const matchCat = cat === "Todos" || a.category === cat;
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div style={{ minHeight:"100vh", background:"#f4f4f4", fontFamily:"'Georgia',serif" }}>
      <Header go={go} active="scv" />

      <div style={{ maxWidth:900, margin:"0 auto", padding:"0 12px" }}>
        <Banner position="top" />

        {/* Hero SCV */}
        <div style={{ background:"linear-gradient(135deg,#7c3aed,#db2777)", borderRadius:10, padding:"16px 14px", marginBottom:12, color:"#fff" }}>
          <h2 style={{ fontSize:20, fontWeight:900, margin:"0 0 4px", fontFamily:"system-ui" }}>🎭 Só Curtindo a Vida</h2>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.8)", margin:0, fontFamily:"system-ui" }}>Eventos, shows, gastronomia e lazer em São Paulo</p>
        </div>

        {/* Filtros */}
        <div style={{ background:"#fff", borderRadius:10, padding:"10px 12px", marginBottom:10, boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar eventos e lazer..."
            style={{ width:"100%", padding:"8px 0", border:"none", borderBottom:"1px solid #eee", fontSize:13, outline:"none", fontFamily:"inherit", marginBottom:8, boxSizing:"border-box" }} />
          <div style={{ overflowX:"auto", display:"flex", gap:5, scrollbarWidth:"none" }}>
            {CATS_SCV.map(c => (
              <button key={c} onClick={()=>setCat(c)}
                style={{ whiteSpace:"nowrap", background:cat===c?"#7c3aed":"none", color:cat===c?"#fff":"#555", border:`1px solid ${cat===c?"#7c3aed":"#ddd"}`, borderRadius:20, padding:"3px 10px", fontSize:10, cursor:"pointer" }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div style={{ textAlign:"center", padding:40 }}>
            <div style={{ width:32, height:32, border:"3px solid #eee", borderTop:"3px solid #7c3aed", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:40, background:"#fff", borderRadius:10 }}>
            <p style={{ fontSize:32 }}>🎭</p>
            <p style={{ color:"#999", fontSize:14 }}>Nenhum evento publicado ainda</p>
            <p style={{ color:"#bbb", fontSize:12 }}>Publique pelo Agente de Notícias 2.0</p>
          </div>
        )}

        {/* Destaque SCV */}
        {featured && (
          <div onClick={()=>go(`#/artigo/${encodeURIComponent(featured.slug||featured.id)}`)}
            style={{ cursor:"pointer", marginBottom:12, borderRadius:10, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.1)", position:"relative" }}>
            {featured.image_url
              ? <img src={featured.image_url} alt="" style={{ width:"100%", height:220, objectFit:"cover", display:"block" }} onError={e=>e.target.style.display="none"} />
              : <div style={{ width:"100%", height:180, background:"linear-gradient(135deg,#7c3aed,#db2777)" }} />
            }
            <div style={{ background:"linear-gradient(transparent,rgba(0,0,0,0.9))", padding:"40px 14px 14px", marginTop:-80, position:"relative" }}>
              <span style={{ background:"#7c3aed", color:"#fff", fontSize:9, fontWeight:700, borderRadius:4, padding:"2px 8px", marginBottom:6, display:"inline-block" }}>{featured.category}</span>
              <h2 style={{ fontSize:17, fontWeight:700, color:"#fff", margin:"4px 0 6px", lineHeight:1.3, fontFamily:"system-ui" }}>{featured.title}</h2>
              {featured.city && <p style={{ fontSize:10, color:"#ddd", margin:0, fontFamily:"system-ui" }}>📍 {featured.city}</p>}
            </div>
          </div>
        )}

        {/* Lista */}
        {rest.slice(0, Math.floor(rest.length/2)).map(a => <SCVCard key={a.id} a={a} go={go} />)}
        <Banner position="middle" />
        {rest.slice(Math.floor(rest.length/2)).map(a => <SCVCard key={a.id} a={a} go={go} />)}

        <div style={{ background:"#e8e8e8", borderRadius:8, minHeight:90, display:"flex", alignItems:"center", justifyContent:"center", margin:"12px 0" }}>
          <p style={{ color:"#aaa", fontSize:11, fontFamily:"system-ui" }}>Google AdSense</p>
        </div>

        <footer style={{ textAlign:"center", padding:"16px 0", borderTop:"1px solid #e0e0e0" }}>
          <p style={{ fontSize:11, color:"#aaa", fontFamily:"system-ui" }}>© Portal 2.0 — Marketing 2.0 Agency</p>
        </footer>
      </div>
    </div>
  );
}

function SCVCard({ a, go }) {
  return (
    <div onClick={()=>go(`#/artigo/${encodeURIComponent(a.slug||a.id)}`)}
      style={{ background:"#fff", borderRadius:8, marginBottom:8, overflow:"hidden", cursor:"pointer", display:"flex", gap:10, padding:10, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", alignItems:"flex-start" }}>
      {a.image_url && <img src={a.image_url} alt="" style={{ width:90, height:65, objectFit:"cover", borderRadius:6, flexShrink:0 }} onError={e=>e.target.style.display="none"} />}
      <div style={{ flex:1, minWidth:0 }}>
        <span style={{ background:"#7c3aed", color:"#fff", fontSize:8, fontWeight:700, borderRadius:4, padding:"1px 6px", textTransform:"uppercase", fontFamily:"system-ui" }}>{a.category}</span>
        <h3 style={{ fontSize:13, fontWeight:700, color:"#111", margin:"4px 0 4px", lineHeight:1.35, fontFamily:"system-ui" }}>{a.title}</h3>
        {a.city && <p style={{ fontSize:10, color:"#aaa", margin:0, fontFamily:"system-ui" }}>📍 {a.city}</p>}
      </div>
    </div>
  );
}
