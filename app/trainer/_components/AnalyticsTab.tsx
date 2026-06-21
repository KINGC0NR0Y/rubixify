'use client';

import { useState, useEffect } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import { ollAlgorithms, pllAlgorithms } from '@/lib/algorithms';
import {
  Solve, QuizResult, getSolves, getQuizResults, clearSolves, clearQuizResults,
  calcAo, formatTime, effectiveTime,
} from '@/lib/session-store';

const comicBox = {
  background: '#FFFFFF',
  border: '3px solid #0A0A0A',
  boxShadow: '4px 4px 0 #0A0A0A',
  borderRadius: 4,
} as const;

const ALL_ALGS = [...ollAlgorithms, ...pllAlgorithms];

export function AnalyticsTab() {
  const [solves, setSolves]           = useState<Solve[]>([]);
  const [quizResults, setQuizResults] = useState<Record<string, QuizResult>>({});

  const reload = () => {
    setSolves(getSolves());
    setQuizResults(getQuizResults());
  };

  useEffect(() => { reload(); }, []);

  // ── Session stats ─────────────────────────────────
  const ao5   = calcAo(solves, 5);
  const ao12  = calcAo(solves, 12);
  const ao100 = calcAo(solves, 100);
  const validTimes = solves.map(effectiveTime).filter(isFinite);
  const best  = validTimes.length > 0 ? Math.min(...validTimes) : null;
  const mean  = validTimes.length > 0 ? validTimes.reduce((s, t) => s + t, 0) / validTimes.length : null;
  const dnfCount = solves.filter(s => s.dnf).length;

  const fmtAo = (v: number | null) =>
    v === null ? '—' : !isFinite(v) ? 'DNF' : formatTime(v);

  // ── Time distribution (5-second buckets) ─────────
  const BUCKET = 5000;
  const distribution: [string, number][] = (() => {
    if (validTimes.length === 0) return [];
    const map: Record<number, number> = {};
    validTimes.forEach(t => {
      const b = Math.floor(t / BUCKET) * BUCKET;
      map[b] = (map[b] ?? 0) + 1;
    });
    return Object.entries(map)
      .map(([k, v]) => [`${Number(k) / 1000}s`, v] as [string, number])
      .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
  })();
  const maxCount = distribution.length > 0 ? Math.max(...distribution.map(([, c]) => c)) : 1;

  // ── Weakest OLL/PLL cases ─────────────────────────
  const weakest = Object.values(quizResults)
    .filter(r => r.attempts >= 2)
    .map(r => {
      const alg = ALL_ALGS.find(a => a.id === r.caseId);
      return {
        ...r,
        name: alg?.name ?? r.caseId,
        category: alg?.category ?? 'OLL',
        accuracy: r.correct / r.attempts,
        avgResponseSec: r.totalResponseMs / r.attempts / 1000,
      };
    })
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 8);

  // ── Best recognition cases ────────────────────────
  const bestRecognition = Object.values(quizResults)
    .filter(r => r.attempts >= 3 && r.correct / r.attempts >= 0.8)
    .map(r => {
      const alg = ALL_ALGS.find(a => a.id === r.caseId);
      return {
        ...r,
        name: alg?.name ?? r.caseId,
        category: alg?.category ?? 'OLL',
        accuracy: r.correct / r.attempts,
        avgResponseSec: r.totalResponseMs / r.attempts / 1000,
      };
    })
    .sort((a, b) => a.avgResponseSec - b.avgResponseSec)
    .slice(0, 5);

  const isEmpty = solves.length === 0 && Object.keys(quizResults).length === 0;

  if (isEmpty) {
    return (
      <div style={{ ...comicBox, padding: 48, textAlign: 'center', background: '#FFFDF4' }}>
        <BarChart3 size={36} style={{ margin: '0 auto 16px', color: '#CCC' }} />
        <div style={{
          fontFamily: 'var(--font-bangers, Bangers, cursive)',
          fontSize: '1.5rem', letterSpacing: '0.08em', color: '#0A0A0A', marginBottom: 8,
        }}>
          NO DATA YET
        </div>
        <p style={{ fontSize: '0.8rem', color: '#555', maxWidth: 280, margin: '0 auto' }}>
          Complete solves in the Timer tab or practice cases in the Quiz tab — your stats will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Refresh */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button
          onClick={reload}
          className="flex items-center gap-1"
          style={{
            background: '#fff', border: '2px solid #0A0A0A', boxShadow: '2px 2px 0 #0A0A0A',
            borderRadius: 2, padding: '4px 12px', fontSize: '0.72rem', fontWeight: 800,
            cursor: 'pointer', fontFamily: 'var(--font-bangers, Bangers, cursive)', letterSpacing: '0.08em',
          }}
        >
          <RefreshCw size={11} /> REFRESH
        </button>
      </div>

      {/* ── Overview stats ────────────────────────────── */}
      {solves.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontFamily: 'var(--font-bangers, Bangers, cursive)',
            fontSize: '0.85rem', letterSpacing: '0.14em', color: '#555', marginBottom: 10,
          }}>
            SESSION OVERVIEW
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 8 }}>
            {[
              { label: 'TOTAL SOLVES', value: solves.length, color: '#0A0A0A' },
              { label: 'BEST TIME',    value: best !== null ? formatTime(best) : '—', color: '#0045AD' },
              { label: 'SESSION MEAN', value: mean !== null ? formatTime(mean) : '—', color: '#009B48' },
              { label: 'DNFs',         value: dnfCount, color: dnfCount > 0 ? '#B90000' : '#0A0A0A' },
            ].map(s => (
              <div key={s.label} style={{ ...comicBox, padding: '14px 16px' }}>
                <div style={{
                  fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.12em', color: '#888',
                  fontFamily: 'var(--font-bangers, Bangers, cursive)', marginBottom: 4,
                }}>
                  {s.label}
                </div>
                <div style={{
                  fontFamily: 'var(--font-bangers, Bangers, cursive)',
                  fontSize: '1.7rem', letterSpacing: '0.04em', color: s.color, lineHeight: 1,
                }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { label: 'AO5',  value: fmtAo(ao5),  color: '#B90000' },
              { label: 'AO12', value: fmtAo(ao12), color: '#0045AD' },
              { label: 'AO100',value: fmtAo(ao100),color: '#009B48' },
            ].map(s => (
              <div key={s.label} style={{ ...comicBox, padding: '12px 14px' }}>
                <div style={{
                  fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.12em', color: '#888',
                  fontFamily: 'var(--font-bangers, Bangers, cursive)', marginBottom: 4,
                }}>
                  {s.label}
                </div>
                <div style={{
                  fontFamily: 'var(--font-bangers, Bangers, cursive)',
                  fontSize: '1.4rem', letterSpacing: '0.04em', color: s.color, lineHeight: 1,
                }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Time distribution ─────────────────────────── */}
      {distribution.length > 1 && (
        <div style={{ ...comicBox, padding: 20, marginBottom: 20 }}>
          <div style={{
            fontFamily: 'var(--font-bangers, Bangers, cursive)',
            fontSize: '0.85rem', letterSpacing: '0.14em', color: '#0A0A0A', marginBottom: 14,
          }}>
            SOLVE TIME DISTRIBUTION
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 80 }}>
            {distribution.map(([key, count]) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 4 }}>
                <div style={{
                  width: '100%',
                  background: '#0045AD',
                  border: '1.5px solid #0A0A0A',
                  height: `${Math.max(4, (count / maxCount) * 64)}px`,
                  borderRadius: 2,
                  transition: 'height 0.3s ease',
                }} />
                <div style={{ fontSize: '0.5rem', fontWeight: 700, color: '#888', whiteSpace: 'nowrap' }}>
                  {key}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#aaa', marginTop: 8, fontWeight: 600 }}>
            {validTimes.length} non-DNF solves · 5-second buckets
          </div>
        </div>
      )}

      {/* ── Weakest OLL/PLL cases ─────────────────────── */}
      {weakest.length > 0 && (
        <div style={{ ...comicBox, padding: 0, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ background: '#B90000', padding: '8px 16px' }}>
            <span style={{
              fontFamily: 'var(--font-bangers, Bangers, cursive)',
              fontSize: '0.85rem', letterSpacing: '0.12em', color: '#fff',
            }}>
              WEAKEST CASES — FOCUS HERE
            </span>
          </div>
          {weakest.map(r => (
            <div
              key={r.caseId}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 16px', borderBottom: '1px solid rgba(10,10,10,0.07)',
              }}
            >
              <div style={{
                width: 34, height: 34, flexShrink: 0,
                background: r.category === 'OLL' ? '#B90000' : '#009B48',
                border: '2px solid #0A0A0A', borderRadius: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem', fontWeight: 900, color: '#fff',
                fontFamily: 'var(--font-bangers, Bangers, cursive)', letterSpacing: '0.04em',
              }}>
                {r.category}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r.name}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#888', marginTop: 2 }}>
                  {r.attempts} attempts · {r.avgResponseSec.toFixed(1)}s avg recognition
                </div>
              </div>
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <div style={{
                  fontFamily: 'var(--font-bangers, Bangers, cursive)',
                  fontSize: '1.05rem', letterSpacing: '0.04em',
                  color: r.accuracy < 0.5 ? '#B90000' : r.accuracy < 0.75 ? '#FF5900' : '#009B48',
                }}>
                  {Math.round(r.accuracy * 100)}%
                </div>
              </div>
              {/* Accuracy bar */}
              <div style={{
                width: 44, height: 5, background: '#f0f0f0',
                border: '1.5px solid #0A0A0A', borderRadius: 2, overflow: 'hidden', flexShrink: 0,
              }}>
                <div style={{
                  width: `${r.accuracy * 100}%`, height: '100%',
                  background: r.accuracy < 0.5 ? '#B90000' : r.accuracy < 0.75 ? '#FF5900' : '#009B48',
                }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Fastest recognition cases ─────────────────── */}
      {bestRecognition.length > 0 && (
        <div style={{ ...comicBox, padding: 0, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ background: '#009B48', padding: '8px 16px' }}>
            <span style={{
              fontFamily: 'var(--font-bangers, Bangers, cursive)',
              fontSize: '0.85rem', letterSpacing: '0.12em', color: '#fff',
            }}>
              FASTEST RECOGNITION
            </span>
          </div>
          {bestRecognition.map(r => (
            <div
              key={r.caseId}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 16px', borderBottom: '1px solid rgba(10,10,10,0.07)',
              }}
            >
              <div style={{
                width: 34, height: 34, flexShrink: 0,
                background: r.category === 'OLL' ? '#B90000' : '#009B48',
                border: '2px solid #0A0A0A', borderRadius: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem', fontWeight: 900, color: '#fff',
                fontFamily: 'var(--font-bangers, Bangers, cursive)', letterSpacing: '0.04em',
              }}>
                {r.category}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r.name}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#888', marginTop: 2 }}>
                  {r.attempts} attempts
                </div>
              </div>
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <div style={{
                  fontFamily: 'var(--font-bangers, Bangers, cursive)',
                  fontSize: '1.05rem', letterSpacing: '0.04em', color: '#009B48',
                }}>
                  {r.avgResponseSec.toFixed(1)}s
                </div>
                <div style={{ fontSize: '0.58rem', color: '#888', fontWeight: 700 }}>avg recog.</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Quiz stats summary ────────────────────────── */}
      {Object.keys(quizResults).length > 0 && (
        <div style={{ ...comicBox, padding: 16, marginBottom: 20 }}>
          <div style={{
            fontFamily: 'var(--font-bangers, Bangers, cursive)',
            fontSize: '0.85rem', letterSpacing: '0.14em', color: '#0A0A0A', marginBottom: 12,
          }}>
            QUIZ SUMMARY
          </div>
          {(() => {
            const results = Object.values(quizResults);
            const totalAttempts = results.reduce((s, r) => s + r.attempts, 0);
            const totalCorrect  = results.reduce((s, r) => s + r.correct, 0);
            const avgAccuracy   = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;
            const avgResponseMs = results.reduce((s, r) => s + r.totalResponseMs, 0) / Math.max(1, totalAttempts);
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {[
                  { label: 'CASES PRACTICED', value: results.length },
                  { label: 'TOTAL ATTEMPTS',  value: totalAttempts },
                  { label: 'OVERALL ACCURACY', value: `${Math.round(avgAccuracy * 100)}%` },
                  { label: 'AVG RECOGNITION',  value: `${(avgResponseMs / 1000).toFixed(1)}s` },
                ].map(s => (
                  <div key={s.label} style={{ background: '#FFFDF4', border: '1.5px solid #0A0A0A', borderRadius: 2, padding: '10px 14px' }}>
                    <div style={{ fontSize: '0.56rem', fontWeight: 800, letterSpacing: '0.1em', color: '#888', fontFamily: 'var(--font-bangers, Bangers, cursive)', marginBottom: 3 }}>
                      {s.label}
                    </div>
                    <div style={{ fontFamily: 'var(--font-bangers, Bangers, cursive)', fontSize: '1.25rem', letterSpacing: '0.04em', color: '#0A0A0A' }}>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Clear data */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {solves.length > 0 && (
          <button
            onClick={() => { clearSolves(); setSolves([]); }}
            style={{
              background: '#fff', border: '2px solid #0A0A0A', borderRadius: 2,
              padding: '5px 12px', fontSize: '0.68rem', fontWeight: 700, color: '#888', cursor: 'pointer',
            }}
          >
            Clear solve history
          </button>
        )}
        {Object.keys(quizResults).length > 0 && (
          <button
            onClick={() => { clearQuizResults(); setQuizResults({}); }}
            style={{
              background: '#fff', border: '2px solid #0A0A0A', borderRadius: 2,
              padding: '5px 12px', fontSize: '0.68rem', fontWeight: 700, color: '#888', cursor: 'pointer',
            }}
          >
            Clear quiz data
          </button>
        )}
      </div>
    </div>
  );
}
