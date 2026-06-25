'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

// ─── palette ─────────────────────────────────────────────────────────────────
const RED    = '#6495ED';
const BLUE   = '#0045AD';
const YELLOW = '#FFD500';
const GREEN  = '#009B48';
const ORANGE = '#FF5900';
const INK    = '#0A0A0A';
const WHITE  = '#FFFFFF';

// ─── data ─────────────────────────────────────────────────────────────────────

interface Credit { name: string; desc: string; url: string; label: string; color: string; }
const CREDITS: Credit[] = [
  { name: 'VisualCube',             desc: "Generates Rubik's Cube SVG visualizations used throughout the cubing community.",                url: 'https://github.com/tdecker91/visualcube',  label: 'Visit VisualCube',    color: BLUE   },
  { name: 'J Perm\'s Website',                 desc: 'Website created by YouTuber and Rubik\'s cuber, J Perm. Serves as one of the most popular speedcubing educational websites with tutorials and algorithm resources.', url: 'https://jperm.net',                        label: 'Visit JPerm.net',     color: RED    },
  { name: 'SpeedCubeShop',          desc: 'Retailer for speedcubes, accessories, lubricants, and cubing gear.',                              url: 'https://speedcubeshop.com',                label: 'Visit SpeedCubeShop', color: GREEN  },
  { name: 'World Cube Association', desc: 'Official organization for competitive speedcubing events and world rankings.',                     url: 'https://www.worldcubeassociation.org',     label: 'Visit WCA',           color: ORANGE },
];

// ─── shared style ─────────────────────────────────────────────────────────────
const card3 = {
  background: WHITE,
  border: `3px solid ${INK}`,
  boxShadow: `4px 4px 0 ${INK}`,
  borderRadius: 4,
};

