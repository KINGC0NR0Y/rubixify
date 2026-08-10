'use client';

import { useState, useEffect } from 'react';
import { Heart, Copy, Check, Move, Star, Tag, Lightbulb, ChevronRight } from 'lucide-react';
import { Algorithm, getVizAlg } from '@/lib/algorithms';
import type { CubeState } from '@/lib/cubeImage';
import { toggleFavorite, isFavorite } from '@/lib/favorites';
import CubeViz from './CubeViz';
import AlgorithmCard from './AlgorithmCard';

const pillClass: Record<string, string> = {
  F2L: 'pill-f2l',
  OLL: 'pill-oll',
  PLL: 'pill-pll',
  Advanced: 'pill-adv',
};

const categoryColor: Record<string, string> = {
  F2L: '#0045AD',
  OLL: '#B90000',
  PLL: '#009B48',
  Advanced: '#FF5900',
};

interface Props {
  alg: Algorithm;
  related: Algorithm[];
}

// Shared style helpers
const comicBox = {
  background: '#FFFFFF',
  border: '3px solid #0A0A0A',
  boxShadow: '4px 4px 0 #0A0A0A',
  borderRadius: 4,
} as const;

const algBox = {
  background: 'rgba(0,69,173,0.06)',
  border: '2px solid #0A0A0A',
  borderRadius: 2,
} as const;

