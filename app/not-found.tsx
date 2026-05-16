import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-7xl font-black mb-4" style={{ color: 'var(--accent)' }}>
        404
      </div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
        Algorithm Not Found
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
        This page doesn&apos;t exist. Maybe the algorithm was mis-scrambled.
      </p>
      <Link
        href="/algorithms"
        className="px-6 py-3 rounded-xl font-semibold text-sm"
        style={{ background: 'var(--accent)', color: '#fff' }}
      >
        Browse Algorithms
      </Link>
    </div>
  );
}
