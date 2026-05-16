'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, SkipBack, ChevronRight, ChevronLeft } from 'lucide-react';

interface Props {
  algorithm: string;
}

// Face colors indexed by face: U=0 R=1 F=2 D=3 L=4 B=5
const FACE_COLORS = [
  0xf7c948, // U yellow
  0xe63946, // R red
  0x2ec4b6, // F teal/green
  0xf8f9fa, // D white
  0xff9f1c, // L orange
  0x457b9d, // B blue
];

export default function CubeVisualizer({ algorithm }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const frameRef = useRef<number>(0);

  const moves = algorithm.trim().split(/\s+/).filter(Boolean);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const playRef = useRef(false);

  useEffect(() => {
    if (!mountRef.current) return;

    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e1e24);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(4, 4, 6);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(5, 8, 5);
    scene.add(dir);

    // Build cube
    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    buildCube(group);

    // Auto-rotate
    let t = 0;
    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      t += 0.005;
      group.rotation.y = t;
      renderer.render(scene, camera);
    }
    animate();

    const ro = new ResizeObserver(() => {
      if (!mountRef.current) return;
      const nw = mountRef.current.clientWidth;
      const nh = mountRef.current.clientHeight;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    });
    ro.observe(mountRef.current);

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      renderer.dispose();
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Pulse group rotation when step changes
  useEffect(() => {
    if (!groupRef.current) return;
    const group = groupRef.current;
    const targetY = step * 0.3;
    group.rotation.y = targetY;
  }, [step]);

  // Auto-play
  useEffect(() => {
    playRef.current = playing;
    if (!playing) return;

    const id = setInterval(() => {
      if (!playRef.current) { clearInterval(id); return; }
      setStep((s) => {
        if (s >= moves.length) {
          clearInterval(id);
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 800);
    return () => clearInterval(id);
  }, [playing, moves.length]);

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={mountRef}
        className="rounded-xl overflow-hidden"
        style={{ height: 260, background: 'var(--surface-2)' }}
      />

      {/* Move sequence display */}
      <div className="flex flex-wrap gap-1 justify-center">
        {moves.map((m, i) => (
          <span
            key={i}
            className="px-2 py-0.5 rounded text-xs font-mono transition-all"
            style={{
              background: i < step ? 'rgba(108,99,255,0.3)' : i === step ? 'rgba(108,99,255,0.6)' : 'var(--surface-2)',
              color: i === step ? '#fff' : 'var(--muted)',
              border: i === step ? '1px solid var(--accent)' : '1px solid transparent',
            }}
          >
            {m}
          </span>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setStep(0)}
          className="p-2 rounded-md transition-colors hover:bg-white/10"
          style={{ color: 'var(--muted)' }}
          title="Reset"
        >
          <SkipBack size={16} />
        </button>
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="p-2 rounded-md transition-colors hover:bg-white/10"
          style={{ color: 'var(--muted)' }}
          title="Previous move"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => setPlaying((v) => !v)}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          onClick={() => setStep((s) => Math.min(moves.length, s + 1))}
          className="p-2 rounded-md transition-colors hover:bg-white/10"
          style={{ color: 'var(--muted)' }}
          title="Next move"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <p className="text-center text-xs" style={{ color: 'var(--muted)' }}>
        Step {step} / {moves.length}
      </p>
    </div>
  );
}

function buildCube(group: THREE.Group) {
  const size = 0.9;
  const gap = 0.05;

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const geo = new THREE.BoxGeometry(size, size, size);

        // Each face: right(+x), left(-x), top(+y), bottom(-y), front(+z), back(-z)
        const mats = [
          new THREE.MeshLambertMaterial({ color: x === 1 ? FACE_COLORS[1] : 0x111118 }),  // R
          new THREE.MeshLambertMaterial({ color: x === -1 ? FACE_COLORS[4] : 0x111118 }), // L
          new THREE.MeshLambertMaterial({ color: y === 1 ? FACE_COLORS[0] : 0x111118 }),  // U
          new THREE.MeshLambertMaterial({ color: y === -1 ? FACE_COLORS[3] : 0x111118 }), // D
          new THREE.MeshLambertMaterial({ color: z === 1 ? FACE_COLORS[2] : 0x111118 }),  // F
          new THREE.MeshLambertMaterial({ color: z === -1 ? FACE_COLORS[5] : 0x111118 }), // B
        ];

        const mesh = new THREE.Mesh(geo, mats);
        mesh.position.set(
          x * (size + gap),
          y * (size + gap),
          z * (size + gap)
        );
        group.add(mesh);
      }
    }
  }
}
