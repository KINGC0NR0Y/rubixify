'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Standard Rubik's Cube face colors (right, left, top, bottom, front, back)
const FACE: [number, number, number, number, number, number] = [
  0x009B48, // right  (+x) Green
  0x0045AD, // left   (-x) Blue
  0xFFD500, // top    (+y) Yellow
  0xEEEEEE, // bottom (-y) White (off-white for visibility)
  0xB90000, // front  (+z) Red
  0xFF5900, // back   (-z) Orange
];
const INNER = 0x111111;

function makeMats(x: number, y: number, z: number): THREE.MeshToonMaterial[] {
  return [
    new THREE.MeshToonMaterial({ color: x ===  1 ? FACE[0] : INNER }),
    new THREE.MeshToonMaterial({ color: x === -1 ? FACE[1] : INNER }),
    new THREE.MeshToonMaterial({ color: y ===  1 ? FACE[2] : INNER }),
    new THREE.MeshToonMaterial({ color: y === -1 ? FACE[3] : INNER }),
    new THREE.MeshToonMaterial({ color: z ===  1 ? FACE[4] : INNER }),
    new THREE.MeshToonMaterial({ color: z === -1 ? FACE[5] : INNER }),
  ];
}

export function RubiksCube3D({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.clientWidth  || 400;
    const H = mount.clientHeight || 400;

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
    camera.position.set(5.5, 4.0, 7.5);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Toon shading needs a directional light
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(4, 8, 6);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xffffff, 0.4);
    fill.position.set(-5, -3, -4);
    scene.add(fill);

    const group = new THREE.Group();
    group.rotation.x = 0.28;
    scene.add(group);

    const cubelets: THREE.Mesh[] = [];
    const GAP = 1.06;

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const geo  = new THREE.BoxGeometry(0.92, 0.92, 0.92);
          const mesh = new THREE.Mesh(geo, makeMats(x, y, z));
          mesh.position.set(x * GAP, y * GAP, z * GAP);

          // Comic-style black outline via back-face trick
          const outline = new THREE.Mesh(
            new THREE.BoxGeometry(0.92, 0.92, 0.92),
            new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide }),
          );
          outline.scale.setScalar(1.09);
          mesh.add(outline);

          group.add(mesh);
          cubelets.push(mesh);
        }
      }
    }

    const raycaster = new THREE.Raycaster();
    const mouse     = new THREE.Vector2(-10, -10);
    let   hovered: THREE.Mesh | null = null;
    let   animId: number;

    const tick = () => {
      animId = requestAnimationFrame(tick);
      group.rotation.y += 0.007;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(cubelets, false);
      const hit  = hits[0]?.object as THREE.Mesh | undefined;

      if (hovered && hovered !== hit) hovered.scale.setScalar(1);
      if (hit && hit !== hovered)     { hit.scale.setScalar(1.14); hovered = hit; }
      if (!hit && hovered)            { hovered = null; }

      renderer.render(scene, camera);
    };
    tick();

    const onMove  = (e: MouseEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      mouse.set(
        ((e.clientX - r.left) / r.width)  * 2 - 1,
       -((e.clientY - r.top)  / r.height) * 2 + 1,
      );
    };
    const onLeave = () => mouse.set(-10, -10);
    renderer.domElement.addEventListener('mousemove', onMove);
    renderer.domElement.addEventListener('mouseleave', onLeave);

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('mousemove', onMove);
      renderer.domElement.removeEventListener('mouseleave', onLeave);
      cubelets.forEach(c => {
        c.geometry.dispose();
        (Array.isArray(c.material) ? c.material : [c.material])
          .forEach(m => (m as THREE.Material).dispose());
        const ol = c.children[0] as THREE.Mesh | undefined;
        if (ol) { ol.geometry.dispose(); (ol.material as THREE.Material).dispose(); }
      });
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={className} style={{ width: '100%', height: '100%' }} />;
}
