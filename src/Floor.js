import { useRef, useState } from 'react'
import { DoubleSide } from 'three'
import { useSpring, animated, config } from "@react-spring/three";
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'

export default function Floor(props) {
    const ref = useRef()

    const [hovered, hover] = useState(false)

    const { scale } = useSpring({
        scale: hovered ? 1.5 : 1,
        config: config.wobbly
    });

    const { height, width } = useThree((state) => state.viewport)

    const data = useScroll();
    useFrame(() => {
        ref.current.position.y = -data.offset * height;
        ref.current.scale.x = data.range(0, 1 / 2) * 15;
        ref.current.scale.y = data.range(0, 1 / 2) * 15;
    });

    return (
        <animated.mesh
            {...props}
            ref={ref}
            receiveShadow
            onPointerOver={(event) => hover(true)}
            onPointerOut={(event) => hover(false)}>
            <circleGeometry args={[5, 100]} />
            {/* <meshStandardMaterial attach="material" color="hotpink" side={DoubleSide} /> */}
            <meshToonMaterial attach="material" color="hotpink" side={DoubleSide} />
        </animated.mesh>
    )
}