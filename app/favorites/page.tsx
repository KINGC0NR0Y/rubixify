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
      {/* Header */}
      <div className="mb-8 fade-up" style={{ borderBottom: '3px solid #0A0A0A', paddingBottom: 20 }}>
        <div className="flex items-center gap-2 text-xs mb-4 font-semibold" style={{ color: '#555555' }}>
          <Link href="/" style={{ color: '#555555' }}>Home</Link>
          <span style={{ color: '#B90000', fontWeight: 900 }}>›</span>
          <span style={{ color: '#0A0A0A' }}>Favorites</span>
        </div>
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 44,
              height: 44,
              background: '#B90000',
              border: '3px solid #0A0A0A',
              boxShadow: '3px 3px 0 #0A0A0A',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Heart size={20} fill="#FFFFFF" style={{ color: '#FFFFFF' }} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-bangers, Bangers, cursive)', fontSize: 'clamp(2rem, 6vw, 3rem)', letterSpacing: '0.03em', color: '#0A0A0A', lineHeight: 1, margin: 0 }}>
              SAVED <span style={{ color: '#B90000' }}>ALGORITHMS</span>
            </h1>
            <p className="text-sm mt-1 font-semibold" style={{ color: '#555555' }}>
              Your personal algorithm reference collection
            </p>
          </div>
        </div>
      </div>

      {algorithms.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 fade-up-2">
          {algorithms.map((alg) => alg && <AlgorithmCard key={alg.id} alg={alg} />)}
        </div>
      ) : (
        <div
          className="text-center py-16 px-8 fade-up-2"
          style={{
            background: '#FFFFFF',
            border: '3px solid #0A0A0A',
            boxShadow: '4px 4px 0 #0A0A0A',
            borderRadius: 4,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              background: '#B90000',
              border: '3px solid #0A0A0A',
              boxShadow: '4px 4px 0 #0A0A0A',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Heart size={32} style={{ color: 'rgba(255,255,255,0.5)' }} />
          </div>
          <p
            className="font-bold text-lg mb-2"
            style={{
              fontFamily: 'var(--font-bangers, Bangers, cursive)',
              fontSize: '1.4rem',
              letterSpacing: '0.06em',
              color: '#0A0A0A',
            }}
          >
            No saved algorithms yet
          </p>
          <p className="text-sm mb-8 max-w-xs mx-auto leading-relaxed font-semibold" style={{ color: '#555555' }}>
            Browse the algorithm database and click the heart icon to save algorithms you&apos;re learning.
          </p>
          <Link
            href="/algorithms"
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold"
          >
            Browse Algorithms <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
