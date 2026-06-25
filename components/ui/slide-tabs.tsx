'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/',           label: 'Home',       color: '#FFD500', textDark: true },
  { href: '/algorithms', label: 'Algorithms', color: '#6495ED', textDark: false },
  { href: '/trainer',    label: 'Trainer',    color: '#0045AD', textDark: false },
  { href: '/favorites',  label: 'Favorites',  color: '#009B48', textDark: false },
  { href: '/about',      label: 'About',      color: '#FF5900', textDark: false },
];

export function SlideTabs() {
  const pathname    = usePathname();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <ul
      className="flex items-center"
      style={{ gap: '2px', padding: '2px', background: '#FFFFFF', border: '2px solid #0A0A0A', borderRadius: '2px', boxShadow: '3px 3px 0 #0A0A0A' }}
    >
      {NAV_LINKS.map((link, i) => {
        const isActive  = pathname === link.href;
        const isHovered = hoveredIdx === i;

        return (
          <li
            key={link.href}
            className="relative"
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <Link
              href={link.href}
              className="block px-3 py-1.5 text-sm font-bold transition-all"
              style={{
                fontFamily: 'var(--font-bangers, Bangers, cursive)',
                letterSpacing: '0.08em',
                fontSize: '0.9rem',
                borderRadius: '1px',
                background: isActive
                  ? link.color
                  : isHovered
                    ? link.color + 'DD'
                    : 'transparent',
                color: isActive
                  ? (link.textDark ? '#0A0A0A' : '#FFFFFF')
                  : isHovered
                    ? (link.textDark ? '#0A0A0A' : '#FFFFFF')
                    : '#0A0A0A',
                border: isActive ? '2px solid #0A0A0A' : '2px solid transparent',
                boxShadow: isActive ? '2px 2px 0 #0A0A0A' : 'none',
                transform: isActive ? 'translate(-1px,-1px)' : 'none',
                transition: 'background 0.1s, color 0.1s, transform 0.1s, box-shadow 0.1s',
              }}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
