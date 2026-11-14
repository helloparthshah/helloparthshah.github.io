import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { AdditiveBlending, MathUtils } from "three";
import firaSemi from "@fontsource/fira-sans/files/fira-sans-latin-600-normal.woff?url";

// A huge year floating in the tunnel, framed by a glowing ring, that the
// camera flies through on its way to that year's projects.
export default function YearGate({ year, z, morph, compact }) {
  const group = useRef();
  const text = useRef();
  const ring = useRef();
  const radius = compact ? 2.4 : 3.4;
  const ringArgs = useMemo(() => [radius, 0.025, 8, 160], [radius]);

  useFrame(({ camera, clock }) => {
    if (!group.current) return;
    // Only shows while travelling between the slides on either side of it:
    // hidden when parked at the previous slide (about 7 units away) and
    // gone by the time the camera parks at the next one (about 1.4 away).
    const m = morph.current;
    const present = MathUtils.smoothstep(m, 0.6, 0.95) * (1 - MathUtils.smoothstep(m, 1.15, 1.4));
    const d = camera.position.z - z;
    const near = MathUtils.smoothstep(d, 1.6, 3.2);
    const far = 1 - MathUtils.smoothstep(d, 5.2, 6.6);
    const o = present * near * far;
    group.current.visible = o > 0.01;
    if (text.current) {
      text.current.strokeOpacity = o;
    }
    if (ring.current) {
      ring.current.material.opacity = o * 0.8;
      ring.current.rotation.z = clock.elapsedTime * 0.15;
    }
  });

  return (
    <group ref={group} position={[0, 0.3, z]}>
      <Text
        ref={text}
        font={firaSemi}
        fontSize={compact ? 1.5 : 2.4}
        letterSpacing={0.04}
        anchorX="center"
        anchorY="middle"
        color="#5ef2ff"
        strokeWidth="1.2%"
        strokeColor="#5ef2ff"
        fillOpacity={0}
        strokeOpacity={0}
        material-depthWrite={false}
      >
        {String(year)}
      </Text>
      <mesh ref={ring}>
        <torusGeometry args={ringArgs} />
        <meshBasicMaterial color="#8b5cff" transparent opacity={0} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
