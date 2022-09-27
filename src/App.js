import {
  Canvas, useFrame
} from '@react-three/fiber'
import Box from './Box'
import Floor from './Floor'
import { OrbitControls, Scroll, ScrollControls, Text, PerspectiveCamera } from '@react-three/drei'
import { Suspense, useEffect, useRef, useState } from 'react'
import store from './store'

const Fallback = () => (
  <div class="loading">Loading...</div>
)

export default function App() {
  const [pages, setPages] = store.useState("pages");

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch('https://api.github.com/users/helloparthshah/repos?per_page=100')
      .then((response) => response.json())
      .then((data) => {
        let proj = [];
        for (let i = 0; i < data.length; i++) {
          if (data[i].has_pages) {
            proj.push(
              <div key={data[i].name} className={'page project'}>
                <a href={`https://helloparthshah.github.io/${data[i].name}`}>
                  <img
                    src={`https://raw.githubusercontent.com/helloparthshah/${data[i].name}/gh-pages/image.png`}
                    alt={data[i].name}
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null;
                      currentTarget.src = "https://miro.medium.com/max/1000/1*SykPj2Btn7Tff_I9S_oPNA.png";
                    }} />
                </a>
                <div className="project-info">
                  <a href={`https://github.com/helloparthshah/${data[i].name}`}>
                    <h1>{data[i].name}</h1>
                  </a>
                  {data[i].description}
                </div>
              </div >
            );
          }
        }
        // check if screen is mobile
        if (window.innerWidth < 768) {
          setPages(proj.length + 1);
        } else {
          setPages(Math.ceil(proj.length / 2) + 1);
        }
        setProjects(proj);
      });
  }, [])
  const html = useRef();

  return (
    <Canvas shadows camera={{
      zoom: 4, position: [10, 10, 10]
    }}>
      <ambientLight intensity={0.5} />
      <directionalLight castShadow
        shadow-mapSize-height={512}
        shadow-mapSize-width={512}
        intensity={0.5}
        position={[-5, 15, 10]}
      />
      <Suspense fallback={<Fallback />}>
        <ScrollControls pages={pages}>
          <Scroll>
            <Box position={[-1.2, 1, 0]} />
            <Box position={[1.2, 1, 0]} />
            <Floor position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} />
          </Scroll>
          <Scroll html>
            <div className={'page'}>
              <h1>Parth Shah</h1>
              <div>
                <a href="https://github.com/helloparthshah">
                  <h2>
                    GitHub
                  </h2>
                </a>
                <a href="https://linkedin.com/in/helloparthshah">
                  <h2>
                    LinkedIn
                  </h2>
                </a>
              </div>
            </div>
            <div className='projects'>
              {projects}
            </div>
          </Scroll>
        </ScrollControls>
      </Suspense>
      {/* <OrbitControls enabled={false} enableZoom={false} /> */}
    </Canvas >
  )
}
