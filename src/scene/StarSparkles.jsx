import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color } from "three";

// Sparkles orbiting a project screen. More stars, more sparkles (log scale),
// so a 450-star repo stands out without small ones looking empty.
export function sparkleCount(stars) {
  if (!stars || stars < 3) return 0;
  return Math.round(6 + 9 * Math.log10(stars));
}

export default function StarSparkles({ stars, width, height, reduceMotion }) {
  const count = sparkleCount(stars);
  const material = useRef();
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    const seed = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      seed[i * 3] = i / count;              // spread around the orbit
      seed[i * 3 + 1] = Math.random();      // speed / size variation
      seed[i * 3 + 2] = Math.random() * 6.28; // twinkle phase
    }
    g.setAttribute("position", new BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aSeed", new BufferAttribute(seed, 3));
    return g;
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSize: { value: [width * 0.5 + 0.28, height * 0.5 + 0.24] },
    uColor: { value: new Color("#ffd56b") },
    uPixel: { value: Math.min(window.devicePixelRatio || 1, 2) },
  }), [width, height]);

  useFrame((_, dt) => {
    const u = material.current?.uniforms;
    if (!u) return;
    if (!reduceMotion) u.uTime.value += Math.min(dt, 0.05);
    u.uSize.value = [width * 0.5 + 0.28, height * 0.5 + 0.24];
  });

  if (!count) return null;
  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        vertexShader={/* glsl */ `
          uniform float uTime;
          uniform vec2 uSize;
          uniform float uPixel;
          attribute vec3 aSeed;
          varying float vAlpha;
          void main() {
            float a = aSeed.x * 6.28318 + uTime * (0.25 + aSeed.y * 0.35);
            // Rounded-rectangle orbit hugging the screen.
            vec2 dir = vec2(cos(a), sin(a));
            vec2 p = sign(dir) * pow(abs(dir), vec2(0.45)) * uSize;
            vec3 pos = vec3(p, 0.05 + 0.08 * sin(uTime + aSeed.z));
            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            float twinkle = 0.5 + 0.5 * sin(uTime * (2.0 + aSeed.y * 3.0) + aSeed.z);
            gl_PointSize = uPixel * (5.0 + aSeed.y * 7.0) * (0.6 + 0.6 * twinkle) * (6.0 / -mv.z);
            vAlpha = 0.35 + 0.65 * twinkle;
            gl_Position = projectionMatrix * mv;
          }
        `}
        fragmentShader={/* glsl */ `
          uniform vec3 uColor;
          varying float vAlpha;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            // A small four-pointed star.
            float d = length(c);
            float cross = max(1.0 - smoothstep(0.0, 0.05, abs(c.x)) , 1.0 - smoothstep(0.0, 0.05, abs(c.y)));
            float glow = 1.0 - smoothstep(0.0, 0.5, d);
            float a = max(glow * glow, cross * (1.0 - smoothstep(0.1, 0.5, d)));
            if (a < 0.02) discard;
            gl_FragColor = vec4(uColor, a * vAlpha);
          }
        `}
      />
    </points>
  );
}
