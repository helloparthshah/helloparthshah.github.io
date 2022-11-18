import { useRef, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll, Points, Point, PointMaterial, RoundedBox, Torus } from '@react-three/drei'
import store from './store'
import { MathUtils } from 'three'

export default function Shapes(props) {
    const [pages, setPages] = store.useState("pages");

    const ref = useRef()
    const ref1 = useRef()
    const ref2 = useRef()

    const [hovered, hover] = useState(false)

    const { height, width } = useThree((state) => state.viewport)

    const positions = Array.from({ length: 500 }, (i) => [
        MathUtils.randFloatSpread(width),
        MathUtils.randFloatSpread(height * 2),
        MathUtils.randFloatSpread(10),
    ])

    const data = useScroll();
    useFrame((state, clock) => {
        // state.camera.position.x = state.mouse.x * 0.4 + 10;
        // state.camera.position.y = state.mouse.y * 0.4 + 10;
        // ref.current.position.y = -data.offset * height * (pages - 1)
        ref.current.position.y = -data.offset * height * (pages - 1) + data.range(0, 1 / pages) * 15 - 15;
        ref.current.scale.x = data.range(1 / pages, 3 / pages) * 5 + 1;
        ref.current.scale.y = data.range(1 / pages, 3 / pages) * 5 + 1;
        ref.current.scale.z = data.range(1 / pages, 3 / pages) * 5 + 1;
        ref.current.rotation.y += 0.001;

        ref1.current.rotation.z += 0.01 / 2;
        ref1.current.rotation.y += 0.05 / 2;
        ref1.current.rotation.x += 0.03 / 2;
        ref1.current.position.y = -data.offset * height * (pages - 1) + 2;
        ref1.current.position.x = -data.range(3 / pages, 3.5 / pages) * 6 + 7 + data.range(4 / pages, 4.5 / pages) * 6;

        ref2.current.rotation.z += 0.01;
        ref2.current.rotation.y += 0.01;
        ref2.current.position.y = -data.offset * height * (pages - 1) + 2;
        ref2.current.scale.x = data.range(8 / pages, 8.5 / pages) * 2;
        ref2.current.scale.y = data.range(8 / pages, 8.5 / pages) * 2;
        ref2.current.scale.z = data.range(8 / pages, 8.5 / pages) * 2;
    });

    return (
        <>
            <RoundedBox
                castShadow
                ref={ref1} args={[1, 1, 1]} radius={0.05} smoothness={4}>
                <meshPhongMaterial color="white" wireframe />
            </RoundedBox>
            <Torus ref={ref2} args={[1, 0.3, 16, 100]} position={[4, 0, 0]} castShadow>
                <meshPhongMaterial color="white" wireframe />
            </Torus>
            <points {...props} ref={ref} castShadow>
                <sphereGeometry args={[3, 64, 64]} />
                <pointsMaterial color="white" size={0.1} sizeAttenuation />
            </points>
            <Points limit={positions.length} position={[0, 0, 0]} castShadow>
                <PointMaterial transparent vertexColors size={5} sizeAttenuation={false} depthWrite={false} />
                {positions.map((position, i) => (
                    <Point key={i} position={position} color="white" />
                ))}
            </Points>
        </>
    )
}