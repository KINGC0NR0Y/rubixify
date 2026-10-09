'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, Search } from 'lucide-react';
import GlobalSearch from './GlobalSearch';
import { SlideTabs } from './ui/slide-tabs';

const navLinks = [
  { href: '/',           label: 'Home' },
  { href: '/algorithms', label: 'Algorithms' },
  { href: '/trainer',    label: 'Trainer' },
  { href: '/favorites',  label: 'Favorites' },
  { href: '/about',      label: 'About' },
];

// Brand mark — same artwork as the favicon (app/icon.svg)
const LOGO_TILES = [
  { x: 20,  y: 115, fill: '#B20000' },
  { x: 310, y: 115, fill: '#B20000' },
  { x: 600, y: 115, fill: '#004AAF' },
  { x: 175, y: 393, fill: '#00A14B' },
  { x: 465, y: 393, fill: '#FFF200' },
  { x: 755, y: 393, fill: '#004AAF' },
  { x: 20,  y: 671, fill: '#00A14B' },
  { x: 310, y: 671, fill: '#FF6A00' },
  { x: 600, y: 671, fill: '#FF6A00' },
];

function CubeLogo() {
  return (
    <svg width="34" height="27" viewBox="20 115 984 790" fill="none" aria-hidden>
      {LOGO_TILES.map((t, i) => (
        <rect
          key={i}
          x={t.x}
          y={t.y}
          width={248}
          height={234}
          rx={40}
          fill={t.fill}
        />
      ))}
    </svg>
  );
}

export default function Navbar() {
  const pathname    = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const headerRef   = useRef<HTMLElement>(null);
  const lastY       = useRef(0);

  // Hide on scroll-down, show on scroll-up
  useEffect(() => {
    lastY.current = window.scrollY;
    const h = headerRef.current;
    if (h) { h.style.transition = 'transform 280ms'; h.style.transform = 'translateY(0)'; }
  }, [pathname]);

  useEffect(() => {
    const header = headerRef.current;
    const onScroll = () => {
      const y    = window.scrollY;
      const hide = !(y < lastY.current || y < 60);
      if (header) {
        header.style.transition = 'transform 280ms';
        header.style.transform  = hide ? 'translateY(-100%)' : 'translateY(0)';
      }
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-50"
        style={{
          background: '#FFFFFF',
          borderBottom: '3px solid #0A0A0A',
          boxShadow: '0 3px 0 #0A0A0A',
        }}
      >
        {/* Yellow accent stripe */}
        <div style={{ height: 4, background: '#FFD500', borderBottom: '2px solid #0A0A0A' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-13" style={{ height: 52 }}>
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 select-none"
            style={{ textDecoration: 'none' }}
          >
            <CubeLogo />
            <span
              style={{
                fontFamily: 'var(--font-bangers, Bangers, Impact, cursive)',
                fontSize: '1.5rem',
                letterSpacing: '0.06em',
                color: '#0A0A0A',
                lineHeight: 1,
              }}
            >
              Rubix
              <span style={{ color: '#B90000' }}>ify</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex">
            <SlideTabs />
          </nav>

          <div className="flex items-center gap-2">
            {/* Search button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm transition-all"
              style={{
                background: '#FFFFFF',
                border: '2px solid #0A0A0A',
                boxShadow: '2px 2px 0 #0A0A0A',
                color: '#0A0A0A',
                borderRadius: '2px',
                fontWeight: 600,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translate(-1px,-1px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '3px 3px 0 #0A0A0A';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = '';
                (e.currentTarget as HTMLElement).style.boxShadow = '2px 2px 0 #0A0A0A';
              }}
            >
              <Search size={13} />
              <span className="hidden sm:inline">Search</span>
              <kbd
                className="hidden sm:inline text-xs px-1 py-0.5"
                style={{
                  background: '#FFD500',
                  border: '1px solid #0A0A0A',
                  borderRadius: '2px',
                  fontSize: '10px',
                  lineHeight: '1',
                  fontFamily: 'var(--font-geist-mono)',
                }}
              >
                /
              </kbd>
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-1.5 transition-colors"
              onClick={() => setMobileOpen(v => !v)}
              style={{
                border: '2px solid #0A0A0A',
                background: mobileOpen ? '#FFD500' : '#FFFFFF',
                boxShadow: '2px 2px 0 #0A0A0A',
                borderRadius: '2px',
                color: '#0A0A0A',
              }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav
            className="md:hidden flex flex-col"
            style={{
              borderTop: '3px solid #0A0A0A',
              background: '#FFFFFF',
              backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          >
            {navLinks.map((l, i) => {
              const active = pathname === l.href;
              const panelColors = ['#FFD500', '#B90000', '#0045AD', '#009B48', '#FF5900'];
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all"
                  style={{
                    borderBottom: '2px solid #0A0A0A',
                    background: active ? panelColors[i % panelColors.length] : 'transparent',
                    color: active && (i === 1 || i === 2 || i === 4) ? '#FFFFFF' : '#0A0A0A',
                    fontFamily: 'var(--font-bangers, Bangers, cursive)',
                    fontSize: '1rem',
                    letterSpacing: '0.1em',
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: panelColors[i % panelColors.length],
                      border: '1.5px solid #0A0A0A',
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  {l.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </>
  );
}
