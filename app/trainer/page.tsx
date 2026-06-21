'use client';

import { useState } from 'react';
import Link from 'next/link';
import { QuizTab }      from './_components/QuizTab';
import { TimerTab }     from './_components/TimerTab';
import { AnalyticsTab } from './_components/AnalyticsTab';

type Tab = 'quiz' | 'timer' | 'analytics';

const TABS: { id: Tab; label: string; color: string }[] = [
  { id: 'quiz',      label: 'QUIZ',      color: '#B90000' },
  { id: 'timer',     label: 'TIMER',     color: '#0045AD' },
  { id: 'analytics', label: 'ANALYTICS', color: '#009B48' },
];

export default function TrainerPage() {
  const [tab, setTab] = useState<Tab>('quiz');

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8 fade-up" style={{ borderBottom: '3px solid #0A0A0A', paddingBottom: 20 }}>
        <div className="flex items-center gap-2 text-xs mb-4 font-semibold" style={{ color: '#555555' }}>
          <Link href="/" style={{ color: '#555555' }}>Home</Link>
          <span style={{ color: '#B90000', fontWeight: 900 }}>›</span>
          <span style={{ color: '#0A0A0A' }}>Trainer</span>
        </div>
        <div style={{
          display: 'inline-block', background: '#009B48',
          border: '3px solid #0A0A0A', boxShadow: '3px 3px 0 #0A0A0A',
          padding: '2px 14px', marginBottom: 10,
        }}>
          <span style={{
            fontFamily: 'var(--font-bangers, Bangers, cursive)',
            fontSize: '0.8rem', letterSpacing: '0.2em', color: '#FFFFFF',
          }}>
            TRAINING MODE
          </span>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-bangers, Bangers, cursive)',
          fontSize: 'clamp(2rem, 6vw, 3rem)', letterSpacing: '0.03em',
          color: '#0A0A0A', lineHeight: 1, margin: 0,
        }}>
          SPEEDCUBING <span style={{ color: '#B90000' }}>HUB</span>
        </h1>
        <p className="text-sm mt-2 font-semibold" style={{ color: '#555555' }}>
          Practice recognition, time your solves, and track your progress — all in one place.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-3 mb-6 fade-up-2">
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: active ? t.color : '#FFFFFF',
                color: active ? '#FFFFFF' : '#0A0A0A',
                border: '3px solid #0A0A0A',
                boxShadow: active ? '2px 2px 0 #0A0A0A' : '4px 4px 0 #0A0A0A',
                borderRadius: 2,
                padding: '8px 20px',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-bangers, Bangers, cursive)',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transform: active ? 'translate(2px,2px)' : '',
                transition: 'transform 0.08s, box-shadow 0.08s',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="fade-up-3">
        {tab === 'quiz'      && <QuizTab />}
        {tab === 'timer'     && <TimerTab />}
        {tab === 'analytics' && <AnalyticsTab />}
      </div>
    </div>
  );
}
