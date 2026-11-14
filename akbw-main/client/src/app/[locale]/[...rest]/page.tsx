import { notFound } from 'next/navigation';

// Noma'lum manzillar tilga mos 404 sahifasini ko'rsatadi
export default function CatchAll() {
  notFound();
}
