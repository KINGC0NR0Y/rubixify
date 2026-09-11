'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight } from 'lucide-react';
import { searchAlgorithms } from '@/lib/algorithms';

interface Props {
  onClose: () => void;
}

const pillClass: Record<string, string> = {
  F2L: 'pill-f2l',
  OLL: 'pill-oll',
  PLL: 'pill-pll',
};

export default function GlobalSearch({ onClose }: Props) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = query.trim().length > 0 ? searchAlgorithms(query).slice(0, 8) : [];

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function goTo(id: string) {
    router.push(`/algorithms/${id}`);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center pt-16 px-4"
      style={{ background: 'rgba(10,10,10,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Comic modal panel */}
      <div
        className="w-full max-w-xl overflow-hidden"
        style={{
          background: '#FFFFFF',
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
          border: '4px solid #0A0A0A',
          boxShadow: '8px 8px 0 #0A0A0A',
          borderRadius: 4,
        }}
      >
        {/* Yellow header bar */}
        <div
          style={{
            background: '#FFD500',
            borderBottom: '3px solid #0A0A0A',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{
            fontFamily: 'var(--font-bangers, Bangers, cursive)',
            fontSize: '1rem',
            letterSpacing: '0.2em',
            color: '#0A0A0A',
          }}>
            SEARCH ALGORITHMS
          </span>
          <button
            onClick={onClose}
            style={{
              background: '#0A0A0A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 2,
              padding: '3px 6px',
              cursor: 'pointer',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Input row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            borderBottom: '3px solid #0A0A0A',
            background: '#FFFFFF',
          }}
        >
          <Search size={15} style={{ color: '#0045AD', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, notation, or case..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '0.95rem',
              color: '#0A0A0A',
              fontWeight: 600,
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ color: '#888888', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Results */}
        {results.length > 0 ? (
          <ul style={{ maxHeight: 320, overflowY: 'auto' }}>
            {results.map((alg, i) => (
              <li key={alg.id} style={{ borderBottom: i < results.length - 1 ? '2px solid #0A0A0A' : 'none' }}>
                <button
                  onClick={() => goTo(alg.id)}
                  className="group"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,213,0,0.2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span className={`text-xs font-bold px-2 py-0.5 shrink-0 ${pillClass[alg.category] ?? 'pill-f2l'}`}
                    style={{ borderRadius: 2 }}>
                    {alg.category}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0A0A0A', margin: 0 }} className="truncate">
                      {alg.name}
                    </p>
                    <p className="alg-text truncate" style={{ fontSize: '0.72rem', margin: 0, color: '#555555' }}>
                      {alg.alg || 'Skip'}
                    </p>
                  </div>
                  <ArrowRight size={13} style={{ color: '#B90000', flexShrink: 0 }} />
                </button>
              </li>
            ))}
          </ul>
        ) : query.trim().length > 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#555555', fontSize: '0.88rem', fontWeight: 600 }}>
            No algorithms found for &quot;{query}&quot;
          </div>
        ) : (
          <div style={{ padding: '28px 16px', textAlign: 'center' }}>
            <div style={{
              fontFamily: 'var(--font-bangers, Bangers, cursive)',
              fontSize: '1.2rem',
              letterSpacing: '0.1em',
              color: '#B90000',
              marginBottom: 6,
            }}>
              START TYPING!
            </div>
            <p style={{ fontSize: '0.8rem', color: '#555555', fontWeight: 600 }}>
              Search F2L, OLL, or PLL algorithms
            </p>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            borderTop: '3px solid #0A0A0A',
            background: '#0A0A0A',
          }}
        >
          {[['↵', 'select'], ['esc', 'close']].map(([key, label]) => (
            <span key={key} style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <kbd style={{
                background: '#FFD500',
                color: '#0A0A0A',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 2,
                padding: '1px 5px',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}>{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
