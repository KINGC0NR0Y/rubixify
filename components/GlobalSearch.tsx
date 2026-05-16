'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight, Command } from 'lucide-react';
import { searchAlgorithms } from '@/lib/algorithms';

interface Props {
  onClose: () => void;
}

const pillClass: Record<string, string> = {
  F2L: 'pill-f2l',
  OLL: 'pill-oll',
  PLL: 'pill-pll',
  Advanced: 'pill-adv',
};

export default function GlobalSearch({ onClose }: Props) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = query.trim().length > 0 ? searchAlgorithms(query).slice(0, 8) : [];

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function goTo(id: string) {
    router.push(`/algorithms/${id}`);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-xl rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(14,14,20,0.95)',
          border: '1px solid var(--border-2)',
          boxShadow: 'var(--shadow-lg), 0 0 60px rgba(124,111,247,0.1)',
        }}
      >
        {/* Input row */}
        <div
          className="flex items-center gap-3 px-4 py-3.5 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <Search size={15} style={{ color: 'var(--violet-2)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search algorithms, cases, notation..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-(--fg-3)"
            style={{ color: 'var(--fg)' }}
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md transition-colors hover:bg-white/8"
            style={{ color: 'var(--fg-3)' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Results */}
        {results.length > 0 ? (
          <ul className="max-h-80 overflow-y-auto py-1">
            {results.map((alg) => (
              <li key={alg.id}>
                <button
                  onClick={() => goTo(alg.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/4 group"
                >
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full shrink-0 ${pillClass[alg.category] ?? 'pill-f2l'}`}>
                    {alg.category}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: 'var(--fg)' }}
                    >
                      {alg.name}
                    </p>
                    <p
                      className="text-xs truncate alg-text"
                      style={{ fontSize: '11px', color: 'var(--fg-3)' }}
                    >
                      {alg.alg || 'Skip'}
                    </p>
                  </div>
                  <ArrowRight
                    size={13}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--violet-2)' }}
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : query.trim().length > 0 ? (
          <div className="px-4 py-10 text-center text-sm" style={{ color: 'var(--fg-2)' }}>
            No algorithms found for &quot;{query}&quot;
          </div>
        ) : (
          <div className="px-4 py-8 text-center" style={{ color: 'var(--fg-3)' }}>
            <Command size={20} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Type to search F2L, OLL, PLL or Advanced algorithms</p>
          </div>
        )}

        {/* Footer hint */}
        <div
          className="px-4 py-2.5 flex items-center gap-3 border-t text-xs"
          style={{ borderColor: 'var(--border)', color: 'var(--fg-3)' }}
        >
          <span><kbd className="px-1 rounded" style={{ background: '#181828', border: '1px solid var(--border)' }}>↵</kbd> to select</span>
          <span><kbd className="px-1 rounded" style={{ background: '#181828', border: '1px solid var(--border)' }}>esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}
