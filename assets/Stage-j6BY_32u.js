import{r as e}from"./rolldown-runtime-XKyaHtl9.js";import{_ as t,a as n,c as r,d as i,f as a,h as o,i as s,l as c,m as l,n as u,o as d,p as f,r as p,s as m,t as h,u as g}from"./r3f-BxKHd2vl.js";var _=e(t(),1),v=o(),y=`
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
`,b=`
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    gl_FragColor = vec4(vColor, vAlpha * (1.0 - smoothstep(0.05, 0.5, r)));
  }
`;function x({formations:e,morph:t,velocity:n,mouse:r,reduceMotion:i}){let a=(0,_.useMemo)(()=>{let t=new m,n=e.rand.length;return t.setAttribute(`position`,new d(new Float32Array(n*3),3)),t.setAttribute(`aSphere`,new d(e.sphere,3)),t.setAttribute(`aTunnel`,new d(e.tunnel,3)),t.setAttribute(`aText`,new d(e.text,3)),t.setAttribute(`aRand`,new d(e.rand,1)),t},[e]),o=(0,_.useMemo)(()=>({uTime:{value:0},uMorph:{value:0},uVel:{value:0},uMouse:{value:r.current.clone()},uPixel:{value:Math.min(window.devicePixelRatio||1,2)},uC1:{value:new c(`#5ef2ff`)},uC2:{value:new c(`#8b5cff`)},uC3:{value:new c(`#ff4fd8`)},uC4:{value:new c(`#ffb86b`)}}),[r]),l=(0,_.useRef)();return s((e,a)=>{let o=l.current?.uniforms;o&&(i||(o.uTime.value+=Math.min(a,.05)),o.uMorph.value=t.current,o.uVel.value=i?0:n.current,o.uMouse.value.copy(r.current))}),(0,v.jsx)(`points`,{geometry:a,frustumCulled:!1,children:(0,v.jsx)(`shaderMaterial`,{ref:l,vertexShader:y,fragmentShader:b,uniforms:o,transparent:!0,depthWrite:!1,blending:2})})}var S=`/assets/fira-sans-latin-600-normal-YXoF73I2.woff`,C=`/assets/jetbrains-mono-latin-500-normal-CmO7R2XR.woff`;function w(e){return!e||e<3?0:Math.round(6+9*Math.log10(e))}function T({stars:e,width:t,height:n,reduceMotion:r}){let i=w(e),a=(0,_.useRef)(),o=(0,_.useMemo)(()=>{let e=new m,t=new Float32Array(i*3);for(let e=0;e<i;e++)t[e*3]=e/i,t[e*3+1]=Math.random(),t[e*3+2]=Math.random()*6.28;return e.setAttribute(`position`,new d(new Float32Array(i*3),3)),e.setAttribute(`aSeed`,new d(t,3)),e},[i]),l=(0,_.useMemo)(()=>({uTime:{value:0},uSize:{value:[t*.5+.28,n*.5+.24]},uColor:{value:new c(`#ffd56b`)},uPixel:{value:Math.min(window.devicePixelRatio||1,2)}}),[t,n]);return s((e,i)=>{let o=a.current?.uniforms;o&&(r||(o.uTime.value+=Math.min(i,.05)),o.uSize.value=[t*.5+.28,n*.5+.24])}),i?(0,v.jsx)(`points`,{geometry:o,frustumCulled:!1,children:(0,v.jsx)(`shaderMaterial`,{ref:a,uniforms:l,transparent:!0,depthWrite:!1,blending:2,vertexShader:`
          uniform float uTime;
          uniform vec2 uSize;
          uniform float uPixel;
          attribute vec3 aSeed;
          varying float vAlpha;
          void main() {
            float a = aSeed.x * 6.28318 + uTime * (0.25 + aSeed.y * 0.35);
            // Rounded-rectangle orbit hugging the screen.
            vec2 dir = vec2(cos(a), sin(a));
            vec2 p = sign(dir) * pow(abs(dir), vec2(0.45)) * uSize;
            vec3 pos = vec3(p, 0.05 + 0.08 * sin(uTime + aSeed.z));
            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            float twinkle = 0.5 + 0.5 * sin(uTime * (2.0 + aSeed.y * 3.0) + aSeed.z);
            gl_PointSize = uPixel * (5.0 + aSeed.y * 7.0) * (0.6 + 0.6 * twinkle) * (6.0 / -mv.z);
            vAlpha = 0.35 + 0.65 * twinkle;
            gl_Position = projectionMatrix * mv;
          }
        `,fragmentShader:`
          uniform vec3 uColor;
          varying float vAlpha;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            // A small four-pointed star.
            float d = length(c);
            float cross = max(1.0 - smoothstep(0.0, 0.05, abs(c.x)) , 1.0 - smoothstep(0.0, 0.05, abs(c.y)));
            float glow = 1.0 - smoothstep(0.0, 0.5, d);
            float a = max(glow * glow, cross * (1.0 - smoothstep(0.1, 0.5, d)));
            if (a < 0.02) discard;
            gl_FragColor = vec4(uColor, a * vAlpha);
          }
        `})}):null}async function E(e){let t=await fetch(e,{mode:`cors`});if(!t.ok)throw Error(t.status);let n=await t.blob(),r=await createImageBitmap(n,{resizeWidth:1024,resizeQuality:`high`,imageOrientation:`flipY`}),a=new f(r);return a.flipY=!1,a.colorSpace=i,a.anisotropy=4,a.needsUpdate=!0,a}var D=(()=>{let e=new a;for(let t=0;t<10;t++){let n=t%2?.024:.058,r=Math.PI/2+t*Math.PI/5,i=Math.cos(r)*n,a=Math.sin(r)*n;t?e.lineTo(i,a):e.moveTo(i,a)}return e})();function O(e){let t=document.createElement(`canvas`);t.width=1024,t.height=576;let n=t.getContext(`2d`),a=n.createLinearGradient(0,0,1024,576);a.addColorStop(0,`#0d0f1f`),a.addColorStop(1,`#2a1240`),n.fillStyle=a,n.fillRect(0,0,1024,576),n.strokeStyle=`rgba(94,242,255,.18)`,n.lineWidth=2;for(let e=0;e<1024;e+=48)n.beginPath(),n.moveTo(e,0),n.lineTo(e,576),n.stroke();n.fillStyle=`#f3f4ff`,n.font=`600 72px "Fira Sans", sans-serif`,n.textAlign=`center`,n.textBaseline=`middle`,n.fillText(e.slice(0,22),512,288);let o=new r(t);return o.colorSpace=i,o}function k({project:e,index:t,position:r,side:i,size:a=[3.2,1.8],camZ:o,morph:l,onOpen:d,compact:f,focused:p,reduceMotion:m}){let h=(0,_.useRef)(),y=(0,_.useRef)(),[b,x]=(0,_.useState)(null),w=n(e=>e.gl),[k,A]=(0,_.useState)(!1),j=(0,_.useRef)([0,0]),M=(0,_.useMemo)(()=>new c(`#5ef2ff`),[]),N=(0,_.useMemo)(()=>new c(`#2a2d4a`),[]);s(()=>{if(!b&&o.current&&Math.abs(o.current-r[2])<22){x(`loading`);let t=()=>x(O(e.title));if(!e.images.length)return t();e.images.reduce((e,t)=>e.catch(()=>E(t)),Promise.reject()).then(e=>{w.initTexture(e),x(e)}).catch(t)}}),(0,_.useEffect)(()=>()=>{b&&b.dispose&&(b.image?.close?.(),b.dispose())},[b]),(0,_.useEffect)(()=>(document.body.style.cursor=k?`pointer`:``,()=>{document.body.style.cursor=``}),[k]),s((e,t)=>{let n=h.current;if(!n)return;let a=1-Math.exp(-t*8),s=f?0:-i*.28,[c,u]=k?j.current:[0,0];n.rotation.y=g.lerp(n.rotation.y,s+c*.25,a),n.rotation.x=g.lerp(n.rotation.x,-u*.18,a);let d=l.current,p=g.smoothstep(d,.55,.95)*(1-g.smoothstep(d,1.15,1.45)),m=o.current-r[2],_=f?g.smoothstep(m,1.6,3.9):g.smoothstep(m,.8,2.6);n.position.y=r[1]-(1-_)*1.2;let v=(k?1.05:1)*p*_;n.visible=v>.01||n.scale.x>.01;let b=m<3?1-Math.exp(-t*20):a;n.scale.x=n.scale.y=n.scale.z=g.lerp(n.scale.x,v,b),y.current.color.lerp(k?M:N,a)});let P=b&&b!==`loading`?b:null,[F,I]=a,L=P?.image,R=L&&L.width&&L.height?L.width/L.height:F/I,z=Math.min(2.4,Math.max(.55,R)),B,V;if(z>=F/I?(B=F,V=F/z):(V=Math.min(I*1.35,F/z),B=V*z),P){let e=Math.min(1,z/R),t=Math.min(1,R/z);P.repeat.set(e,t),P.offset.set((1-e)/2,1-t)}let H=f||i<0?`left`:`right`,U=H===`left`?-B/2:B/2,W=-V/2-.22;return(0,v.jsxs)(`group`,{ref:h,position:r,children:[(0,v.jsxs)(`mesh`,{position:[0,0,-.03],children:[(0,v.jsx)(`planeGeometry`,{args:[B+.12,V+.12]}),(0,v.jsx)(`meshBasicMaterial`,{ref:y,color:`#2a2d4a`,toneMapped:!1})]}),(0,v.jsxs)(`mesh`,{onPointerOver:e=>{e.stopPropagation(),A(!0)},onPointerOut:()=>A(!1),onPointerMove:e=>{e.uv&&(j.current=[(e.uv.x-.5)*2,(e.uv.y-.5)*2])},onClick:t=>{t.stopPropagation(),d(e)},children:[(0,v.jsx)(`planeGeometry`,{args:[B,V]}),(0,v.jsx)(`meshBasicMaterial`,{map:P,color:P?`#ffffff`:`#0d0f1a`,toneMapped:!1},P?P.uuid:`empty`)]}),e.stars>0&&(0,v.jsxs)(`group`,{position:[B/2-.06,V/2+.06,.02],children:[(0,v.jsxs)(`mesh`,{position:[-.2,0,-.005],children:[(0,v.jsx)(`planeGeometry`,{args:[.46,.2]}),(0,v.jsx)(`meshBasicMaterial`,{color:`#1a1406`,transparent:!0,opacity:.85,toneMapped:!1})]}),(0,v.jsxs)(`mesh`,{position:[-.35,0,0],children:[(0,v.jsx)(`shapeGeometry`,{args:[D]}),(0,v.jsx)(`meshBasicMaterial`,{color:`#ffd56b`,toneMapped:!1})]}),(0,v.jsx)(u,{font:C,fontSize:.11,color:`#ffd56b`,anchorX:`right`,anchorY:`middle`,position:[-.06,0,0],children:e.stars>=1e3?`${(e.stars/1e3).toFixed(1)}k`:String(e.stars)})]}),(0,v.jsx)(T,{stars:e.stars,width:B,height:V,reduceMotion:m}),!f&&!p&&(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(u,{font:C,fontSize:.12,letterSpacing:.08,color:`#5ef2ff`,anchorX:H,anchorY:`top`,position:[U,W,0],children:`${String(t+1).padStart(2,`0`)}  ${e.featured?`FEATURED`:`GITHUB PAGES`}`}),(0,v.jsx)(u,{font:S,fontSize:f?.26:.3,color:`#f3f4ff`,maxWidth:B,anchorX:H,anchorY:`top`,position:[U,W-.2,0],textAlign:H,children:e.title}),e.dates&&(0,v.jsx)(u,{font:C,fontSize:.1,color:`#8c90b0`,letterSpacing:.04,anchorX:H,anchorY:`top`,position:[U,W-(f?.56:.62),0],children:e.dates.toUpperCase()})]})]})}function A({year:e,z:t,morph:n,compact:r,parkedNext:i,parkedPrev:a}){let o=(0,_.useRef)(),c=(0,_.useRef)(),l=(0,_.useRef)(),d=r?1.25:3.4,f=(0,_.useMemo)(()=>[d,r?.012:.025,8,160],[d,r]);return s(({camera:e,clock:r})=>{if(!o.current)return;let s=n.current,u=g.smoothstep(s,.6,.95)*(1-g.smoothstep(s,1.15,1.4)),d=e.position.z-t,f=g.smoothstep(d,i+.3,i+1.4),p=1-g.smoothstep(d,a-1.6,a-.3),m=u*f*p;o.current.visible=m>.01,c.current&&(c.current.strokeOpacity=m),l.current&&(l.current.material.opacity=m*.8,l.current.rotation.z=r.elapsedTime*.15)}),(0,v.jsxs)(`group`,{ref:o,position:[0,.3,t],children:[(0,v.jsx)(u,{ref:c,font:S,fontSize:r?.62:2.4,letterSpacing:.04,anchorX:`center`,anchorY:`middle`,color:`#5ef2ff`,strokeWidth:`1.2%`,strokeColor:`#5ef2ff`,fillOpacity:0,strokeOpacity:0,"material-depthWrite":!1,children:String(e)}),(0,v.jsxs)(`mesh`,{ref:l,children:[(0,v.jsx)(`torusGeometry`,{args:f}),(0,v.jsx)(`meshBasicMaterial`,{color:`#8b5cff`,transparent:!0,opacity:0,blending:2,depthWrite:!1,toneMapped:!1})]})]})}function j(e,t,n,r=`Fira Sans`){let i=document.createElement(`canvas`);i.width=1400,i.height=360;let a=i.getContext(`2d`);a.fillStyle=`#fff`,a.textAlign=`center`,a.textBaseline=`middle`;let o=260;for(a.font=`600 ${o}px "${r}", Arial, sans-serif`;a.measureText(e).width>i.width*.92&&o>40;)o-=10,a.font=`600 ${o}px "${r}", Arial, sans-serif`;a.fillText(e,i.width/2,i.height/2);let s=a.getImageData(0,0,i.width,i.height).data,c=[];for(let e=0;e<i.height;e+=2)for(let t=0;t<i.width;t+=2)s[(e*i.width+t)*4+3]>128&&c.push([t,e]);let l=n/i.width,u=new Float32Array(t*3);for(let e=0;e<t;e++){let[t,n]=c.length?c[Math.floor(Math.random()*c.length)]:[i.width/2,i.height/2];u[e*3]=(t-i.width/2)*l+(Math.random()-.5)*.02,u[e*3+1]=-(n-i.height/2)*l+(Math.random()-.5)*.02,u[e*3+2]=(Math.random()-.5)*.25}return u}function M({count:e,tunnelStart:t,tunnelEnd:n,finaleZ:r,name:i,compact:a}){let o=new Float32Array(e*3),s=new Float32Array(e*3),c=new Float32Array(e),l=a?2.6:4.2;for(let r=0;r<e;r++){c[r]=Math.random();let e=Math.random()*2-1,i=Math.random()*Math.PI*2,u=Math.sqrt(1-e*e),d=(a?1.6:2.1)*(.92+Math.random()**3*.16);o[r*3]=u*Math.cos(i)*d,o[r*3+1]=u*Math.sin(i)*d+.3,o[r*3+2]=e*d;let f=t-Math.random()*(t-n),p=Math.floor(Math.random()*9)/9*Math.PI*2+f*.22+(Math.random()-.5)*.45,m=l*(.8+Math.random()*.5)+Math.random()**4*3;s[r*3]=Math.cos(p)*m,s[r*3+1]=Math.sin(p)*m*.8+.3,s[r*3+2]=f}let u=j(i.toUpperCase(),e,a?4.2:7.5);for(let t=0;t<e;t++)u[t*3+1]+=.5,u[t*3+2]+=r;return{sphere:o,tunnel:s,text:u,rand:c}}function N(e,t){let n=e.length,r=e.map(e=>`${e.featured?`f`:``}${e.year??``}`).join(`,`);return(0,_.useMemo)(()=>{let r=t?5:5.6,i=Array.from({length:n},(e,n)=>{let i=n%2==0?1:-1;return{z:-8-n*r,x:t?0:i*2.25,side:i}}),a=i.length?i[i.length-1].z:-8,o=[];e.forEach((t,n)=>{if(t.featured||!t.year)return;let a=e[n-1];(!a||a.featured||a.year!==t.year)&&o.push({year:t.year,z:i[n].z+r*.5})});let s=a-6,c=s-8,l=t?8.5:7,u=t?4.6:4.2;return{panels:i,spacing:r,tunnelStart:2,tunnelEnd:s,finaleZ:c,slides:[{pos:[0,.35,l],look:[0,.3,l-8],morph:0},...i.map(e=>({pos:[t?0:e.x*.4,.35,e.z+u],look:[t?0:e.x*.85,.3,e.z],morph:1})),{pos:[0,.35,c+(t?10:7.5)],look:[0,.5,c],morph:2}],years:o,viewDist:u}},[n,r,t])}var P=e=>e*e*(3-2*e);function F({progress:e,velocity:t,layout:r,camZ:i,mouse:a,morph:o,reduceMotion:c,compact:u,onSection:d}){let{camera:f,pointer:p}=n(),m=(0,_.useRef)(``),h=(0,_.useMemo)(()=>new l,[]),v=(0,_.useMemo)(()=>new l,[]),y=(0,_.useMemo)(()=>new l,[]),b=(0,_.useRef)(null),x=(0,_.useRef)(0),S=(0,_.useRef)(!1);return(0,_.useEffect)(()=>{let e=()=>{S.current=!0};return window.addEventListener(`pointermove`,e,{once:!0}),()=>window.removeEventListener(`pointermove`,e)},[]),s((n,s)=>{let{slides:l}=r,_=l.length,C=e.current*(_-1),w=c?1:1-Math.exp(-Math.min(s,.05)*6);x.current=g.lerp(x.current,C,w);let T=Math.min(_-1,Math.max(0,x.current)),E=Math.min(_-2,Math.floor(T)),D=P(T-E),O=l[E],k=l[E+1];o.current=g.lerp(O.morph,k.morph,D),v.set(...O.pos).lerp(h.set(...k.pos),D),y.set(...O.look).lerp(h.set(...k.look),D),b.current||(b.current=y.clone()),b.current.copy(y);let A=c?0:t.current,j=c||u?0:1;f.position.set(v.x+p.x*.35*j,v.y+p.y*.2*j,v.z),f.lookAt(b.current);let M=Math.sin(Math.PI*(T-Math.floor(T)));f.rotation.z+=j*(o.current>.5&&o.current<1.5?M*.04*Math.sign(k.pos[0]-O.pos[0]||1):0);let N=55+j*Math.min(A,1)*16;if(Math.abs(f.fov-N)>.01&&(f.fov=N,f.updateProjectionMatrix()),i.current=v.z,S.current){h.set(p.x,p.y,.5).unproject(f).sub(f.position).normalize();let e=Math.max(1,f.position.z-b.current.z);a.current.copy(f.position).addScaledVector(h,e/Math.max(.2,-h.z))}else a.current.set(0,0,1e3);let F=Math.round(T),I=F===0?`hero`:F===_-1?`finale`:`work`,L=I===`work`?F-1:-1,R=`${I}:${L}`;R!==m.current&&(m.current=R,d({section:I,index:L}))}),null}function I({data:e,progress:t,velocity:n,onOpen:r,onSection:i,reduceMotion:a,compact:o,active:s=-1}){let c=(0,_.useRef)(0),u=(0,_.useRef)(new l(0,0,-100)),d=(0,_.useRef)(0),f=N(e.projects,o),p=(0,_.useMemo)(()=>M({count:o?26e3:6e4,tunnelStart:f.tunnelStart,tunnelEnd:f.tunnelEnd,finaleZ:f.finaleZ,name:e.config.name,compact:o}),[f,e.config.name,o]);return(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(`color`,{attach:`background`,args:[`#05060a`]}),(0,v.jsx)(`fog`,{attach:`fog`,args:[`#05060a`,10,30]}),(0,v.jsx)(F,{progress:t,velocity:n,layout:f,camZ:c,mouse:u,morph:d,reduceMotion:a,compact:o,onSection:i}),(0,v.jsx)(x,{formations:p,morph:d,velocity:n,mouse:u,reduceMotion:a}),f.years.map(e=>(0,v.jsx)(A,{year:e.year,z:e.z,morph:d,compact:o,parkedNext:f.viewDist-f.spacing*.5,parkedPrev:f.viewDist+f.spacing*.5},e.year)),e.projects.map((e,t)=>(0,v.jsx)(k,{project:e,index:t,side:f.panels[t].side,position:[f.panels[t].x,o?.75:.3,f.panels[t].z],size:o?[2.6,1.46]:[3,1.69],camZ:c,morph:d,onOpen:r,compact:o,focused:t===s,reduceMotion:a},e.id))]})}function L(e){let[t,n]=(0,_.useState)(Math.min(window.devicePixelRatio||1,1.75));return(0,v.jsxs)(p,{className:`stage`,dpr:t,camera:{fov:55,near:.1,far:80,position:[0,.35,7]},gl:{antialias:!1,powerPreference:`high-performance`,alpha:!1},children:[(0,v.jsx)(h,{onDecline:()=>n(1),onIncline:()=>n(Math.min(window.devicePixelRatio||1,1.75))}),(0,v.jsx)(I,{...e})]})}export{L as default};