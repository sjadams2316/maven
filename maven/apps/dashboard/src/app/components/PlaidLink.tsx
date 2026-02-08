'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';

interface PlaidLinkProps {
  onSuccess: (accounts: any[]) => void;
  onExit?: () => void;
  children?: React.ReactNode;
}

export function PlaidLinkButton({ onSuccess, onExit, children }: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch link token on mount
  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        const response = await fetch('/api/plaid/create-link-token', {
          method: 'POST',
        });
        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
          return;
        }
        
        setLinkToken(data.link_token);
      } catch (err) {
        setError('Failed to initialize Plaid');
        console.error('Error fetching link token:', err);
      }
    };

    fetchLinkToken();
  }, []);

  const handleSuccess = useCallback(async (publicToken: string, metadata: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_token: publicToken,
          metadata,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      // Store linked accounts (MVP: localStorage, Production: database)
      const existingAccounts = JSON.parse(localStorage.getItem('maven_accounts') || '[]');
      const newAccounts = data.accounts.map((account: any) => ({
        ...account,
        institutionId: data.institution.id,
        institutionName: data.institution.name,
        itemId: data.item_id,
        linkedAt: new Date().toISOString(),
      }));
      
      const updatedAccounts = [...existingAccounts, ...newAccounts];
      localStorage.setItem('maven_accounts', JSON.stringify(updatedAccounts));
      
      onSuccess(newAccounts);
    } catch (err) {
      setError('Failed to link account');
      console.error('Error exchanging token:', err);
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  const handleExit = useCallback(() => {
    onExit?.();
  }, [onExit]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: handleSuccess,
    onExit: handleExit,
  });

  if (error) {
    return (
      <div className="text-red-400 text-sm p-4 bg-red-500/10 rounded-xl border border-red-500/20">
        {error}
      </div>
    );
  }

  return (
    <button
      onClick={() => open()}
      disabled={!ready || loading}
      className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Linking...
        </>
      ) : (
        children || (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Link Account
          </>
        )
      )}
    </button>
  );
}
