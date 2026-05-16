'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, Search } from 'lucide-react';
import GlobalSearch from './GlobalSearch';
import { SlideTabs } from './ui/slide-tabs';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/algorithms', label: 'Algorithms' },
  { href: '/trainer', label: 'Trainer' },
  { href: '/favorites', label: 'Favorites' },
  { href: '/about', label: 'About' },
];

const NAVBAR_H = 56; // h-14

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    const h = headerRef.current;
    if (h) { h.style.transition = 'transform 300ms'; h.style.transform = 'translateY(0)'; }
  }, [pathname]);

  useEffect(() => {
    const header = headerRef.current;
    const onScroll = () => {
      const y = window.scrollY;
      const heroMax = 3 * window.innerHeight;

      if (pathname === '/' && y <= heroMax) {
        const heroFrac = y / heroMax;
        if (heroFrac > 0.88) {
          const exitFrac = (heroFrac - 0.88) / 0.12;
          if (header) {
            header.style.transition = 'none';
            header.style.transform = `translateY(${-exitFrac * NAVBAR_H}px)`;
          }
        } else {
          if (header) { header.style.transition = 'transform 300ms'; header.style.transform = 'translateY(0)'; }
        }
      } else {
        const hide = !(y < lastY.current || y < 60);
        if (header) {
          header.style.transition = 'transform 300ms';
          header.style.transform = hide ? 'translateY(-100%)' : 'translateY(0)';
        }
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
        style={{ background: 'transparent' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 font-bold text-lg tracking-tight select-none">
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
              style={{ background: 'linear-gradient(135deg, #7c6ff7, #6058e0)', color: '#fff' }}
            >
              C
            </span>
            <span style={{ color: 'var(--fg)' }}>Cubo</span>
            <span className="gradient-text-violet">Pedia</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex">
            <SlideTabs />
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all"
              style={{
                background: '#111120',
                border: '1px solid var(--border)',
                color: 'var(--fg-2)',
              }}
            >
              <Search size={13} />
              <span className="hidden sm:inline">Search...</span>
              <kbd
                className="hidden sm:inline text-xs px-1.5 py-0.5 rounded"
                style={{
                  background: '#181828',
                  border: '1px solid var(--border)',
                  color: 'var(--fg-3)',
                  fontSize: '10px',
                  lineHeight: '1',
                }}
              >
                /
              </kbd>
            </button>

            <button
              className="md:hidden p-1.5 rounded-lg transition-colors hover:bg-white/5"
              onClick={() => setMobileOpen((v) => !v)}
              style={{ color: 'var(--fg-2)' }}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav
            className="md:hidden border-t px-4 py-3 flex flex-col gap-1"
            style={{ borderColor: 'var(--border)' }}
          >
            {navLinks.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm transition-all"
                  style={{
                    color: active ? 'var(--violet-2)' : 'var(--fg)',
                    background: active ? 'rgba(124,111,247,0.12)' : 'transparent',
                  }}
                >
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
