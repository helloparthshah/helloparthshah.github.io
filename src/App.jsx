import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { loadData } from "./data";
import { SITE, COPY } from "./site.config";

const Stage = lazy(() => import("./Stage"));

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch (e) {
    return false;
  }
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isCompact = () => window.innerWidth < 760;

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [section, setSection] = useState({ section: "hero", index: -1 });
  const [listView, setListView] = useState(() => !hasWebGL());
  const [compact, setCompact] = useState(isCompact);
  const progress = useRef(0);
  const velocity = useRef(0);
  const bar = useRef(null);
  const reduceMotion = useMemo(reducedMotion, []);

  useEffect(() => { loadData().then(setData).catch(setError); }, []);
  useEffect(() => { if (data?.config?.name) document.title = `${data.config.name} · Projects`; }, [data]);
  useEffect(() => {
    const onResize = () => setCompact(isCompact());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Scroll position and speed, read once per frame.
  useEffect(() => {
    let raf, lastY = window.scrollY, lastT = performance.now();
    const tick = (t) => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const y = window.scrollY;
      progress.current = Math.min(1, Math.max(0, y / max));
      const dt = Math.max(1, t - lastT);
      const raw = Math.min(1.5, (Math.abs(y - lastY) / window.innerHeight) * (1000 / dt) * 0.35);
      velocity.current += (raw - velocity.current) * 0.12;
      lastY = y; lastT = t;
      if (bar.current) bar.current.style.transform = `scaleX(${progress.current})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (error) {
    return (
      <main className="message">
        <p>Couldn&apos;t load projects right now.</p>
        <a href={SITE.portfolioUrl}>Visit the portfolio instead →</a>
      </main>
    );
  }

  const config = data?.config;
  const projects = data?.projects ?? [];
  const links = config ? [
    ["Portfolio", SITE.portfolioUrl],
    ["Resume", `${SITE.portfolioUrl}/resume.pdf`],
    ...Object.entries(config.footerLinks ?? {}).filter(([k]) => /github|linkedin/i.test(k)),
  ] : [];
  const current = section.index >= 0 ? projects[section.index] : null;
  // Scroll length grows with the number of projects.
  const pages = 3 + projects.length * 0.9;

  return (
    <>
      <nav className="nav">
        <a className="brand" href={SITE.portfolioUrl}>{config?.name ?? ""}</a>
        <div className="nav-links">
          {links.map(([k, v]) => <a key={k} href={v} target="_blank" rel="noreferrer">{k}</a>)}
          {data && (
            <button type="button" className="view-toggle" onClick={() => { setListView((l) => !l); window.scrollTo(0, 0); }}>
              {listView ? COPY.backTo3d : COPY.listView}
            </button>
          )}
        </div>
      </nav>

      {listView ? (
        <ListView projects={projects} config={config} onOpen={setSelected} />
      ) : (
        <>
          {data && (
            <Suspense fallback={null}>
              <Stage data={data} progress={progress} velocity={velocity} onOpen={setSelected}
                onSection={setSection} reduceMotion={reduceMotion} compact={compact} />
            </Suspense>
          )}
          <div className="scroll-space" style={{ height: `${pages * 100}vh` }} aria-hidden="true" />
          <div className="progress"><div ref={bar} /></div>

          <header className={`hero ${section.section === "hero" ? "show" : ""}`}>
            <h1>{config?.name ?? " "}</h1>
            {config?.tagline && <p className="tagline">{config.tagline}</p>}
            <p className="hint">{data ? COPY.heroHint : "Loading projects…"} <span aria-hidden="true">↓</span></p>
          </header>

          <div className={`caption ${section.section === "work" ? "show" : ""}`} aria-live="polite">
            <span className="label">{COPY.workLabel} · {String(section.index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
            <strong>{current?.title ?? ""}</strong>
            <span className="sub">{current?.bullets?.[0] ?? COPY.workHint}</span>
            {current && <button type="button" onClick={() => setSelected(current)}>Details →</button>}
          </div>

          <footer className={`finale ${section.section === "finale" ? "show" : ""}`}>
            <h2>{COPY.finaleTitle}</h2>
            <p>{COPY.finaleText}</p>
            <div className="finale-links">
              {links.map(([k, v]) => <a key={k} href={v} target="_blank" rel="noreferrer">{k}</a>)}
            </div>
          </footer>

          {/* Plain content for search engines and screen readers. */}
          <section className="sr-only">
            <h2>Projects</h2>
            <ul>{projects.map((p) => <li key={p.id}><a href={Object.values(p.links)[0]}>{p.title}</a>: {p.bullets.join(" ")}</li>)}</ul>
          </section>
        </>
      )}

      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function ListView({ projects, config, onOpen }) {
  return (
    <main className="list">
      <h1>{config?.name}</h1>
      {config?.tagline && <p className="tagline">{config.tagline}</p>}
      <div className="grid">
        {projects.map((p) => (
          <button key={p.id} type="button" className="card" onClick={() => onOpen(p)}>
            {p.image && <img src={p.image} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
            <span className="card-body">
              <strong>{p.title}</strong>
              <span className="sub">{p.dates}</span>
              <span>{p.bullets[0]}</span>
            </span>
          </button>
        ))}
      </div>
    </main>
  );
}

function ProjectModal({ project, onClose }) {
  const close = useRef(null);
  useEffect(() => { close.current?.focus(); }, []);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={project.title} onClick={(e) => e.stopPropagation()}>
        <button ref={close} type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button>
        {project.image && <img src={project.image} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
        <div className="modal-body">
          <span className="label">{project.featured ? "Featured" : "GitHub Pages"}{project.dates ? ` · ${project.dates}` : ""}{project.stars ? ` · ★ ${project.stars}` : ""}</span>
          <h2>{project.title}</h2>
          <ul>{project.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
          {project.skills.length > 0 && <div className="chips">{project.skills.map((s) => <span key={s}>{s}</span>)}</div>}
          <div className="modal-links">
            {Object.entries(project.links).map(([k, v]) => <a key={k} href={v} target="_blank" rel="noreferrer">{k} ↗</a>)}
          </div>
        </div>
      </div>
    </div>
  );
}
