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

  // Every repo with GitHub Pages that is not already featured, most-starred first.
  let pages = [];
  try {
    const repos = await getJson(`https://api.github.com/users/${SITE.github}/repos?per_page=100&sort=updated`);
    const taken = new Set(featured.map((p) => p.id.replace(/-/g, "")));
    pages = repos
      .filter((r) => r.has_pages && !r.fork && r.name.toLowerCase() !== `${SITE.github}.github.io`)
      .filter((r) => !taken.has(r.name.toLowerCase().replace(/[^a-z0-9]/g, "")))
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .map((r) => ({
        id: r.name.toLowerCase(),
        title: r.name,
        dates: r.created_at ? new Date(r.created_at).getFullYear().toString() : "",
        bullets: r.description ? [r.description] : [],
        skills: [r.language, ...(r.topics ?? [])].filter(Boolean).slice(0, 5),
        links: {
          Live: r.homepage || `https://${SITE.github}.github.io/${r.name}`,
          GitHub: r.html_url,
        },
        image: `https://raw.githubusercontent.com/${SITE.github}/${r.name}/gh-pages/image.png`,
        stars: r.stargazers_count,
        featured: false,
      }));
  } catch (e) {
    // The GitHub API is rate limited for anonymous visitors; featured projects still show.
  }

  return { config, projects: [...featured, ...pages] };
}
