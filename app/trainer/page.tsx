'use client';

import { useState, useCallback, useEffect } from 'react';
import { Shuffle, Eye, EyeOff, CheckCircle, XCircle, RotateCcw, ArrowRight } from 'lucide-react';
import { ollAlgorithms, pllAlgorithms, Algorithm } from '@/lib/algorithms';
import CubeViz from '@/components/CubeViz';
import Link from 'next/link';

type Mode = 'OLL' | 'PLL';

interface Result {
  id: string;
  correct: boolean;
}

function pickRandom(arr: Algorithm[]): Algorithm {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function TrainerPage() {
  const [mode, setMode]         = useState<Mode>('OLL');
  const [current, setCurrent]   = useState<Algorithm>(ollAlgorithms[0]);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults]   = useState<Result[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [options, setOptions]   = useState<Algorithm[]>([]);

  const pool = mode === 'OLL' ? ollAlgorithms : pllAlgorithms;

  function buildOptions(p: Algorithm[], c: Algorithm): Algorithm[] {
    const wrong = [...p.filter((a) => a.id !== c.id)].sort(() => Math.random() - 0.5).slice(0, 3);
    return [...wrong, c].sort(() => Math.random() - 0.5);
  }

  // Randomise only on the client to avoid SSR/hydration mismatch
  useEffect(() => {
    const c = pickRandom(ollAlgorithms);
    setCurrent(c);
    setOptions(buildOptions(ollAlgorithms, c));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Regenerate options whenever current or pool changes (after mount)
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
  }

  function handleGuess(id: string) {
    if (selected) return;
    setSelected(id);
    setRevealed(true);
    setResults((r) => [...r, { id: current.id, correct: id === current.id }]);
  }

  function reset() {
    setResults([]);
    next();
  }

  const accuracy =
    results.length > 0
      ? Math.round((results.filter((r) => r.correct).length / results.length) * 100)
      : null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8 fade-up">
        <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--fg-3)' }}>
          <Link href="/" className="hover:text-(--fg-2) transition-colors" style={{ color: 'var(--fg-3)' }}>Home</Link>
          <span>/</span>
          <span style={{ color: 'var(--fg-2)' }}>Trainer</span>
        </div>
        <h1 className="text-4xl font-black mb-1">
          <span style={{ color: 'var(--fg)' }}>Algorithm </span>
          <span className="gradient-text">Trainer</span>
        </h1>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--fg-2)' }}>
          Practice recognizing OLL and PLL cases. Identify the case from the diagram, then reveal the algorithm.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6 fade-up-2">
        {(['OLL', 'PLL'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className="px-6 py-2 rounded-xl text-sm font-semibold transition-all"
            style={
              mode === m
                ? {
                    background: m === 'OLL' ? 'rgba(240,98,146,0.2)' : 'rgba(52,211,153,0.2)',
                    color: m === 'OLL' ? 'var(--rose)' : 'var(--emerald)',
                    border: `1px solid ${m === 'OLL' ? 'rgba(240,98,146,0.5)' : 'rgba(52,211,153,0.5)'}`,
                  }
                : {
                    background: '#0e0e18',
                    color: 'var(--fg-2)',
                    border: '1px solid var(--border)',
                  }
            }
          >
            {m}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      {results.length > 0 && (
        <div className="card-solid rounded-2xl flex items-center gap-4 px-4 py-3 mb-6 text-sm fade-up">
          <span style={{ color: 'var(--fg-3)' }}>{results.length} attempted</span>
          <span className="flex items-center gap-1" style={{ color: 'var(--emerald)' }}>
            <CheckCircle size={13} />
            {results.filter((r) => r.correct).length}
          </span>
          <span className="flex items-center gap-1" style={{ color: 'var(--rose)' }}>
            <XCircle size={13} />
            {results.filter((r) => !r.correct).length}
          </span>
          <span
            className="ml-auto font-black text-base"
            style={{ color: accuracy && accuracy >= 70 ? 'var(--emerald)' : 'var(--rose)' }}
          >
            {accuracy}%
          </span>
          <button
            onClick={reset}
            className="flex items-center gap-1 text-xs transition-colors hover:text-foreground"
            style={{ color: 'var(--fg-3)' }}
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      )}

      {/* Quiz card */}
      <div className="card-solid rounded-2xl p-6 mb-5 fade-up-3">
        <p className="text-xs font-medium mb-5 text-center tracking-widest uppercase" style={{ color: 'var(--fg-3)' }}>
          What is this {mode} case?
        </p>

        {/* Diagram */}
        <div className="flex justify-center mb-6">
          <div
            className="card-solid rounded-2xl p-5"
          >
            <CubeViz alg={current.alg} category={current.category} size={140} />
          </div>
        </div>

        {/* Multiple choice */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {options.map((opt) => {
            let style: React.CSSProperties = {
              background: '#0e0e18',
              borderColor: 'var(--border)',
              color: 'var(--fg)',
            };
            if (selected) {
              if (opt.id === current.id) {
                style = { background: 'rgba(52,211,153,0.12)', borderColor: 'rgba(52,211,153,0.5)', color: 'var(--emerald)' };
              } else if (opt.id === selected) {
                style = { background: 'rgba(240,98,146,0.12)', borderColor: 'rgba(240,98,146,0.5)', color: 'var(--rose)' };
              }
            }
            return (
              <button
                key={opt.id}
                onClick={() => handleGuess(opt.id)}
                disabled={!!selected}
                className="px-4 py-3 rounded-xl text-sm text-left border transition-all font-medium"
                style={style}
              >
                {opt.name}
              </button>
            );
          })}
        </div>

        {/* Reveal toggle */}
        {!selected && (
          <div className="text-center">
            <button
              onClick={() => setRevealed((v) => !v)}
              className="inline-flex items-center gap-2 text-xs transition-colors"
              style={{ color: 'var(--fg-3)' }}
            >
              {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
              {revealed ? 'Hide' : 'Reveal'} answer
            </button>
          </div>
        )}

        {/* Answer reveal */}
        {revealed && (
          <div
            className="mt-4 rounded-xl p-4 border"
            style={
              selected
                ? selected === current.id
                  ? { background: 'rgba(52,211,153,0.06)', borderColor: 'rgba(52,211,153,0.25)' }
                  : { background: 'rgba(240,98,146,0.06)', borderColor: 'rgba(240,98,146,0.25)' }
                : { background: '#181828', borderColor: 'var(--border)' }
            }
          >
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--fg-3)' }}>
              Correct case
            </p>
            <p className="font-bold mb-1" style={{ color: 'var(--fg)' }}>
              {current.name}
            </p>
            {current.alg && (
              <p className="alg-text mb-2">{current.alg}</p>
            )}
            <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--fg-2)' }}>
              {current.recognition}
            </p>
            <Link
              href={`/algorithms/${current.id}`}
              className="inline-flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-80"
              style={{ color: 'var(--violet-2)' }}
            >
              View full algorithm <ArrowRight size={11} />
            </Link>
          </div>
        )}
      </div>

      {/* Next button */}
      <div className="flex justify-center fade-up-4">
        <button
          onClick={next}
          className="btn-primary flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm"
        >
          <Shuffle size={15} />
          Next Case
        </button>
      </div>
    </div>
  );
}
