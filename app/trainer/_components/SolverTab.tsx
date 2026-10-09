'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Check, Copy, Eraser, RotateCcw, Play, Pause, SkipBack, SkipForward,
  Shuffle, Sparkles, TriangleAlert, ArrowRight, Loader2,
} from 'lucide-react';
import {
  SOLVED, applyAlg, validateFacelets, CENTER_INDEX,
  type FaceLetter, type ValidationResult,
} from '@/lib/cube';
import { solveCube, crossTable, type Solution } from '@/lib/cubeSolver';
import { generateScramble } from '@/lib/scramble';

// three.js is a heavy import and the net is useful on its own, so the 3-D view
// only loads once someone actually asks for a solution.
const CubeState3D = dynamic(() => import('@/components/ui/CubeState3D'), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%', minHeight: 240 }} />,
});

const BLANK = '.';

interface Swatch {
  face: FaceLetter;
  name: string;
  hex: string;
  /** Where this colour sits on a correctly-held cube. */
  position: string;
}

// The scheme every diagram on this site uses: yellow up, blue front.
const SWATCHES: Swatch[] = [
  { face: 'U', name: 'Yellow', hex: '#FFD500', position: 'Up' },
  { face: 'F', name: 'Blue', hex: '#0045AD', position: 'Front' },
  { face: 'R', name: 'Red', hex: '#B90000', position: 'Right' },
  { face: 'B', name: 'Green', hex: '#009B48', position: 'Back' },
  { face: 'L', name: 'Orange', hex: '#FF5900', position: 'Left' },
  { face: 'D', name: 'White', hex: '#F8F8F8', position: 'Down' },
];

const HEX: Record<string, string> = Object.fromEntries(SWATCHES.map((s) => [s.face, s.hex]));
const COLOR_NAMES = Object.fromEntries(SWATCHES.map((s) => [s.face, s.name])) as Record<FaceLetter, string>;

/** Face blocks in net order, positioned on a 4 × 3 grid of faces. */
const NET: { face: FaceLetter; col: number; row: number; label: string }[] = [
  { face: 'U', col: 2, row: 1, label: 'Up' },
  { face: 'L', col: 1, row: 2, label: 'Left' },
  { face: 'F', col: 2, row: 2, label: 'Front' },
  { face: 'R', col: 3, row: 2, label: 'Right' },
  { face: 'B', col: 4, row: 2, label: 'Back' },
  { face: 'D', col: 2, row: 3, label: 'Down' },
];

const FACE_OFFSET: Record<FaceLetter, number> = { U: 0, R: 9, F: 18, D: 27, L: 36, B: 45 };

const comicBox = {
  background: '#FFFFFF',
  border: '3px solid #0A0A0A',
  boxShadow: '4px 4px 0 #0A0A0A',
  borderRadius: 4,
} as const;

const headingFont = {
  fontFamily: 'var(--font-bangers, Bangers, cursive)',
  letterSpacing: '0.08em',
} as const;

const solvedStickers = () => SOLVED.split('');
const clearedStickers = () =>
  Array.from({ length: 54 }, (_, i) => (CENTER_INDEX.includes(i) ? SOLVED[i] : BLANK));

const SPEEDS = [
  { label: '0.5×', ms: 900 },
  { label: '1×', ms: 520 },
  { label: '2×', ms: 260 },
  { label: '4×', ms: 130 },
];

