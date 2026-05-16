'use client';

import Link from 'next/link';
import { Heart, Move } from 'lucide-react';
import { Algorithm } from '@/lib/algorithms';
import { toggleFavorite, isFavorite } from '@/lib/favorites';
import { useState, useEffect } from 'react';
import CubeViz from './CubeViz';

const pillClass: Record<string, string> = {
  F2L: 'pill-f2l',
  OLL: 'pill-oll',
  PLL: 'pill-pll',
  Advanced: 'pill-adv',
};

interface Props {
  alg: Algorithm;
}

export default function AlgorithmCard({ alg }: Props) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(isFavorite(alg.id));
  }, [alg.id]);

  function handleFav(e: React.MouseEvent) {
    e.preventDefault();
    const next = toggleFavorite(alg.id);
    setFav(next.includes(alg.id));
  }

  return (
    <Link
      href={`/algorithms/${alg.id}`}
      className="card-solid rounded-2xl p-4 flex flex-col gap-3 card-hover group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span
            className={`inline-flex text-xs font-mono px-2 py-0.5 rounded-full ${pillClass[alg.category] ?? 'pill-f2l'}`}
          >
            {alg.category}
            {alg.subCategory ? ` · ${alg.subCategory}` : ''}
          </span>
          <h3
            className="mt-2 text-sm font-semibold leading-tight truncate"
            style={{ color: 'var(--fg)' }}
          >
            {alg.name}
          </h3>
        </div>

        <button
          onClick={handleFav}
          className="p-1.5 rounded-lg transition-all hover:bg-white/8 shrink-0 mt-0.5"
          title={fav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            size={14}
            fill={fav ? 'var(--rose)' : 'none'}
            style={{ color: fav ? 'var(--rose)' : 'var(--fg-3)' }}
          />
        </button>
      </div>

      {/* Diagram */}
      <div className="flex justify-center py-1">
        <CubeViz alg={alg.alg} category={alg.category} size={64} />
      </div>

      {/* Algorithm notation */}
      <div
        className="alg-text rounded-xl px-3 py-2 truncate"
        style={{ background: '#181828', border: '1px solid var(--border)' }}
        title={alg.alg}
      >
        {alg.alg || 'Skip (already solved)'}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between text-xs"
        style={{ color: 'var(--fg-3)' }}
      >
        <span className="flex items-center gap-1">
          <Move size={11} />
          {alg.moves} moves
        </span>
        <span
          className="flex items-center gap-1"
          style={{ color: alg.popularity >= 8 ? 'var(--emerald)' : 'var(--fg-3)' }}
        >
          {'★'.repeat(Math.round(alg.popularity / 2))}{'☆'.repeat(5 - Math.round(alg.popularity / 2))}
        </span>
      </div>
    </Link>
  );
}
