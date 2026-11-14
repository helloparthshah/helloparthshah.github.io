import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, Vector3 } from "three";
import Particles from "./Particles";
import ProjectPanel from "./ProjectPanel";
import YearGate from "./YearGate";
import { buildFormations } from "./formations";

// The scroll is a series of slides: the hero, one per project, and the finale.
// Each slide parks the camera somewhere; scroll snapping lands on them and the
// camera eases between neighbours. `morph` drives the particles:
// 0 = sphere (hero), 1 = vortex (projects), 2 = name (finale).
export function useLayout(projects, compact) {
  const projectCount = projects.length;
  const yearsKey = projects.map((p) => `${p.featured ? "f" : ""}${p.year ?? ""}`).join(",");
  return useMemo(() => {
    const spacing = compact ? 5 : 5.6;
    const firstZ = -8;
    const panels = Array.from({ length: projectCount }, (_, i) => {
      const side = i % 2 === 0 ? 1 : -1;
      return { z: firstZ - i * spacing, x: compact ? 0 : side * 2.25, side };
    });
    const lastZ = panels.length ? panels[panels.length - 1].z : firstZ;
    // A year gate before the first non-featured project of each year.
    const years = [];
    projects.forEach((p, i) => {
      if (p.featured || !p.year) return;
      const prev = projects[i - 1];
      if (!prev || prev.featured || prev.year !== p.year) {
        years.push({ year: p.year, z: panels[i].z + spacing * 0.5 });
      }
    });
    const tunnelStart = 2;
    const tunnelEnd = lastZ - 6;
    const finaleZ = tunnelEnd - 8;

    const heroZ = compact ? 8.5 : 7;
    const slides = [
      { pos: [0, 0.35, heroZ], look: [0, 0.3, heroZ - 8], morph: 0 },
      ...panels.map((p) => ({
        pos: [compact ? 0 : p.x * 0.4, 0.35, p.z + (compact ? 4.6 : 4.2)],
        look: [compact ? 0 : p.x * 0.85, 0.3, p.z],
        morph: 1,
      })),
      { pos: [0, 0.35, finaleZ + (compact ? 10 : 7.5)], look: [0, 0.5, finaleZ], morph: 2 },
    ];
    return { panels, spacing, tunnelStart, tunnelEnd, finaleZ, slides, years };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectCount, yearsKey, compact]);
}

const ease = (t) => t * t * (3 - 2 * t);

function Rig({ progress, velocity, layout, camZ, mouse, morph, reduceMotion, compact, onSection }) {
  const { camera, pointer } = useThree();
  const last = useRef("");
  const tmp = useMemo(() => new Vector3(), []);
  const pos = useMemo(() => new Vector3(), []);
  const look = useMemo(() => new Vector3(), []);
  const lookNow = useRef(null);
  const smooth = useRef(0);
  // Only push particles around once a real pointer has moved.
  const active = useRef(false);
  useEffect(() => {
    const on = () => { active.current = true; };
    window.addEventListener("pointermove", on, { once: true });
    return () => window.removeEventListener("pointermove", on);
  }, []);

  useFrame((_, dt) => {
    const { slides } = layout;
    const n = slides.length;
    const target = progress.current * (n - 1);
    const k = reduceMotion ? 1 : 1 - Math.exp(-Math.min(dt, 0.05) * 6);
    smooth.current = MathUtils.lerp(smooth.current, target, k);
    const f = Math.min(n - 1, Math.max(0, smooth.current));
    const i = Math.min(n - 2, Math.floor(f));
    const t = ease(f - i);
    const a = slides[i], b = slides[i + 1];

    morph.current = MathUtils.lerp(a.morph, b.morph, t);
    pos.set(...a.pos).lerp(tmp.set(...b.pos), t);
    look.set(...a.look).lerp(tmp.set(...b.look), t);
    if (!lookNow.current) lookNow.current = look.clone();
    lookNow.current.copy(look);

    const v = reduceMotion ? 0 : velocity.current;
    const sway = reduceMotion || compact ? 0 : 1;
    camera.position.set(pos.x + pointer.x * 0.35 * sway, pos.y + pointer.y * 0.2 * sway, pos.z);
    camera.lookAt(lookNow.current);
    // A little bank and lens warp while travelling, never on phones.
    const travel = Math.sin(Math.PI * (f - Math.floor(f)));
    camera.rotation.z += sway * (morph.current > 0.5 && morph.current < 1.5 ? travel * 0.04 * Math.sign(b.pos[0] - a.pos[0] || 1) : 0);
    const fov = 55 + sway * Math.min(v, 1) * 16;
    if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }
    camZ.current = pos.z;

    // Pointer projected into the scene for the particle push.
    if (active.current) {
      tmp.set(pointer.x, pointer.y, 0.5).unproject(camera).sub(camera.position).normalize();
      const depth = Math.max(1, camera.position.z - lookNow.current.z);
      mouse.current.copy(camera.position).addScaledVector(tmp, depth / Math.max(0.2, -tmp.z));
    } else mouse.current.set(0, 0, 1000);

    // Which slide is in view, for the HTML overlay.
    const r = Math.round(f);
    const section = r === 0 ? "hero" : r === n - 1 ? "finale" : "work";
    const index = section === "work" ? r - 1 : -1;
    const key = `${section}:${index}`;
    if (key !== last.current) { last.current = key; onSection({ section, index }); }
  });
  return null;
}

export default function Scene({ data, progress, velocity, onOpen, onSection, reduceMotion, compact, active = -1 }) {
  const camZ = useRef(0);
  const mouse = useRef(new Vector3(0, 0, -100));
  const morph = useRef(0);
  const layout = useLayout(data.projects, compact);
  const formations = useMemo(
    () => buildFormations({
      count: compact ? 26000 : 60000,
      tunnelStart: layout.tunnelStart,
      tunnelEnd: layout.tunnelEnd,
      finaleZ: layout.finaleZ,
      name: data.config.name,
      compact,
    }),
    [layout, data.config.name, compact]
  );

  return (
    <>
      <color attach="background" args={["#05060a"]} />
      <fog attach="fog" args={["#05060a", 10, 30]} />
      <Rig progress={progress} velocity={velocity} layout={layout} camZ={camZ} mouse={mouse}
        morph={morph} reduceMotion={reduceMotion} compact={compact} onSection={onSection} />
      <Particles formations={formations} morph={morph} velocity={velocity} mouse={mouse} reduceMotion={reduceMotion} />
      {layout.years.map((y) => (
        <YearGate key={y.year} year={y.year} z={y.z} morph={morph} compact={compact} />
      ))}
      {data.projects.map((p, i) => (
        <ProjectPanel
          key={p.id}
          project={p}
          index={i}
          side={layout.panels[i].side}
          position={[layout.panels[i].x, compact ? 0.75 : 0.3, layout.panels[i].z]}
          size={compact ? [2.6, 1.46] : [3, 1.69]}
          camZ={camZ}
          morph={morph}
          onOpen={onOpen}
          compact={compact}
          focused={i === active}
          reduceMotion={reduceMotion}
        />
      ))}
    </>
  );
}
