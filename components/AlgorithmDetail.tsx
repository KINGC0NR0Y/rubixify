'use client';

import { useState, useEffect } from 'react';
import { Heart, Copy, Check, Move, Star, Tag, Lightbulb, ChevronRight } from 'lucide-react';
import { Algorithm } from '@/lib/algorithms';
import { toggleFavorite, isFavorite } from '@/lib/favorites';
import CubeViz from './CubeViz';
import AlgorithmCard from './AlgorithmCard';

const pillClass: Record<string, string> = {
  F2L: 'pill-f2l',
  OLL: 'pill-oll',
  PLL: 'pill-pll',
  Advanced: 'pill-adv',
};

interface Props {
  alg: Algorithm;
  related: Algorithm[];
}

export default function AlgorithmDetail({ alg, related }: Props) {
  const [fav, setFav]       = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setFav(isFavorite(alg.id));
  }, [alg.id]);

  function handleFav() {
    const next = toggleFavorite(alg.id);
    setFav(next.includes(alg.id));
  }

  function handleCopy() {
    navigator.clipboard.writeText(alg.alg);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8 fade-up">
        <div>
          <span className={`inline-flex text-xs font-mono px-2 py-0.5 rounded-full ${pillClass[alg.category] ?? 'pill-f2l'}`}>
            {alg.category}{alg.subCategory ? ` · ${alg.subCategory}` : ''}
          </span>
          <h1 className="text-4xl font-black mt-2 mb-1" style={{ color: 'var(--fg)' }}>
            {alg.name}
          </h1>
          <p className="text-sm leading-relaxed max-w-lg" style={{ color: 'var(--fg-2)' }}>
            {alg.recognition}
          </p>
        </div>
        <button
          onClick={handleFav}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all"
          style={
            fav
              ? { background: 'rgba(184,78,116,0.15)', borderColor: 'rgba(184,78,116,0.4)', color: 'var(--rose)' }
              : { background: '#181828', borderColor: 'var(--border)', color: 'var(--fg-2)' }
          }
        >
          <Heart size={14} fill={fav ? 'var(--rose)' : 'none'} />
          {fav ? 'Saved' : 'Save'}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* ── Left: details ─────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Main algorithm */}
          <div className="card-solid rounded-2xl p-5 fade-up-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                Main Algorithm
              </h2>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
                style={
                  copied
                    ? { background: 'rgba(52,211,153,0.15)', color: 'var(--emerald)', border: '1px solid rgba(52,211,153,0.3)' }
                    : { background: '#181828', color: 'var(--fg-2)', border: '1px solid var(--border)' }
                }
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div
              className="alg-text text-xl rounded-xl px-4 py-4"
              style={{ background: '#181828', border: '1px solid var(--border)', letterSpacing: '0.08em' }}
            >
              {alg.alg || <span style={{ color: 'var(--fg-3)' }}>Skip – already solved</span>}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 fade-up-2">
            {[
              { icon: <Move size={14} />, label: 'Move Count', value: alg.moves.toString() },
              { icon: <Star size={14} />, label: 'Popularity', value: `${alg.popularity}/10` },
              { icon: <Tag size={14} />, label: 'Category', value: alg.category },
            ].map((s) => (
              <div key={s.label} className="card-solid rounded-2xl p-4 text-center">
                <div className="flex justify-center mb-1.5" style={{ color: 'var(--fg-3)' }}>
                  {s.icon}
                </div>
                <div className="text-xl font-black" style={{ color: 'var(--violet-2)' }}>
                  {s.value}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--fg-3)' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Alternative algorithms */}
          {alg.alts.length > 0 && (
            <div className="card-solid rounded-2xl p-5 fade-up-3">
              <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--fg)' }}>
                Alternative Algorithms
              </h2>
              <div className="flex flex-col gap-2">
                {alg.alts.map((alt, i) => (
                  <div
                    key={i}
                    className="alg-text text-sm rounded-xl px-3 py-2.5 flex items-center justify-between"
                    style={{ background: '#181828', border: '1px solid var(--border)' }}
                  >
                    <span>{alt}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(alt)}
                      className="p-1 rounded hover:bg-white/8 transition-colors"
                      style={{ color: 'var(--fg-3)' }}
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recognition & fingertricks */}
          <div className="card-solid rounded-2xl p-5 fade-up-3">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={14} style={{ color: 'var(--amber)' }} />
              <h2 className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                Recognition Tips
              </h2>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-2)' }}>
              {alg.recognition}
            </p>
            {alg.fingertricks && (
              <div
                className="mt-4 pt-4 border-t"
                style={{ borderColor: 'var(--border)' }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--fg)' }}>
                  Fingertrick Suggestion
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--fg-2)' }}>
                  {alg.fingertricks}
                </p>
              </div>
            )}
          </div>

        </div>

        {/* ── Right: diagram + related ───────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Case diagram */}
          <div className="card-solid rounded-2xl p-5 flex flex-col items-center gap-3 fade-up-2">
            <h2 className="text-sm font-semibold self-start" style={{ color: 'var(--fg)' }}>
              Case Diagram
            </h2>
            <CubeViz alg={alg.alg} category={alg.category} size={150} />
            <p className="text-xs text-center" style={{ color: 'var(--fg-3)' }}>
              {alg.caseShape ?? alg.category} pattern
            </p>
          </div>

          {/* Related algorithms */}
          {related.length > 0 && (
            <div className="fade-up-3">
              <div className="flex items-center gap-1.5 mb-3 px-1">
                <ChevronRight size={13} style={{ color: 'var(--fg-3)' }} />
                <h2 className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                  Related {alg.category} Cases
                </h2>
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
