import { useState, useEffect, useRef } from "react";
import { SUPABASE_URL, SUPABASE_ANON } from "../App.jsx";

const SERVICE = () => import.meta.env.VITE_SUPABASE_SERVICE_KEY || SUPABASE_ANON;

function headers(service=false) {
  const key = service ? SERVICE() : SUPABASE_ANON;
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation" };
}

export default function Admin({ onBack }) {
  const [auth, setAuth] = useState(false);
  const [pw, setPw] = useState("");
  const [tab, setTab] = useState("banners");
  const [banners, setBanners] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bForm, setBForm] = useState({ name:"", image_url:"", whatsapp_number:"", whatsapp_text:"Olá, vim do Portal 2.0", position:"top", active:true, order_num:0 });
  const [bEditing, setBEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [aForm, setAForm] = useState({ title:"", summary:"", content:"", image_url:"", category:"Notícia", city:"Franco da Rocha", section:"news" });
  const [aSaving, setASaving] = useState(false);
  const imgRef = useRef();
  const [uploadErr, setUploadErr] = useState("");
  const fileRef = useRef();

  const PASS = import.meta.env.VITE_ADMIN_PASSWORD || "Portal@2ponto0";

  const login = () => { if (pw === PASS) { setAuth(true); loadAll(); } else alert("Senha incorreta!"); };

  function loadAll() { loadBanners(); loadArticles(); }

  async function loadBanners() {
    setLoading(true);
    const r = await fetch(`${SUPABASE_URL}/rest/v1/banners?order=position.asc,order_num.asc`, { headers: headers() });
    const d = await r.json(); setBanners(Array.isArray(d)?d:[]); setLoading(false);
  }

  async function loadArticles() {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/articles?order=published_at.desc&limit=30`, { headers: headers() });
    const d = await r.json(); setArticles(Array.isArray(d)?d:[]);
  }

  async function uploadArticleImage(file) {
    const ext = file.name.split(".").pop().toLowerCase();
    const filename = `article_${Date.now()}.${ext}`;
    const key = (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_SERVICE_KEY) || SERVICE();
    const r = await fetch(`${SUPABASE_URL}/storage/v1/object/banners/${filename}`, {
      method:"POST",
      headers:{ "apikey":key, "Authorization":`Bearer ${key}`, "Content-Type":file.type, "x-upsert":"true", "Cache-Control":"3600" },
      body:file
    });
    if (r.ok) {
      setAForm(f=>({...f, image_url:`${SUPABASE_URL}/storage/v1/object/public/banners/${filename}`}));
    } else {
      const res = await r.json().catch(()=>({}));
      alert("Erro ao fazer upload: " + (res.message||r.status));
    }
  }

  async function saveArticle() {
    if (!aForm.title||!aForm.content) { alert("Preencha título e conteúdo!"); return; }
    setASaving(true);
    try {
      const slug = aForm.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") + "-" + Date.now();
      await fetch(`${SUPABASE_URL}/rest/v1/articles`, {
        method:"POST", headers:headers(true),
        body:JSON.stringify({...aForm, slug, published_at: new Date().toISOString()})
      });
      setAForm({title:"",summary:"",content:"",image_url:"",category:"Notícia",city:"Franco da Rocha",section:"news"});
      alert("✅ Artigo publicado no portal!");
      setTab("articles");
      loadArticles();
    } catch(e) { alert("Erro: "+e.message); }
    setASaving(false);
  }

  async function uploadImage(file) {
    setUploading(true); setUploadErr("");
    const ext = file.name.split(".").pop().toLowerCase();
    const path = `banner_${Date.now()}.${ext}`;
    const key = SERVICE();
    const r = await fetch(`${SUPABASE_URL}/storage/v1/object/banners/${path}`, {
      method:"POST", headers:{ apikey:key, Authorization:`Bearer ${key}`, "Content-Type":file.type, "x-upsert":"true" }, body:file
    });
    const res = await r.json();
    if (r.ok || res.Key || res.path) {
      setBForm(f=>({...f, image_url:`${SUPABASE_URL}/storage/v1/object/public/banners/${path}`}));
    } else { setUploadErr(`Erro: ${res.message||JSON.stringify(res)}`); }
    setUploading(false);
  }

  async function saveBanner() {
    if (!bForm.name||!bForm.image_url||!bForm.whatsapp_number) { alert("Preencha nome, imagem e WhatsApp!"); return; }
    const payload = {...bForm, whatsapp_number: bForm.whatsapp_number.replace(/\D/g,"")};
    if (bEditing) { await fetch(`${SUPABASE_URL}/rest/v1/banners?id=eq.${bEditing}`, {method:"PATCH",headers:headers(true),body:JSON.stringify(payload)}); }
    else { await fetch(`${SUPABASE_URL}/rest/v1/banners`, {method:"POST",headers:headers(true),body:JSON.stringify(payload)}); }
    setBForm({name:"",image_url:"",whatsapp_number:"",whatsapp_text:"Olá, vim do Portal 2.0",position:"top",active:true,order_num:0});
    setBEditing(null); loadBanners();
  }

  async function deleteBanner(id) { if(!confirm("Deletar?"))return; await fetch(`${SUPABASE_URL}/rest/v1/banners?id=eq.${id}`,{method:"DELETE",headers:headers(true)}); loadBanners(); }
  async function toggleBanner(b) { await fetch(`${SUPABASE_URL}/rest/v1/banners?id=eq.${b.id}`,{method:"PATCH",headers:headers(true),body:JSON.stringify({active:!b.active})}); loadBanners(); }
  async function deleteArticle(id) { if(!confirm("Deletar artigo?"))return; await fetch(`${SUPABASE_URL}/rest/v1/articles?id=eq.${id}`,{method:"DELETE",headers:headers(true)}); loadArticles(); }

  const S = {
    input:{width:"100%",padding:"9px 12px",border:"1px solid #ddd",borderRadius:8,fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:8},
    label:{fontSize:11,color:"#666",fontWeight:600,display:"block",marginBottom:3},
    btn:(c="#A01313")=>({background:c,color:"#fff",border:"none",borderRadius:8,padding:"10px 16px",fontSize:13,fontWeight:700,cursor:"pointer",width:"100%"}),
  };

  if (!auth) return (
    <div style={{minHeight:"100vh",background:"#080808",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#111",borderRadius:16,padding:24,width:"100%",maxWidth:320}}>
        <h2 style={{color:"#C8A96E",fontWeight:900,textAlign:"center",marginBottom:20}}>🔐 Admin Portal 2.0</h2>
        <input type="password" placeholder="Senha admin" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}
          style={{...S.input,background:"#1a1a1a",border:"1px solid #333",color:"#fff",marginBottom:12}}/>
        <button onClick={login} style={S.btn()}>Entrar</button>
        <button onClick={onBack} style={{...S.btn("#333"),marginTop:8}}>← Portal</button>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#f8f9fa",fontFamily:"system-ui,sans-serif"}}>
      <header style={{background:"#080808",padding:"12px 16px"}}>
        <div style={{maxWidth:700,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <h1 style={{color:"#C8A96E",fontWeight:900,fontSize:16,margin:0}}>🔧 Admin Portal 2.0</h1>
          <button onClick={onBack} style={{background:"none",border:"1px solid #444",color:"#aaa",borderRadius:8,padding:"5px 12px",fontSize:11,cursor:"pointer"}}>← Portal</button>
        </div>
      </header>

      <div style={{maxWidth:700,margin:"0 auto",padding:16}}>
        {/* Tabs */}
        <div style={{display:"flex",gap:4,marginBottom:16}}>
          {[["banners","📣 Banners"],["articles","📰 Artigos"],["novo","✍️ Nova Notícia"]].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)}
              style={{flex:1,background:tab===t?"#A01313":"#fff",color:tab===t?"#fff":"#333",border:`1px solid ${tab===t?"#A01313":"#ddd"}`,borderRadius:8,padding:"8px 0",fontSize:11,fontWeight:700,cursor:"pointer"}}>
              {l}
            </button>
          ))}
        </div>

        {/* BANNERS TAB */}
        {tab==="banners" && (
          <>
            <div style={{background:"#fff",borderRadius:12,padding:16,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",marginBottom:16}}>
              <h3 style={{fontSize:14,fontWeight:700,marginBottom:12}}>{bEditing?"✏️ Editar":"➕ Novo"} Banner</h3>
              <label style={S.label}>Nome</label>
              <input style={S.input} placeholder="Ex: CDL Franco da Rocha" value={bForm.name} onChange={e=>setBForm(f=>({...f,name:e.target.value}))}/>
              <label style={S.label}>Imagem</label>
              <div style={{display:"flex",gap:8,marginBottom:4}}>
                <input style={{...S.input,margin:0,flex:1}} placeholder="URL ou upload" value={bForm.image_url} onChange={e=>setBForm(f=>({...f,image_url:e.target.value}))}/>
                <button onClick={()=>fileRef.current.click()} disabled={uploading} style={{background:"#f0f0f0",border:"1px solid #ddd",borderRadius:8,padding:"0 12px",cursor:"pointer",fontSize:12}}>{uploading?"⏳":"📁"}</button>
              </div>
              {uploadErr&&<p style={{fontSize:11,color:"#dc2626",marginBottom:4}}>{uploadErr}</p>}
              <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>e.target.files[0]&&uploadImage(e.target.files[0])}/>
              {bForm.image_url&&<img src={bForm.image_url} alt="" style={{width:"100%",height:70,objectFit:"cover",borderRadius:6,marginBottom:8}} onError={e=>e.target.style.display="none"}/>}
              <label style={S.label}>WhatsApp (DDD+número)</label>
              <input style={S.input} placeholder="11934503566" value={bForm.whatsapp_number} onChange={e=>setBForm(f=>({...f,whatsapp_number:e.target.value}))}/>
              <label style={S.label}>Mensagem WhatsApp</label>
              <input style={S.input} value={bForm.whatsapp_text} onChange={e=>setBForm(f=>({...f,whatsapp_text:e.target.value}))}/>
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                <div style={{flex:1}}>
                  <label style={S.label}>Posição</label>
                  <select style={{...S.input,margin:0}} value={bForm.position} onChange={e=>setBForm(f=>({...f,position:e.target.value}))}>
                    <option value="top">Topo</option>
                    <option value="middle">Meio</option>
                  </select>
                </div>
                <div style={{flex:1}}>
                  <label style={S.label}>Ordem</label>
                  <input type="number" style={{...S.input,margin:0}} value={bForm.order_num} onChange={e=>setBForm(f=>({...f,order_num:+e.target.value}))}/>
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={saveBanner} style={S.btn()}>{bEditing?"Salvar":"Adicionar"}</button>
                {bEditing&&<button onClick={()=>{setBEditing(null);setBForm({name:"",image_url:"",whatsapp_number:"",whatsapp_text:"Olá, vim do Portal 2.0",position:"top",active:true,order_num:0});}} style={S.btn("#666")}>Cancelar</button>}
              </div>
            </div>
            <h3 style={{fontSize:13,fontWeight:700,marginBottom:8}}>Banners ({banners.length})</h3>
            {banners.map(b=>(
              <div key={b.id} style={{background:"#fff",borderRadius:8,padding:10,marginBottom:8,display:"flex",gap:10,alignItems:"center",opacity:b.active?1:0.5}}>
                <img src={b.image_url} alt="" style={{width:60,height:40,objectFit:"cover",borderRadius:4,flexShrink:0}} onError={e=>e.target.style.display="none"}/>
                <div style={{flex:1}}>
                  <p style={{fontSize:12,fontWeight:700,margin:"0 0 2px"}}>{b.name}</p>
                  <p style={{fontSize:10,color:"#888",margin:0}}>{b.position==="top"?"Topo":"Meio"} · {b.active?"✅":"⛔"}</p>
                </div>
                <div style={{display:"flex",gap:4}}>
                  <button onClick={()=>toggleBanner(b)} style={{background:"none",border:"1px solid #ddd",borderRadius:6,padding:"3px 8px",fontSize:11,cursor:"pointer"}}>{b.active?"Pausar":"Ativar"}</button>
                  <button onClick={()=>{setBEditing(b.id);setBForm({name:b.name,image_url:b.image_url,whatsapp_number:b.whatsapp_number,whatsapp_text:b.whatsapp_text,position:b.position,active:b.active,order_num:b.order_num});window.scrollTo(0,0);}} style={{background:"#f0f0f0",border:"none",borderRadius:6,padding:"3px 8px",fontSize:11,cursor:"pointer"}}>✏️</button>
                  <button onClick={()=>deleteBanner(b.id)} style={{background:"#fee2e2",border:"none",borderRadius:6,padding:"3px 8px",fontSize:11,cursor:"pointer",color:"#dc2626"}}>🗑️</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* NOVO ARTIGO TAB */}
        {tab==="novo" && (
          <div style={{background:"#fff",borderRadius:12,padding:16,boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
            <h3 style={{fontSize:14,fontWeight:700,marginBottom:14}}>✍️ Nova Notícia Manual</h3>
            <label style={S.label}>Título *</label>
            <input style={S.input} placeholder="Título da notícia" value={aForm.title} onChange={e=>setAForm(f=>({...f,title:e.target.value}))}/>
            <label style={S.label}>Resumo (aparece em destaque)</label>
            <textarea style={{...S.input,height:70,resize:"none"}} placeholder="Resumo da notícia..." value={aForm.summary} onChange={e=>setAForm(f=>({...f,summary:e.target.value}))}/>
            <label style={S.label}>Conteúdo completo *</label>
            <textarea style={{...S.input,height:160,resize:"vertical"}} placeholder="Texto completo da notícia..." value={aForm.content} onChange={e=>setAForm(f=>({...f,content:e.target.value}))}/>
            <label style={S.label}>Imagem</label>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <input style={{...S.input,margin:0,flex:1}} placeholder="URL da imagem" value={aForm.image_url} onChange={e=>setAForm(f=>({...f,image_url:e.target.value}))}/>
              <button onClick={()=>imgRef.current.click()} style={{background:"#f0f0f0",border:"1px solid #ddd",borderRadius:8,padding:"0 12px",cursor:"pointer",fontSize:12}}>📁</button>
            </div>
            <input ref={imgRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>e.target.files[0]&&uploadArticleImage(e.target.files[0])}/>
            {aForm.image_url&&<img src={aForm.image_url} alt="" style={{width:"100%",height:80,objectFit:"cover",borderRadius:6,marginBottom:8}} onError={e=>e.target.style.display="none"}/>}
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <div style={{flex:1}}>
                <label style={S.label}>Categoria</label>
                <select style={{...S.input,margin:0}} value={aForm.category} onChange={e=>setAForm(f=>({...f,category:e.target.value}))}>
                  {["Notícia","Política","Segurança","Saúde","Obras","Entretenimento","Eventos","Legislação"].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{flex:1}}>
                <label style={S.label}>Seção</label>
                <select style={{...S.input,margin:0}} value={aForm.section} onChange={e=>setAForm(f=>({...f,section:e.target.value}))}>
                  <option value="news">📰 Notícias</option>
                  <option value="scv">🎭 Só Curtindo</option>
                </select>
              </div>
            </div>
            <label style={S.label}>Cidade</label>
            <select style={{...S.input}} value={aForm.city} onChange={e=>setAForm(f=>({...f,city:e.target.value}))}>
              {["Franco da Rocha","Caieiras","Francisco Morato","Mairiporã","Cajamar","Jundiaí","São Paulo"].map(c=><option key={c}>{c}</option>)}
            </select>
            <button onClick={saveArticle} disabled={aSaving} style={{...S.btn(),opacity:aSaving?0.7:1}}>
              {aSaving?"Publicando...":"🚀 Publicar no Portal"}
            </button>
          </div>
        )}

        {/* ARTICLES TAB */}
        {tab==="articles" && (
          <>
            <p style={{fontSize:12,color:"#888",marginBottom:12}}>Artigos publicados pelo Agente de Notícias 2.0</p>
            {articles.map(a=>(
              <div key={a.id} style={{background:"#fff",borderRadius:8,padding:10,marginBottom:8,display:"flex",gap:10,alignItems:"center"}}>
                {a.image_url&&<img src={a.image_url} alt="" style={{width:60,height:40,objectFit:"cover",borderRadius:4,flexShrink:0}} onError={e=>e.target.style.display="none"}/>}
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:12,fontWeight:700,margin:"0 0 2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.title}</p>
                  <p style={{fontSize:10,color:"#888",margin:0}}>{a.section==="scv"?"🎭 Só Curtindo":"📰 Notícias"} · {new Date(a.published_at).toLocaleDateString("pt-BR")}</p>
                </div>
                <button onClick={()=>deleteArticle(a.id)} style={{background:"#fee2e2",border:"none",borderRadius:6,padding:"3px 8px",fontSize:11,cursor:"pointer",color:"#dc2626",flexShrink:0}}>🗑️</button>
              </div>
            ))}
            {articles.length===0&&<p style={{color:"#aaa",textAlign:"center",padding:20}}>Nenhum artigo publicado ainda.</p>}
          </>
        )}
      </div>
    </div>
  );
}
