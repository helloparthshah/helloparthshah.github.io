import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { CanvasTexture, Color, MathUtils, SRGBColorSpace, Texture } from "three";
import firaSemi from "@fontsource/fira-sans/files/fira-sans-latin-600-normal.woff?url";
import monoMed from "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff?url";

// Decode and downscale screenshots off the main thread, so flying up to a
// panel doesn't stall a frame.
async function loadScreenshot(url) {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error(res.status);
  const blob = await res.blob();
  const bitmap = await createImageBitmap(blob, { resizeWidth: 1024, resizeQuality: "high", imageOrientation: "flipY" });
  const t = new Texture(bitmap);
  t.flipY = false;
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}

// Placeholder art for projects without a screenshot: the title on a dark board.
function placeholder(title) {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 576;
  const g = c.getContext("2d");
  const grad = g.createLinearGradient(0, 0, 1024, 576);
  grad.addColorStop(0, "#0d0f1f"); grad.addColorStop(1, "#2a1240");
  g.fillStyle = grad; g.fillRect(0, 0, 1024, 576);
  g.strokeStyle = "rgba(94,242,255,.18)"; g.lineWidth = 2;
  for (let x = 0; x < 1024; x += 48) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 576); g.stroke(); }
  g.fillStyle = "#f3f4ff";
  g.font = '600 72px "Fira Sans", sans-serif';
  g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(title.slice(0, 22), 512, 288);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/**
 * One project hanging in the corridor. Its screenshot loads only once the
 * camera gets close, tilts toward the pointer on hover, and opens on click.
 */
export default function ProjectPanel({ project, index, position, side, size = [3.2, 1.8], camZ, morph, onOpen, compact }) {
  const group = useRef();
  const frame = useRef();
  const [texture, setTexture] = useState(null);
  const gl = useThree((st) => st.gl);
  const [hovered, setHovered] = useState(false);
  const pointer = useRef([0, 0]);
  const accent = useMemo(() => new Color("#5ef2ff"), []);
  const idle = useMemo(() => new Color("#2a2d4a"), []);

  // Lazy-load the texture when the camera is within range.
  useFrame(() => {
    if (texture || !camZ.current) return;
    if (Math.abs(camZ.current - position[2]) < 22) {
      setTexture("loading");
      const fallback = () => setTexture(placeholder(project.title));
      if (!project.image) return fallback();
      loadScreenshot(project.image)
        .then((t) => { gl.initTexture(t); setTexture(t); })
        .catch(fallback);
    }
  });

  useEffect(() => () => {
    if (texture && texture.dispose) { texture.image?.close?.(); texture.dispose(); }
  }, [texture]);
  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "";
    return () => { document.body.style.cursor = ""; };
  }, [hovered]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const k = 1 - Math.exp(-dt * 8);
    const baseY = compact ? 0 : -side * 0.28;
    const [px, py] = hovered ? pointer.current : [0, 0];
    g.rotation.y = MathUtils.lerp(g.rotation.y, baseY + px * 0.25, k);
    g.rotation.x = MathUtils.lerp(g.rotation.x, -py * 0.18, k);
    // Panels only exist inside the vortex: they grow in as it forms and
    // shrink away as it collapses into the finale.
    const m = morph.current;
    const present = MathUtils.smoothstep(m, 0.55, 0.95) * (1 - MathUtils.smoothstep(m, 1.15, 1.45));
    g.visible = present > 0.01;
    const s = (hovered ? 1.05 : 1) * present;
    g.scale.x = g.scale.y = g.scale.z = MathUtils.lerp(g.scale.x, s, k);
    frame.current.color.lerp(hovered ? accent : idle, k);
  });

  const [w, h] = size;
  // Labels sit under the panel, aligned to its outer edge.
  const anchor = compact || side < 0 ? "left" : "right";
  const textX = anchor === "left" ? -w / 2 : w / 2;
  const textY = -h / 2 - 0.22;
  const tex = texture && texture !== "loading" ? texture : null;

  return (
    <group ref={group} position={position}>
      <mesh position={[0, 0, -0.03]} >
        <planeGeometry args={[w + 0.12, h + 0.12]} />
        <meshBasicMaterial ref={frame} color="#2a2d4a" toneMapped={false} />
      </mesh>
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        onPointerMove={(e) => { if (e.uv) pointer.current = [(e.uv.x - 0.5) * 2, (e.uv.y - 0.5) * 2]; }}
        onClick={(e) => { e.stopPropagation(); onOpen(project); }}
      >
        <planeGeometry args={[w, h]} />
        {/* Keyed so the shader is rebuilt once the screenshot arrives. */}
        <meshBasicMaterial key={tex ? tex.uuid : "empty"} map={tex} color={tex ? "#ffffff" : "#0d0f1a"} toneMapped={false} />
      </mesh>
      {!compact && <>
      <Text font={monoMed} fontSize={0.12} letterSpacing={0.08} color="#5ef2ff"
        anchorX={anchor} anchorY="top" position={[textX, textY, 0]}>
        {`${String(index + 1).padStart(2, "0")}  ${project.featured ? "FEATURED" : "GITHUB PAGES"}`}
      </Text>
      <Text font={firaSemi} fontSize={compact ? 0.26 : 0.3} color="#f3f4ff" maxWidth={w}
        anchorX={anchor} anchorY="top" position={[textX, textY - 0.2, 0]} textAlign={anchor}>
        {project.title}
      </Text>
      {project.dates && (
        <Text font={monoMed} fontSize={0.1} color="#8c90b0" letterSpacing={0.04}
          anchorX={anchor} anchorY="top" position={[textX, textY - (compact ? 0.56 : 0.62), 0]}>
          {project.dates.toUpperCase()}
        </Text>
      )}
      </>}
    </group>
  );
}
