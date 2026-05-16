import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAlgorithmById, allAlgorithms } from '@/lib/algorithms';
import AlgorithmDetail from '@/components/AlgorithmDetail';

export function generateStaticParams() {
  return allAlgorithms.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const alg = getAlgorithmById(id);
  if (!alg) return { title: 'Not Found – CuboPedia' };
  return {
    title: `${alg.name} – CuboPedia`,
    description: alg.recognition,
  };
}

export default async function AlgorithmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const alg = getAlgorithmById(id);
  if (!alg) notFound();

  const related = allAlgorithms
    .filter((a) => a.category === alg.category && a.id !== alg.id)
    .slice(0, 4);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-2 text-xs mb-6" style={{ color: 'var(--muted)' }}>
        <Link href="/" style={{ color: 'var(--muted)' }}>Home</Link>
        <span>/</span>
        <Link href="/algorithms" style={{ color: 'var(--muted)' }}>Algorithms</Link>
        <span>/</span>
        <span style={{ color: 'var(--foreground)' }}>{alg.name}</span>
      </div>

      <AlgorithmDetail alg={alg} related={related} />
    </div>
  );
}
