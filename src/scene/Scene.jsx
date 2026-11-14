import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, Vector3 } from "three";
import Particles from "./Particles";
import ProjectPanel from "./ProjectPanel";
import { buildFormations } from "./formations";

// Scroll progress (0..1) is split into acts: hero, explode into the vortex,
// fly past the projects, collapse into the name.
export const ACTS = { hero: 0.06, explode: 0.14, tunnelEnd: 0.86, finale: 0.94 };

export function useLayout(projectCount, compact) {
  return useMemo(() => {
    const spacing = compact ? 5 : 5.6;
    const firstZ = -8;
    const panels = Array.from({ length: projectCount }, (_, i) => {
      const side = i % 2 === 0 ? 1 : -1;
      return { z: firstZ - i * spacing, x: compact ? 0 : side * 2.25, side };
    });
    const lastZ = panels.length ? panels[panels.length - 1].z : firstZ;
    const tunnelStart = 2;
    const tunnelEnd = lastZ - 6;
    const finaleZ = tunnelEnd - 8;
    const keys = [
      [0, compact ? 8.5 : 7],
      [ACTS.hero, compact ? 8.5 : 7],
      [ACTS.explode, 1],
      [ACTS.tunnelEnd, lastZ - 1.5],
      [ACTS.finale, finaleZ + (compact ? 10 : 7.5)],
      [1, finaleZ + (compact ? 10 : 7.5)],
    ];
    return { panels, spacing, tunnelStart, tunnelEnd, finaleZ, keys };
  }, [projectCount, compact]);
}

function lerpKeys(keys, s) {
  for (let i = 1; i < keys.length; i++) {
    if (s <= keys[i][0]) {
      const [s0, v0] = keys[i - 1], [s1, v1] = keys[i];
      const t = s1 === s0 ? 1 : (s - s0) / (s1 - s0);
      return MathUtils.lerp(v0, v1, t * t * (3 - 2 * t));
    }
  }
  return keys[keys.length - 1][1];
}

export function morphFor(s) {
  if (s <= ACTS.hero) return 0;
  if (s <= ACTS.explode) return (s - ACTS.hero) / (ACTS.explode - ACTS.hero);
  if (s <= ACTS.tunnelEnd) return 1;
  if (s <= ACTS.finale) return 1 + (s - ACTS.tunnelEnd) / (ACTS.finale - ACTS.tunnelEnd);
  return 2;
}

function Rig({ progress, velocity, layout, camZ, mouse, morph, reduceMotion, onSection }) {
  const { camera, pointer } = useThree();
  const last = useRef("");
  const tmp = useMemo(() => new Vector3(), []);
  const smooth = useRef({ s: 0 });
  // Only push particles around once a real pointer has moved.
  const active = useRef(false);
  useEffect(() => {
    const on = () => { active.current = true; };
    window.addEventListener("pointermove", on, { once: true });
    return () => window.removeEventListener("pointermove", on);
  }, []);

  useFrame((_, dt) => {
    const k = reduceMotion ? 1 : 1 - Math.exp(-Math.min(dt, 0.05) * 3);
    smooth.current.s = MathUtils.lerp(smooth.current.s, progress.current, k);
    const s = smooth.current.s;
    morph.current = morphFor(s);

    const z = lerpKeys(layout.keys, s);
    const v = velocity.current;
    camera.position.set(
      MathUtils.lerp(camera.position.x, pointer.x * 0.45, k),
      MathUtils.lerp(camera.position.y, 0.35 + pointer.y * 0.25, k),
      z
    );
    camera.lookAt(camera.position.x * 0.4, 0.3, z - 8);
    // Warp: speed widens the lens and banks the camera inside the tunnel.
    const inTunnel = morph.current > 0.5 && morph.current < 1.5 ? 1 : 0;
    camera.rotation.z = inTunnel * (Math.sin(z * 0.08) * 0.08 + v * 0.25);
    const fov = 55 + v * 28;
    if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }
    camZ.current = z;

    // Pointer projected onto a plane in front of the camera.
    tmp.set(pointer.x, pointer.y, 0.5).unproject(camera).sub(camera.position).normalize();
    const depth = morph.current < 0.5 ? camera.position.z : morph.current > 1.5 ? camera.position.z - layout.finaleZ : 6;
    if (active.current) mouse.current.copy(camera.position).addScaledVector(tmp, depth / Math.max(0.2, -tmp.z));
    else mouse.current.set(0, 0, 1000);

    // Which section is in view, for the HTML overlay.
    let section = "hero";
    if (morph.current >= 0.5) section = "work";
    if (morph.current >= 1.5) section = "finale";
    let index = -1;
    if (section === "work") {
      let best = Infinity;
      layout.panels.forEach((p, i) => {
        const d = Math.abs(z - 5 - p.z);
        if (d < best && z - 1 > p.z) { best = d; index = i; }
      });
    }
    const key = `${section}:${index}`;
    if (key !== last.current) { last.current = key; onSection({ section, index }); }
  });
  return null;
}

export default function Scene({ data, progress, velocity, onOpen, onSection, reduceMotion, compact }) {
  const camZ = useRef(0);
  const mouse = useRef(new Vector3(0, 0, -100));
  const morph = useRef(0);
  const layout = useLayout(data.projects.length, compact);
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
        morph={morph} reduceMotion={reduceMotion} onSection={onSection} />
      <Particles formations={formations} morph={morph} velocity={velocity} mouse={mouse} reduceMotion={reduceMotion} />
      {data.projects.map((p, i) => (
        <ProjectPanel
          key={p.id}
          project={p}
          index={i}
          side={layout.panels[i].side}
          position={[layout.panels[i].x, 0.3, layout.panels[i].z]}
          size={compact ? [2.6, 1.46] : [3, 1.69]}
          camZ={camZ}
          morph={morph}
          onOpen={onOpen}
          compact={compact}
        />
      ))}
    </>
  );
}
