'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TradeOrder {
  id: string;
  symbol: string;
  name: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop' | 'stop_limit';
  quantity: number;
  price?: number;
  stopPrice?: number;
  account: string;
  status: 'pending' | 'submitted' | 'filled' | 'partial' | 'cancelled';
  createdAt: string;
  filledAt?: string;
  filledPrice?: number;
}

interface Position {
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  value: number;
  gain: number;
  gainPercent: number;
}

const positions: Position[] = [
  { symbol: 'VTI', name: 'Vanguard Total Stock', shares: 450, avgCost: 220, currentPrice: 278, value: 125100, gain: 26100, gainPercent: 26.4 },
  { symbol: 'NVDA', name: 'NVIDIA Corp', shares: 65, avgCost: 450, currentPrice: 892, value: 57980, gain: 28730, gainPercent: 98.2 },
  { symbol: 'AAPL', name: 'Apple Inc', shares: 180, avgCost: 165, currentPrice: 233, value: 41940, gain: 12240, gainPercent: 41.2 },
  { symbol: 'MSFT', name: 'Microsoft Corp', shares: 85, avgCost: 320, currentPrice: 447, value: 37995, gain: 10795, gainPercent: 39.7 },
  { symbol: 'TAO', name: 'Bittensor', shares: 30, avgCost: 280, currentPrice: 512, value: 15360, gain: 6960, gainPercent: 82.9 },
];

const recentOrders: TradeOrder[] = [
  { id: '1', symbol: 'VTI', name: 'Vanguard Total Stock', side: 'buy', orderType: 'market', quantity: 10, account: 'Individual', status: 'filled', createdAt: '2026-02-07T14:30:00', filledAt: '2026-02-07T14:30:02', filledPrice: 277.85 },
  { id: '2', symbol: 'BND', name: 'Vanguard Total Bond', side: 'buy', orderType: 'limit', quantity: 50, price: 72.50, account: 'IRA', status: 'pending', createdAt: '2026-02-08T09:15:00' },
  { id: '3', symbol: 'NVDA', name: 'NVIDIA Corp', side: 'sell', orderType: 'limit', quantity: 5, price: 920, account: 'Individual', status: 'pending', createdAt: '2026-02-08T10:00:00' },
];

