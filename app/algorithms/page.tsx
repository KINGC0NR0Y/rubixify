'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { allAlgorithms, Category } from '@/lib/algorithms';
import AlgorithmCard from '@/components/AlgorithmCard';
import Link from 'next/link';

const categories: { label: string; value: Category | 'All'; color: string; textLight: boolean }[] = [
  { label: 'All',      value: 'All',      color: '#0A0A0A', textLight: true },
  { label: 'F2L',      value: 'F2L',      color: '#0045AD', textLight: true },
  { label: 'OLL',      value: 'OLL',      color: '#B90000', textLight: true },
  { label: 'PLL',      value: 'PLL',      color: '#009B48', textLight: true },
  { label: 'Advanced', value: 'Advanced', color: '#FF5900', textLight: true },
];

export default function AlgorithmsPage() {
  const [query, setQuery]       = useState('');
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [maxMoves, setMaxMoves] = useState<number>(30);
  const [sort, setSort]         = useState<'number' | 'popularity' | 'moves'>('number');
  const [showFilters, setShowFilters] = useState(false);

  // Honor a `?category=` link (e.g. from the homepage CFOP cards).
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('category');
    if (!param) return;
    const match = categories.find(
      (c) => c.value !== 'All' && c.value.toLowerCase() === param.toLowerCase(),
    );
    if (match) setCategory(match.value);
  }, []);

  const results = useMemo(() => {
    const filtered = allAlgorithms.filter((a) => {
      const q = query.toLowerCase().trim();
      const matchCat   = category === 'All' || a.category === category;
      const matchMoves = a.moves <= maxMoves;
      const matchQ     =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.alg.toLowerCase().includes(q) ||
        a.recognition.toLowerCase().includes(q) ||
        a.subCategory?.toLowerCase().includes(q);
      return matchCat && matchMoves && matchQ;
    });
    if (sort === 'number') return filtered;
    return [...filtered].sort((a, b) =>
      sort === 'popularity' ? b.popularity - a.popularity : a.moves - b.moves
    );
  }, [query, category, maxMoves, sort]);

  const comicPanel = {
    background: '#FFFFFF',
    border: '3px solid #0A0A0A',
    boxShadow: '4px 4px 0 #0A0A0A',
    borderRadius: 4,
  } as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

      {/* ── Page header ─────────────────────────────── */}
      <div className="mb-8 fade-up" style={{ borderBottom: '3px solid #0A0A0A', paddingBottom: 20 }}>
        <div className="flex items-center gap-2 text-xs mb-4 font-semibold" style={{ color: '#555555' }}>
          <Link href="/" style={{ color: '#555555' }}>Home</Link>
          <span style={{ color: '#B90000', fontWeight: 900 }}>›</span>
          <span style={{ color: '#0A0A0A' }}>Algorithms</span>
        </div>
        <div style={{ display: 'inline-block', background: '#0045AD', border: '3px solid #0A0A0A', boxShadow: '3px 3px 0 #0A0A0A', padding: '2px 14px', marginBottom: 10 }}>
          <span style={{ fontFamily: 'var(--font-bangers, Bangers, cursive)', fontSize: '0.8rem', letterSpacing: '0.2em', color: '#FFFFFF' }}>
            DATABASE
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-bangers, Bangers, cursive)', fontSize: 'clamp(2.2rem, 6vw, 3.5rem)', letterSpacing: '0.03em', color: '#0A0A0A', lineHeight: 1, margin: 0 }}>
          ALGORITHM <span style={{ color: '#B90000' }}>EXPLORER</span>
        </h1>
        <p className="text-sm mt-2 font-semibold" style={{ color: '#555555' }}>
          {allAlgorithms.length} algorithms across F2L, OLL, PLL, and Advanced categories
        </p>
      </div>

      {/* ── Search + filter bar ──────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5 fade-up-2">
        <div
          className="flex items-center gap-2.5 flex-1 px-4 py-2.5"
          style={{
            background: '#FFFFFF',
            border: '3px solid #0A0A0A',
            boxShadow: '3px 3px 0 #0A0A0A',
            borderRadius: 2,
          }}
        >
          <Search size={14} style={{ color: '#0045AD', flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, notation, or recognition pattern..."
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '0.88rem', color: '#0A0A0A', fontWeight: 600 }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={13} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all"
          style={{
            background: showFilters ? '#FFD500' : '#FFFFFF',
            border: '3px solid #0A0A0A',
            boxShadow: showFilters ? '2px 2px 0 #0A0A0A' : '3px 3px 0 #0A0A0A',
            borderRadius: 2,
            color: '#0A0A0A',
            transform: showFilters ? 'translate(1px,1px)' : '',
            cursor: 'pointer',
            fontFamily: 'var(--font-bangers, Bangers, cursive)',
            letterSpacing: '0.08em',
            fontSize: '1rem',
          }}
        >
          <SlidersHorizontal size={14} />
          Filters
        </button>
      </div>

      {/* ── Category tabs ────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-4 fade-up-3">
        {categories.map((c) => {
          const active = category === c.value;
          return (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              style={{
                background: active ? c.color : '#FFFFFF',
                color: active ? '#FFFFFF' : '#0A0A0A',
                border: '2px solid #0A0A0A',
                boxShadow: active ? '2px 2px 0 #0A0A0A' : '3px 3px 0 #0A0A0A',
                borderRadius: 2,
                padding: '5px 14px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transform: active ? 'translate(1px,1px)' : '',
                fontFamily: 'var(--font-bangers, Bangers, cursive)',
                letterSpacing: '0.08em',
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* ── Expanded filters ─────────────────────────── */}
      {showFilters && (
        <div
          className="mb-6 p-5 grid sm:grid-cols-2 gap-5 fade-up"
          style={comicPanel}
        >
          <div>
            <label className="text-xs font-bold mb-2 block" style={{ color: '#0A0A0A', fontFamily: 'var(--font-bangers, Bangers, cursive)', letterSpacing: '0.1em', fontSize: '0.85rem' }}>
              Max moves:{' '}
              <span style={{ color: '#B90000' }}>{maxMoves === 30 ? 'Any' : maxMoves}</span>
            </label>
            <input
              type="range"
              min={3}
              max={30}
              value={maxMoves}
              onChange={(e) => setMaxMoves(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: '#B90000' }}
            />
          </div>
          <div>
            <label className="text-xs font-bold mb-2 block" style={{ color: '#0A0A0A', fontFamily: 'var(--font-bangers, Bangers, cursive)', letterSpacing: '0.1em', fontSize: '0.85rem' }}>
              Sort by
            </label>
            <div className="flex gap-2">
              {(['number', 'popularity', 'moves'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  style={{
                    background: sort === s ? '#0045AD' : '#FFFFFF',
                    color: sort === s ? '#FFFFFF' : '#0A0A0A',
                    border: '2px solid #0A0A0A',
                    boxShadow: sort === s ? '1px 1px 0 #0A0A0A' : '3px 3px 0 #0A0A0A',
                    borderRadius: 2,
                    padding: '5px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transform: sort === s ? 'translate(1px,1px)' : '',
                  }}
                >
                  {s === 'number' ? 'Number' : s === 'popularity' ? 'Popularity' : 'Move Count'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Results count ────────────────────────────── */}
      <p className="text-xs mb-5 font-bold" style={{ color: '#555555' }}>
        Showing <span style={{ color: '#B90000', fontFamily: 'var(--font-bangers, Bangers, cursive)', fontSize: '1rem' }}>{results.length}</span> result{results.length !== 1 ? 's' : ''}
      </p>

      {/* ── Grid ─────────────────────────────────────── */}
      {results.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((alg) => (
            <AlgorithmCard key={alg.id} alg={alg} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20" style={comicPanel}>
          <Filter size={36} className="mx-auto mb-4" style={{ color: '#B90000', opacity: 0.5 }} />
          <p className="font-bold mb-1" style={{ fontFamily: 'var(--font-bangers, Bangers, cursive)', fontSize: '1.2rem', letterSpacing: '0.06em', color: '#0A0A0A' }}>
            No algorithms match your filters.
          </p>
          <button
            onClick={() => { setQuery(''); setCategory('All'); setMaxMoves(30); }}
            className="mt-4 btn-secondary px-5 py-2 text-sm font-bold"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