export default function AlgorithmDetail({ alg, related }: Props) {
  const [fav, setFav]       = useState(false);
  const [copied, setCopied] = useState(false);
  const [vizState, setVizState] = useState<CubeState>('recognition');
  const accent = categoryColor[alg.category] ?? '#0045AD';

  useEffect(() => {
    setFav(isFavorite(alg.id));
  }, [alg.id]);

  function handleFav() {
    const next = toggleFavorite(alg.id);
    setFav(next.includes(alg.id));
  }

  function handleCopy() {
    navigator.clipboard?.writeText(alg.alg).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8 fade-up">
        <div>
          <span className={`inline-flex text-xs font-bold px-2 py-0.5 ${pillClass[alg.category] ?? 'pill-f2l'}`}
            style={{ borderRadius: 2 }}>
            {alg.category}{alg.subCategory ? ` · ${alg.subCategory}` : ''}
          </span>
          <h1
            className="mt-2 mb-1"
            style={{
              fontFamily: 'var(--font-bangers, Bangers, cursive)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              letterSpacing: '0.03em',
              color: '#0A0A0A',
              lineHeight: 1,
            }}
          >
            {alg.name}
          </h1>
          <p className="text-sm leading-relaxed max-w-lg" style={{ color: '#2a2a2a' }}>
            {alg.recognition}
          </p>
        </div>
        <button
          onClick={handleFav}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all"
          style={
            fav
              ? { background: '#B90000', border: '3px solid #0A0A0A', boxShadow: '3px 3px 0 #0A0A0A', color: '#FFFFFF', borderRadius: 2 }
              : { background: '#FFFFFF', border: '3px solid #0A0A0A', boxShadow: '3px 3px 0 #0A0A0A', color: '#0A0A0A', borderRadius: 2 }
          }
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translate(-1px,-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '4px 4px 0 #0A0A0A'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '3px 3px 0 #0A0A0A'; }}
        >
          <Heart size={14} fill={fav ? '#FFFFFF' : 'none'} />
          {fav ? 'Saved' : 'Save'}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* ── Left: details ─────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Main algorithm */}
          <div style={{ ...comicBox, padding: 20 }} className="fade-up-2">
            <div
              style={{
                background: accent,
                borderBottom: '3px solid #0A0A0A',
                margin: '-20px -20px 16px -20px',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-bangers, Bangers, cursive)',
                fontSize: '0.95rem',
                letterSpacing: '0.1em',
                color: '#FFFFFF',
              }}>
                MAIN ALGORITHM
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 font-bold transition-all"
                style={
                  copied
                    ? { background: '#009B48', color: '#FFFFFF', border: '2px solid #0A0A0A', borderRadius: 2 }
                    : { background: '#FFD500', color: '#0A0A0A', border: '2px solid #0A0A0A', borderRadius: 2 }
                }
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div
              className="alg-text text-xl px-4 py-4"
              style={{ ...algBox, letterSpacing: '0.08em' }}
            >
              {alg.alg || <span style={{ color: '#888888' }}>Skip – already solved</span>}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 fade-up-2">
            {[
              { icon: <Move size={14} />, label: 'Moves', value: alg.moves.toString(), color: '#0045AD' },
              { icon: <Star size={14} />, label: 'Popularity', value: `${alg.popularity}/10`, color: '#FF5900' },
              { icon: <Tag size={14} />, label: 'Category', value: alg.category, color: accent },
            ].map((s) => (
              <div key={s.label} style={{ ...comicBox, padding: '16px 12px', textAlign: 'center' }}>
                <div style={{ color: s.color, display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                  {s.icon}
                </div>
                <div style={{
                  fontFamily: 'var(--font-bangers, Bangers, cursive)',
                  fontSize: '1.6rem',
                  color: s.color,
                  lineHeight: 1,
                }}>
                  {s.value}
                </div>
                <div className="text-xs mt-1 font-semibold" style={{ color: '#555555' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Alternative algorithms */}
          {alg.alts.length > 0 && (
            <div style={{ ...comicBox, padding: 20 }} className="fade-up-3">
              <div style={{
                background: '#FFD500',
                borderBottom: '3px solid #0A0A0A',
                margin: '-20px -20px 16px -20px',
                padding: '10px 16px',
              }}>
                <span style={{
                  fontFamily: 'var(--font-bangers, Bangers, cursive)',
                  fontSize: '0.95rem',
                  letterSpacing: '0.1em',
                  color: '#0A0A0A',
                }}>
                  ALTERNATIVE ALGORITHMS
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {alg.alts.map((alt, i) => (
                  <div
                    key={i}
                    className="alg-text text-sm px-3 py-2.5 flex items-center justify-between"
                    style={algBox}
                  >
                    <span>{alt}</span>
                    <button
                      onClick={() => navigator.clipboard?.writeText(alt).catch(() => {})}
                      className="p-1 rounded transition-colors"
                      style={{ color: '#0045AD', border: '1px solid #0A0A0A', borderRadius: 2, background: '#FFFFFF' }}
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recognition & fingertricks */}
          <div style={{ ...comicBox, padding: 20 }} className="fade-up-3">
            <div style={{
              background: '#FF5900',
              borderBottom: '3px solid #0A0A0A',
              margin: '-20px -20px 16px -20px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <Lightbulb size={14} style={{ color: '#FFFFFF' }} />
              <span style={{
                fontFamily: 'var(--font-bangers, Bangers, cursive)',
                fontSize: '0.95rem',
                letterSpacing: '0.1em',
                color: '#FFFFFF',
              }}>
                RECOGNITION TIPS
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#2a2a2a' }}>
              {alg.recognition}
            </p>
            {alg.fingertricks && (
              <div
                className="mt-4 pt-4"
                style={{ borderTop: '2px dashed #0A0A0A' }}
              >
                <p className="text-xs font-bold mb-1" style={{ color: '#0A0A0A' }}>
                  Fingertrick Suggestion
                </p>
                <p className="text-xs leading-relaxed" style={{ color: '#2a2a2a' }}>
                  {alg.fingertricks}
                </p>
              </div>
            )}
          </div>

          {/* Notes / tips */}
          {alg.notes && (
            <div style={{ ...comicBox, padding: 20 }} className="fade-up-3">
              <div style={{
                background: '#FFD500',
                borderBottom: '3px solid #0A0A0A',
                margin: '-20px -20px 16px -20px',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <Lightbulb size={14} style={{ color: '#0A0A0A' }} />
                <span style={{
                  fontFamily: 'var(--font-bangers, Bangers, cursive)',
                  fontSize: '0.95rem',
                  letterSpacing: '0.1em',
                  color: '#0A0A0A',
                }}>
                  NOTES &amp; TIPS
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#2a2a2a' }}>
                {alg.notes}
              </p>
            </div>
          )}
        </div>

        {/* ── Right: diagram + related ───────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Case diagram */}
          <div style={{ ...comicBox, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }} className="fade-up-2">
            <div style={{
              background: accent,
              borderBottom: '3px solid #0A0A0A',
              margin: '-20px -20px 4px -20px',
              padding: '10px 16px',
              alignSelf: 'stretch',
            }}>
              <span style={{
                fontFamily: 'var(--font-bangers, Bangers, cursive)',
                fontSize: '0.9rem',
                letterSpacing: '0.1em',
                color: '#FFFFFF',
              }}>
                CASE DIAGRAM
              </span>
            </div>
            <CubeViz alg={getVizAlg(alg)} category={alg.category} size={150} state={vizState} />

            {/* Recognition / Solved state toggle */}
            <div className="flex gap-2">
              {([
                { key: 'recognition', label: 'Recognition' },
                { key: 'solved', label: 'Solved' },
              ] as const).map((opt) => {
                const active = vizState === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setVizState(opt.key)}
                    style={{
                      background: active ? accent : '#FFFFFF',
                      color: active ? '#FFFFFF' : '#0A0A0A',
                      border: '2px solid #0A0A0A',
                      boxShadow: active ? '1px 1px 0 #0A0A0A' : '2px 2px 0 #0A0A0A',
                      borderRadius: 2,
                      padding: '3px 10px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transform: active ? 'translate(1px,1px)' : '',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-center font-semibold" style={{ color: '#555555' }}>
              {vizState === 'solved'
                ? 'Goal state after solving'
                : `${alg.caseShape ?? alg.category} pattern`}
            </p>
          </div>

          {/* Related algorithms */}
          {related.length > 0 && (
            <div className="fade-up-3">
              <div className="flex items-center gap-1.5 mb-3 px-1">
                <ChevronRight size={13} style={{ color: '#B90000' }} />
                <span style={{
                  fontFamily: 'var(--font-bangers, Bangers, cursive)',
                  fontSize: '0.95rem',
                  letterSpacing: '0.06em',
                  color: '#0A0A0A',
                }}>
                  Related {alg.category} Cases
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {related.map((r) => (
                  <AlgorithmCard key={r.id} alg={r} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
