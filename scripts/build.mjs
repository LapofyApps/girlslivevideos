#!/usr/bin/env node
// Rebuilds the paginated blog index and sitemap.xml.
//
//   node scripts/build.mjs
//
// - Blog index: scripts/posts.json (array order = display order) → blog.html + blog/page/N.html
//   Header/footer are copied from contact.html so generated pages match the hand-written ones.
// - Sitemap: every deployed *.html that has a canonical and is not noindex.
//   lastmod = article:modified_time if present, else the file's last git commit date
//   (today if the file has uncommitted changes).
//
// No dependencies. Run it after adding/editing a post, then commit the output.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SITE = "https://www.girlslivevideos.com";
const PAGE_SIZE = 6;
const TODAY = new Date().toLocaleDateString("en-CA"); // local YYYY-MM-DD
// Not deployed (see firebase.json "ignore"), so never in the sitemap
const SKIP_DIRS = new Set(["scripts", "templates", "drafts", "node_modules", "img"]);

const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ---------- blog index ---------- */

const posts = JSON.parse(read("scripts/posts.json"));
for (const p of posts) {
  if (!fs.existsSync(path.join(ROOT, "blog", `${p.slug}.html`))) throw new Error(`posts.json: blog/${p.slug}.html not found`);
}

const contact = read("contact.html");
const headerHtml = contact.match(/<header class="header">[\s\S]*?<\/header>/)[0]
  .replace(/ class="nav-link active" aria-current="page"/g, ' class="nav-link"')
  .replace('<a href="/blog" class="nav-link">', '<a href="/blog" class="nav-link active" aria-current="page">');
const footerHtml = contact.match(/<footer class="footer">[\s\S]*?<\/footer>/)[0];

const pageCount = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
const pageUrl = n => (n === 1 ? `${SITE}/blog` : `${SITE}/blog/page/${n}`);
const pagePath = n => (n === 1 ? "/blog" : `/blog/page/${n}`);

function card(p) {
  const badge = p.badge ? `\n        <span class="blog-card-badge">${esc(p.badge)}</span>` : "";
  const style = p.gradient ? ` style="background: ${esc(p.gradient)};"` : "";
  return `    <a href="/blog/${p.slug}" class="blog-card">
      <div class="blog-card-img"${style} aria-hidden="true">
        ${p.emoji}${badge}
      </div>
      <div class="blog-card-body">
        <div class="blog-card-tag">${esc(p.tag)}</div>
        <h2 class="blog-card-title">${esc(p.title)}</h2>
        <p class="blog-card-excerpt">${esc(p.excerpt)}</p>
        <div class="blog-card-meta">${esc(p.date)} · ${p.readTime} min read</div>
        <div class="blog-card-read">Read more →</div>
      </div>
    </a>`;
}

function pagination(n) {
  if (pageCount === 1) return "";
  const links = [];
  if (n > 1) links.push(`<a href="${pagePath(n - 1)}" rel="prev">← Newer</a>`);
  for (let i = 1; i <= pageCount; i++) {
    links.push(i === n ? `<span aria-current="page">${i}</span>` : `<a href="${pagePath(i)}">${i}</a>`);
  }
  if (n < pageCount) links.push(`<a href="${pagePath(n + 1)}" rel="next">Older →</a>`);
  return `\n  <nav class="pagination" aria-label="Blog pages">\n    ${links.join("\n    ")}\n  </nav>`;
}

