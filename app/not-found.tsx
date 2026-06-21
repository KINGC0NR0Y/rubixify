import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div
        className="mb-4"
        style={{
          fontFamily: 'var(--font-bangers, Bangers, cursive)',
          fontSize: 'clamp(5rem, 18vw, 9rem)',
          letterSpacing: '0.04em',
          lineHeight: 1,
          color: '#B90000',
          textShadow: '5px 5px 0 #0A0A0A',
        }}
      >
        404
      </div>
      <h1
        className="mb-2"
        style={{
          fontFamily: 'var(--font-bangers, Bangers, cursive)',
          fontSize: 'clamp(1.4rem, 4vw, 2rem)',
          letterSpacing: '0.04em',
          color: '#0A0A0A',
        }}
      >
        Algorithm Not Found
      </h1>
      <p className="text-sm mb-8 font-semibold" style={{ color: '#555555' }}>
        This page doesn&apos;t exist. Maybe the algorithm was mis-scrambled.
      </p>
      <Link
        href="/algorithms"
        className="btn-primary px-6 py-3 font-semibold text-sm"
      >
        Browse Algorithms
      </Link>
    </div>
  );
}
