'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { generateScramble, parseScramble } from '@/lib/scramble';
import {
  Solve, getSolves, addSolve, deleteSolve, updateSolve, clearSolves,
  calcAo, formatTime, effectiveTime,
} from '@/lib/session-store';

type Phase = 'idle' | 'inspecting' | 'running' | 'stopped';

const comicBox = {
  background: '#FFFFFF',
  border: '3px solid #0A0A0A',
  boxShadow: '4px 4px 0 #0A0A0A',
  borderRadius: 4,
} as const;

// Inline scramble visualizer using sr-visualizer
function ScrambleViz({ alg, size = 100 }: { alg: string; size?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    let cancelled = false;
    setReady(false);
    import('sr-visualizer').then(({ cubeSVG }) => {
      if (cancelled || !el) return;
      el.innerHTML = '';
      try {
        cubeSVG(el, {
          width: size,
          height: size,
          backgroundColor: '#0d0d12',
          cubeColor: '#1a1a24',
          algorithm: alg || undefined,
        });
        if (!cancelled) setReady(true);
      } catch { /* ignore unsupported sequences */ }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [alg, size]);

  return (
    <div
      ref={ref}
      style={{
        width: size, height: size,
        borderRadius: 6, overflow: 'hidden',
        background: '#0d0d12', flexShrink: 0,
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.18s ease',
      }}
    />
  );
}

export function TimerTab() {
  const [scramble, setScramble]             = useState(() => generateScramble());
  const [moves, setMoves]                   = useState<string[]>([]);
  const [playerStep, setPlayerStep]         = useState(0);
  const [phase, setPhase]                   = useState<Phase>('idle');
  const [inspectionLeft, setInspectionLeft] = useState(15);
  const [solveStart, setSolveStart]         = useState(0);
  const [elapsed, setElapsed]               = useState(0);
  const [solves, setSolves]                 = useState<Solve[]>([]);
  const [lastSolve, setLastSolve]           = useState<Solve | null>(null);

  // Parse scramble into move tokens
  useEffect(() => {
    const m = parseScramble(scramble);
    setMoves(m);
    setPlayerStep(0);
  }, [scramble]);

  // Load solves from localStorage on mount
  useEffect(() => { setSolves(getSolves()); }, []);

  const newScramble = useCallback(() => setScramble(generateScramble()), []);

  // Inspection countdown
  useEffect(() => {
    if (phase !== 'inspecting') return;
    if (inspectionLeft <= 0) {
      setPhase('running');
      setSolveStart(Date.now());
      return;
    }
    const t = setTimeout(() => setInspectionLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, inspectionLeft]);

  // Running elapsed display
  useEffect(() => {
    if (phase !== 'running') return;
    const t = setInterval(() => setElapsed(Date.now() - solveStart), 10);
    return () => clearInterval(t);
  }, [phase, solveStart]);

  const stopSolve = useCallback(() => {
    const time = Date.now() - solveStart;
    const solve: Solve = {
      id: crypto.randomUUID(),
      time,
      scramble,
      dnf: false,
      plusTwo: false,
      timestamp: Date.now(),
    };
    const all = addSolve(solve);
    setSolves(all);
    setLastSolve(solve);
    setPhase('stopped');
    newScramble();
  }, [solveStart, scramble, newScramble]);

  const handleActivate = useCallback(() => {
    if (phase === 'idle' || phase === 'stopped') {
      setInspectionLeft(15);
      setPhase('inspecting');
    } else if (phase === 'inspecting') {
      setPhase('running');
      setSolveStart(Date.now());
      setElapsed(0);
    } else if (phase === 'running') {
      stopSolve();
    }
  }, [phase, stopSolve]);

  // Spacebar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      e.preventDefault();
      handleActivate();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleActivate]);

  // Stats
  const ao5   = calcAo(solves, 5);
  const ao12  = calcAo(solves, 12);
  const ao100 = calcAo(solves, 100);
  const validTimes = solves.map(effectiveTime).filter(isFinite);
  const best = validTimes.length > 0 ? Math.min(...validTimes) : null;
  const mean = validTimes.length > 0 ? validTimes.reduce((s, t) => s + t, 0) / validTimes.length : null;

  const timerDisplay = () => {
    if (phase === 'inspecting') return String(Math.max(0, inspectionLeft));
    if (phase === 'running') return formatTime(elapsed);
    if (phase === 'stopped' && lastSolve) return formatTime(lastSolve.time);
    return lastSolve ? formatTime(lastSolve.time) : '0.00';
  };

  const timerColor = () => {
    if (phase === 'running') return '#009B48';
    if (phase === 'inspecting') return inspectionLeft <= 3 ? '#B90000' : '#FFD500';
    return '#0A0A0A';
  };

  const instruction = () => {
    if (phase === 'inspecting') return 'SPACE or tap → start solving';
    if (phase === 'running') return 'SPACE or tap → stop';
    if (phase === 'stopped') return 'SPACE or tap → next solve';
    return 'SPACE or tap → start inspection';
  };

  const toggleDnf = (id: string) => {
    const s = solves.find(s => s.id === id);
    if (!s) return;
    setSolves(updateSolve(id, { dnf: !s.dnf, plusTwo: false }));
  };

  const togglePlusTwo = (id: string) => {
    const s = solves.find(s => s.id === id);
    if (!s) return;
    setSolves(updateSolve(id, { plusTwo: !s.plusTwo, dnf: false }));
  };

  const removeSolve = (id: string) => setSolves(deleteSolve(id));

  const fmtAo = (v: number | null) =>
    v === null ? '—' : !isFinite(v) ? 'DNF' : formatTime(v);

  return (
    <div>
      {/* ── Scramble card ──────────────────────────── */}
      <div style={{ ...comicBox, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.16em',
              color: '#555', fontFamily: 'var(--font-bangers, Bangers, cursive)', marginBottom: 8,
            }}>
              SCRAMBLE
            </div>
            <p className="alg-text" style={{ fontSize: '1rem', lineHeight: 1.7, wordBreak: 'break-word' }}>
              {scramble}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ border: '2px solid #0A0A0A', borderRadius: 4, overflow: 'hidden' }}>
              <ScrambleViz alg={scramble} size={90} />
            </div>
            <button
              onClick={newScramble}
              className="flex items-center gap-1"
              style={{
                background: '#FFD500', border: '2px solid #0A0A0A', boxShadow: '2px 2px 0 #0A0A0A',
                borderRadius: 2, padding: '4px 12px', fontSize: '0.75rem', fontWeight: 800,
                cursor: 'pointer', fontFamily: 'var(--font-bangers, Bangers, cursive)', letterSpacing: '0.08em',
              }}
            >
              <RefreshCw size={11} /> NEW
            </button>
          </div>
        </div>

        {/* Scramble step player */}
        {moves.length > 0 && (
          <div style={{ borderTop: '2px solid rgba(10,10,10,0.12)', marginTop: 16, paddingTop: 12 }}>
            <div style={{
              fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.14em',
              color: '#555', fontFamily: 'var(--font-bangers, Bangers, cursive)', marginBottom: 10,
            }}>
              VIRTUAL CUBE — STEP {playerStep} / {moves.length}
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Step controls */}
              <div style={{ display: 'flex', gap: 3 }}>
                {[
                  { label: '|◀', onClick: () => setPlayerStep(0) },
                  { label: <ChevronLeft size={12} />, onClick: () => setPlayerStep(s => Math.max(0, s - 1)) },
                  { label: <ChevronRight size={12} />, onClick: () => setPlayerStep(s => Math.min(moves.length, s + 1)), accent: true },
                  { label: '▶|', onClick: () => setPlayerStep(moves.length) },
                ].map((btn, i) => (
                  <button
                    key={i}
                    onClick={btn.onClick}
                    style={{
                      background: btn.accent ? '#009B48' : '#fff',
                      color: btn.accent ? '#fff' : '#0A0A0A',
                      border: '2px solid #0A0A0A', borderRadius: 2,
                      padding: '4px 8px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              {/* Move tokens */}
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', flex: 1 }}>
                {moves.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => setPlayerStep(i + 1)}
                    style={{
                      background: i < playerStep ? '#0A0A0A' : '#fff',
                      color: i < playerStep ? '#fff' : '#0A0A0A',
                      border: `1.5px solid ${i === playerStep - 1 ? '#B90000' : '#0A0A0A'}`,
                      outline: i === playerStep - 1 ? '2px solid #B90000' : 'none',
                      outlineOffset: 1,
                      borderRadius: 2, padding: '2px 6px',
                      fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            {/* Cube state at current step */}
            <div style={{ marginTop: 10 }}>
              <ScrambleViz alg={moves.slice(0, playerStep).join(' ')} size={80} />
            </div>
          </div>
        )}
      </div>

      {/* ── Timer ──────────────────────────────────── */}
      <div
        onClick={handleActivate}
        style={{
          ...comicBox,
          padding: '36px 24px',
          marginBottom: 16,
          textAlign: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          background:
            phase === 'running'    ? 'rgba(0,155,72,0.05)'   :
            phase === 'inspecting' ? 'rgba(255,213,0,0.08)'  : '#FFFDF4',
          transition: 'background 0.2s',
        }}
      >
        {phase === 'inspecting' && (
          <div style={{
            fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.2em',
            color: inspectionLeft <= 3 ? '#B90000' : '#888',
            fontFamily: 'var(--font-bangers, Bangers, cursive)', marginBottom: 6,
          }}>
            INSPECTION
          </div>
        )}
        <div style={{
          fontFamily: 'var(--font-bangers, Bangers, cursive)',
          fontSize: 'clamp(4rem, 15vw, 7rem)',
          letterSpacing: '0.04em',
          lineHeight: 1,
          color: timerColor(),
          transition: 'color 0.15s',
        }}>
          {timerDisplay()}
        </div>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#999', marginTop: 10, letterSpacing: '0.05em' }}>
          {instruction()}
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────── */}
      {solves.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'BEST', value: best !== null ? formatTime(best) : '—' },
            { label: 'MEAN', value: mean !== null ? formatTime(mean) : '—' },
            { label: 'AO5',  value: fmtAo(ao5) },
            { label: 'AO12', value: fmtAo(ao12) },
            { label: 'AO100',value: fmtAo(ao100) },
          ].map(stat => (
            <div key={stat.label} style={{ ...comicBox, padding: '10px 6px', textAlign: 'center' }}>
              <div style={{
                fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.1em', color: '#555',
                fontFamily: 'var(--font-bangers, Bangers, cursive)', marginBottom: 3,
              }}>
                {stat.label}
              </div>
              <div style={{
                fontFamily: 'var(--font-bangers, Bangers, cursive)',
                fontSize: '0.9rem', letterSpacing: '0.04em', color: '#0A0A0A',
              }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Session list ───────────────────────────── */}
      {solves.length > 0 && (
        <div style={{ ...comicBox, padding: 0, overflow: 'hidden' }}>
          <div style={{
            background: '#0A0A0A', padding: '8px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{
              fontFamily: 'var(--font-bangers, Bangers, cursive)',
              fontSize: '0.85rem', letterSpacing: '0.12em', color: '#fff',
            }}>
              SESSION — {solves.length} SOLVE{solves.length !== 1 ? 'S' : ''}
            </span>
            <button
              onClick={() => { clearSolves(); setSolves([]); setLastSolve(null); }}
              className="flex items-center gap-1"
              style={{
                background: 'none', border: 'none', color: '#888',
                cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700,
              }}
            >
              <Trash2 size={11} /> Clear all
            </button>
          </div>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {[...solves].reverse().map((solve, i) => {
              const t = effectiveTime(solve);
              const display = !isFinite(t) ? 'DNF' : formatTime(t);
              return (
                <div
                  key={solve.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                    borderBottom: '1px solid rgba(10,10,10,0.07)',
                    background: i === 0 ? 'rgba(0,155,72,0.04)' : 'transparent',
                  }}
                >
                  <span style={{ fontSize: '0.65rem', color: '#aaa', fontWeight: 700, width: 26, textAlign: 'right', flexShrink: 0 }}>
                    {solves.length - i}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-bangers, Bangers, cursive)',
                    fontSize: '1rem', letterSpacing: '0.04em',
                    color: solve.dnf ? '#B90000' : '#0A0A0A',
                    flex: 1,
                  }}>
                    {display}
                    {solve.plusTwo && <span style={{ fontSize: '0.65rem', color: '#FF5900', marginLeft: 4 }}>+2</span>}
                  </span>
                  <div style={{ display: 'flex', gap: 3 }}>
                    <button
                      onClick={() => togglePlusTwo(solve.id)}
                      style={{
                        background: solve.plusTwo ? '#FF5900' : '#fff',
                        color: solve.plusTwo ? '#fff' : '#555',
                        border: '1.5px solid #0A0A0A', borderRadius: 2,
                        padding: '2px 6px', fontSize: '0.6rem', fontWeight: 700, cursor: 'pointer',
                      }}
                    >+2</button>
                    <button
                      onClick={() => toggleDnf(solve.id)}
                      style={{
                        background: solve.dnf ? '#B90000' : '#fff',
                        color: solve.dnf ? '#fff' : '#555',
                        border: '1.5px solid #0A0A0A', borderRadius: 2,
                        padding: '2px 6px', fontSize: '0.6rem', fontWeight: 700, cursor: 'pointer',
                      }}
                    >DNF</button>
                    <button
                      onClick={() => removeSolve(solve.id)}
                      style={{
                        background: '#fff', color: '#999',
                        border: '1.5px solid #0A0A0A', borderRadius: 2,
                        padding: '2px 5px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                      }}
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {solves.length === 0 && (
        <div style={{ ...comicBox, padding: 32, textAlign: 'center', background: '#FFFDF4' }}>
          <div style={{
            fontFamily: 'var(--font-bangers, Bangers, cursive)',
            fontSize: '1.2rem', letterSpacing: '0.08em', color: '#0A0A0A', marginBottom: 6,
          }}>
            NO SOLVES YET
          </div>
          <p style={{ fontSize: '0.78rem', color: '#555' }}>
            Press SPACE or tap the timer to begin your first solve.
          </p>
        </div>
      )}
    </div>
  );
}
