'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PreviewBannerProps {
  clientName: string;
}

export function PreviewBanner({ clientName }: PreviewBannerProps) {
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  const isAdvisor = searchParams.get('advisor') === 'true';

  if (!isPreview) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white px-4 py-3 flex items-center justify-between gap-4 shadow-lg">
      <div className="flex items-center gap-3">
        <span className="text-xl">👁️</span>
        <div>
          <span className="font-medium">Preview Mode</span>
          <span className="hidden sm:inline text-amber-100 ml-2">
            — You&apos;re viewing as <strong>{clientName}</strong>
          </span>
          <span className="sm:hidden text-amber-100 block text-sm">
            Viewing as {clientName}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isAdvisor && (
          <Link
            href="/partners/clients"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors text-sm min-h-[40px] flex items-center"
          >
            ← Back to Dashboard
          </Link>
        )}
        <button
          onClick={() => window.close()}
          className="px-4 py-2 bg-white text-amber-600 hover:bg-amber-50 rounded-lg font-medium transition-colors text-sm min-h-[40px]"
        >
          Exit Preview
        </button>
      </div>
    </div>
  );
}
