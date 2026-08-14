import { useState, useEffect } from "react";
import Home from "./pages/Home.jsx";
import Article from "./pages/Article.jsx";
import Admin from "./pages/Admin.jsx";

const SUPABASE_URL = "https://yuqidbvfilomxkwaaerl.supabase.co";
const SUPABASE_ANON = "sb_publishable_t3Qiwi-26sBX-0mbtdjXCA__h26yp3p";

export { SUPABASE_URL, SUPABASE_ANON };

export default function App() {
  const [page, setPage] = useState("home");
  const [article, setArticle] = useState(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#/admin")) { setPage("admin"); return; }
    if (hash.startsWith("#/article/")) {
      const url = decodeURIComponent(hash.replace("#/article/", ""));
      setArticle({ url });
      setPage("article");
    }
  }, []);

  const navigate = (pg, data) => {
    if (pg === "article") {
      window.location.hash = `#/article/${encodeURIComponent(data.url)}`;
      setArticle(data);
    } else if (pg === "admin") {
      window.location.hash = "#/admin";
    } else {
      window.location.hash = "";
    }
    setPage(pg);
    window.scrollTo(0, 0);
  };

  if (page === "admin") return <Admin onBack={() => navigate("home")} />;
  if (page === "article" && article) return <Article article={article} onBack={() => navigate("home")} />;
  return <Home onArticle={(a) => navigate("article", a)} />;
}
