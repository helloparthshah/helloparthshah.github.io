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
    const anim = useRef()

    const [hovered, hover] = useState(false)

    const { height, width } = useThree((state) => state.viewport)

    const positions = Array.from({ length: 500 }, (i) => [
        MathUtils.randFloatSpread(width),
        MathUtils.randFloatSpread(height * 2),
        MathUtils.randFloatSpread(10),
    ])
    const nPoints = 1000;

    const planePoints = useMemo(() => {
        const points = [];
        for (let i = 0; i < nPoints; i++) {
            points.push([
                (i % Math.sqrt(nPoints) / 3 - 6) * 1.7,
                0,
                (i / Math.sqrt(nPoints) / 3 - 6) * 1.7,
            ]);
        }
        return points;
    }, [width, height]);

    const distances = useMemo(() => {
        const distances = [];
        for (let i = 0; i < nPoints; i++) {
            distances.push(Math.sqrt(planePoints[i][0] * planePoints[i][0] + planePoints[i][2] * planePoints[i][2]));
        }
        return distances;
    }, [planePoints]);

    const roundedSquareWave = (t, delta, a, f) => {
        return ((2 * a) / Math.PI) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta)
    }

    useFrame((state) => {
        state.camera.position.x = state.mouse.x * 0.1 + 10;
        state.camera.position.y = state.mouse.y * 0.1 + 10;
    });
    const data = useScroll();
    useFrame(({ clock }) => {
        // change the scale of the material
        for (let i = 0; i < nPoints; ++i) {
            const t = clock.elapsedTime - distances[i] / 25
            const scale = roundedSquareWave(t, 0.1, 0.4, 0.25)
            anim.current.children[i].position.y = scale * 2
            // increase the scale of the points
            // anim.current.children[i].position.z *= 1 + scale / 20
            // anim.current.children[i].position.x *= 1 + scale / 20
            // change size of material
            // console.log(anim.current.geometry)
        }

        ref.current.scale.x = 1 + roundedSquareWave(clock.elapsedTime, 0.1, 0.4, 0.25);
        ref.current.scale.y = 1 + roundedSquareWave(clock.elapsedTime, 0.1, 0.4, 0.25);
        ref.current.scale.z = 1 + roundedSquareWave(clock.elapsedTime, 0.1, 0.4, 0.25);


        // anim.current.position.y = -data.offset * height * (pages - 1) + data.range(1 / pages, 2 / pages) * 15;


        ref.current.position.y = -data.offset * height * (pages - 1) + data.range(0, 1 / pages) * 15 - 15;
        // ref.current.position.x = data.range(2 / pages, 3 / pages) * 15;
        ref.current.material.transparent = true
        anim.current.material.transparent = true
        ref.current.material.opacity = 1 - data.range(2 / pages, 3 / pages)
        anim.current.material.opacity = 1 - data.range(0, 0.25 / pages)
        // ref.current.scale.x = data.range(1 / pages, 3 / pages) * 5 + 1;
        // ref.current.scale.y = data.range(1 / pages, 3 / pages) * 5 + 1;
        // ref.current.scale.z = data.range(1 / pages, 3 / pages) * 5 + 1;
        ref.current.rotation.y += 0.001;

        ref1.current.rotation.z += 0.01 / 2;
        ref1.current.rotation.y += 0.05 / 2;
        ref1.current.rotation.x += 0.03 / 2;
        ref1.current.position.y = -data.offset * height * (pages - 1) + 2;
        ref1.current.position.x = -data.range(3 / pages, 3.5 / pages) * width / 4 + width / 4;

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
                <meshPhongMaterial color="black" wireframe />
            </RoundedBox>
            <Torus ref={ref2} position={[-1, 0, height / 6]} castShadow>
                <meshPhongMaterial color="black" wireframe />
            </Torus>
            <Points ref={anim} limit={planePoints.length} position={[0, 0, 0]} castShadow>
                <PointMaterial transparent vertexColors size={7} sizeAttenuation={false} depthWrite={false} />
                {planePoints.map((point, i) => (
                    <Point key={i} color="black" position={point} />
                ))}
            </Points>
            <points {...props} ref={ref} castShadow>
                <sphereGeometry args={[3, 64, 64]} />
                <pointsMaterial color="black" size={0.1} sizeAttenuation />
            </points>
            {/* <Points limit={positions.length} position={[0, 0, 0]} castShadow>
                <PointMaterial transparent vertexColors size={5} sizeAttenuation={false} depthWrite={false} />
                {positions.map((position, i) => (
                    <Point key={i} position={position} color="black" />
                ))}
            </Points> */}
        </>
    )
}