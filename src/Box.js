import { useRef, useState } from 'react'
import { useSpring, animated, config } from "@react-spring/three";
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import store from './store'

export default function Box(props) {
    const [pages, setPages] = store.useState("pages");

    const ref = useRef()
    const [hovered, hover] = useState(false)
    const [clicked, click] = useState(false)

    useFrame((state, delta) => (ref.current.rotation.x += delta))

    const { height, width } = useThree((state) => state.viewport)

    const data = useScroll();
    useFrame(() => {
        ref.current.position.y = -data.offset * height * (pages - 1) + 1;
    });

    const { color } = useSpring({
        color: hovered ? 'red' : '#a656a4',
        config: config.default
    })

    const { scale } = useSpring({
        scale: clicked ? 1.5 : 1,
        config: config.wobbly
    });
    return (
        <animated.mesh
            {...props}
            castShadow
            receiveShadow
            ref={ref}
            scale={scale}
            onClick={(event) => click(!clicked)}
            onPointerOver={(event) => hover(true)}
            onPointerOut={(event) => hover(false)}>
            <boxGeometry args={[1, 1, 1]} />
            <animated.meshStandardMaterial color={color} />
        </animated.mesh>
    )
}