'use client';

import Link from 'next/link';
import { Heart, Move } from 'lucide-react';
import { Algorithm, getVizAlg } from '@/lib/algorithms';
import { toggleFavorite, useFavorites } from '@/lib/favorites';
import CubeViz from './CubeViz';

const pillClass: Record<string, string> = {
  F2L: 'pill-f2l',
  OLL: 'pill-oll',
  PLL: 'pill-pll',
};

const categoryAccent: Record<string, string> = {
  F2L: '#0045AD',
  OLL: '#B90000',
  PLL: '#009B48',
};

interface Props {
  alg: Algorithm;
}

export default function AlgorithmCard({ alg }: Props) {
  const fav = useFavorites().includes(alg.id);

  function handleFav(e: React.MouseEvent) {
    e.preventDefault();
    toggleFavorite(alg.id);
  }

  const accent = categoryAccent[alg.category] ?? '#0045AD';

  return (
    <Link
      href={`/algorithms/${alg.id}`}
      className="card-solid card-hover flex flex-col gap-0 group"
      style={{ borderRadius: 4, overflow: 'hidden', textDecoration: 'none' }}
    >
      {/* Colored category header bar */}
      <div
        style={{
          background: accent,
          borderBottom: '3px solid #0A0A0A',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span className={`inline-flex text-xs font-bold px-2 py-0.5 ${pillClass[alg.category] ?? 'pill-f2l'}`}
          style={{ borderRadius: 2 }}>
          {alg.category}{alg.subCategory ? ` · ${alg.subCategory}` : ''}
        </span>
        <button
          onClick={handleFav}
          className="p-1 rounded transition-all shrink-0"
          title={fav ? 'Remove from favorites' : 'Add to favorites'}
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          <Heart
            size={13}
            fill={fav ? '#FFFFFF' : 'none'}
            style={{ color: '#FFFFFF' }}
          />
        </button>
      </div>

      <div style={{ padding: '12px' }}>
        {/* Name */}
        <h3
          className="text-sm font-bold leading-tight mb-3"
          style={{
            color: '#0A0A0A',
            fontFamily: 'var(--font-bangers, Bangers, cursive)',
            fontSize: '1rem',
            letterSpacing: '0.04em',
          }}
        >
          {alg.name}
        </h3>

        {/* Diagram */}
        <div className="flex justify-center py-1 mb-3">
          <CubeViz alg={getVizAlg(alg)} category={alg.category} size={64} />
        </div>

        {/* Algorithm notation */}
        <div
          className="alg-text px-3 py-2 truncate mb-3"
          style={{
            border: '2px solid #0A0A0A',
            borderRadius: 2,
            background: 'rgba(0,69,173,0.06)',
          }}
          title={alg.alg}
        >
          {alg.alg || 'Skip (already solved)'}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs" style={{ color: '#555555' }}>
          <span className="flex items-center gap-1 font-semibold">
            <Move size={11} />
            {alg.moves} moves
          </span>
          <span style={{ color: alg.popularity >= 8 ? '#009B48' : '#888888', fontSize: '0.7rem' }}>
            {'★'.repeat(Math.round(alg.popularity / 2))}{'☆'.repeat(5 - Math.round(alg.popularity / 2))}
          </span>
        </div>
      </div>
    </Link>
  );
}