export default function TradePage() {
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop' | 'stop_limit'>('market');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [account, setAccount] = useState('individual');
  const [showConfirm, setShowConfirm] = useState(false);

  const selectedPosition = positions.find(p => p.symbol === selectedSymbol);
  const estimatedValue = selectedPosition && quantity 
    ? Number(quantity) * selectedPosition.currentPrice 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                ← Dashboard
              </Link>
            </div>
            <h1 className="text-3xl font-bold">Trade Center</h1>
            <p className="text-slate-400 mt-1">Execute trades across your accounts</p>
          </div>
          <div className="flex gap-3">
            <Link href="/rebalance" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg">
              ⚖️ Rebalance
            </Link>
            <Link href="/tax-harvesting" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg">
              📋 Tax-Loss Harvest
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Trade Ticket */}
          <div className="col-span-1">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-6">New Order</h2>
              
              <div className="space-y-4">
                {/* Buy/Sell Toggle */}
                <div className="flex rounded-lg overflow-hidden">
                  <button
                    onClick={() => setSide('buy')}
                    className={`flex-1 py-3 font-medium transition-colors ${
                      side === 'buy' ? 'bg-green-600' : 'bg-slate-700'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setSide('sell')}
                    className={`flex-1 py-3 font-medium transition-colors ${
                      side === 'sell' ? 'bg-red-600' : 'bg-slate-700'
                    }`}
                  >
                    Sell
                  </button>
                </div>

                {/* Symbol */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Symbol</label>
                  <input
                    type="text"
                    value={selectedSymbol}
                    onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
                    placeholder="Enter symbol..."
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3"
                  />
                  {selectedPosition && (
                    <div className="mt-2 p-3 bg-slate-700/50 rounded-lg">
                      <div className="text-sm font-medium">{selectedPosition.name}</div>
                      <div className="text-sm text-slate-400">
                        {selectedPosition.shares} shares @ ${selectedPosition.currentPrice}
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Type */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Order Type</label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value as typeof orderType)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3"
                  >
                    <option value="market">Market</option>
                    <option value="limit">Limit</option>
                    <option value="stop">Stop</option>
                    <option value="stop_limit">Stop Limit</option>
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3"
                  />
                  {side === 'sell' && selectedPosition && (
                    <div className="flex gap-2 mt-2">
                      {[25, 50, 75, 100].map((pct) => (
                        <button
                          key={pct}
                          onClick={() => setQuantity(String(Math.floor(selectedPosition.shares * pct / 100)))}
                          className="flex-1 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded"
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Limit Price */}
                {(orderType === 'limit' || orderType === 'stop_limit') && (
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Limit Price</label>
                    <input
                      type="number"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3"
                    />
                  </div>
                )}

                {/* Stop Price */}
                {(orderType === 'stop' || orderType === 'stop_limit') && (
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Stop Price</label>
                    <input
                      type="number"
                      value={stopPrice}
                      onChange={(e) => setStopPrice(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3"
                    />
                  </div>
                )}

                {/* Account */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Account</label>
                  <select
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3"
                  >
                    <option value="individual">Individual Brokerage</option>
                    <option value="ira">Traditional IRA</option>
                    <option value="roth">Roth IRA</option>
                    <option value="401k">401(k)</option>
                  </select>
                </div>

                {/* Estimated Value */}
                {estimatedValue > 0 && (
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Estimated {side === 'buy' ? 'Cost' : 'Proceeds'}</span>
                      <span className="font-medium">${estimatedValue.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={!selectedSymbol || !quantity}
                  className={`w-full py-4 rounded-lg font-medium transition-colors ${
                    side === 'buy' 
                      ? 'bg-green-600 hover:bg-green-500 disabled:bg-green-900' 
                      : 'bg-red-600 hover:bg-red-500 disabled:bg-red-900'
                  } disabled:cursor-not-allowed`}
                >
                  Preview {side === 'buy' ? 'Buy' : 'Sell'} Order
                </button>
              </div>
            </div>
          </div>

          {/* Positions & Orders */}
          <div className="col-span-2 space-y-6">
            {/* Current Positions */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="p-4 border-b border-slate-700/50">
                <h2 className="text-lg font-semibold">Your Positions</h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left p-3 text-slate-400 font-medium">Symbol</th>
                    <th className="text-right p-3 text-slate-400 font-medium">Shares</th>
                    <th className="text-right p-3 text-slate-400 font-medium">Price</th>
                    <th className="text-right p-3 text-slate-400 font-medium">Value</th>
                    <th className="text-right p-3 text-slate-400 font-medium">Gain/Loss</th>
                    <th className="text-center p-3 text-slate-400 font-medium">Trade</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((position) => (
                    <tr key={position.symbol} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                      <td className="p-3">
                        <div className="font-medium">{position.symbol}</div>
                        <div className="text-sm text-slate-400">{position.name}</div>
                      </td>
                      <td className="text-right p-3">{position.shares}</td>
                      <td className="text-right p-3">${position.currentPrice.toFixed(2)}</td>
                      <td className="text-right p-3">${position.value.toLocaleString()}</td>
                      <td className={`text-right p-3 ${position.gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        <div>{position.gain >= 0 ? '+' : ''}${position.gain.toLocaleString()}</div>
                        <div className="text-sm">{position.gain >= 0 ? '+' : ''}{position.gainPercent.toFixed(1)}%</div>
                      </td>
                      <td className="text-center p-3">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => {
                              setSelectedSymbol(position.symbol);
                              setSide('buy');
                            }}
                            className="px-3 py-1 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded text-sm"
                          >
                            Buy
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSymbol(position.symbol);
                              setSide('sell');
                            }}
                            className="px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded text-sm"
                          >
                            Sell
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Open Orders */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="p-4 border-b border-slate-700/50">
                <h2 className="text-lg font-semibold">Open Orders</h2>
              </div>
              {recentOrders.filter(o => o.status === 'pending' || o.status === 'submitted').length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No open orders
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left p-3 text-slate-400 font-medium">Order</th>
                      <th className="text-left p-3 text-slate-400 font-medium">Type</th>
                      <th className="text-right p-3 text-slate-400 font-medium">Qty</th>
                      <th className="text-right p-3 text-slate-400 font-medium">Price</th>
                      <th className="text-left p-3 text-slate-400 font-medium">Account</th>
                      <th className="text-center p-3 text-slate-400 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.filter(o => o.status === 'pending' || o.status === 'submitted').map((order) => (
                      <tr key={order.id} className="border-b border-slate-700/30">
                        <td className="p-3">
                          <div className={`font-medium ${order.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                            {order.side.toUpperCase()} {order.symbol}
                          </div>
                          <div className="text-sm text-slate-400">{order.name}</div>
                        </td>
                        <td className="p-3 capitalize">{order.orderType.replace('_', ' ')}</td>
                        <td className="text-right p-3">{order.quantity}</td>
                        <td className="text-right p-3">{order.price ? `$${order.price}` : 'Market'}</td>
                        <td className="p-3">{order.account}</td>
                        <td className="text-center p-3">
                          <button className="px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded text-sm">
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Recent Fills */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="p-4 border-b border-slate-700/50">
                <h2 className="text-lg font-semibold">Recent Fills</h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left p-3 text-slate-400 font-medium">Order</th>
                    <th className="text-right p-3 text-slate-400 font-medium">Qty</th>
                    <th className="text-right p-3 text-slate-400 font-medium">Filled Price</th>
                    <th className="text-right p-3 text-slate-400 font-medium">Total</th>
                    <th className="text-left p-3 text-slate-400 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.filter(o => o.status === 'filled').map((order) => (
                    <tr key={order.id} className="border-b border-slate-700/30">
                      <td className="p-3">
                        <div className={`font-medium ${order.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                          {order.side.toUpperCase()} {order.symbol}
                        </div>
                      </td>
                      <td className="text-right p-3">{order.quantity}</td>
                      <td className="text-right p-3">${order.filledPrice?.toFixed(2)}</td>
                      <td className="text-right p-3">${((order.filledPrice || 0) * order.quantity).toLocaleString()}</td>
                      <td className="p-3 text-slate-400">
                        {order.filledAt && new Date(order.filledAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Order Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-6">Confirm Order</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-400">Action</span>
                  <span className={`font-medium ${side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                    {side.toUpperCase()} {selectedSymbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quantity</span>
                  <span>{quantity} shares</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Order Type</span>
                  <span className="capitalize">{orderType.replace('_', ' ')}</span>
                </div>
                {limitPrice && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Limit Price</span>
                    <span>${limitPrice}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Account</span>
                  <span className="capitalize">{account.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-slate-700">
                  <span className="font-medium">Estimated {side === 'buy' ? 'Cost' : 'Proceeds'}</span>
                  <span className="font-bold">${estimatedValue.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    // Would submit order here
                  }}
                  className={`flex-1 py-3 rounded-lg font-medium ${
                    side === 'buy' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'
                  }`}
                >
                  Submit Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
