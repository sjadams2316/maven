'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { getMemberById, FamilyMember } from '@/lib/demo-family';
import { FamilyMemberDetail } from '@/components/client-portal/FamilyMemberDetail';

// Loading skeleton
function MemberDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-32 bg-white/10 rounded" />
      <div className="bg-white/5 rounded-3xl p-8 h-40" />
      <div className="space-y-4">
        <div className="h-6 w-40 bg-white/10 rounded" />
        <div className="h-20 bg-white/5 rounded-xl" />
        <div className="h-20 bg-white/5 rounded-xl" />
      </div>
    </div>
  );
}

export default function FamilyMemberPage() {
  const params = useParams<{ code: string; memberId: string }>();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<FamilyMember | null>(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      const data = getMemberById(params.memberId);
      setMember(data || null);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [params.memberId]);

  if (loading) {
    return <MemberDetailSkeleton />;
  }

  if (!member) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-xl font-semibold text-white mb-2">Member Not Found</h2>
        <p className="text-gray-400 mb-6">
          We couldn't find this family member.
        </p>
        <a 
          href={`/c/${params.code}/family`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors min-h-[44px]"
        >
          ← Back to Family
        </a>
      </div>
    );
  }

  return <FamilyMemberDetail member={member} code={params.code} />;
}
