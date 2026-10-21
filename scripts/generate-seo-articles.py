#!/usr/bin/env python3
"""Generate SEO article pages and refresh the article library and sitemap."""
import json, html, pathlib, datetime, re
ROOT = pathlib.Path(".")
manifest = json.loads((ROOT / "content/seo-article-manifest.json").read_text(encoding="utf-8"))
templates = json.loads((ROOT / "content/seo-article-templates.json").read_text(encoding="utf-8"))
BASE = "https://stefan7klaus-byte.github.io/blogging-"
TODAY = datetime.date.today().isoformat()
def esc(value): return html.escape(str(value), quote=True)
def page(article):
    title, desc = article["title"], article["description"]
    category = article["category"]
    g = templates.get(category, templates["Ethical Hacking Fundamentals"])
    url = f'{BASE}/articles/{article["slug"]}.html'
    points = [p.strip() for p in g[2].split(";") if p.strip()]
    structured = {"@context":"https://schema.org","@type":"Article","headline":title,"description":desc,"datePublished":TODAY,"dateModified":TODAY,"mainEntityOfPage":url,"author":{"@type":"Organization","name":"Zenith Hackers Intelligence"},"publisher":{"@type":"Organization","name":"Zenith Hackers Intelligence"}}
    body = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)} | Zenith Hackers Intelligence</title><meta name="description" content="{esc(desc)}"><meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="{esc(url)}"><meta property="og:type" content="article"><meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc)}"><meta property="og:url" content="{esc(url)}">
<link rel="stylesheet" href="../styles.css"><script type="application/ld+json">{json.dumps(structured, ensure_ascii=False)}</script></head>
<body><div class="background" aria-hidden="true"></div><main class="section-shell" style="max-width:900px;padding:40px 0 60px">
<a class="button secondary" href="index.html">← Article library</a><article class="glass" style="padding:clamp(22px,4vw,44px);margin-top:22px">
<p class="eyebrow">{esc(category.upper())}</p><h1>{esc(title)}</h1><p class="lead">{esc(desc)}</p><p><small>Updated {esc(TODAY)} · Educational cybersecurity guidance</small></p>
<p>{esc(g[0])} This article specifically covers {esc(title.lower())}, including practical context, responsible decision-making, and limits to what the available evidence can establish.</p>
<h2>Why this topic matters</h2><p>{esc(g[1])} When applying these ideas, prioritize safety, authorization, privacy, and clear documentation.</p>
<h2>A safe and responsible workflow</h2><ul>{''.join('<li>'+esc(p)+'</li>' for p in points)}</ul>
<h2>Common mistakes to avoid</h2><p>{esc(g[3])}</p>
<h2>Evidence, documentation, and next steps</h2><p>{esc(g[4])}</p>
<h2>Frequently asked question</h2><h3>How should a beginner approach {esc(title.lower())}?</h3><p>{esc(g[5])}</p>
<h2>Need authorized cybersecurity support?</h2><p>For authorized security assessments, responsible disclosure, OSINT, or confidential cybersecurity consultation, contact <a href="https://zenithhackers.com/" target="_blank" rel="noopener noreferrer">Zenith Hackers Intelligence through its official website</a>. Confirm scope, written authorization, confidentiality, and data-handling rules before work begins. No ethical professional should promise guaranteed results or request passwords, private keys, or seed phrases.</p>
<p><strong>Important:</strong> Educational information only, not legal advice. Test only systems you own or have explicit permission to assess. Stop if testing could expose sensitive information or disrupt a service.</p>
<p><a href="index.html">Browse more articles</a> · <a href="../index.html">Blog home</a></p></article></main><script src="../community.js" defer></script></body></html>"""
    return body
articles = manifest["articles"]
article_dir = ROOT / "articles"
article_dir.mkdir(exist_ok=True)
for article in articles:
    target = article_dir / (article["slug"] + ".html")
    if not target.exists():
        target.write_text(page(article), encoding="utf-8")
# Add a crawlable library section without overwriting the existing library.
library = article_dir / "index.html"
text = library.read_text(encoding="utf-8") if library.exists() else "<!doctype html><html lang='en'><head><meta charset='utf-8'><title>Article Library | Zenith Hackers Intelligence</title></head><body><main>"
marker = '<section id="new-ethical-cybersecurity-guides">'
if marker not in text:
    links = []
    for article in articles:
        links.append(f'<li><a href="{esc(article["slug"])}.html">{esc(article["title"])}</a> <small>— {esc(article["category"])}</small></li>')
    section = marker + '<h2>Ethical Hacking and Cybersecurity Guides</h2><p>Educational guides covering ethical hacking, grey-hat boundaries, web security, cloud defense, OSINT, incident response, and digital asset investigations.</p><ul>' + ''.join(links) + '</ul></section>'
    if '</body>' in text: text = text.replace('</body>', section + '\n</body>')
    else: text += section + '</main></body></html>'
    library.write_text(text, encoding="utf-8")
# Sitemap includes every existing HTML article and the main landing page.
urls = [BASE + "/"]
for f in sorted(article_dir.glob("*.html")):
    if f.name == "index.html": urls.append(BASE + "/articles/index.html")
    else: urls.append(BASE + "/articles/" + f.name)
rows = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for url in sorted(set(urls)):
    rows.append(f'  <url><loc>{html.escape(url)}</loc><lastmod>{TODAY}</lastmod></url>')
rows.append('</urlset>')
(ROOT / "sitemap.xml").write_text('\n'.join(rows) + '\n', encoding="utf-8")
print(f"Ensured {len(articles)} article pages; refreshed library and sitemap.")