export function SolverTab() {
  const [stickers, setStickers] = useState<string[]>(solvedStickers);
  const [selected, setSelected] = useState<FaceLetter>('U');
  // The solution is kept together with the cube it was computed from, so an
  // edit makes it stale by derivation rather than by a clean-up effect.
  const [solved, setSolved] = useState<{ source: string; solution: Solution } | null>(null);
  const [solving, setSolving] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(1);
  const [copied, setCopied] = useState(false);
  const paintingRef = useRef(false);

  const facelets = useMemo(() => stickers.join(''), [stickers]);
  const validation: ValidationResult = useMemo(
    () => validateFacelets(facelets, COLOR_NAMES),
    [facelets],
  );
  const isSolvedState = facelets === SOLVED;
  const turnMs = SPEEDS[speedIndex].ms;
  const solution = solved?.source === facelets ? solved.solution : null;

  useEffect(() => {
    if (!playing || !solution || step >= solution.moves.length) return;
    const id = setTimeout(() => {
      const next = step + 1;
      setStep(next);
      if (next >= solution.moves.length) setPlaying(false);
    }, turnMs + 90);
    return () => clearTimeout(id);
  }, [playing, step, solution, turnMs]);

  const paint = useCallback(
    (index: number, cycle: boolean) => {
      if (CENTER_INDEX.includes(index)) return;
      setStickers((prev) => {
        const next = [...prev];
        if (cycle && prev[index] === selected) {
          const at = SWATCHES.findIndex((s) => s.face === selected);
          next[index] = SWATCHES[(at + 1) % SWATCHES.length].face;
        } else {
          next[index] = selected;
        }
        return next;
      });
    },
    [selected],
  );

  useEffect(() => {
    const stop = () => { paintingRef.current = false; };
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, []);

  // Build the cross lookup table while the user is still typing in their cube,
  // so the first Solve doesn't pay for it.
  useEffect(() => {
    const id = setTimeout(() => crossTable(), 400);
    return () => clearTimeout(id);
  }, []);

  // Number keys pick a colour — much faster than reaching for the palette on
  // every one of 48 stickers.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 6) setSelected(SWATCHES[n - 1].face);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function handleSolve() {
    setSolving(true);
    setFailure(null);
    // Yield a frame so the button's loading state paints before the solver
    // takes the main thread for its ~100ms of work.
    setTimeout(() => {
      try {
        setSolved({ source: facelets, solution: solveCube(facelets) });
        setStep(0);
        setPlaying(false);
      } catch (error) {
        setFailure(
          error instanceof Error
            ? error.message
            : 'Something went wrong while solving that cube.',
        );
      } finally {
        setSolving(false);
      }
    }, 20);
  }

  function loadScramble() {
    setStickers(applyAlg(SOLVED, generateScramble(25)).split(''));
  }

  async function copySolution() {
    if (!solution) return;
    try {
      await navigator.clipboard.writeText(solution.moves.join(' '));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  const highlighted = useMemo(() => {
    const set = new Set<number>();
    for (const issue of validation.issues) for (const i of issue.facelets ?? []) set.add(i);
    return set;
  }, [validation]);

  const finished = solution != null && step >= solution.moves.length;
  const currentMove = solution && step < solution.moves.length ? solution.moves[step] : null;
  const activeStage = solution?.stages.find(
    (s) => s.moves.length > 0 && step >= s.start && step < s.start + s.moves.length,
  );

  return (
    <div>
      <Flow solution={solution} valid={validation.ok} finished={finished} />

      {/* ── Enter the cube ─────────────────────────────────────────────── */}
      <Panel color="#0045AD" title="1 · ENTER YOUR CUBE">
        <p className="text-sm leading-relaxed mb-3" style={{ color: '#2a2a2a' }}>
          Hold your cube with the <strong>yellow centre facing up</strong> and the{' '}
          <strong>blue centre facing you</strong>. That is the same view every diagram on
          Rubixify uses, so red ends up on the right, orange on the left, green at the back and
          white underneath.
        </p>
        <p className="text-xs leading-relaxed mb-3" style={{ color: '#555555' }}>
          Pick a colour below, then click each sticker on the net — hold and drag to paint several
          at once, or press <kbd style={kbd}>1</kbd>–<kbd style={kbd}>6</kbd> to switch colours.
          Clicking a sticker that already has the selected colour steps it to the next one. The six
          centres are locked because they never move on a real cube.
        </p>
        <p className="text-xs leading-relaxed mb-4" style={{ color: '#555555' }}>
          The net is unfolded, so <strong>Back</strong> and <strong>Down</strong> are the two that
          catch people out. To read <strong>Back</strong>, spin the cube twice to the left keeping
          yellow up — its top row is the one touching yellow. To read <strong>Down</strong>, tip the
          cube towards you — its top row is the one touching blue.
        </p>

        <div className="flex flex-wrap gap-2 mb-5">
          {SWATCHES.map((s, i) => {
            const active = selected === s.face;
            return (
              <button
                key={s.face}
                onClick={() => setSelected(s.face)}
                aria-pressed={active}
                title={`${s.name} — the ${s.position} centre`}
                className="flex items-center gap-2 px-3 py-2"
                style={{
                  background: '#FFFFFF',
                  border: '3px solid #0A0A0A',
                  boxShadow: active ? '2px 2px 0 #0A0A0A' : '4px 4px 0 #0A0A0A',
                  transform: active ? 'translate(2px,2px)' : '',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'transform 0.08s, box-shadow 0.08s',
                }}
              >
                <span
                  style={{
                    width: 18, height: 18, borderRadius: 2,
                    background: s.hex, border: '2px solid #0A0A0A', display: 'block',
                  }}
                />
                <span className="text-xs font-bold" style={{ color: '#0A0A0A' }}>{s.name}</span>
                <span className="text-[10px] font-bold" style={{ color: '#999999' }}>{i + 1}</span>
              </button>
            );
          })}
        </div>

        <CubeNet
          stickers={stickers}
          highlighted={highlighted}
          onPaint={paint}
          paintingRef={paintingRef}
        />

        <div className="flex flex-wrap items-center gap-3 mt-5">
          <SmallButton onClick={() => setStickers(solvedStickers())} icon={<RotateCcw size={13} />}>
            Reset
          </SmallButton>
          <SmallButton onClick={() => setStickers(clearedStickers())} icon={<Eraser size={13} />}>
            Clear
          </SmallButton>
          <SmallButton onClick={loadScramble} icon={<Shuffle size={13} />}>
            Random scramble
          </SmallButton>
        </div>
      </Panel>

      {/* ── Validate ───────────────────────────────────────────────────── */}
      <Panel color="#FF5900" title="2 · CHECK IT'S A REAL CUBE">
        <div className="flex flex-wrap gap-2 mb-4">
          {SWATCHES.map((s) => {
            const n = validation.counts[s.face];
            const ok = n === 9;
            return (
              <span
                key={s.face}
                className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-bold"
                style={{
                  border: `2px solid ${ok ? '#0A0A0A' : '#B90000'}`,
                  background: ok ? '#FFFFFF' : 'rgba(185,0,0,0.07)',
                  color: ok ? '#0A0A0A' : '#B90000',
                  borderRadius: 2,
                }}
              >
                <span style={{ width: 12, height: 12, background: s.hex, border: '1.5px solid #0A0A0A', borderRadius: 1 }} />
                {n}/9
              </span>
            );
          })}
        </div>

        {validation.ok ? (
          <div
            className="flex items-start gap-2 p-3 text-sm font-semibold"
            style={{ background: 'rgba(0,155,72,0.08)', border: '2px solid #009B48', borderRadius: 4, color: '#0A0A0A' }}
          >
            <Check size={16} style={{ color: '#009B48', flexShrink: 0, marginTop: 1 }} />
            <span>
              {isSolvedState
                ? "That cube is already solved — scramble it, or enter the state you're stuck on."
                : 'That is a real, solvable cube. Nice and careful — you got all 54 stickers right.'}
            </span>
          </div>
        ) : (
          <ul className="space-y-2">
            {validation.issues.map((issue, i) => (
              <li
                key={`${issue.code}-${i}`}
                className="flex items-start gap-2 p-3 text-sm leading-relaxed"
                style={{
                  background: issue.code === 'incomplete' ? 'rgba(0,69,173,0.06)' : 'rgba(185,0,0,0.07)',
                  border: `2px solid ${issue.code === 'incomplete' ? '#0045AD' : '#B90000'}`,
                  borderRadius: 4,
                  color: '#2a2a2a',
                }}
              >
                <TriangleAlert
                  size={15}
                  style={{ color: issue.code === 'incomplete' ? '#0045AD' : '#B90000', flexShrink: 0, marginTop: 2 }}
                />
                <span>{issue.message}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* ── Solve ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3 my-8">
        <button
          onClick={handleSolve}
          disabled={!validation.ok || solving || isSolvedState}
          className="btn-primary inline-flex items-center gap-3 px-10 py-4"
          style={{
            fontSize: '1.4rem',
            opacity: !validation.ok || isSolvedState ? 0.45 : 1,
            cursor: !validation.ok || solving || isSolvedState ? 'not-allowed' : 'pointer',
          }}
        >
          {solving ? <Loader2 size={22} className="animate-spin" /> : <Sparkles size={22} />}
          {solving ? 'READING YOUR CUBE…' : 'SOLVE CUBE'}
        </button>
        <p className="text-xs font-semibold text-center" style={{ color: '#555555' }}>
          {isSolvedState
            ? 'Nothing to solve yet.'
            : validation.ok
              ? 'One click and you get the full sequence, step by step.'
              : 'Fix the notes above and the button lights up.'}
        </p>
        {failure && (
          <p className="text-xs font-bold text-center" style={{ color: '#B90000' }}>{failure}</p>
        )}
      </div>

      {/* ── Follow the solution ────────────────────────────────────────── */}
      {solution && (
        <Panel color="#009B48" title={`3 · ${solution.turnCount} MOVES TO SOLVED`}>
          <div className="grid gap-5" style={{ gridTemplateColumns: 'minmax(0,1fr)' }}>
            <div className="sm:grid sm:gap-5" style={{ gridTemplateColumns: 'minmax(0, 260px) minmax(0, 1fr)' }}>
              <div
                style={{
                  border: '3px solid #0A0A0A',
                  boxShadow: '4px 4px 0 #0A0A0A',
                  borderRadius: 4,
                  background: '#0d0d12',
                  height: 260,
                  marginBottom: 20,
                }}
              >
                <CubeState3D
                  facelets={solution.states[0]}
                  moves={solution.moves}
                  index={step}
                  turnMs={turnMs}
                />
              </div>

              <div className="mb-5">
                <p className="text-xs font-bold mb-1" style={{ ...headingFont, color: '#555555', fontSize: '0.72rem' }}>
                  {finished ? 'DONE' : `MOVE ${step + 1} OF ${solution.moves.length}`}
                </p>
                <p style={{ ...headingFont, fontSize: '2.6rem', lineHeight: 1, color: finished ? '#009B48' : '#0A0A0A' }}>
                  {finished ? 'SOLVED!' : currentMove}
                </p>
                {activeStage && !finished && (
                  <p className="text-xs font-bold mt-2" style={{ color: activeStage.color }}>
                    {activeStage.title}
                  </p>
                )}
                <p className="text-xs leading-relaxed mt-2" style={{ color: '#555555' }}>
                  {finished
                    ? 'Every piece is home. Give the cube a spin and check it against the model.'
                    : activeStage?.blurb ?? 'Turn the highlighted face on your own cube, then step forward.'}
                </p>

                <div
                  className="mt-4"
                  style={{ height: 8, background: '#EEEEEE', border: '2px solid #0A0A0A', borderRadius: 2 }}
                >
                  <div
                    style={{
                      width: `${solution.moves.length ? (step / solution.moves.length) * 100 : 100}%`,
                      height: '100%',
                      background: '#009B48',
                      transition: 'width 0.2s ease',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Playback controls */}
            <div className="flex flex-wrap items-center gap-2">
              <SmallButton onClick={() => { setPlaying(false); setStep(0); }} icon={<RotateCcw size={13} />}>
                Restart
              </SmallButton>
              <SmallButton
                onClick={() => { setPlaying(false); setStep((s) => Math.max(0, s - 1)); }}
                disabled={step === 0}
                icon={<SkipBack size={13} />}
              >
                Back
              </SmallButton>
              <button
                onClick={() => {
                  if (finished) setStep(0);
                  setPlaying(finished ? true : !playing);
                }}
                className="btn-secondary inline-flex items-center gap-2 px-5 py-2"
                style={{ fontSize: '0.95rem' }}
              >
                {playing ? <Pause size={15} /> : <Play size={15} />}
                {playing ? 'Pause' : finished ? 'Play again' : 'Play'}
              </button>
              <SmallButton
                onClick={() => { setPlaying(false); setStep((s) => Math.min(solution.moves.length, s + 1)); }}
                disabled={finished}
                icon={<SkipForward size={13} />}
              >
                Next
              </SmallButton>
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-[10px] font-bold mr-1" style={{ color: '#555555' }}>SPEED</span>
                {SPEEDS.map((s, i) => (
                  <button
                    key={s.label}
                    onClick={() => setSpeedIndex(i)}
                    style={{
                      background: speedIndex === i ? '#0045AD' : '#FFFFFF',
                      color: speedIndex === i ? '#FFFFFF' : '#0A0A0A',
                      border: '2px solid #0A0A0A',
                      borderRadius: 2,
                      padding: '3px 8px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Full sequence */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold" style={{ ...headingFont, color: '#555555', fontSize: '0.72rem' }}>
                  FULL SEQUENCE
                </p>
                <button
                  onClick={copySolution}
                  className="inline-flex items-center gap-1 text-xs font-bold"
                  style={{ color: copied ? '#009B48' : '#0045AD', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div
                className="flex flex-wrap gap-1 p-3"
                style={{ border: '2px solid #0A0A0A', borderRadius: 4, background: '#FBFBFB' }}
              >
                {solution.moves.map((move, i) => (
                  <button
                    key={i}
                    onClick={() => { setPlaying(false); setStep(i); }}
                    title={`Jump to move ${i + 1}`}
                    style={{
                      fontFamily: 'var(--font-geist-mono, monospace)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 2,
                      border: '1px solid transparent',
                      cursor: 'pointer',
                      background: i === step ? '#FFD500' : i < step ? '#EFEFEF' : 'transparent',
                      color: i < step ? '#999999' : '#0045AD',
                      borderColor: i === step ? '#0A0A0A' : 'transparent',
                    }}
                  >
                    {move}
                  </button>
                ))}
              </div>
            </div>

            {/* Stage breakdown */}
            <div>
              <p className="text-xs font-bold mb-2" style={{ ...headingFont, color: '#555555', fontSize: '0.72rem' }}>
                STEP BY STEP
              </p>
              <div className="space-y-3">
                {solution.stages.map((stage) => {
                  const done = step >= stage.start + stage.moves.length;
                  const current = activeStage?.key === stage.key;
                  return (
                    <div
                      key={stage.key}
                      style={{
                        border: `2px solid ${current ? stage.color : '#0A0A0A'}`,
                        borderLeft: `6px solid ${stage.color}`,
                        borderRadius: 4,
                        padding: 12,
                        background: current ? 'rgba(255,213,0,0.07)' : '#FFFFFF',
                        opacity: stage.moves.length === 0 ? 0.6 : 1,
                      }}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ ...headingFont, fontSize: '1.05rem', color: '#0A0A0A' }}>
                          {stage.title}
                        </span>
                        <span className="text-[11px] font-bold" style={{ color: '#555555' }}>
                          {stage.moves.length === 0 ? 'already done — free skip!' : `${stage.moves.length} moves`}
                        </span>
                        {done && stage.moves.length > 0 && (
                          <Check size={13} style={{ color: '#009B48' }} />
                        )}
                        {stage.algId && stage.algName && (
                          <Link
                            href={`/algorithms/${stage.algId}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold ml-auto"
                            style={{ color: '#0045AD', textDecoration: 'none' }}
                          >
                            {stage.algName} <ArrowRight size={10} />
                          </Link>
                        )}
                      </div>
                      <p className="text-xs mt-1 mb-2" style={{ color: '#555555' }}>{stage.blurb}</p>
                      {stage.moves.length > 0 && (
                        <p className="alg-text" style={{ fontSize: '0.8rem' }}>{stage.moves.join(' ')}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <Notation moves={solution.moves} />
          </div>
        </Panel>
      )}
    </div>
  );
}

// ── Pieces of UI ────────────────────────────────────────────────────────────

const kbd = {
  border: '1.5px solid #0A0A0A',
  borderRadius: 2,
  padding: '0 4px',
  background: '#F4F4F4',
  fontFamily: 'var(--font-geist-mono, monospace)',
  fontSize: '0.7rem',
  fontWeight: 700,
} as const;

function Panel({ color, title, children }: { color: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ ...comicBox, padding: 24, marginBottom: 24 }}>
      <div
        style={{
          background: color,
          borderBottom: '3px solid #0A0A0A',
          margin: '-24px -24px 20px -24px',
          padding: '10px 16px',
        }}
      >
        <span style={{ ...headingFont, fontSize: '0.9rem', letterSpacing: '0.12em', color: color === '#FFD500' ? '#0A0A0A' : '#FFFFFF' }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function SmallButton({
  onClick, children, icon, disabled,
}: {
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold"
      style={{
        background: '#FFFFFF',
        color: '#0A0A0A',
        border: '2px solid #0A0A0A',
        boxShadow: '3px 3px 0 #0A0A0A',
        borderRadius: 2,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {icon}
      {children}
    </button>
  );
}

/** The five-step promise, so the flow is visible before it is started. */
function Flow({ solution, valid, finished }: { solution: Solution | null; valid: boolean; finished: boolean }) {
  const steps = [
    { label: 'Enter your cube', done: valid },
    { label: 'Validate', done: valid },
    { label: 'Solve', done: solution != null },
    { label: 'Follow along', done: solution != null && !finished },
    { label: 'Solved!', done: finished },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-6">
      {steps.map((s, i) => (
        <span key={s.label} className="inline-flex items-center gap-2">
          <span
            className="text-[11px] font-bold px-2 py-1"
            style={{
              border: '2px solid #0A0A0A',
              borderRadius: 2,
              background: s.done ? '#009B48' : '#FFFFFF',
              color: s.done ? '#FFFFFF' : '#555555',
            }}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && <span style={{ color: '#B90000', fontWeight: 900 }}>›</span>}
        </span>
      ))}
    </div>
  );
}

function CubeNet({
  stickers, highlighted, onPaint, paintingRef,
}: {
  stickers: string[];
  highlighted: Set<number>;
  onPaint: (index: number, cycle: boolean) => void;
  paintingRef: React.RefObject<boolean>;
}) {
  // Painting follows the pointer via hit-testing rather than `pointerenter`,
  // because a touch pointer stays captured by the sticker it started on and
  // would otherwise only ever paint that one.
  const paintUnderPointer = (e: React.PointerEvent) => {
    if (!paintingRef.current) return;
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const facelet = el?.dataset?.facelet;
    if (facelet !== undefined) onPaint(Number(facelet), false);
  };

  return (
    <div
      className="overflow-x-auto"
      style={{ paddingBottom: 4, touchAction: 'none' }}
      onPointerMove={paintUnderPointer}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, max-content)',
          gridTemplateRows: 'repeat(3, max-content)',
          gap: 10,
          width: 'max-content',
          margin: '0 auto',
        }}
      >
        {NET.map(({ face, col, row, label }) => (
          <div key={face} style={{ gridColumn: col, gridRow: row }}>
            <p
              className="text-[10px] font-bold mb-1 text-center"
              style={{ color: '#555555', letterSpacing: '0.08em' }}
            >
              {label.toUpperCase()}
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 3,
                padding: 3,
                background: '#0A0A0A',
                borderRadius: 3,
              }}
            >
              {Array.from({ length: 9 }, (_, cell) => {
                const index = FACE_OFFSET[face] + cell;
                const isCenter = cell === 4;
                const value = stickers[index];
                const filled = value !== BLANK;
                return (
                  <button
                    key={cell}
                    onPointerDown={(e) => {
                      if (isCenter) return;
                      e.preventDefault();
                      paintingRef.current = true;
                      onPaint(index, true);
                    }}
                    disabled={isCenter}
                    data-facelet={isCenter ? undefined : index}
                    aria-label={`${label} sticker ${cell + 1}`}
                    title={isCenter ? `${label} centre — fixed` : undefined}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 2,
                      background: filled ? HEX[value] : '#FFFFFF',
                      backgroundImage: filled
                        ? undefined
                        : 'repeating-linear-gradient(45deg, #E8E8E8 0 4px, #FFFFFF 4px 8px)',
                      border: highlighted.has(index) ? '2px solid #B90000' : '1px solid rgba(0,0,0,0.25)',
                      boxShadow: isCenter ? 'inset 0 0 0 2px rgba(10,10,10,0.55)' : undefined,
                      cursor: isCenter ? 'default' : 'pointer',
                      touchAction: 'none',
                      padding: 0,
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Only explains the move types the solution actually uses. */
function Notation({ moves }: { moves: string[] }) {
  const used = new Set(moves.map((m) => m[0]));
  const rows: [string, string][] = [
    ['R L U D F B', 'Turn that face a quarter turn clockwise, looking straight at it.'],
    ["R'  U'  F'", 'The same face, a quarter turn anticlockwise.'],
    ['R2 U2 F2', 'A half turn — direction does not matter.'],
  ];
  if ([...used].some((c) => 'MES'.includes(c))) {
    rows.push(['M E S', 'The middle slice between two faces: M follows L, E follows D, S follows F.']);
  }
  if ([...used].some((c) => 'rludfb'.includes(c))) {
    rows.push(['r u f', 'A wide turn — that face plus the slice behind it, together.']);
  }
  if ([...used].some((c) => 'xyz'.includes(c))) {
    rows.push(['x y z', 'Turn the whole cube: x follows R, y follows U, z follows F.']);
  }
  return (
    <div style={{ border: '2px dashed #0A0A0A', borderRadius: 4, padding: 12 }}>
      <p className="text-xs font-bold mb-2" style={{ ...headingFont, color: '#555555', fontSize: '0.72rem' }}>
        READING THE NOTATION
      </p>
      <dl className="space-y-1">
        {rows.map(([symbol, meaning]) => (
          <div key={symbol} className="flex gap-3 text-xs">
            <dt className="alg-text shrink-0" style={{ fontSize: '0.75rem', minWidth: 92 }}>{symbol}</dt>
            <dd style={{ color: '#555555' }}>{meaning}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
