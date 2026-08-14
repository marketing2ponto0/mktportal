import { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import Banner from "../components/Banner.jsx";
import { SUPABASE_URL, SUPABASE_ANON } from "../App.jsx";

export default function Article({ slug, onBack, go }) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (!slug) return;
    loadArticle();
  }, [slug]);

  async function loadArticle() {
    setLoading(true);
    try {
      // Try by slug first, then by id
      let r = await fetch(`${SUPABASE_URL}/rest/v1/articles?slug=eq.${encodeURIComponent(slug)}&limit=1`, {
        headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` }
      });
      let d = await r.json();
      if (!Array.isArray(d) || !d.length) {
        r = await fetch(`${SUPABASE_URL}/rest/v1/articles?id=eq.${encodeURIComponent(slug)}&limit=1`, {
          headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` }
        });
        d = await r.json();
      }
      if (Array.isArray(d) && d.length) {
        setArticle(d[0]);
        loadRelated(d[0].category, d[0].id);
      }
    } catch {}
    setLoading(false);
  }

  async function loadRelated(cat, id) {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/articles?category=eq.${cat}&id=neq.${id}&order=published_at.desc&limit=4`, {
        headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` }
      });
      const d = await r.json();
      setRelated(Array.isArray(d) ? d : []);
    } catch {}
  }

  const CAT_COLORS = {
    "Política":"#1e40af","Segurança":"#dc2626","Saúde":"#16a34a",
    "Obras":"#d97706","Entretenimento":"#7c3aed","Eventos":"#db2777",
    "Legislação":"#0891b2","Notícia":"#374151"
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#f4f4f4", fontFamily:"system-ui,sans-serif" }}>
      <Header go={go} />
      <div style={{ textAlign:"center", padding:60 }}>
        <div style={{ width:32, height:32, border:"3px solid #eee", borderTop:"3px solid #A01313", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (!article) return (
    <div style={{ minHeight:"100vh", background:"#f4f4f4" }}>
      <Header go={go} />
      <div style={{ textAlign:"center", padding:60 }}>
        <p style={{ fontSize:40 }}>📭</p>
        <p style={{ color:"#999" }}>Artigo não encontrado</p>
        <button onClick={onBack} style={{ background:"#A01313", color:"#fff", border:"none", borderRadius:8, padding:"10px 20px", cursor:"pointer", marginTop:12 }}>← Voltar</button>
      </div>
    </div>
  );

  const paragraphs = (article.content || article.summary || "").split("\n").filter(p => p.trim());

  return (
    <div style={{ minHeight:"100vh", background:"#f4f4f4", fontFamily:"'Georgia',serif" }}>
      <Header go={go} />
      <div style={{ maxWidth:900, margin:"0 auto", padding:"0 12px" }}>
        <Banner position="top" />

        <article style={{ background:"#fff", borderRadius:10, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.08)", marginBottom:12 }}>
          {article.image_url && (
            <img src={article.image_url} alt={article.title} style={{ width:"100%", maxHeight:320, objectFit:"cover", display:"block" }} onError={e=>e.target.style.display="none"} />
          )}
          <div style={{ padding:"16px 14px" }}>
            <span style={{ background: CAT_COLORS[article.category]||"#374151", color:"#fff", fontSize:9, fontWeight:700, borderRadius:4, padding:"2px 8px", textTransform:"uppercase", fontFamily:"system-ui" }}>{article.category}</span>
            {article.city && <span style={{ fontSize:10, color:"#888", marginLeft:8, fontFamily:"system-ui" }}>📍 {article.city}</span>}

            <h1 style={{ fontSize:20, fontWeight:700, color:"#111", margin:"10px 0 8px", lineHeight:1.3 }}>{article.title}</h1>

            <p style={{ fontSize:11, color:"#aaa", marginBottom:16, fontFamily:"system-ui" }}>
              {new Date(article.published_at).toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})}
            </p>

            {article.summary && (
              <p style={{ fontSize:15, color:"#444", fontWeight:400, lineHeight:1.7, marginBottom:16, borderLeft:"3px solid #A01313", paddingLeft:12, fontStyle:"italic" }}>
                {article.summary}
              </p>
            )}

            <Banner position="middle" />

            <div style={{ fontSize:14, color:"#222", lineHeight:1.8 }}>
              {paragraphs.map((p, i) => (
                <p key={i} style={{ marginBottom:14 }}>{p}</p>
              ))}
            </div>

            <div style={{ borderTop:"1px solid #f0f0f0", paddingTop:12, marginTop:16, fontFamily:"system-ui" }}>
              <p style={{ fontSize:11, color:"#aaa", textAlign:"center" }}>portal2ponto0.com.br</p>
            </div>
          </div>
        </article>

        {/* Google AdSense */}
        <div style={{ background:"#e8e8e8", borderRadius:8, minHeight:90, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
          <p style={{ color:"#aaa", fontSize:11, fontFamily:"system-ui" }}>Google AdSense</p>
        </div>

        {/* Relacionadas */}
        {related.length > 0 && (
          <div style={{ marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <span style={{ width:4, height:16, background:"#A01313", borderRadius:2, display:"inline-block" }} />
              <h3 style={{ fontSize:12, fontWeight:700, color:"#333", margin:0, textTransform:"uppercase", letterSpacing:1, fontFamily:"system-ui" }}>Veja também</h3>
            </div>
            {related.map(a => (
              <div key={a.id} onClick={() => go(`#/artigo/${encodeURIComponent(a.slug||a.id)}`)}
                style={{ background:"#fff", borderRadius:8, marginBottom:8, padding:10, cursor:"pointer", display:"flex", gap:10, boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
                {a.image_url && <img src={a.image_url} alt="" style={{ width:70, height:50, objectFit:"cover", borderRadius:6, flexShrink:0 }} onError={e=>e.target.style.display="none"} />}
                <h4 style={{ fontSize:12, fontWeight:600, color:"#111", margin:0, lineHeight:1.35 }}>{a.title}</h4>
              </div>
            ))}
          </div>
        )}

        <button onClick={onBack} style={{ width:"100%", background:"#fff", border:"1px solid #ddd", borderRadius:8, padding:12, color:"#333", fontWeight:600, fontSize:13, cursor:"pointer", marginBottom:16, fontFamily:"system-ui" }}>
          ← Voltar às notícias
        </button>
      </div>
    </div>
  );
}
