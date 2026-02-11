import { Suspense } from 'react';
import { ClientHeader, ClientHeaderSkeleton } from '@/components/client-portal/ClientHeader';
import { ClientNav } from '@/components/client-portal/ClientNav';
import { PreviewBanner } from '@/components/client-portal/PreviewBanner';
import '../../globals.css';

// Demo data - will be replaced with API call
const DEMO_CLIENT_DATA = {
  name: 'John Smith',
  advisorFirm: 'Maven Partners',
  advisorLogo: undefined,
  primaryColor: '#f59e0b', // Amber for Maven Partners
};

export const metadata = {
  title: 'Client Portal | Maven',
  description: 'View your portfolio, insights, and connect with your advisor',
};

export default async function ClientPortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const client = DEMO_CLIENT_DATA;
  
  return (
    <html lang="en">
      <body className="bg-[#0a0a12] min-h-screen text-white">
        {/* Subtle gradient background effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-3xl" />
        </div>
        
        {/* Preview banner for advisors previewing client view */}
        <Suspense fallback={null}>
          <PreviewBanner clientName={client.name} />
        </Suspense>
        
        <div className="relative flex min-h-screen">
          {/* Desktop sidebar */}
          <ClientNav code={code} primaryColor={client.primaryColor} />
          
          {/* Main content area */}
          <div className="flex-1 flex flex-col min-h-screen">
            <Suspense fallback={<ClientHeaderSkeleton />}>
              <ClientHeader
                firmName={client.advisorFirm}
                firmLogo={client.advisorLogo}
                clientName={client.name}
                primaryColor={client.primaryColor}
              />
            </Suspense>
            
            {/* Page content with bottom padding for mobile nav */}
            <main className="flex-1 pb-20 md:pb-0">
              <div className="max-w-2xl mx-auto px-4 py-6">
                {children}
              </div>
            </main>
          </div>
        </div>
        
        {/* Mobile bottom nav (rendered in ClientNav) */}
      </body>
    </html>
  );
}
