'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GEOMETRY, applyMove, moveTurn, parseMove, type Facelets } from '@/lib/cube';

/**
 * A three.js cube that shows a given facelet state and turns one move at a time.
 *
 * The cubelets are snapped back to their home transforms and repainted from the
 * facelet string after every turn, so the model can never drift out of sync with
 * the state the solver is describing — the animation is presentation only, and
 * `facelets` + `moves` + `index` are always the single source of truth.
 */
export interface CubeState3DProps {
  /** The cube as entered, before any solution move. */
  facelets: Facelets;
  /** The solution being played back. */
  moves: string[];
  /** How many of `moves` have been applied. */
  index: number;
  /** Milliseconds per turn. */
  turnMs?: number;
  className?: string;
}

const STICKER_COLORS: Record<string, number> = {
  U: 0xffd500, // yellow
  R: 0xb90000, // red
  F: 0x0045ad, // blue
  D: 0xf8f8f8, // white
  L: 0xff5900, // orange
  B: 0x009b48, // green
};
const PLASTIC = 0x111111;
const GAP = 1.06;
const SIZE = 0.94;

const vecKey = (v: readonly number[]) => v.join(',');

/** Which facelet index sits on cubelet `pos` facing `normal`, if any. */
const FACELET_AT = new Map<string, number>(
  GEOMETRY.map((g, i) => [`${vecKey(g.pos)}|${vecKey(g.normal)}`, i]),
);

