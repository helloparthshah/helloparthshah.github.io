import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import Scene from "./scene/Scene";

// The WebGL part, loaded lazily so the page's text appears first.
export default function Stage(props) {
  const [dpr, setDpr] = useState(Math.min(window.devicePixelRatio || 1, 1.75));
  return (
    <Canvas
      className="stage"
      dpr={dpr}
      camera={{ fov: 55, near: 0.1, far: 80, position: [0, 0.35, 7] }}
      gl={{ antialias: false, powerPreference: "high-performance", alpha: false }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(Math.min(window.devicePixelRatio || 1, 1.75))} />
      <Scene {...props} />
    </Canvas>
  );
}
