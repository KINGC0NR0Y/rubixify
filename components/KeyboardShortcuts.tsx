'use client';

import { useEffect } from 'react';

// Opens global search when "/" is pressed outside inputs
export default function KeyboardShortcuts({ onSearch }: { onSearch: () => void }) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (
        e.key === '/' &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        onSearch();
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSearch]);

  return null;
}
