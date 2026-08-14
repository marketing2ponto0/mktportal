import { useState, useEffect } from "react";
import { SUPABASE_URL, SUPABASE_ANON } from "../App.jsx";

export default function Banner({ position, style = {} }) {
  const [banners, setBanners] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    fetch(`${SUPABASE_URL}/rest/v1/banners?position=eq.${position}&active=eq.true&order=order_num.asc`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` }
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length) setBanners(data); })
      .catch(() => {});
  }, [position]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % banners.length), 8000);
    return () => clearInterval(t);
  }, [banners]);

  if (!banners.length) return null;
  const b = banners[idx];
  const waMsg = encodeURIComponent(b.whatsapp_text || "Olá, vim do Portal 2.0");
  const waUrl = `https://wa.me/${b.whatsapp_number.replace(/\D/g,"")}?text=${waMsg}`;

  return (
    <a href={waUrl} target="_blank" rel="noopener noreferrer"
      style={{ display: "block", width: "100%", overflow: "hidden", borderRadius: 8, ...style }}>
      <img src={b.image_url} alt={b.name}
        style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }} />
    </a>
  );
}
