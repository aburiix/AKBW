import { LoaderCircle } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex justify-center items-center w-full min-h-[60vh]">
      <LoaderCircle className="w-8 h-8 text-gray-400 animate-spin" />
    </div>
  );
}
