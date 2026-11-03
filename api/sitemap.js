// Ye file har baar Firebase se products padh ke sitemap khud bana deti hai.
module.exports = async function (req, res) {
  const SITE = 'https://premium-courses-vault.vercel.app';
  const DB = 'https://smart-store-72f69-default-rtdb.firebaseio.com';
  let ids = [];
  try {
    const r = await fetch(DB + '/products.json?shallow=true');
    const data = await r.json();
    ids = data ? Object.keys(data) : [];
  } catch (e) {}
  const urls = [SITE + '/'].concat(
    ids.map(id => SITE + '/course/' + encodeURIComponent(id))
  );
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(u => '  <url><loc>' + u.replace(/&/g, '&amp;') + '</loc></url>').join('\n') +
    '\n</urlset>';
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).send(xml);
};
