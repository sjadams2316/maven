'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

interface Course {
  id: string;
  title: string;
  description: string;
  category: 'basics' | 'tax' | 'investing' | 'retirement' | 'crypto';
  duration: string;
  lessons: number;
  progress: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnail: string;
}

const COURSES: Course[] = [
  {
    id: '1',
    title: 'Understanding Your Portfolio',
    description: 'Learn how to read and analyze your portfolio allocation, performance metrics, and risk measures.',
    category: 'basics',
    duration: '15 min',
    lessons: 4,
    progress: 100,
    difficulty: 'beginner',
    thumbnail: '📊',
  },
  {
    id: '2',
    title: 'Tax-Loss Harvesting Strategies',
    description: 'Master the art of tax-loss harvesting to reduce your tax bill while maintaining investment exposure.',
    category: 'tax',
    duration: '25 min',
    lessons: 6,
    progress: 75,
    difficulty: 'intermediate',
    thumbnail: '🌾',
  },
  {
    id: '3',
    title: 'Introduction to Crypto Investing',
    description: 'Understand cryptocurrency fundamentals, risks, and how it fits into a diversified portfolio.',
    category: 'crypto',
    duration: '30 min',
    lessons: 8,
    progress: 50,
    difficulty: 'beginner',
    thumbnail: '₿',
  },
  {
    id: '4',
    title: 'Retirement Planning 101',
    description: 'Build a solid retirement plan with proper asset allocation, withdrawal strategies, and Social Security optimization.',
    category: 'retirement',
    duration: '45 min',
    lessons: 10,
    progress: 0,
    difficulty: 'beginner',
    thumbnail: '🏖️',
  },
  {
    id: '5',
    title: 'Advanced Tax Strategies',
    description: 'Roth conversions, backdoor IRAs, charitable giving strategies, and more for optimizing your taxes.',
    category: 'tax',
    duration: '40 min',
    lessons: 8,
    progress: 0,
    difficulty: 'advanced',
    thumbnail: '💰',
  },
  {
    id: '6',
    title: 'Understanding Market Risk',
    description: 'Learn about different types of market risk and how to protect your portfolio during volatility.',
    category: 'investing',
    duration: '20 min',
    lessons: 5,
    progress: 25,
    difficulty: 'intermediate',
    thumbnail: '📈',
  },
  {
    id: '7',
    title: 'Bittensor & Decentralized AI',
    description: 'Deep dive into TAO, the Bittensor network, and the future of decentralized artificial intelligence.',
    category: 'crypto',
    duration: '35 min',
    lessons: 7,
    progress: 0,
    difficulty: 'advanced',
    thumbnail: '🧠',
  },
  {
    id: '8',
    title: 'Estate Planning Basics',
    description: 'Protect your wealth for future generations with proper estate planning and beneficiary designations.',
    category: 'basics',
    duration: '30 min',
    lessons: 6,
    progress: 0,
    difficulty: 'intermediate',
    thumbnail: '📜',
  },
];

const ARTICLES = [
  { title: '5 Tax Moves to Make Before Year End', category: 'tax', readTime: '5 min', date: 'Feb 5, 2026' },
  { title: 'What the Fed Rate Decision Means for You', category: 'market', readTime: '4 min', date: 'Feb 3, 2026' },
  { title: 'Bitcoin Mining Stocks: CIFR vs IREN Analysis', category: 'crypto', readTime: '8 min', date: 'Jan 28, 2026' },
  { title: 'Maximizing Your 401(k) Match', category: 'retirement', readTime: '3 min', date: 'Jan 20, 2026' },
];

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  basics: { label: 'Basics', color: 'bg-blue-500/20 text-blue-400' },
  tax: { label: 'Tax', color: 'bg-emerald-500/20 text-emerald-400' },
  investing: { label: 'Investing', color: 'bg-purple-500/20 text-purple-400' },
  retirement: { label: 'Retirement', color: 'bg-amber-500/20 text-amber-400' },
  crypto: { label: 'Crypto', color: 'bg-pink-500/20 text-pink-400' },
  market: { label: 'Market', color: 'bg-red-500/20 text-red-400' },
};

export default function LearnPage() {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredCourses = COURSES.filter(course => {
    if (filter !== 'all' && course.category !== filter) return false;
    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  
  const inProgress = COURSES.filter(c => c.progress > 0 && c.progress < 100);
  const completed = COURSES.filter(c => c.progress === 100);
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl mx-auto mb-4">
            🎓
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Learning Center</h1>
          <p className="text-gray-400">Build your financial knowledge</p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{completed.length}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{inProgress.length}</p>
            <p className="text-sm text-gray-500">In Progress</p>
          </div>
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-400">{COURSES.length - completed.length - inProgress.length}</p>
            <p className="text-sm text-gray-500">Not Started</p>
          </div>
        </div>
        
        {/* Continue Learning */}
        {inProgress.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Continue Learning</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {inProgress.map((course) => (
                <div
                  key={course.id}
                  className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-xl p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-2xl">
                      {course.thumbnail}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white mb-1">{course.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-400">{course.progress}%</span>
                      </div>
                      <button className="text-sm text-indigo-400 hover:text-indigo-300">
                        Continue →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {[
              { key: 'all', label: 'All' },
              { key: 'basics', label: 'Basics' },
              { key: 'tax', label: 'Tax' },
              { key: 'investing', label: 'Investing' },
              { key: 'retirement', label: 'Retirement' },
              { key: 'crypto', label: 'Crypto' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition ${
                  filter === key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          </div>
        </div>
        
        {/* Courses Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-[#12121a] border border-white/10 rounded-xl overflow-hidden hover:border-indigo-500/30 transition group"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition">
                    {course.thumbnail}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${CATEGORY_CONFIG[course.category].color}`}>
                    {CATEGORY_CONFIG[course.category].label}
                  </span>
                </div>
                
                <h3 className="font-semibold text-white mb-2 group-hover:text-indigo-400 transition">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{course.lessons} lessons • {course.duration}</span>
                  <span className={`capitalize ${
                    course.difficulty === 'beginner' ? 'text-emerald-400' :
                    course.difficulty === 'intermediate' ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {course.difficulty}
                  </span>
                </div>
                
                {course.progress > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span className="text-white">{course.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${course.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <button className="w-full p-3 bg-white/5 text-indigo-400 text-sm font-medium hover:bg-indigo-600 hover:text-white transition">
                {course.progress === 0 ? 'Start Course' : course.progress === 100 ? 'Review' : 'Continue'}
              </button>
            </div>
          ))}
        </div>
        
        {/* Recent Articles */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Recent Articles</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {ARTICLES.map((article, idx) => (
              <div
                key={idx}
                className="bg-[#12121a] border border-white/10 rounded-xl p-4 hover:border-white/20 transition cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_CONFIG[article.category]?.color || 'bg-gray-500/20 text-gray-400'}`}>
                    {CATEGORY_CONFIG[article.category]?.label || article.category}
                  </span>
                  <span className="text-xs text-gray-600">{article.readTime} read</span>
                </div>
                <h3 className="font-medium text-white hover:text-indigo-400 transition">{article.title}</h3>
                <p className="text-xs text-gray-500 mt-2">{article.date}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
