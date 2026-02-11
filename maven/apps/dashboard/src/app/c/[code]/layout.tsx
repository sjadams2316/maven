'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { PortalNavigation } from '@/components/client-portal';

function ClientLayoutInner({ children }: { children: React.ReactNode }) {
  const params = useParams<{ code: string }>();
  const searchParams = useSearchParams();

  const isPreview = searchParams.get('preview') === 'true';

  return (
    <div className="min-h-screen bg-[#0a1628]">
      {/* Preview Banner */}
      {isPreview && (
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white text-center py-2 px-4 text-sm font-medium fixed top-0 left-0 right-0 z-[60]">
          <span className="mr-2">👁️</span>
          Advisor Preview — This is how your client sees their portal
          <Link 
            href={`/partners/clients/1`}
            className="ml-4 underline hover:no-underline"
          >
            Back to client →
          </Link>
        </div>
      )}

      <div className={`flex ${isPreview ? 'pt-10' : ''}`}>
        {/* Sidebar Navigation */}
        <PortalNavigation code={params.code} />

        {/* Main Content Area */}
        <div className="flex-1 min-h-screen">
          {/* Mobile Header - Only visible on mobile since sidebar is hidden */}
          <header className="md:hidden sticky top-0 z-40 bg-[#0a1628]/95 backdrop-blur-sm border-b border-white/10">
            <div className="px-4 py-4 pl-16">
              <Link href={`/c/${params.code}`} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg shadow-teal-500/20">
                  MP
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Maven Partners</p>
                  <p className="text-gray-500 text-xs">Client Portal</p>
                </div>
              </Link>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-4xl mx-auto px-4 py-6 md:py-8 md:px-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-white/10 py-6 mt-8">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <p className="text-gray-500 text-sm">
                Powered by <span className="text-teal-400">Maven</span>
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

// Loading fallback
function LayoutFallback({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a1628]">
      <div className="flex">
        {/* Sidebar skeleton */}
        <div className="hidden md:block w-64 bg-[#0a1628] border-r border-white/10 min-h-screen">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
        
        {/* Content area */}
        <div className="flex-1">
          <main className="max-w-4xl mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LayoutFallback>{children}</LayoutFallback>}>
      <ClientLayoutInner>{children}</ClientLayoutInner>
    </Suspense>
  );
}
