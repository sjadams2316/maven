'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ComplianceTask {
  id: string;
  clientName: string;
  clientId: string;
  type: 'agreement' | 'risk_questionnaire' | 'suitability' | 'disclosure' | 'annual_review';
  status: 'pending' | 'in_progress' | 'awaiting_signature' | 'completed' | 'overdue';
  dueDate: string;
  completedDate?: string;
  assignedTo: string;
}

const mockTasks: ComplianceTask[] = [
  { id: '1', clientName: 'Robert Chen', clientId: 'client-1', type: 'agreement', status: 'awaiting_signature', dueDate: '2026-02-10', assignedTo: 'Jon Adams' },
  { id: '2', clientName: 'Sarah Mitchell', clientId: 'client-2', type: 'risk_questionnaire', status: 'pending', dueDate: '2026-02-12', assignedTo: 'Jon Adams' },
  { id: '3', clientName: 'David Park', clientId: 'client-3', type: 'annual_review', status: 'overdue', dueDate: '2026-02-01', assignedTo: 'Jon Adams' },
  { id: '4', clientName: 'Emily Watson', clientId: 'client-4', type: 'suitability', status: 'in_progress', dueDate: '2026-02-15', assignedTo: 'Jon Adams' },
  { id: '5', clientName: 'Michael Torres', clientId: 'client-5', type: 'disclosure', status: 'completed', dueDate: '2026-02-05', completedDate: '2026-02-04', assignedTo: 'Jon Adams' },
  { id: '6', clientName: 'Jennifer Lee', clientId: 'client-6', type: 'agreement', status: 'completed', dueDate: '2026-02-03', completedDate: '2026-02-02', assignedTo: 'Jon Adams' },
];

const typeLabels: Record<string, string> = {
  agreement: 'Client Agreement',
  risk_questionnaire: 'Risk Questionnaire',
  suitability: 'Suitability Review',
  disclosure: 'Disclosure Delivery',
  annual_review: 'Annual Review',
};

const typeIcons: Record<string, string> = {
  agreement: '📝',
  risk_questionnaire: '📋',
  suitability: '✅',
  disclosure: '📄',
  annual_review: '🔄',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  in_progress: 'bg-blue-500/20 text-blue-400',
  awaiting_signature: 'bg-purple-500/20 text-purple-400',
  completed: 'bg-green-500/20 text-green-400',
  overdue: 'bg-red-500/20 text-red-400',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  awaiting_signature: 'Awaiting Signature',
  completed: 'Completed',
  overdue: 'Overdue',
};

export default function CompliancePage() {
  const [filter, setFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredTasks = mockTasks.filter(task => {
    if (filter !== 'all' && task.status !== filter) return false;
    if (typeFilter !== 'all' && task.type !== typeFilter) return false;
    return true;
  });

  const stats = {
    total: mockTasks.length,
    pending: mockTasks.filter(t => t.status === 'pending' || t.status === 'in_progress' || t.status === 'awaiting_signature').length,
    overdue: mockTasks.filter(t => t.status === 'overdue').length,
    completed: mockTasks.filter(t => t.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/advisor" className="text-slate-400 hover:text-white transition-colors">
                ← Advisor
              </Link>
            </div>
            <h1 className="text-3xl font-bold">Compliance Center</h1>
            <p className="text-slate-400 mt-1">Track regulatory requirements and client documentation</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
              📊 Generate Report
            </button>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors">
              + New Task
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-slate-400 text-sm">Total Tasks</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-slate-400 text-sm">In Progress</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="text-2xl font-bold text-red-400">{stats.overdue}</div>
            <div className="text-slate-400 text-sm">Overdue</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
            <div className="text-slate-400 text-sm">Completed</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="awaiting_signature">Awaiting Signature</option>
            <option value="overdue">Overdue</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="all">All Types</option>
            <option value="agreement">Client Agreements</option>
            <option value="risk_questionnaire">Risk Questionnaires</option>
            <option value="suitability">Suitability Reviews</option>
            <option value="disclosure">Disclosures</option>
            <option value="annual_review">Annual Reviews</option>
          </select>
        </div>

        {/* Task List */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left p-4 text-slate-400 font-medium">Task</th>
                <th className="text-left p-4 text-slate-400 font-medium">Client</th>
                <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                <th className="text-left p-4 text-slate-400 font-medium">Due Date</th>
                <th className="text-left p-4 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{typeIcons[task.type]}</span>
                      <div>
                        <div className="font-medium">{typeLabels[task.type]}</div>
                        <div className="text-sm text-slate-400">Assigned to {task.assignedTo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Link href={`/advisor/clients/${task.clientId}`} className="text-purple-400 hover:text-purple-300">
                      {task.clientName}
                    </Link>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${statusColors[task.status]}`}>
                      {statusLabels[task.status]}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className={task.status === 'overdue' ? 'text-red-400' : ''}>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    {task.completedDate && (
                      <div className="text-sm text-green-400">
                        Completed {new Date(task.completedDate).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {task.status !== 'completed' && (
                        <>
                          <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">
                            View
                          </button>
                          <button className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-sm transition-colors">
                            {task.status === 'awaiting_signature' ? 'Resend' : 'Start'}
                          </button>
                        </>
                      )}
                      {task.status === 'completed' && (
                        <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">
                          View Record
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Audit Log Preview */}
        <div className="mt-8 bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Audit Log</h2>
          <div className="space-y-3">
            {[
              { time: '2 hours ago', action: 'Client Agreement signed', client: 'Jennifer Lee', user: 'Client (e-signature)' },
              { time: '1 day ago', action: 'Risk Questionnaire sent', client: 'Sarah Mitchell', user: 'Jon Adams' },
              { time: '2 days ago', action: 'ADV Part 2 delivered', client: 'Michael Torres', user: 'System (automated)' },
              { time: '3 days ago', action: 'Suitability review initiated', client: 'Emily Watson', user: 'Jon Adams' },
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
                <div className="flex items-center gap-4">
                  <span className="text-slate-500 text-sm w-24">{log.time}</span>
                  <span>{log.action}</span>
                  <span className="text-purple-400">{log.client}</span>
                </div>
                <span className="text-slate-400 text-sm">{log.user}</span>
              </div>
            ))}
          </div>
          <button className="mt-4 text-purple-400 hover:text-purple-300 text-sm">
            View Full Audit Log →
          </button>
        </div>
      </div>
    </div>
  );
}
