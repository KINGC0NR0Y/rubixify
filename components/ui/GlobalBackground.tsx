'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { bgCamera } from '@/lib/bg-camera';

interface Composer {
  render(): void;
  setSize(w: number, h: number): void;
  addPass(p: unknown): void;
}

interface Refs {
  scene:     THREE.Scene | null;
  camera:    THREE.PerspectiveCamera | null;
  renderer:  THREE.WebGLRenderer | null;
  composer:  Composer | null;
  stars:     THREE.Points[];
  nebula:    THREE.Mesh | null;
  animId:    number | null;
}

function buildStars(r: Refs) {
  for (let layer = 0; layer < 3; layer++) {
    const n   = 5000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const sz  = new Float32Array(n);

    for (let i = 0; i < n; i++) {
      const radius = 200 + Math.random() * 800;
      const theta  = Math.random() * Math.PI * 2;
      const phi    = Math.acos(Math.random() * 2 - 1);
      pos[i * 3]     = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
      const c = new THREE.Color();
      const rn = Math.random();
      if (rn < 0.65)      c.setHSL(0, 0, 0.8 + Math.random() * 0.2);
      else if (rn < 0.85) c.setHSL(0.75, 0.4, 0.8);
      else                c.setHSL(0.95, 0.5, 0.8);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      sz[i] = Math.random() * 2 + 0.5;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
    geo.setAttribute('size',     new THREE.BufferAttribute(sz,  1));

    const mat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, depth: { value: layer } },
      vertexShader: `
        attribute float size; attribute vec3 color;
        varying vec3 vColor;
        uniform float time; uniform float depth;
        void main() {
          vColor = color;
          vec3 p = position;
          float a = time * 0.05 * (1.0 - depth * 0.3);
          mat2 rot = mat2(cos(a),-sin(a),sin(a),cos(a));
          p.xy = rot * p.xy;
          vec4 mv = modelViewMatrix * vec4(p,1.0);
          gl_PointSize = size*(300.0/-mv.z);
          gl_Position = projectionMatrix*mv;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float d = length(gl_PointCoord-vec2(0.5));
          if(d>0.5) discard;
          gl_FragColor = vec4(vColor, 1.0-smoothstep(0.0,0.5,d));
        }
      `,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });

    const pts = new THREE.Points(geo, mat);
    r.scene!.add(pts);
    r.stars.push(pts);
  }
}

function buildNebula(r: Refs) {
  const geo = new THREE.PlaneGeometry(8000, 4000, 100, 100);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      time:    { value: 0 },
      color1:  { value: new THREE.Color(0x7c6ff7) },
      color2:  { value: new THREE.Color(0xf06292) },
      opacity: { value: 0.09 },
    },
    vertexShader: `
      varying vec2 vUv; varying float vElev;
      uniform float time;
      void main() {
        vUv = uv;
        vec3 p = position;
        float e = sin(p.x*0.01+time)*cos(p.y*0.01+time)*20.0;
        p.z += e; vElev = e;
        gl_Position = projectionMatrix*modelViewMatrix*vec4(p,1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color1,color2; uniform float opacity,time;
      varying vec2 vUv; varying float vElev;
      void main() {
        float mf = sin(vUv.x*10.0+time)*cos(vUv.y*10.0+time);
        vec3 col = mix(color1,color2,mf*0.5+0.5);
        float alpha = opacity*(1.0-length(vUv-0.5)*2.0);
        gl_FragColor = vec4(col,alpha);
      }
    `,
    transparent: true, blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide, depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.z = -1050;
  r.scene!.add(mesh);
  r.nebula = mesh;
}

function buildAtmosphere(r: Refs) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
      varying vec3 vNormal;
      void main(){vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}
    `,
    fragmentShader: `
      varying vec3 vNormal; uniform float time;
      void main(){
        float i=pow(0.7-dot(vNormal,vec3(0,0,1)),2.0);
        vec3 a=vec3(0.48,0.44,0.97)*i*(sin(time*2.0)*0.1+0.9);
        gl_FragColor=vec4(a,i*0.09);
      }
    `,
    side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true,
  });
  r.scene!.add(new THREE.Mesh(new THREE.SphereGeometry(600, 32, 32), mat));
}

export function GlobalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smooth    = useRef({ x: 0, y: 30, z: 200 });
  const r         = useRef<Refs>({
    scene: null, camera: null, renderer: null, composer: null,
    stars: [], nebula: null, animId: null,
  });

  useEffect(() => {
    let destroyed = false;

    async function init() {
      const refs   = r.current;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }] = await Promise.all([
        import('three/examples/jsm/postprocessing/EffectComposer.js'),
        import('three/examples/jsm/postprocessing/RenderPass.js'),
        import('three/examples/jsm/postprocessing/UnrealBloomPass.js'),
      ]);
      if (destroyed) return;

      refs.scene = new THREE.Scene();
      refs.scene.fog = new THREE.FogExp2(0x000000, 0.00025);

      refs.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
      refs.camera.position.set(0, 30, 200);

      refs.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
      refs.renderer.setClearColor(0x07070a, 1);
      refs.renderer.setSize(window.innerWidth, window.innerHeight);
      refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      refs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      refs.renderer.toneMappingExposure = 0.25;

      refs.composer = new EffectComposer(refs.renderer) as unknown as Composer;
      refs.composer.addPass(new RenderPass(refs.scene, refs.camera));
      refs.composer.addPass(new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight), 0.35, 0.2, 0.92,
      ));

      buildStars(refs);
      buildNebula(refs);
      buildAtmosphere(refs);

      const tick = () => {
        refs.animId = requestAnimationFrame(tick);
        const t = Date.now() * 0.001;

        refs.stars.forEach(s => {
          const m = s.material as THREE.ShaderMaterial;
          if (m.uniforms) m.uniforms.time.value = t;
        });

        if (refs.nebula) {
          const m = refs.nebula.material as THREE.ShaderMaterial;
          if (m.uniforms) m.uniforms.time.value = t * 0.5;
        }

        if (refs.camera) {
          const k = 0.04;
          smooth.current.x += (bgCamera.tx - smooth.current.x) * k;
          smooth.current.y += (bgCamera.ty - smooth.current.y) * k;
          smooth.current.z += (bgCamera.tz - smooth.current.z) * k;
          refs.camera.position.set(
            smooth.current.x + Math.sin(t * 0.1) * 2,
            smooth.current.y + Math.cos(t * 0.15) * 1,
            smooth.current.z,
          );
          refs.camera.lookAt(0, 10, -600);
        }

        refs.composer?.render();
      };
      tick();
    }

    init();

    const onResize = () => {
      const refs = r.current;
      if (!refs.camera || !refs.renderer || !refs.composer) return;
      refs.camera.aspect = window.innerWidth / window.innerHeight;
      refs.camera.updateProjectionMatrix();
      refs.renderer.setSize(window.innerWidth, window.innerHeight);
      refs.composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      destroyed = true;
      window.removeEventListener('resize', onResize);
      const refs = r.current;
      if (refs.animId) cancelAnimationFrame(refs.animId);
      refs.stars.forEach(s => {
        s.geometry.dispose();
        (s.material as THREE.Material).dispose();
      });
      if (refs.nebula) {
        refs.nebula.geometry.dispose();
        (refs.nebula.material as THREE.Material).dispose();
      }
      refs.renderer?.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0,
        width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none',
      }}
    />
  );
}