// ─── section header helper ────────────────────────────────────────────────────
function SectionHeader({
  tag, tagColor, tagTxt = WHITE, title, accent, accentColor,
}: {
  tag: string; tagColor: string; tagTxt?: string;
  title: string; accent: string; accentColor: string;
}) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 48 }}>
      <span style={{
        display: 'inline-block', background: tagColor,
        border: `3px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}`,
        padding: '3px 16px', marginBottom: 14,
        fontFamily: 'var(--font-bangers, Bangers, cursive)',
        fontSize: '0.78rem', letterSpacing: '0.25em', color: tagTxt,
      }}>
        {tag}
      </span>
      <h2 style={{
        fontFamily: 'var(--font-bangers, Bangers, cursive)',
        fontSize: 'clamp(2rem, 6vw, 3.2rem)', letterSpacing: '0.03em',
        color: INK, margin: 0, lineHeight: 1,
      }}>
        {title}{' '}
        <span style={{ color: accentColor, textShadow: `2px 2px 0 ${INK}` }}>{accent}</span>
      </h2>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <div>

      {/* breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <p className="text-xs font-semibold" style={{ color: '#555' }}>
          <Link href="/" style={{ color: '#555' }}>Home</Link>
          {' '}<span style={{ color: RED, fontWeight: 900 }}>›</span>{' '}
          <span style={{ color: INK }}>About</span>
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* ABOUT ME                                                            */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal direction="up">
            <SectionHeader
              tag="ABOUT ME" tagColor={BLUE}
              title="WHY" accent="CUBOPEDIA?" accentColor={RED}
            />
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.1}>
            <div style={{ ...card3, overflow: 'hidden' }}>
              {/* window-chrome bar */}
              <div style={{
                background: YELLOW, borderBottom: `3px solid ${INK}`,
                padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10,
              }}>
                {[RED, GREEN, BLUE].map((c) => (
                  <div key={c} style={{ width: 12, height: 12, background: c, border: `2px solid ${INK}`, borderRadius: '50%' }} />
                ))}
                <span style={{
                  fontFamily: 'var(--font-bangers, Bangers, cursive)',
                  fontSize: '0.88rem', letterSpacing: '0.12em', color: INK, marginLeft: 6,
                }}>
                  MY STORY
                </span>
              </div>
              {/* body */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { lead: true,  p: "The Story Behind Cubopedia" },
                  { lead: false, p: "Hey cubers! My name is Satvik Thakur and I started this project as a high schooler to complement my love for Rubik's cubing! What began as a personal interest in solving the cube faster quickly turned into a deeper curiosity about the algorithms and formulated structure behind the Rubik's cube" },
                  { lead: false, p: "I created Cubopedia as a place where cubers of all skill levels can find algorithms, tutorials, guides, and other useful cubing resources in one organized platform. Fear not, whether it's your first time solving the cube or working toward faster solves, my primary focus with this project is to make learning cubing easier and more enjoyable." },
                  { lead: false, p: "With that being said, I hope y'all find this small project of mine helpful and accomodating to all your cubing needs. Happy solving!" },
                  { lead: false, p: "  - Satvik Thakur"},
                ].map(({ lead, p }, i) => (
                  <p
                    key={i}
                    style={{
                      fontSize: lead ? '1.03rem' : '0.9rem',
                      fontWeight: lead ? 700 : 500,
                      color: '#2a2a2a', lineHeight: 1.75, margin: 0,
                      borderLeft: lead ? `4px solid ${RED}` : 'none',
                      paddingLeft: lead ? 14 : 0,
                    }}
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div style={{ borderTop: `3px solid ${INK}`, opacity: 0.1 }} />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* CREDITS & RESOURCES                                                 */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal direction="up">
            <SectionHeader
              tag="Feel free to check out" tagColor={INK}
              title="CREDITS &" accent="RESOURCES" accentColor={BLUE}
            />
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {CREDITS.map((cr, i) => (
              <ScrollReveal key={cr.name} direction={i % 2 === 0 ? 'left' : 'right'} delay={i * 0.08}>
                <div style={{ ...card3, overflow: 'hidden' }}>
                  <div style={{ background: cr.color, borderBottom: `3px solid ${INK}`, padding: '10px 16px' }}>
                    <span style={{
                      fontFamily: 'var(--font-bangers, Bangers, cursive)',
                      fontSize: '1rem', letterSpacing: '0.06em', color: WHITE,
                    }}>
                      {cr.name}
                    </span>
                  </div>
                  <div style={{ padding: '14px 16px 18px' }}>
                    <p style={{
                      fontSize: '0.8rem', color: '#2a2a2a',
                      lineHeight: 1.65, margin: '0 0 14px 0', fontWeight: 500,
                    }}>
                      {cr.desc}
                    </p>
                    <a
                      href={cr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: cr.color, color: WHITE,
                        border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}`,
                        borderRadius: 2, padding: '6px 14px',
                        fontSize: '0.8rem', fontFamily: 'var(--font-bangers, Bangers, cursive)',
                        letterSpacing: '0.08em', textDecoration: 'none',
                      }}
                    >
                      <ExternalLink size={11} />
                      {cr.label}
                    </a>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* FOOTER QUOTE                                                        */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4">
        <ScrollReveal direction="scale">
          <div className="max-w-2xl mx-auto text-center">
            <div style={{
              background: INK, border: `4px solid ${INK}`,
              boxShadow: `6px 6px 0 ${YELLOW}`,
              borderRadius: 4, padding: '32px 36px', position: 'relative',
            }}>
              {/* speech-bubble tail */}
              <div style={{
                position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)',
                width: 0, height: 0,
                borderLeft: '16px solid transparent',
                borderRight: '16px solid transparent',
                borderTop: `20px solid ${INK}`,
              }} />
              <div style={{
                fontFamily: 'var(--font-bangers, Bangers, cursive)',
                fontSize: '0.72rem', letterSpacing: '0.35em', color: YELLOW, marginBottom: 12,
              }}>
                ★ ★ ★
              </div>
              <blockquote style={{
                fontFamily: 'var(--font-bangers, Bangers, cursive)',
                fontSize: 'clamp(1.3rem, 4vw, 2rem)',
                letterSpacing: '0.03em', color: WHITE,
                margin: 0, lineHeight: 1.3,
              }}>
                &quot;We turn the cube and twists us.&quot;
              </blockquote>
              <p style={{
                marginTop: 16,
                fontSize: '0.8rem',
                fontWeight: 600,
                color: YELLOW,
                letterSpacing: '0.12em',
              }}>
                — Erno Rubik
              </p>
            </div>
          </div>
        </ScrollReveal>
        {/* space for the bubble tail */}
        <div style={{ height: 40 }} />
      </section>

    </div>
  );
}
