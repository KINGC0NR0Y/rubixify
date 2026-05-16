'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/',           label: 'Home' },
  { href: '/algorithms', label: 'Algorithms' },
  { href: '/trainer',    label: 'Trainer' },
  { href: '/favorites',  label: 'Favorites' },
  { href: '/about',      label: 'About' },
];

export function SlideTabs() {
  const pathname = usePathname();
  const activeIndex = NAV_LINKS.findIndex((l) => l.href === pathname);
  const [selected, setSelected] = useState(activeIndex === -1 ? 0 : activeIndex);
  const [cursor, setCursor] = useState({ left: 0, width: 0, opacity: 0 });
  const tabsRef = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const idx = NAV_LINKS.findIndex((l) => l.href === pathname);
    if (idx !== -1) setSelected(idx);
  }, [pathname]);

  useEffect(() => {
    const el = tabsRef.current[selected];
    if (el) {
      setCursor({ left: el.offsetLeft, width: el.getBoundingClientRect().width, opacity: 1 });
    }
  }, [selected]);

  return (
    <ul
      className="relative flex rounded-full p-1"
      style={{ border: '1px solid rgba(124,111,247,0.2)' }}
      onMouseLeave={() => {
        const el = tabsRef.current[selected];
        if (el) {
          setCursor({ left: el.offsetLeft, width: el.getBoundingClientRect().width, opacity: 1 });
        }
      }}
    >
      {NAV_LINKS.map((link, i) => {
        const isActive = pathname === link.href;
        return (
          <li
            key={link.href}
            ref={(el) => { tabsRef.current[i] = el; }}
            onMouseEnter={() => {
              const el = tabsRef.current[i];
              if (el) setCursor({ left: el.offsetLeft, width: el.getBoundingClientRect().width, opacity: 1 });
            }}
            onClick={() => setSelected(i)}
            className="relative z-10"
          >
            <Link
              href={link.href}
              className="block px-3 py-1.5 text-sm rounded-full transition-colors"
              style={{
                color: isActive ? 'var(--violet-2)' : 'var(--fg-2)',
                fontWeight: isActive ? '500' : '400',
              }}
            >
              {link.label}
            </Link>
          </li>
        );
      })}

      <motion.li
        animate={cursor}
        className="absolute z-0 top-1 h-[calc(100%-8px)] rounded-full pointer-events-none"
        style={{ background: 'rgba(124,111,247,0.15)' }}
      />
    </ul>
  );
}
