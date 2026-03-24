import React, { useState, useRef, useEffect } from 'react';
import { Search as SearchIcon, Loader2, CornerDownLeft } from 'lucide-react';
import StudentDetailCard from '../components/StudentDetailCard';
import { semesters as cseSemesters } from '../data/subjects';
import { aimlSemesters } from '../data/subjects-aiml';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [resultStream, setResultStream] = useState<'CSE ICP' | 'AIML ICP' | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const searchQuery = query.trim().toUpperCase();
    if (!searchQuery) return;

    setIsSearching(true);
    setHasSearched(true);
    setSearchResult(null);
    setResultStream(null);

    try {
      const res = await fetch(`/api/search/${encodeURIComponent(searchQuery)}`);
      
      if (res.ok) {
        const data = await res.json();
        setSearchResult(data);
        setResultStream(data.branch as 'CSE ICP' | 'AIML ICP');
      } else if (res.status !== 404) {
        console.error('Error searching: status', res.status);
      }
    } catch (err) {
      console.error('Search error', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 sm:p-6 text-[var(--color-text)] flex flex-col items-center">
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1">
        
        {/* Search Bar Section */}
        <div 
          className={`flex flex-col items-center w-full transition-all duration-700 ease-in-out ${
            hasSearched ? 'mt-2 mb-8' : 'mt-16 sm:mt-24 mb-12'
          }`}
        >
          {/* Header Section */}
          <header className={`text-center transition-all duration-700 ${hasSearched ? 'mb-4 scale-90' : 'mb-8 scale-100'}`}>
            <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-3">Student Search</h1>
            <p className="text-stone-500">Find student submissions by their roll number.</p>
          </header>

          <div className="card w-full max-w-2xl mx-auto relative group flex items-center shadow-sm hover:shadow-md transition-shadow duration-300">
            <SearchIcon className="absolute left-4 w-5 h-5 text-stone-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="Enter Roll Number (e.g. 21BXXXXXXX)"
              className="w-full bg-transparent py-3 pl-12 pr-12 outline-none text-base sm:text-lg font-mono uppercase placeholder:normal-case placeholder:font-sans placeholder:text-stone-400"
            />
            <button 
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              title="Search (Enter)"
              className="absolute right-2 p-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group/btn"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <CornerDownLeft className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search Results Section */}
        {hasSearched && (
          <div className="w-full flex-1">
            {isSearching ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
              </div>
            ) : searchResult ? (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
                <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-4 px-2">Search Result</h2>
                <div className="space-y-4">
                  <StudentDetailCard
                    submission={searchResult}
                    index={0}
                    stream={resultStream || 'CSE ICP'}
                    semesters={resultStream === 'AIML ICP' ? aimlSemesters : cseSemesters}
                    readOnly={true}
                  />
                </div>
              </div>
            ) : (
              <div className="card text-center py-12 border border-stone-200 border-dashed bg-white/50 max-w-4xl mx-auto">
                <p className="text-stone-500">No results found for <span className="font-mono font-bold text-stone-700">{query}</span>.</p>
                <button 
                  onClick={() => { setQuery(''); setHasSearched(false); inputRef.current?.focus(); }}
                  className="mt-4 text-sm font-medium text-[var(--color-primary)] hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
