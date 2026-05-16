'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { allAlgorithms, Category } from '@/lib/algorithms';
import AlgorithmCard from '@/components/AlgorithmCard';
import Link from 'next/link';

const categories: { label: string; value: Category | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'F2L', value: 'F2L' },
  { label: 'OLL', value: 'OLL' },
  { label: 'PLL', value: 'PLL' },
  { label: 'Advanced', value: 'Advanced' },
];

const pillClass: Record<string, string> = {
  All:      'pill-f2l',
  F2L:      'pill-f2l',
  OLL:      'pill-oll',
  PLL:      'pill-pll',
  Advanced: 'pill-adv',
};

export default function AlgorithmsPage() {
  const [query, setQuery]         = useState('');
  const [category, setCategory]   = useState<Category | 'All'>('All');
  const [maxMoves, setMaxMoves]   = useState<number>(30);
  const [sort, setSort]           = useState<'popularity' | 'moves'>('popularity');
  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(() => {
    return allAlgorithms
      .filter((a) => {
        const q = query.toLowerCase().trim();
        const matchCat    = category === 'All' || a.category === category;
        const matchMoves  = a.moves <= maxMoves;
        const matchQ      =
          !q ||
          a.name.toLowerCase().includes(q) ||
          a.alg.toLowerCase().includes(q) ||
          a.recognition.toLowerCase().includes(q) ||
          a.subCategory?.toLowerCase().includes(q);
        return matchCat && matchMoves && matchQ;
      })
      .sort((a, b) =>
        sort === 'popularity' ? b.popularity - a.popularity : a.moves - b.moves
      );
  }, [query, category, maxMoves, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8 fade-up">
        <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--fg-3)' }}>
          <Link href="/" style={{ color: 'var(--fg-3)' }} className="hover:text-[var(--fg-2)] transition-colors">Home</Link>
          <span>/</span>
          <span style={{ color: 'var(--fg-2)' }}>Algorithms</span>
        </div>
        <h1 className="text-4xl font-black mb-1">
          <span style={{ color: 'var(--fg)' }}>Algorithm </span>
          <span className="gradient-text-violet">Explorer</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--fg-2)' }}>
          {allAlgorithms.length} algorithms across F2L, OLL, PLL, and Advanced categories
        </p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5 fade-up-2">
        <div
          className="flex items-center gap-2.5 flex-1 px-4 py-2.5 rounded-xl border transition-all focus-within:border-[rgba(124,111,247,0.5)]"
          style={{ background: '#0e0e18', borderColor: 'var(--border)' }}
        >
          <Search size={14} style={{ color: 'var(--fg-3)', flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, notation, or recognition pattern..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-(--fg-3)"
            style={{ color: 'var(--fg)' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-0.5 rounded hover:bg-white/8 transition-colors"
              style={{ color: 'var(--fg-3)' }}
            >
              <X size={12} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all"
          style={{
            background: showFilters ? 'rgba(98,88,200,0.2)' : '#0e0e18',
            borderColor: showFilters ? 'rgba(124,111,247,0.5)' : 'var(--border)',
            color: showFilters ? 'var(--violet-2)' : 'var(--fg-2)',
          }}
        >
          <SlidersHorizontal size={14} />
          Filters
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-4 fade-up-3">
        {categories.map((c) => {
          const active = category === c.value;
          return (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${active ? pillClass[c.value] : ''}`}
              style={!active ? {
                background: '#0e0e18',
                color: 'var(--fg-2)',
                border: '1px solid var(--border)',
              } : { border: 'none' }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div
          className="mb-6 p-5 rounded-2xl border grid sm:grid-cols-2 gap-5 fade-up"
          style={{ background: '#0e0e18', borderColor: 'var(--border)' }}
        >
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--fg-2)' }}>
              Max move count:{' '}
              <span style={{ color: 'var(--violet-2)' }}>
                {maxMoves === 30 ? 'Any' : maxMoves}
              </span>
            </label>
            <input
              type="range"
              min={3}
              max={30}
              value={maxMoves}
              onChange={(e) => setMaxMoves(Number(e.target.value))}
              className="w-full accent-[#7c6ff7]"
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--fg-2)' }}>
              Sort by
            </label>
            <div className="flex gap-2">
              {(['popularity', 'moves'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className="px-3 py-1.5 rounded-lg text-xs border font-medium transition-all"
                  style={{
                    background: sort === s ? 'rgba(98,88,200,0.2)' : '#181828',
                    color: sort === s ? 'var(--violet-2)' : 'var(--fg-2)',
                    borderColor: sort === s ? 'rgba(124,111,247,0.5)' : 'var(--border)',
                  }}
                >
                  {s === 'popularity' ? 'Popularity' : 'Move Count'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-xs mb-5" style={{ color: 'var(--fg-3)' }}>
        Showing <span style={{ color: 'var(--fg-2)' }}>{results.length}</span> result{results.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      {results.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((alg) => (
            <AlgorithmCard key={alg.id} alg={alg} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24" style={{ color: 'var(--fg-3)' }}>
          <Filter size={36} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm mb-1" style={{ color: 'var(--fg-2)' }}>No algorithms match your filters.</p>
          <button
            onClick={() => { setQuery(''); setCategory('All'); setMaxMoves(30); }}
            className="mt-4 text-xs px-4 py-2 rounded-lg transition-all hover:opacity-80"
            style={{ background: 'rgba(124,111,247,0.15)', color: 'var(--violet-2)', border: '1px solid rgba(124,111,247,0.3)' }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
