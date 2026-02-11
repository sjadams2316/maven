import { Suspense } from 'react';
import { ClientHeader, ClientHeaderSkeleton } from '@/components/client-portal/ClientHeader';
import { ClientNav } from '@/components/client-portal/ClientNav';
import '../../globals.css';

// Demo data - will be replaced with API call
const DEMO_CLIENT_DATA = {
  name: 'John Smith',
  advisorFirm: 'Adams Wealth Management',
  advisorLogo: undefined,
  primaryColor: '#4f46e5', // indigo-600
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
      <body className="bg-slate-50 min-h-screen">
        <div className="flex min-h-screen">
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