function blogPage(n) {
  const slice = posts.slice((n - 1) * PAGE_SIZE, n * PAGE_SIZE);
  const title = n === 1
    ? "GirlsLiveVideos Blog: Prank Ideas, Video Call Tips &amp; Trends"
    : `GirlsLiveVideos Blog – Page ${n} of ${pageCount}`;
  const description = n === 1
    ? "Fake call prank ideas, video call tips, online dating advice and trending stories from the GirlsLiveVideos blog."
    : `More prank ideas, video call tips and online trends from the GirlsLiveVideos blog (page ${n} of ${pageCount}).`;
  const url = pageUrl(n);
  const breadcrumb = [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
    ...(n > 1 ? [{ "@type": "ListItem", position: 3, name: `Page ${n}`, item: url }] : []),
  ];
  const ld = [
    { "@context": "https://schema.org", "@type": "Blog", name: "GirlsLiveVideos Blog", url: `${SITE}/blog`,
      description: "Prank ideas, fake call guides, video call tips and online trends.",
      publisher: { "@type": "Organization", name: "GirlsLiveVideos", url: `${SITE}/` } },
    { "@context": "https://schema.org", "@type": "ItemList", name: n === 1 ? "GirlsLiveVideos Blog Posts" : `GirlsLiveVideos Blog Posts – Page ${n}`, url,
      itemListElement: slice.map((p, i) => ({ "@type": "ListItem", position: (n - 1) * PAGE_SIZE + i + 1, url: `${SITE}/blog/${p.slug}`, name: p.title })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: breadcrumb },
  ].map(o => `  <script type="application/ld+json">\n${JSON.stringify(o, null, 2).replace(/^/gm, "  ")}\n  </script>`).join("\n\n");
  const relLinks = [
    n > 1 ? `  <link rel="prev" href="${pageUrl(n - 1)}" />` : "",
    n < pageCount ? `  <link rel="next" href="${pageUrl(n + 1)}" />` : "",
  ].filter(Boolean).join("\n");

  return `<!DOCTYPE html>
<!-- GENERATED by scripts/build.mjs from scripts/posts.json — edit those, not this file. -->
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${url}" />
${relLinks ? relLinks + "\n" : ""}  <meta name="robots" content="index, follow" />
  <meta name="author" content="GirlsLiveVideos" />

  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:site_name" content="GirlsLiveVideos" />
  <meta property="og:image" content="${SITE}/og-image.jpg" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${SITE}/og-image.jpg" />

${ld}

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/style.css?v=2" />
</head>
<body>

${headerHtml}

<section class="page-hero">
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <ol>
      <li><a href="/">Home</a></li>
      ${n === 1 ? '<li aria-current="page">Blog</li>' : `<li><a href="/blog">Blog</a></li>\n      <li aria-current="page">Page ${n}</li>`}
    </ol>
  </nav>
  <h1>GirlsLiveVideos <span class="gradient-text">Blog</span>${n > 1 ? ` – Page ${n}` : ""}</h1>
  <p class="lead">Prank ideas, fake call guides, video call tips and online trends. Want to try a prank right now? Open the <a href="/fake-video-call" style="color:#ff8fa3;text-decoration:underline;">fake video call simulator</a>.</p>
</section>

<section class="prose-section">
  <div class="blog-grid">
${slice.map(card).join("\n\n")}
  </div>${pagination(n)}
</section>

${footerHtml}

<script>
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  if (hamburger) hamburger.addEventListener('click', () => hamburger.setAttribute('aria-expanded', String(nav.classList.toggle('open'))));
</script>
</body>
</html>
`;
}

fs.writeFileSync(path.join(ROOT, "blog.html"), blogPage(1));
fs.mkdirSync(path.join(ROOT, "blog/page"), { recursive: true });
for (const f of fs.readdirSync(path.join(ROOT, "blog/page"))) {
  const n = parseInt(f, 10);
  if (!(n >= 2 && n <= pageCount)) fs.unlinkSync(path.join(ROOT, "blog/page", f));
}
for (let n = 2; n <= pageCount; n++) fs.writeFileSync(path.join(ROOT, `blog/page/${n}.html`), blogPage(n));
console.log(`blog: ${posts.length} posts → ${pageCount} page(s)`);

/* ---------- sitemap ---------- */

function htmlFiles(dir = "") {
  const out = [];
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    const rel = path.posix.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) out.push(...htmlFiles(rel)); }
    else if (e.name.endsWith(".html") && e.name !== "404.html") out.push(rel);
  }
  return out;
}

function lastmod(rel, html) {
  const m = html.match(/<meta property="article:modified_time" content="(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  try {
    const dirty = execFileSync("git", ["status", "--porcelain", "--", rel], { cwd: ROOT }).toString().trim();
    if (dirty) return TODAY;
    const d = execFileSync("git", ["log", "-1", "--format=%cs", "--", rel], { cwd: ROOT }).toString().trim();
    return d || TODAY;
  } catch { return TODAY; }
}

const entries = [];
for (const rel of htmlFiles()) {
  const html = read(rel);
  if (/<meta name="robots" content="[^"]*noindex/i.test(html)) continue;
  const canon = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
  if (!canon) throw new Error(`${rel}: missing canonical`);
  const expected = SITE + (rel === "index.html" ? "/" : "/" + rel.replace(/\.html$/, ""));
  if (canon !== expected) throw new Error(`${rel}: canonical ${canon} != expected ${expected}`);
  entries.push({ loc: canon, lastmod: lastmod(rel, html) });
}
entries.sort((a, b) => (a.loc === `${SITE}/` ? -1 : b.loc === `${SITE}/` ? 1 : a.loc.localeCompare(b.loc)));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(e => `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n  </url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml);
console.log(`sitemap: ${entries.length} URLs`);
