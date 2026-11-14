import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color } from "three";

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;     // 0 = sphere, 1 = vortex, 2 = name
  uniform float uVel;       // smoothed scroll speed
  uniform vec3 uMouse;      // pointer projected into the scene
  uniform float uPixel;
  attribute vec3 aSphere;
  attribute vec3 aTunnel;
  attribute vec3 aText;
  attribute float aRand;
  varying vec3 vColor;
  varying float vAlpha;

  uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; uniform vec3 uC4;

  vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }

  void main() {
    // Each particle starts its transition a little later than the last.
    float seg = clamp(floor(uMorph), 0.0, 1.0);
    float f = clamp(uMorph - seg, 0.0, 1.0);
    float local = smoothstep(0.0, 1.0, clamp((f - aRand * 0.4) / 0.6, 0.0, 1.0));

    vec3 sphere = rotY(aSphere - vec3(0.0, 0.3, 0.0), uTime * 0.12) + vec3(0.0, 0.3, 0.0);
    // The sphere breathes.
    sphere *= 1.0 + 0.04 * sin(uTime * 1.3 + aRand * 6.28);
    vec3 a = seg < 0.5 ? sphere : aTunnel;
    vec3 b = seg < 0.5 ? aTunnel : aText;
    vec3 p = mix(a, b, local);

    // Swirl out mid-flight.
    float flight = sin(local * 3.14159);
    p += flight * vec3(sin(aRand * 91.0 + uTime), cos(aRand * 57.0 + uTime * 0.8), sin(aRand * 23.0)) * 1.6;

    // Idle drift.
    p += 0.035 * vec3(sin(uTime * 0.9 + aRand * 50.0), cos(uTime * 1.1 + aRand * 31.0), sin(uTime * 0.7 + aRand * 17.0));

    // Scroll speed blows the field outward from the corridor's axis.
    vec2 axis = p.xy - vec2(0.0, 0.3);
    p.xy += normalize(axis + 0.0001) * uVel * (0.4 + aRand * 1.6);

    // The pointer pushes particles away.
    vec3 toP = p - uMouse;
    float d = length(toP);
    p += normalize(toP + 0.0001) * (1.0 - smoothstep(0.0, 1.1, d)) * 0.7;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = -mv.z;
    gl_PointSize = uPixel * (1.0 + aRand * 2.2) * (1.0 + uVel * 1.5) * (20.0 / dist);

    // Colour shifts with formation and depth.
    vec3 cA = mix(uC1, uC2, aRand);
    vec3 cB = mix(uC2, uC3, fract(aRand * 3.0 + p.z * 0.03));
    vec3 cC = mix(uC3, uC4, aRand);
    vec3 from = seg < 0.5 ? cA : cB;
    vec3 to = seg < 0.5 ? cB : cC;
    vColor = mix(from, to, local);
    // Brighter while the vortex is formed, so the tunnel walls read clearly.
    float tunnelGlow = 1.0 + 1.6 * (1.0 - clamp(abs(uMorph - 1.0) * 2.0, 0.0, 1.0));
    vAlpha = (1.0 - smoothstep(2.0, 45.0, dist)) * smoothstep(0.2, 1.2, dist) * (0.16 + 0.22 * aRand) * tunnelGlow * (1.0 + uVel * 1.5 + flight * 0.8);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    gl_FragColor = vec4(vColor, vAlpha * (1.0 - smoothstep(0.05, 0.5, r)));
  }
`;

export default function Particles({ formations, morph, velocity, mouse, reduceMotion }) {
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    const n = formations.rand.length;
    // Positions are unused by the shader but give three.js a vertex count.
    g.setAttribute("position", new BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute("aSphere", new BufferAttribute(formations.sphere, 3));
    g.setAttribute("aTunnel", new BufferAttribute(formations.tunnel, 3));
    g.setAttribute("aText", new BufferAttribute(formations.text, 3));
    g.setAttribute("aRand", new BufferAttribute(formations.rand, 1));
    return g;
  }, [formations]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uVel: { value: 0 },
    uMouse: { value: mouse.current.clone() },
    uPixel: { value: Math.min(window.devicePixelRatio || 1, 2) },
    uC1: { value: new Color("#5ef2ff") },
    uC2: { value: new Color("#8b5cff") },
    uC3: { value: new Color("#ff4fd8") },
    uC4: { value: new Color("#ffb86b") },
  }), [mouse]);

  // React Three Fiber copies the uniforms prop onto the material, so update
  // the material's own uniforms rather than the object passed in.
  const material = useRef();
  useFrame((_, dt) => {
    const u = material.current?.uniforms;
    if (!u) return;
    if (!reduceMotion) u.uTime.value += Math.min(dt, 0.05);
    u.uMorph.value = morph.current;
    u.uVel.value = reduceMotion ? 0 : velocity.current;
    u.uMouse.value.copy(mouse.current);
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}
