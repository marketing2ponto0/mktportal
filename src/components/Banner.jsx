import { useState, useEffect } from "react";
import { SUPABASE_URL, SUPABASE_ANON } from "../App.jsx";

export default function Banner({ position }) {
  const [banners, setBanners] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    fetch(`${SUPABASE_URL}/rest/v1/banners?position=eq.${position}&active=eq.true&order=order_num.asc`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` }
    }).then(r => r.json()).then(d => { if (Array.isArray(d) && d.length) setBanners(d); }).catch(()=>{});
  }, [position]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % banners.length), 7000);
    return () => clearInterval(t);
  }, [banners]);

  if (!banners.length) return null;
  const b = banners[idx];
  const waUrl = `https://wa.me/${b.whatsapp_number.replace(/\D/g,"")}?text=${encodeURIComponent(b.whatsapp_text||"Olá, vim do Portal 2.0")}`;

  return (
    <div style={{ margin: "12px 0" }}>
      <p style={{ fontSize: 9, color: "#bbb", textAlign: "center", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: 1 }}>Publicidade</p>
      <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block", borderRadius: 8, overflow: "hidden" }}>
        <img src={b.image_url} alt={b.name} style={{ width: "100%", display: "block", maxHeight: 100, objectFit: "cover" }} />
      </a>
    </div>
  );
}
