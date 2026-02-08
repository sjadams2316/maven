'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

interface CryptoHolding {
  symbol: string;
  name: string;
  amount: number;
  price: number;
  value: number;
  change24h: number;
  change7d?: number;
  account: string;
}

// Sam's crypto holdings from memory
const SAM_CRYPTO = [
  { symbol: 'TAO', name: 'Bittensor', amount: 215, account: 'Various (Retirement + Coinbase)' },
];

export default function CryptoPage() {
  const [holdings, setHoldings] = useState<CryptoHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [btcPrice, setBtcPrice] = useState(0);
  const [btcChange, setBtcChange] = useState(0);
  
  const fetchPrices = async () => {
    try {
      // Fetch TAO and BTC prices
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bittensor,bitcoin&vs_currencies=usd&include_24hr_change=true&include_7d_change=true'
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // BTC for reference
        setBtcPrice(data.bitcoin?.usd || 0);
        setBtcChange(data.bitcoin?.usd_24h_change || 0);
        
        // Update holdings with live prices
        const updatedHoldings = SAM_CRYPTO.map(h => {
          let priceData = null;
          if (h.symbol === 'TAO') priceData = data.bittensor;
          
          const price = priceData?.usd || 0;
          const change24h = priceData?.usd_24h_change || 0;
          const change7d = priceData?.usd_7d_change;
          
          return {
            ...h,
            price,
            value: price * h.amount,
            change24h,
            change7d,
          };
        });
        
        setHoldings(updatedHoldings);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);
  
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const totalCost = 215 * 450; // Approximate cost basis (could be stored)
  const totalGain = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Crypto Holdings</h1>
            <p className="text-gray-400 mt-1">
              {lastUpdate 
                ? `Updated ${lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
                : 'Loading...'}
            </p>
          </div>
          
          <button
            onClick={fetchPrices}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition flex items-center gap-2"
          >
            <span>↻</span>
            <span>Refresh</span>
          </button>
        </div>
        
        {/* Summary Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-2xl p-5">
            <p className="text-purple-300 text-sm mb-1">Total Crypto Value</p>
            <p className="text-3xl font-bold text-white">
              {loading ? '...' : `$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            </p>
            {!loading && (
              <p className={`text-sm mt-1 ${totalGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalGain >= 0 ? '+' : ''}{totalGainPercent.toFixed(1)}% all time
              </p>
            )}
          </div>
          
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-5">
            <p className="text-gray-400 text-sm mb-1">Bitcoin Price</p>
            <p className="text-3xl font-bold text-white">
              {loading ? '...' : `$${btcPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            </p>
            {!loading && (
              <p className={`text-sm mt-1 ${btcChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {btcChange >= 0 ? '+' : ''}{btcChange.toFixed(2)}% (24h)
              </p>
            )}
          </div>
          
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-5">
            <p className="text-gray-400 text-sm mb-1">TAO Price</p>
            <p className="text-3xl font-bold text-white">
              {loading ? '...' : `$${holdings[0]?.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '—'}`}
            </p>
            {!loading && holdings[0] && (
              <p className={`text-sm mt-1 ${holdings[0].change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {holdings[0].change24h >= 0 ? '+' : ''}{holdings[0].change24h.toFixed(2)}% (24h)
              </p>
            )}
          </div>
        </div>
        
        {/* Holdings */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden mb-8">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Your Holdings</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading live prices...</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {holdings.map((holding, idx) => (
                <div key={idx} className="p-4 hover:bg-white/5 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {holding.symbol.slice(0, 2)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{holding.name}</h3>
                        <span className="text-gray-500">{holding.symbol}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {holding.amount.toLocaleString()} tokens • {holding.account}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xl font-bold text-white">
                        ${holding.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                      <div className="flex items-center justify-end gap-2 text-sm">
                        <span className={holding.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {holding.change24h >= 0 ? '▲' : '▼'} {Math.abs(holding.change24h).toFixed(2)}%
                        </span>
                        <span className="text-gray-600">24h</span>
                      </div>
                      {holding.change7d !== undefined && (
                        <div className="flex items-center justify-end gap-2 text-xs">
                          <span className={holding.change7d >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {holding.change7d >= 0 ? '+' : ''}{holding.change7d.toFixed(2)}%
                          </span>
                          <span className="text-gray-600">7d</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Price per token */}
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Price per token</span>
                    <span className="text-white">${holding.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* TAO Info */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-2xl">
              🧠
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">About Bittensor (TAO)</h3>
              <p className="text-gray-400 text-sm mb-4">
                Bittensor is a decentralized AI network where machine learning models are trained and 
                deployed in a distributed manner. TAO is the native token used to incentivize network 
                participants and access AI services.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white/10 text-gray-300 text-xs rounded-full">Decentralized AI</span>
                <span className="px-3 py-1 bg-white/10 text-gray-300 text-xs rounded-full">Machine Learning</span>
                <span className="px-3 py-1 bg-white/10 text-gray-300 text-xs rounded-full">Proof of Intelligence</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Thesis Note */}
        <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-sm text-gray-400">
            💡 <strong className="text-white">Your Thesis:</strong> AI infrastructure is in early innings. 
            TAO represents the decentralized AI future — where intelligence is commoditized and accessible 
            to everyone, not controlled by a few big tech companies.
          </p>
        </div>
      </main>
    </div>
  );
}
