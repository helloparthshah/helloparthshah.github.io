import {
  Canvas, useFrame
} from '@react-three/fiber'
import Box from './Box'
import Floor from './Floor'
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Scroll, ScrollControls } from '@react-three/drei'

export default function App() {
  return (
    <Canvas shadows>
      <ambientLight intensity={0.5} />
      <directionalLight castShadow
        shadow-mapSize-height={512}
        shadow-mapSize-width={512}
        intensity={0.5}
        position={[-5, 15, 10]}
      />
      <ScrollControls pages={2}>
        <Scroll>
          <Box position={[-1.2, 1, 0]} />
          <Box position={[1.2, 1, 0]} />
          <Floor position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} />
        </Scroll>
      </ScrollControls>
      <PerspectiveCamera position={[10, 10, 10]} makeDefault />
      <OrbitControls enabled={false} />
    </Canvas>
  )
}
