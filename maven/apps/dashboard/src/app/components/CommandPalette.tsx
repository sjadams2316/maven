'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Command {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  action?: () => void;
  href?: string;
  category: string;
}

const COMMANDS: Command[] = [
  // Navigation
  { id: 'dashboard', label: 'Go to Dashboard', icon: '🏠', href: '/dashboard', shortcut: 'G D', category: 'Navigation' },
  { id: 'portfolio', label: 'Open Portfolio Lab', icon: '📊', href: '/portfolio-lab', shortcut: 'G P', category: 'Navigation' },
  { id: 'goals', label: 'View Goals', icon: '🎯', href: '/goals', shortcut: 'G G', category: 'Navigation' },
  { id: 'family', label: 'Family Wealth', icon: '👨‍👩‍👧‍👦', href: '/family', category: 'Navigation' },
  { id: 'crypto', label: 'Crypto Holdings', icon: '₿', href: '/crypto', category: 'Navigation' },
  { id: 'oracle', label: 'Ask Maven Oracle', icon: '🔮', href: '/oracle', shortcut: 'G O', category: 'Navigation' },
  
  // Actions
  { id: 'harvest', label: 'Tax-Loss Harvest', icon: '🌾', href: '/tax-harvesting', category: 'Actions' },
  { id: 'rebalance', label: 'Rebalance Portfolio', icon: '⚖️', href: '/portfolio-lab', category: 'Actions' },
  { id: 'link-account', label: 'Link New Account', icon: '🔗', href: '/accounts/link', category: 'Actions' },
  { id: 'add-goal', label: 'Add New Goal', icon: '➕', href: '/goals', category: 'Actions' },
  
  // Tools
  { id: 'fragility', label: 'Market Fragility Index', icon: '📈', href: '/fragility', category: 'Tools' },
  { id: 'retirement', label: 'Retirement Calculator', icon: '🏖️', href: '/retirement', category: 'Tools' },
  { id: 'what-if', label: 'What-If Scenarios', icon: '🤔', href: '/what-if', category: 'Tools' },
  { id: 'documents', label: 'Document Vault', icon: '📄', href: '/documents', category: 'Tools' },
  
  // Settings
  { id: 'settings', label: 'Settings', icon: '⚙️', href: '/settings', shortcut: 'G S', category: 'Settings' },
  { id: 'notifications', label: 'Notifications', icon: '🔔', href: '/notifications', category: 'Settings' },
  { id: 'billing', label: 'Billing', icon: '💳', href: '/billing', category: 'Settings' },
  { id: 'help', label: 'Help & Support', icon: '❓', href: '/help', category: 'Settings' },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  // Filter commands
  const filteredCommands = COMMANDS.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );
  
  // Group by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);
  
  // Flatten for keyboard navigation
  const flatCommands = Object.values(groupedCommands).flat();
  
  // Open/close with keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);
  
  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, flatCommands.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter' && flatCommands[selectedIndex]) {
      executeCommand(flatCommands[selectedIndex]);
    }
  };
  
  const executeCommand = (cmd: Command) => {
    setIsOpen(false);
    if (cmd.action) {
      cmd.action();
    } else if (cmd.href) {
      router.push(cmd.href);
    }
  };
  
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400 hover:bg-white/10 hover:text-white transition"
      >
        <span>⌘K</span>
        <span>Quick actions</span>
      </button>
    );
  }
  
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-xl mx-4 bg-[#12121a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Search input */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <span className="text-gray-500">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-lg"
          />
          <kbd className="px-2 py-1 bg-white/10 text-gray-500 text-xs rounded">ESC</kbd>
        </div>
        
        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2">
          {Object.entries(groupedCommands).map(([category, commands]) => (
            <div key={category} className="mb-4">
              <p className="px-3 py-1 text-xs text-gray-500 uppercase tracking-wider">
                {category}
              </p>
              
              {commands.map((cmd) => {
                const index = flatCommands.indexOf(cmd);
                const isSelected = index === selectedIndex;
                
                return (
                  <button
                    key={cmd.id}
                    onClick={() => executeCommand(cmd)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                      isSelected
                        ? 'bg-indigo-600/20 text-white'
                        : 'text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-xl">{cmd.icon}</span>
                    <span className="flex-1 text-left">{cmd.label}</span>
                    {cmd.shortcut && (
                      <span className="text-xs text-gray-600">{cmd.shortcut}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
          
          {filteredCommands.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No commands found for "{query}"
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-white/10 bg-white/5 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>⌘K anywhere</span>
        </div>
      </div>
    </div>
  );
}
