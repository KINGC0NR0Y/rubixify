'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Shuffle, Eye, EyeOff, CheckCircle, XCircle, RotateCcw, ArrowRight } from 'lucide-react';
import { ollAlgorithms, pllAlgorithms, Algorithm } from '@/lib/algorithms';
import CubeViz from '@/components/CubeViz';
import Link from 'next/link';
import { recordQuizAttempt } from '@/lib/session-store';

type Mode = 'OLL' | 'PLL';

interface Result {
  id: string;
  correct: boolean;
}

const modeColor: Record<Mode, string> = { OLL: '#6495ED', PLL: '#009B48' };

const comicBox = {
  background: '#FFFFFF',
  border: '3px solid #0A0A0A',
  boxShadow: '4px 4px 0 #0A0A0A',
  borderRadius: 4,
} as const;

function pickRandom(arr: Algorithm[]): Algorithm {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildOptions(pool: Algorithm[], current: Algorithm): Algorithm[] {
  const wrong = [...pool.filter(a => a.id !== current.id)]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  return [...wrong, current].sort(() => Math.random() - 0.5);
}

export function QuizTab() {
  const [mode, setMode]       = useState<Mode>('OLL');
  const [current, setCurrent] = useState<Algorithm>(ollAlgorithms[0]);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [options, setOptions] = useState<Algorithm[]>([]);
  const caseStartRef = useRef(Date.now());

  const pool = mode === 'OLL' ? ollAlgorithms : pllAlgorithms;

  useEffect(() => {
    const c = pickRandom(ollAlgorithms);
    setCurrent(c);
    setOptions(buildOptions(ollAlgorithms, c));
    caseStartRef.current = Date.now();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (options.length > 0) setOptions(buildOptions(pool, current));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const next = useCallback(() => {
    const c = pickRandom(pool);
    setCurrent(c);
    setOptions(buildOptions(pool, c));
    setRevealed(false);
    setSelected(null);
    caseStartRef.current = Date.now();
  }, [pool]);

  function switchMode(m: Mode) {
    setMode(m);
    const p = m === 'OLL' ? ollAlgorithms : pllAlgorithms;
    const c = pickRandom(p);
    setCurrent(c);
    setOptions(buildOptions(p, c));
    setRevealed(false);
    setSelected(null);
    setResults([]);
    caseStartRef.current = Date.now();
  }

  function handleGuess(id: string) {
    if (selected) return;
    const responseMs = Date.now() - caseStartRef.current;
    const correct = id === current.id;
    setSelected(id);
    setRevealed(true);
    setResults(r => [...r, { id: current.id, correct }]);
    recordQuizAttempt(current.id, correct, responseMs);
  }

  function reset() {
    setResults([]);
    next();
  }

  const accuracy =
    results.length > 0
      ? Math.round((results.filter(r => r.correct).length / results.length) * 100)
      : null;

  return (
    <div>
      {/* Mode toggle */}
      <div className="flex gap-3 mb-6 fade-up-2">
        {(['OLL', 'PLL'] as Mode[]).map(m => {
          const active = mode === m;
          return (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{
                background: active ? modeColor[m] : '#FFFFFF',
                color: active ? '#FFFFFF' : '#0A0A0A',
                border: '3px solid #0A0A0A',
                boxShadow: active ? '2px 2px 0 #0A0A0A' : '4px 4px 0 #0A0A0A',
                borderRadius: 2,
                padding: '8px 28px',
                fontSize: '1rem',
                fontFamily: 'var(--font-bangers, Bangers, cursive)',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transform: active ? 'translate(2px,2px)' : '',
              }}
            >
              {m}
            </button>
          );
        })}
      </div>

      {/* Stats bar */}
      {results.length > 0 && (
        <div
          className="flex items-center gap-4 px-4 py-3 mb-6 text-sm fade-up"
          style={{ ...comicBox, background: '#FFFDF4' }}
        >
          <span className="font-bold" style={{ color: '#555555' }}>{results.length} attempted</span>
          <span className="flex items-center gap-1 font-bold" style={{ color: '#009B48' }}>
            <CheckCircle size={13} />
            {results.filter(r => r.correct).length}
          </span>
          <span className="flex items-center gap-1 font-bold" style={{ color: '#6495ED' }}>
            <XCircle size={13} />
            {results.filter(r => !r.correct).length}
          </span>
          <span
            className="ml-auto font-black"
            style={{
              fontFamily: 'var(--font-bangers, Bangers, cursive)',
              fontSize: '1.3rem',
              letterSpacing: '0.06em',
              color: accuracy && accuracy >= 70 ? '#009B48' : '#6495ED',
            }}
          >
            {accuracy}%
          </span>
          <button
            onClick={reset}
            className="flex items-center gap-1 text-xs font-bold"
            style={{ color: '#555555', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      )}

      {/* Quiz card */}
      <div style={{ ...comicBox, padding: 24, marginBottom: 20 }} className="fade-up-3">
        <div style={{
          background: modeColor[mode],
          borderBottom: '3px solid #0A0A0A',
          margin: '-24px -24px 20px -24px',
          padding: '10px 16px',
        }}>
          <span style={{
            fontFamily: 'var(--font-bangers, Bangers, cursive)',
            fontSize: '0.9rem',
            letterSpacing: '0.12em',
            color: '#FFFFFF',
          }}>
            WHAT IS THIS {mode} CASE?
          </span>
        </div>

        <div className="flex justify-center mb-6">
          <div style={{
            background: '#FFFFFF',
            border: '3px solid #0A0A0A',
            boxShadow: '4px 4px 0 #0A0A0A',
            borderRadius: 4,
            padding: 20,
          }}>
            <CubeViz alg={current.alg} category={current.category} size={140} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {options.map(opt => {
            let bg = '#FFFFFF', color = '#0A0A0A', shadow = '3px 3px 0 #0A0A0A';
            if (selected) {
              if (opt.id === current.id) { bg = '#009B48'; color = '#FFFFFF'; shadow = '2px 2px 0 #0A0A0A'; }
              else if (opt.id === selected) { bg = '#6495ED'; color = '#FFFFFF'; shadow = '2px 2px 0 #0A0A0A'; }
            }
            return (
              <button
                key={opt.id}
                onClick={() => handleGuess(opt.id)}
                disabled={!!selected}
                style={{
                  background: bg, color,
                  border: '2px solid #0A0A0A',
                  boxShadow: shadow,
                  borderRadius: 2,
                  padding: '12px 16px',
                  fontSize: '0.87rem',
                  fontWeight: 700,
                  textAlign: 'left',
                  cursor: selected ? 'default' : 'pointer',
                }}
              >
                {opt.name}
              </button>
            );
          })}
        </div>

        {!selected && (
          <div className="text-center">
            <button
              onClick={() => setRevealed(v => !v)}
              className="inline-flex items-center gap-2 text-xs font-bold"
              style={{ color: '#555555', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
              {revealed ? 'Hide' : 'Reveal'} answer
            </button>
          </div>
        )}

        {revealed && (
          <div
            className="mt-4 p-4"
            style={
              selected
                ? selected === current.id
                  ? { background: 'rgba(0,155,72,0.08)', border: '2px solid #009B48', borderRadius: 4 }
                  : { background: 'rgba(185,0,0,0.08)', border: '2px solid #6495ED', borderRadius: 4 }
                : { background: '#FFFDF4', border: '2px solid #0A0A0A', borderRadius: 4 }
            }
          >
            <p className="text-xs font-bold mb-1" style={{ color: '#555555', fontFamily: 'var(--font-bangers, Bangers, cursive)', letterSpacing: '0.1em', fontSize: '0.75rem' }}>
              CORRECT CASE
            </p>
            <p className="font-bold mb-1" style={{ fontFamily: 'var(--font-bangers, Bangers, cursive)', fontSize: '1.1rem', letterSpacing: '0.04em', color: '#0A0A0A' }}>
              {current.name}
            </p>
            {current.alg && (
              <p className="alg-text mb-2" style={{ fontSize: '0.85rem' }}>{current.alg}</p>
            )}
            <p className="text-xs leading-relaxed mb-3" style={{ color: '#555555' }}>
              {current.recognition}
            </p>
            <Link
              href={`/algorithms/${current.id}`}
              className="inline-flex items-center gap-1 text-xs font-bold"
              style={{ color: '#0045AD', textDecoration: 'none' }}
            >
              View full algorithm <ArrowRight size={11} />
            </Link>
          </div>
        )}
      </div>

      <div className="flex justify-center fade-up-4">
        <button
          onClick={next}
          className="btn-primary flex items-center gap-2 px-8 py-3 font-bold text-sm"
        >
          <Shuffle size={15} />
          Next Case
        </button>
      </div>
    </div>
  );
}
