// Reuses same logic as Agente de Noticias
function decodeEntities(str) {
  return (str || '')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d)))
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&nbsp;/g,' ')
    .replace(/&atilde;/g,'ã').replace(/&otilde;/g,'õ').replace(/&eacute;/g,'é')
    .replace(/&ecirc;/g,'ê').replace(/&iacute;/g,'í').replace(/&oacute;/g,'ó')
    .replace(/&uacute;/g,'ú').replace(/&agrave;/g,'à').replace(/&aacute;/g,'á')
    .replace(/&ccedil;/g,'ç').replace(/&Atilde;/g,'Ã').replace(/&Ccedil;/g,'Ç');
}

function parseRSS(xml, sourceName) {
  const items = [];
  const matches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
  for (const item of matches.slice(0,10)) {
    const title = decodeEntities((item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/))?.[1] || '');
    const link = (item.match(/<link>(.*?)<\/link>/) || [])[1] || '';
    const desc = decodeEntities(((item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || item.match(/<description>([\s\S]*?)<\/description>/))?.[1] || '').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim());
    const pubDate = (item.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || '';
    const image = (item.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*type=["']image/i)||[])[1] || (item.match(/<media:content[^>]*url=["']([^"']+)["']/i)||[])[1] || '';
    if (!title) continue;
    const t = title.toLowerCase();
    let category = 'Notícia';
    if (/prefeit|vereador|política|partido/.test(t)) category='Política';
    else if (/saúde|hospital|dengue|vacina/.test(t)) category='Saúde';
    else if (/policia|crime|roubo|furto|acidente|gcm/.test(t)) category='Segurança';
    else if (/obra|paviment|asfalto|construção/.test(t)) category='Obras';
    else if (/cinema|show|evento|festival|cultura|lazer/.test(t)) category='Entretenimento';
    const diff = Date.now() - new Date(pubDate).getTime();
    const h = Math.floor(diff/3600000);
    const time = h<1?'Agora':h<24?`${h}h atrás`:h<48?'Ontem':`${Math.floor(h/24)}d atrás`;
    items.push({ id: Math.random().toString(36).substr(2,9), title, summary: desc.substring(0,220)||'Clique para ler.', image, url: link.trim(), time, source: sourceName||'Portal 2.0', category, location:'' });
  }
  return items;
}

async function fetchRSS(url, name) {
  try {
    const r = await fetch(url, { headers:{'User-Agent':'Mozilla/5.0'} });
    if (!r.ok) return [];
    return parseRSS(await r.text(), name);
  } catch { return []; }
}

async function fetchGoogleNews(query) {
  return fetchRSS(`https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`, 'Google News');
}

exports.handler = async (event) => {
  const city = (event.queryStringParameters?.city) || 'São Paulo';
  try {
    const [regional, google] = await Promise.all([
      fetchRSS('https://cidadereporter.com/feed/', 'Cidade Repórter'),
      fetchGoogleNews(`${city} notícias`),
    ]);
    const all = [...regional.filter(n=>{
      const t=(n.title+' '+n.summary).toLowerCase();
      return t.includes(city.toLowerCase().split(',')[0].trim().toLowerCase());
    }), ...google].slice(0,15);
    return { statusCode:200, headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}, body: JSON.stringify({ city, news: all }) };
  } catch(e) {
    return { statusCode:500, body: JSON.stringify({ error:e.message, news:[] }) };
  }
};
