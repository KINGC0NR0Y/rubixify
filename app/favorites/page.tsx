'use client';

import { useState, useEffect } from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { getFavorites } from '@/lib/favorites';
import { getAlgorithmById } from '@/lib/algorithms';
import AlgorithmCard from '@/components/AlgorithmCard';
import Link from 'next/link';

export default function FavoritesPage() {
  const [favIds, setFavIds] = useState<string[]>([]);

  useEffect(() => {
    setFavIds(getFavorites());
  }, []);

  const algorithms = favIds
    .map((id) => getAlgorithmById(id))
    .filter(Boolean) as ReturnType<typeof getAlgorithmById>[];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs mb-3 fade-up" style={{ color: 'var(--fg-3)' }}>
        <Link href="/" className="hover:text-(--fg-2) transition-colors" style={{ color: 'var(--fg-3)' }}>Home</Link>
        <span>/</span>
        <span style={{ color: 'var(--fg-2)' }}>Favorites</span>
      </div>

      <div className="flex items-center gap-3 mb-8 fade-up">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(240,98,146,0.15)' }}
        >
          <Heart size={18} fill="var(--rose)" style={{ color: 'var(--rose)' }} />
        </div>
        <div>
          <h1 className="text-4xl font-black">
            <span style={{ color: 'var(--fg)' }}>Saved </span>
            <span className="gradient-text">Algorithms</span>
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--fg-2)' }}>
            Your personal algorithm reference collection
          </p>
        </div>
      </div>

      {algorithms.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 fade-up-2">
          {algorithms.map((alg) => alg && <AlgorithmCard key={alg.id} alg={alg} />)}
        </div>
      ) : (
        <div className="card-solid rounded-2xl p-16 text-center fade-up-2">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(240,98,146,0.1)' }}
          >
            <Heart size={28} style={{ color: 'var(--rose)', opacity: 0.5 }} />
          </div>
          <p className="font-bold text-lg mb-2" style={{ color: 'var(--fg)' }}>
            No saved algorithms yet
          </p>
          <p className="text-sm mb-8 max-w-xs mx-auto leading-relaxed" style={{ color: 'var(--fg-2)' }}>
            Browse the algorithm database and click the heart icon to save algorithms you&apos;re learning.
          </p>
          <Link
            href="/algorithms"
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
          >
            Browse Algorithms <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
