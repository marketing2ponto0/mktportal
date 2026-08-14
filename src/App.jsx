import { useState, useEffect } from "react";
import Home from "./pages/Home.jsx";
import Article from "./pages/Article.jsx";
import SoCurtindo from "./pages/SoCurtindo.jsx";
import Admin from "./pages/Admin.jsx";

export const SUPABASE_URL = "https://yuqidbvfilomxkwaaerl.supabase.co";
export const SUPABASE_ANON = "sb_publishable_t3Qiwi-26sBX-0mbtdjXCA__h26yp3p";

function getPage() {
  const h = window.location.hash;
  if (h.startsWith("#/artigo/")) {
    let rest = h.replace("#/artigo/","");
    let from = "home";
    const qi = rest.indexOf("?");
    if (qi >= 0) { from = rest.slice(qi+1) || "home"; rest = rest.slice(0, qi); }
    return { page: "article", slug: decodeURIComponent(rest), from };
  }
  if (h === "#/so-curtindo") return { page: "scv" };
  if (h === "#/admin") return { page: "admin" };
  return { page: "home" };
}

export default function App() {
  const [state, setState] = useState(getPage());

  useEffect(() => {
    const handler = () => setState(getPage());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const go = (hash) => { window.location.hash = hash; window.scrollTo(0,0); };

  if (state.page === "admin") return <Admin onBack={() => go("")} />;
  if (state.page === "article") return <Article slug={state.slug} from={state.from} onBack={() => go(state.from === "scv" ? "#/so-curtindo" : "")} go={go} />;
  if (state.page === "scv") return <SoCurtindo go={go} />;
  return <Home go={go} />;
}
