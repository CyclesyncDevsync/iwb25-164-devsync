'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface SearchResult {
  id: string;
  title: string;
  type: 'material' | 'auction' | 'supplier' | 'page';
  url: string;
  description?: string;
  category?: string;
}

interface NavbarSearchProps {
  onClose?: () => void;
  className?: string;
}

const recentSearches = [
  'Recycled Plastic',
  'Metal Scraps',
  'Electronics',
  'Textile Waste'
];

const trendingSearches = [
  'Solar Panel Components',
  'Battery Materials',
  'Biodegradable Plastics',
  'Rare Earth Metals'
];

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    title: 'Premium Recycled Plastic Materials',
    type: 'material',
    url: '/materials/premium-plastic',
    description: 'High-quality recycled plastic suitable for manufacturing',
    category: 'Plastics'
  },
  {
    id: '2',
    title: 'Electronics Components Auction',
    type: 'auction',
    url: '/auctions/electronics-components',
    description: 'Live auction for various electronic components',
    category: 'Electronics'
  },
  {
    id: '3',
    title: 'GreenTech Suppliers Ltd.',
    type: 'supplier',
    url: '/suppliers/greentech',
    description: 'Specialized in sustainable material solutions',
    category: 'Suppliers'
  }
];

export function NavbarSearch({ onClose, className = '' }: NavbarSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Simulate search API call
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const filteredResults = mockSearchResults.filter(result =>
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setResults(filteredResults);
    setLoading(false);
  };

  useEffect(() => {
    if (query) {
      performSearch(query);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      handleClose();
    }
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    onClose?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      router.push(results[selectedIndex].url);
      handleClose();
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'material':
        return '🔧';
      case 'auction':
        return '🔨';
      case 'supplier':
        return '🏢';
      default:
        return '📄';
    }
  };

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'material':
        return 'Material';
      case 'auction':
        return 'Auction';
      case 'supplier':
        return 'Supplier';
      default:
        return 'Page';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search materials, auctions, suppliers..."
          className="w-full px-4 py-2 pl-10 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Search Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={handleClose}
            />
            
            {/* Results Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden"
            >
              {query ? (
                <div>
                  {loading ? (
                    <div className="px-4 py-8 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Searching...</p>
                    </div>
                  ) : results.length > 0 ? (
                    <div>
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Search Results
                        </p>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {results.map((result, index) => (
                          <button
                            key={result.id}
                            onClick={() => {
                              router.push(result.url);
                              handleClose();
                            }}
                            className={`
                              w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors
                              ${selectedIndex === index ? 'bg-green-50 dark:bg-green-900/20' : ''}
                            `}
                          >
                            <div className="flex items-start space-x-3">
                              <span className="text-lg">{getResultIcon(result.type)}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {result.title}
                                  </p>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                    {getResultTypeLabel(result.type)}
                                  </span>
                                </div>
                                {result.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                                    {result.description}
                                  </p>
                                )}
                                {result.category && (
                                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                    {result.category}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <MagnifyingGlassIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No results found for "{query}"
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Try searching for materials, auctions, or suppliers
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {/* Recent Searches */}
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      Recent Searches
                    </p>
                  </div>
                  <div className="py-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setQuery(search);
                          inputRef.current?.focus();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span>{search}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Trending Searches */}
                  <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center">
                      <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                      Trending
                    </p>
                  </div>
                  <div className="py-2">
                    {trendingSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setQuery(search);
                          inputRef.current?.focus();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                          <span>{search}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