// three.js BoxGeometry material order: +x, −x, +y, −y, +z, −z.
const MATERIAL_NORMALS: readonly (readonly [number, number, number])[] = [
  [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
];

const AXIS_VECTOR: Record<string, THREE.Vector3> = {
  x: new THREE.Vector3(1, 0, 0),
  y: new THREE.Vector3(0, 1, 0),
  z: new THREE.Vector3(0, 0, 1),
};

interface Cubelet {
  mesh: THREE.Mesh;
  home: readonly [number, number, number];
  materials: THREE.MeshToonMaterial[];
}

export default function CubeState3D({
  facelets,
  moves,
  index,
  turnMs = 380,
  className,
}: CubeState3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  // The scene lives outside React state: it is imperative, and re-creating it on
  // every prop change would restart the animation mid-turn.
  const apiRef = useRef<{
    setState: (f: Facelets) => void;
    turn: (move: string, after: Facelets) => void;
  } | null>(null);
  const appliedRef = useRef(0);
  const solutionRef = useRef<{ facelets: Facelets; moves: string[] } | null>(null);
  const turnMsRef = useRef(turnMs);

  useEffect(() => {
    turnMsRef.current = turnMs;
  }, [turnMs]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 320;
    const height = mount.clientHeight || 320;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(5.4, 4.6, 7.2);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.95));
    const sun = new THREE.DirectionalLight(0xffffff, 1.25);
    sun.position.set(4, 8, 6);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xffffff, 0.45);
    fill.position.set(-5, -3, -4);
    scene.add(fill);

    const group = new THREE.Group();
    group.rotation.y = -0.12;
    scene.add(group);

    const cubelets: Cubelet[] = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const materials = MATERIAL_NORMALS.map(
            () => new THREE.MeshToonMaterial({ color: PLASTIC }),
          );
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(SIZE, SIZE, SIZE), materials);
          mesh.position.set(x * GAP, y * GAP, z * GAP);

          // Comic-style black outline, matching the site's other 3-D cube.
          const outline = new THREE.Mesh(
            new THREE.BoxGeometry(SIZE, SIZE, SIZE),
            new THREE.MeshBasicMaterial({ color: 0x0a0a0a, side: THREE.BackSide }),
          );
          outline.scale.setScalar(1.1);
          mesh.add(outline);

          group.add(mesh);
          cubelets.push({ mesh, home: [x, y, z], materials });
        }
      }
    }

    /** Snap every cubelet home and repaint its stickers from `f`. */
    const setState = (f: Facelets) => {
      for (const c of cubelets) {
        c.mesh.position.set(c.home[0] * GAP, c.home[1] * GAP, c.home[2] * GAP);
        c.mesh.rotation.set(0, 0, 0);
        c.mesh.updateMatrix();
        MATERIAL_NORMALS.forEach((normal, i) => {
          const facelet = FACELET_AT.get(`${vecKey(c.home)}|${vecKey(normal)}`);
          const color = facelet === undefined ? PLASTIC : STICKER_COLORS[f[facelet]] ?? PLASTIC;
          c.materials[i].color.setHex(color);
        });
      }
    };

    let spin: {
      pivot: THREE.Group;
      axis: THREE.Vector3;
      total: number;
      elapsed: number;
      after: Facelets;
      members: Cubelet[];
    } | null = null;

    const finishSpin = () => {
      if (!spin) return;
      for (const c of spin.members) group.attach(c.mesh);
      group.remove(spin.pivot);
      setState(spin.after);
      spin = null;
    };

    const turn = (move: string, after: Facelets) => {
      finishSpin();
      const spec = moveTurn(move);
      if (!spec) {
        setState(after);
        return;
      }
      const axisIndex = spec.axis === 'x' ? 0 : spec.axis === 'y' ? 1 : 2;
      const members = cubelets.filter((c) => spec.layers.includes(c.home[axisIndex]));

      const pivot = new THREE.Group();
      group.add(pivot);
      for (const c of members) pivot.attach(c.mesh);

      spin = {
        pivot,
        axis: AXIS_VECTOR[spec.axis],
        // `moveTurn` gives the turn in three.js's own sign convention.
        total: (-Math.PI / 2) * spec.quarters,
        elapsed: 0,
        after,
        members,
      };
    };

    let frame = 0;
    let last = performance.now();
    const tick = () => {
      frame = requestAnimationFrame(tick);
      const now = performance.now();
      const dt = now - last;
      last = now;

      if (spin) {
        spin.elapsed += dt;
        const t = Math.min(1, spin.elapsed / Math.max(60, turnMsRef.current));
        // Ease-out so a turn reads as a flick rather than a constant slide.
        const eased = 1 - Math.pow(1 - t, 3);
        spin.pivot.setRotationFromAxisAngle(spin.axis, spin.total * eased);
        if (t >= 1) finishSpin();
      }

      renderer.render(scene, camera);
    };
    tick();

    // Drag to look around; the cube is a reference model, so free orbit helps.
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      renderer.domElement.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      group.rotation.y += (e.clientX - lastX) * 0.008;
      group.rotation.x = Math.max(
        -Math.PI / 2.2,
        Math.min(Math.PI / 2.2, group.rotation.x + (e.clientY - lastY) * 0.008),
      );
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      if (renderer.domElement.hasPointerCapture(e.pointerId)) {
        renderer.domElement.releasePointerCapture(e.pointerId);
      }
    };
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('pointerup', onUp);
    renderer.domElement.addEventListener('pointercancel', onUp);
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.cursor = 'grab';

    const onResize = () => {
      const w = mount.clientWidth || width;
      const h = mount.clientHeight || height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    apiRef.current = { setState, turn };

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('pointerup', onUp);
      renderer.domElement.removeEventListener('pointercancel', onUp);
      apiRef.current = null;
      // Forget which solution was drawn: the next scene starts unpainted, so it
      // has to be told the state again rather than assuming it already shows it.
      solutionRef.current = null;
      for (const c of cubelets) {
        c.mesh.geometry.dispose();
        c.materials.forEach((m) => m.dispose());
        const outline = c.mesh.children[0] as THREE.Mesh | undefined;
        if (outline) {
          outline.geometry.dispose();
          (outline.material as THREE.Material).dispose();
        }
      }
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  // Drive the scene from props: a single step forward or back animates, any
  // other jump (a restart, a scrub, a brand new solution) repaints instantly.
  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;

    const stateAt = (n: number) => {
      let s = facelets;
      for (let i = 0; i < n; i++) s = applyMove(s, moves[i]);
      return s;
    };

    const previous = solutionRef.current;
    if (previous?.facelets !== facelets || previous?.moves !== moves) {
      solutionRef.current = { facelets, moves };
      appliedRef.current = index;
      api.setState(stateAt(index));
      return;
    }

    const from = appliedRef.current;
    if (from === index) return;
    if (index === from + 1) {
      api.turn(moves[from], stateAt(index));
    } else if (index === from - 1) {
      // Stepping back is the move undone: show where it started from, then run
      // its inverse so the turn reads the way the user's hand would move.
      api.setState(stateAt(index + 1));
      api.turn(invertToken(moves[index]), stateAt(index));
    } else {
      api.setState(stateAt(index));
    }
    appliedRef.current = index;
  }, [facelets, moves, index]);

  return (
    <div
      ref={mountRef}
      className={className}
      style={{ width: '100%', height: '100%', minHeight: 240 }}
      aria-label="3D view of your cube"
      role="img"
    />
  );
}

function invertToken(token: string): string {
  const m = parseMove(token);
  if (!m) return token;
  const q = m.quarters === 2 ? 2 : m.quarters === 1 ? 3 : 1;
  return m.base + (q === 1 ? '' : q === 2 ? '2' : "'");
}
