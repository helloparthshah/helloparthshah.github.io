import { SITE } from "./site.config.js";

const RAW = `https://raw.githubusercontent.com/${SITE.portfolioRepo}/${SITE.portfolioBranch}`;
const getJson = (url) => fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${r.status} ${url}`))));
const lines = (text) => (text ? text.split("\n").map((l) => l.trim()).filter(Boolean) : []);

// Raw GitHub serves files with CORS headers, so images can be used as WebGL textures.
const portfolioImage = (path) => (path ? `${RAW}/public${path}` : null);

export async function loadData() {
  const [config, projects] = await Promise.all([
    getJson(`${RAW}/website.config.json`),
    getJson(`${RAW}/public/jsons/projects.json`),
  ]);

  const featured = projects
    // The portfolio's catch-all "Other Projects" card points here, so skip it.
    .filter((p) => p.description && p.skills?.length)
    .map((p) => ({
      id: p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: p.title,
      dates: [p.start, p.end].filter(Boolean).join(" - "),
      bullets: lines(p.description),
      skills: p.skills ?? [],
      links: p.links ?? {},
      image: portfolioImage(p.image),
      featured: true,
    }));

  // Repos are listed per owner (user or organization), one request each.
  const reposCache = new Map();
  const reposOf = (owner) => {
    const key = owner.toLowerCase();
    if (!reposCache.has(key)) {
      reposCache.set(key, getJson(`https://api.github.com/users/${owner}/repos?per_page=100&sort=updated`).catch(() => []));
    }
    return reposCache.get(key);
  };

  // Star counts for featured projects, from the repo behind their GitHub link.
  // A link to an organization (github.com/org) is matched by the project's name.
  const norm = (x) => x.toLowerCase().replace(/\.git$/, "").replace(/[^a-z0-9]/g, "");
  await Promise.all(featured.map(async (p) => {
    const url = Object.entries(p.links).find(([k, v]) => /github/i.test(k) && /github\.com\/[^/?#]+/.test(v))?.[1];
    if (!url) return;
    const [, owner, name] = url.match(/github\.com\/([^/?#]+)(?:\/([^/?#]+))?/);
    // A repo link is looked up directly, which also follows repos that moved
    // to another owner; an organization link is searched by the project's name.
    const byName = async () => (await reposOf(owner)).find((r) => norm(r.name) === norm(name ?? p.title));
    const repo = name
      ? (await getJson(`https://api.github.com/repos/${owner}/${name.replace(/\.git$/, "")}`).catch(() => null)) ?? (await byName())
      : await byName();
    if (repo) p.stars = repo.stargazers_count;
  }));

  // Every other repo with GitHub Pages, newest first (grouped by year), then by stars.
  let pages = [];
  const repos = await reposOf(SITE.github);
  const taken = new Set(featured.map((p) => p.id.replace(/-/g, "")));
  pages = repos
    .filter((r) => r.has_pages && !r.fork && r.name.toLowerCase() !== `${SITE.github}.github.io`)
    .filter((r) => !taken.has(r.name.toLowerCase().replace(/[^a-z0-9]/g, "")))
    .map((r) => {
      const year = r.created_at ? new Date(r.created_at).getFullYear() : null;
      return {
        id: r.name.toLowerCase(),
        title: r.name,
        dates: year ? String(year) : "",
        year,
        bullets: r.description ? [r.description] : [],
        skills: [r.language, ...(r.topics ?? [])].filter(Boolean).slice(0, 5),
        links: {
          Live: r.homepage || `https://${SITE.github}.github.io/${r.name}`,
          GitHub: r.html_url,
        },
        image: `https://raw.githubusercontent.com/${SITE.github}/${r.name}/gh-pages/image.png`,
        stars: r.stargazers_count,
        featured: false,
      };
    })
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || b.stars - a.stars);

  // Featured projects keep the portfolio's order; their year is the latest one in their dates.
  featured.forEach((p) => {
    const years = (p.dates.match(/\d{4}/g) ?? []).map(Number);
    p.year = years.length ? Math.max(...years) : null;
  });

  return { config, projects: [...featured, ...pages] };
}
