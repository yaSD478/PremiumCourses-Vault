// /course/<id> par aane wale Google/visitors ko is product ki SEO tags ke saath page deta hai.
const SITE = 'https://premium-courses-vault.vercel.app';
const DB = 'https://smart-store-72f69-default-rtdb.firebaseio.com';

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function setById(html, id, attr, val) {
  const re = new RegExp('(<[^>]*?\\b' + attr + '=")[^"]*("[^>]*?\\bid="' + id + '")', 'i');
  const re2 = new RegExp('(<[^>]*?\\bid="' + id + '"[^>]*?\\b' + attr + '=")[^"]*(")', 'i');
  if (re.test(html)) return html.replace(re, '$1' + esc(val) + '$2');
  return html.replace(re2, '$1' + esc(val) + '$2');
}

module.exports = async function (req, res) {
  const id = String((req.query && req.query.id) || '').trim();
  let html = '';
  try {
    html = await (await fetch(SITE + '/index.html')).text();
  } catch (e) {
    res.status(500).send('Error'); return;
  }

  let p = null;
  try {
    if (id) p = await (await fetch(DB + '/products/' + encodeURIComponent(id) + '.json')).json();
  } catch (e) {}

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate');

  if (!p) { res.status(404).send(html); return; }

  const title = p.title || p.name || 'Course';
  const image = p.imageUrl || p.image || '';
  const disc = (p.discountPrice != null && p.discountPrice !== '') ? parseFloat(p.discountPrice) : null;
  const price = disc != null ? disc : (parseFloat(p.price) || parseFloat(p.originalPrice) || 0);
  const plain = String(p.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const desc = (plain.slice(0, 155) || ('Buy ' + title + ' online at an affordable price. Instant access.'));
  const pageTitle = title + ' — Buy Online at Best Price | PremiumCourses';
  const url = SITE + '/course/' + encodeURIComponent(id);

  html = html.replace(/<title>[\s\S]*?<\/title>/i, '<title>' + esc(pageTitle) + '</title>');
  html = html.replace(/(<meta name="description" content=")[^"]*(")/i, '$1' + esc(desc) + '$2');
  html = setById(html, 'canonical-link', 'href', url);
  html = setById(html, 'og-title', 'content', pageTitle);
  html = setById(html, 'og-description', 'content', desc);
  html = setById(html, 'og-url', 'content', url);
  if (image) html = setById(html, 'og-image', 'content', image);
  html = setById(html, 'og-type', 'content', 'product');
  html = setById(html, 'tw-title', 'content', pageTitle);
  html = setById(html, 'tw-description', 'content', desc);
  if (image) html = setById(html, 'tw-image', 'content', image);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description: desc,
    image: image || undefined,
    url: url,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: String(price),
      availability: 'https://schema.org/InStock',
      url: url
    }
  };
  const ldTag = '<script type="application/ld+json">' +
    JSON.stringify(ld).replace(/</g, '\\u003c') + '</script>\n';
  html = /<\/head>/i.test(html) ? html.replace(/<\/head>/i, ldTag + '</head>') : html.replace(/<body/i, ldTag + '<body');

  const noscript = '<noscript><h1>' + esc(title) + '</h1><p>' + esc(desc) + '</p><p>Price: ₹' +
    esc(price) + '</p></noscript>';
  html = html.replace(/<body([^>]*)>/i, '<body$1>' + noscript);

  res.status(200).send(html);
};
