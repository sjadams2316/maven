'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from '../components/Header';

// Dynamically import PlaidLink to avoid SSR issues
const PlaidLinkButton = dynamic(
  () => import('../components/PlaidLink').then(mod => mod.PlaidLinkButton),
  { 
    ssr: false,
    loading: () => (
      <button disabled className="w-full px-6 py-4 bg-gray-500/50 text-white font-semibold rounded-xl">
        Loading...
      </button>
    )
  }
);

interface LinkedAccount {
  id: string;
  name: string;
  officialName?: string;
  type: string;
  subtype?: string;
  mask?: string;
  currentBalance?: number;
  availableBalance?: number;
  currency: string;
  institutionId?: string;
  institutionName?: string;
  itemId?: string;
  linkedAt?: string;
}

export default function AccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load accounts from localStorage (MVP) - production would use database
    const storedAccounts = localStorage.getItem('maven_accounts');
    if (storedAccounts) {
      setAccounts(JSON.parse(storedAccounts));
    }
    setLoading(false);
  }, []);

  const handleAccountLinked = (newAccounts: LinkedAccount[]) => {
    setAccounts(prev => [...prev, ...newAccounts]);
  };

  const handleRemoveAccount = (accountId: string) => {
    const updatedAccounts = accounts.filter(a => a.id !== accountId);
    setAccounts(updatedAccounts);
    localStorage.setItem('maven_accounts', JSON.stringify(updatedAccounts));
  };

  const totalBalance = accounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0);

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'depository':
        return '🏦';
      case 'investment':
        return '📈';
      case 'credit':
        return '💳';
      case 'loan':
        return '🏠';
      default:
        return '💰';
    }
  };

  const getAccountTypeLabel = (type: string, subtype?: string) => {
    if (subtype) {
      return subtype.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Total Balance Card */}
        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-6 mb-8">
          <p className="text-sm text-gray-400 mb-1">Total Net Worth</p>
          <p className="text-4xl font-bold">{formatCurrency(totalBalance)}</p>
          <p className="text-sm text-gray-400 mt-2">{accounts.length} account{accounts.length !== 1 ? 's' : ''} linked</p>
        </div>

        {/* Link New Account */}
        <div className="mb-8">
          <PlaidLinkButton onSuccess={handleAccountLinked}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Link New Account
          </PlaidLinkButton>
        </div>

        {/* Accounts List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl mx-auto mb-4">
              🔗
            </div>
            <h3 className="text-lg font-semibold mb-2">No accounts linked yet</h3>
            <p className="text-gray-400 mb-6">
              Link your bank accounts, brokerages, and investment accounts to see your complete financial picture.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Group by institution */}
            {Object.entries(
              accounts.reduce((groups: Record<string, LinkedAccount[]>, account) => {
                const key = account.institutionName || 'Other';
                if (!groups[key]) groups[key] = [];
                groups[key].push(account);
                return groups;
              }, {})
            ).map(([institution, institutionAccounts]) => (
              <div key={institution} className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                  <h3 className="font-semibold">{institution}</h3>
                </div>
                <div className="divide-y divide-white/5">
                  {institutionAccounts.map((account) => (
                    <div key={account.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl">
                          {getAccountIcon(account.type)}
                        </div>
                        <div>
                          <p className="font-medium">{account.name}</p>
                          <p className="text-sm text-gray-400">
                            {getAccountTypeLabel(account.type, account.subtype)}
                            {account.mask && ` •••• ${account.mask}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCurrency(account.currentBalance || 0, account.currency)}
                          </p>
                          {account.availableBalance !== undefined && account.availableBalance !== account.currentBalance && (
                            <p className="text-sm text-gray-400">
                              {formatCurrency(account.availableBalance, account.currency)} available
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveAccount(account.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition text-gray-400 hover:text-red-400"
                          title="Remove account"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="text-xl">🔒</div>
            <div>
              <p className="font-medium text-sm">Bank-level security</p>
              <p className="text-sm text-gray-400">
                Your credentials are never stored on our servers. We use Plaid, the same service trusted by 
                Venmo, Coinbase, and thousands of other financial apps.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
