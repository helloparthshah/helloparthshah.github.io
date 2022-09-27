import {
  Canvas, useFrame
} from '@react-three/fiber'
import Box from './Box'
import Floor from './Floor'
import { OrbitControls, Scroll, ScrollControls, Text, PerspectiveCamera } from '@react-three/drei'
import { Suspense, useEffect, useRef, useState } from 'react'
import store from './store'
import GitHubButton from 'react-github-btn'

const Fallback = () => (
  <div class="loading">Loading...</div>
)

export default function App() {
  const [pages, setPages] = store.useState("pages");

  const [projects, setProjects] = useState([]);

  const [experience, setExperience] = useState([]);

  useEffect(() => {
    fetch('https://api.github.com/users/helloparthshah/repos?per_page=100', {
      headers: {
      }
    })
      .then((response) => response.json())
      .then((data) => {
        let proj = [];
        if (data.length > 0) {
          data.sort((a, b) => {
            return a.stargazers_count < b.stargazers_count ? 1 : -1;
          });
        }
        for (let i = 0; i < data.length; i++) {
          if (data[i].has_pages) {
            proj.push(
              <div key={data[i].name} className={'page project'}>
                <img
                  className='project-image'
                  src={`https://raw.githubusercontent.com/helloparthshah/${data[i].name}/gh-pages/image.png`}
                  alt={data[i].name}
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null;
                    currentTarget.src = "https://miro.medium.com/max/1000/1*SykPj2Btn7Tff_I9S_oPNA.png";
                  }} />
                <div className="project-info">
                  <div className='project-name'>
                    <h1>{data[i].name}</h1>
                    <div className='project-links'>
                      <a href={`https://github.com/helloparthshah/${data[i].name}`}>
                        <img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="github" />
                      </a>
                      <GitHubButton href={`https://github.com/helloparthshah/${data[i].name}`} data-color-scheme="no-preference: dark; light: dark; dark: dark;" data-icon="octicon-star" data-size='large' data-show-count="true" aria-label="Star helloparthshah/zdfzf on GitHub">Star</GitHubButton>
                      <a href={`https://helloparthshah.github.io/${data[i].name}`}>
                        <img src="https://cdn2.iconfinder.com/data/icons/pittogrammi/142/95-512.png" alt="webpage" />
                      </a>
                    </div>
                  </div>
                  {data[i].description}
                </div>
              </div >
            );
          }
        }
        setProjects(proj);
        let expList = [];

        fetch('https://raw.githubusercontent.com/helloparthshah/resume/main/experience.json')
          .then((response) => response.text())
          .then((data) => {
            // parse json
            let exp = JSON.parse(data);
            console.log(exp);
            for (let i = 0; i < exp.length; i++) {
              expList.push(
                <div key={exp[i].company} className='experience'>
                  <div className='company-logo'>
                    <img src={exp[i].logo} />
                    <h4>{exp[i].company}</h4>
                  </div>
                  <div className='experience-info'>
                    <h2>{exp[i].post}</h2>
                    <h3>{exp[i].start} - {exp[i].end}</h3>
                  </div>
                  <div>
                    {exp[i].description}
                  </div>
                </div>
              );
            }
            setExperience(expList);
            if (window.innerWidth < 768) {
              setPages(Math.ceil(proj.length + expList.length / 2 + 1.5));
            } else {
              setPages(Math.ceil(proj.length / 2 + expList.length / 4 + 1.5));
              console.log(expList.length);
              console.log(proj.length / 2 + expList.length / 4 + 1.5);
            }
          });
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
              <div className='links'>
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
                <a href="https://media-exp1.licdn.com/dms/document/C562DAQErdLnkvDfptw/profile-treasury-document-pdf-analyzed/0/1662602663927?e=1665014400&v=beta&t=YvUKGuTPcIvKsw-qroE9rrdUiahsKna7m6YdBtKjqQ8">
                  <h2>
                    Resume
                  </h2>
                </a>
              </div>
            </div>
            <h1 className="exp">Experience</h1>
            <div className={'experiences'}>
              {experience}
            </div>
            <div className='projects'>
              <h1>Projects</h1>
              {projects}
            </div>
          </Scroll>
        </ScrollControls>
      </Suspense>
      {/* <OrbitControls enabled={false} enableZoom={false} /> */}
    </Canvas >
  )
}
