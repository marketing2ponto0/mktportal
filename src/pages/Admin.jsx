import { useState, useEffect, useRef } from "react";

const SUPABASE_URL = "https://yuqidbvfilomxkwaaerl.supabase.co";
const SUPABASE_ANON = "sb_publishable_t3Qiwi-26sBX-0mbtdjXCA__h26yp3p";

function supaHeaders(service = false) {
  const key = service ? (import.meta.env.VITE_SUPABASE_SERVICE_KEY || SUPABASE_ANON) : SUPABASE_ANON;
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation" };
}

export default function Admin({ onBack }) {
  const [auth, setAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:"", image_url:"", whatsapp_number:"", whatsapp_text:"Olá, vim do Portal 2.0", position:"top", active:true, order_num:0 });
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef();

  const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD || "Portal@2ponto0";

  const login = () => {
    if (password === ADMIN_PASS) { setAuth(true); loadBanners(); }
    else alert("Senha incorreta!");
  };

  async function loadBanners() {
    setLoading(true);
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/banners?order=position.asc,order_num.asc`, { headers: supaHeaders() });
      const d = await r.json();
      setBanners(Array.isArray(d) ? d : []);
    } catch(e) { console.error("Load error:", e); }
    setLoading(false);
  }

  async function uploadImage(file) {
    setUploading(true);
    setUploadError("");
    try {
      const ext = file.name.split(".").pop().toLowerCase();
      const path = `banner_${Date.now()}.${ext}`;
      const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || SUPABASE_ANON;

      const r = await fetch(`${SUPABASE_URL}/storage/v1/object/banners/${path}`, {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": file.type,
          "x-upsert": "true"
        },
        body: file
      });

      const result = await r.json();

      if (r.ok || result.Key || result.path || result.fullPath) {
        const url = `${SUPABASE_URL}/storage/v1/object/public/banners/${path}`;
        setForm(f => ({ ...f, image_url: url }));
        setUploadError("");
      } else {
        console.error("Upload error:", result);
        setUploadError(`Erro: ${result.message || result.error || JSON.stringify(result)}`);
      }
    } catch(e) {
      console.error("Upload exception:", e);
      setUploadError(`Erro de conexão: ${e.message}`);
    }
    setUploading(false);
  }

  async function saveBanner() {
    if (!form.name || !form.image_url || !form.whatsapp_number) {
      alert("Preencha nome, imagem e WhatsApp!"); return;
    }
    const waNum = form.whatsapp_number.replace(/\D/g,"");
    const payload = { ...form, whatsapp_number: waNum };
    try {
      if (editing) {
        await fetch(`${SUPABASE_URL}/rest/v1/banners?id=eq.${editing}`, {
          method: "PATCH", headers: supaHeaders(true), body: JSON.stringify(payload)
        });
      } else {
        await fetch(`${SUPABASE_URL}/rest/v1/banners`, {
          method: "POST", headers: supaHeaders(true), body: JSON.stringify(payload)
        });
      }
      setForm({ name:"", image_url:"", whatsapp_number:"", whatsapp_text:"Olá, vim do Portal 2.0", position:"top", active:true, order_num:0 });
      setEditing(null);
      loadBanners();
    } catch(e) { alert("Erro ao salvar: " + e.message); }
  }

  async function deleteBanner(id) {
    if (!confirm("Deletar banner?")) return;
    await fetch(`${SUPABASE_URL}/rest/v1/banners?id=eq.${id}`, { method: "DELETE", headers: supaHeaders(true) });
    loadBanners();
  }

  async function toggleActive(b) {
    await fetch(`${SUPABASE_URL}/rest/v1/banners?id=eq.${b.id}`, {
      method: "PATCH", headers: supaHeaders(true), body: JSON.stringify({ active: !b.active })
    });
    loadBanners();
  }

  function editBanner(b) {
    setEditing(b.id);
    setForm({ name:b.name, image_url:b.image_url, whatsapp_number:b.whatsapp_number, whatsapp_text:b.whatsapp_text, position:b.position, active:b.active, order_num:b.order_num });
    window.scrollTo(0,0);
  }

  const S = {
    input: { width:"100%", padding:"10px 12px", border:"1px solid #ddd", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", marginBottom:8 },
    label: { fontSize:11, color:"#666", fontWeight:600, display:"block", marginBottom:3 },
    btn: (c="#A01313") => ({ background:c, color:"#fff", border:"none", borderRadius:8, padding:"10px 16px", fontSize:13, fontWeight:700, cursor:"pointer", width:"100%" }),
  };

  if (!auth) return (
    <div style={{ minHeight:"100vh", background:"#080808", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#111", borderRadius:16, padding:24, width:"100%", maxWidth:320 }}>
        <h2 style={{ color:"#C8A96E", fontWeight:900, textAlign:"center", marginBottom:20 }}>🔐 Admin Portal 2.0</h2>
        <input type="password" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&login()}
          style={{ ...S.input, background:"#1a1a1a", border:"1px solid #333", color:"#fff", marginBottom:12 }} />
        <button onClick={login} style={S.btn()}>Entrar</button>
        <button onClick={onBack} style={{ ...S.btn("#333"), marginTop:8 }}>← Portal</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#f8f9fa", fontFamily:"system-ui,sans-serif" }}>
      <header style={{ background:"#080808", padding:"12px 16px" }}>
        <div style={{ maxWidth:700, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <h1 style={{ color:"#C8A96E", fontWeight:900, fontSize:16, margin:0 }}>🔧 Admin — Banners</h1>
          <button onClick={onBack} style={{ background:"none", border:"1px solid #444", color:"#aaa", borderRadius:8, padding:"5px 12px", fontSize:11, cursor:"pointer" }}>← Portal</button>
        </div>
      </header>

      <div style={{ maxWidth:700, margin:"0 auto", padding:16 }}>
        <div style={{ background:"#fff", borderRadius:12, padding:16, boxShadow:"0 1px 4px rgba(0,0,0,0.08)", marginBottom:20 }}>
          <h3 style={{ fontSize:14, fontWeight:700, marginBottom:14, color:"#111" }}>{editing?"✏️ Editar Banner":"➕ Novo Banner"}</h3>

          <label style={S.label}>Nome do anunciante</label>
          <input style={S.input} placeholder="Ex: CDL Franco da Rocha" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />

          <label style={S.label}>Imagem do banner</label>
          <div style={{ display:"flex", gap:8, marginBottom:4 }}>
            <input style={{ ...S.input, margin:0, flex:1 }} placeholder="URL da imagem ou faça upload" value={form.image_url} onChange={e=>setForm(f=>({...f,image_url:e.target.value}))} />
            <button onClick={()=>fileRef.current.click()} disabled={uploading}
              style={{ background: uploading?"#eee":"#f0f0f0", border:"1px solid #ddd", borderRadius:8, padding:"0 12px", cursor:"pointer", whiteSpace:"nowrap", fontSize:12 }}>
              {uploading?"⏳ Enviando...":"📁 Upload"}
            </button>
          </div>
          {uploadError && <p style={{ fontSize:11, color:"#dc2626", marginBottom:8 }}>{uploadError}</p>}
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e=>e.target.files[0]&&uploadImage(e.target.files[0])} />
          {form.image_url && <img src={form.image_url} alt="" style={{ width:"100%", height:80, objectFit:"cover", borderRadius:6, marginBottom:8 }} onError={e=>e.target.style.display="none"} />}

          <label style={S.label}>WhatsApp (com DDD, ex: 11934503566)</label>
          <input style={S.input} placeholder="11934503566" value={form.whatsapp_number} onChange={e=>setForm(f=>({...f,whatsapp_number:e.target.value}))} />

          <label style={S.label}>Texto da mensagem WhatsApp</label>
          <input style={S.input} value={form.whatsapp_text} onChange={e=>setForm(f=>({...f,whatsapp_text:e.target.value}))} />

          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            <div style={{ flex:1 }}>
              <label style={S.label}>Posição</label>
              <select style={{ ...S.input, margin:0 }} value={form.position} onChange={e=>setForm(f=>({...f,position:e.target.value}))}>
                <option value="top">Topo</option>
                <option value="middle">Meio</option>
              </select>
            </div>
            <div style={{ flex:1 }}>
              <label style={S.label}>Ordem</label>
              <input type="number" style={{ ...S.input, margin:0 }} value={form.order_num} onChange={e=>setForm(f=>({...f,order_num:+e.target.value}))} />
            </div>
          </div>

          <div style={{ display:"flex", gap:8 }}>
            <button onClick={saveBanner} style={S.btn()}>{editing?"Salvar Alterações":"Adicionar Banner"}</button>
            {editing && <button onClick={()=>{setEditing(null);setForm({name:"",image_url:"",whatsapp_number:"",whatsapp_text:"Olá, vim do Portal 2.0",position:"top",active:true,order_num:0});}} style={S.btn("#666")}>Cancelar</button>}
          </div>
        </div>

        <h3 style={{ fontSize:14, fontWeight:700, color:"#111", marginBottom:10 }}>Banners cadastrados ({banners.length})</h3>
        {loading && <p style={{ color:"#999", textAlign:"center" }}>Carregando...</p>}
        {banners.map(b => (
          <div key={b.id} style={{ background:"#fff", borderRadius:10, padding:12, marginBottom:8, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", display:"flex", gap:10, alignItems:"center", opacity:b.active?1:0.5 }}>
            <img src={b.image_url} alt="" style={{ width:60, height:40, objectFit:"cover", borderRadius:6, flexShrink:0 }} onError={e=>e.target.style.display="none"} />
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:700, color:"#111", margin:"0 0 2px" }}>{b.name}</p>
              <p style={{ fontSize:10, color:"#888", margin:0 }}>{b.position==="top"?"Topo":"Meio"} · Ordem {b.order_num} · {b.active?"✅ Ativo":"⛔ Inativo"}</p>
            </div>
            <div style={{ display:"flex", gap:4, flexShrink:0 }}>
              <button onClick={()=>toggleActive(b)} style={{ background:"none", border:"1px solid #ddd", borderRadius:6, padding:"4px 8px", fontSize:11, cursor:"pointer" }}>{b.active?"Pausar":"Ativar"}</button>
              <button onClick={()=>editBanner(b)} style={{ background:"#f0f0f0", border:"none", borderRadius:6, padding:"4px 8px", fontSize:11, cursor:"pointer" }}>✏️</button>
              <button onClick={()=>deleteBanner(b.id)} style={{ background:"#fee2e2", border:"none", borderRadius:6, padding:"4px 8px", fontSize:11, cursor:"pointer", color:"#dc2626" }}>🗑️</button>
            </div>
          </div>
        ))}
        {!loading && banners.length===0 && <p style={{ color:"#aaa", textAlign:"center", padding:20 }}>Nenhum banner cadastrado ainda.</p>}
      </div>
    </div>
  );
}
