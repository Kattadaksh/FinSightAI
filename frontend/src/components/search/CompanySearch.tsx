import React, { useState } from 'react';
import { Search, ArrowRight, Building2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const POPULAR_COMPANIES = [
  { ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Semiconductors & AI', country: '🇺🇸 NASDAQ' },
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Consumer Tech', country: '🇺🇸 NASDAQ' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', sector: 'Software & Cloud', country: '🇺🇸 NASDAQ' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', sector: 'E-Commerce & Cloud', country: '🇺🇸 NASDAQ' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Internet & AI', country: '🇺🇸 NASDAQ' },
  { ticker: 'META', name: 'Meta Platforms Inc.', sector: 'Social Media & AI', country: '🇺🇸 NASDAQ' },
  { ticker: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive & EVs', country: '🇺🇸 NASDAQ' },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Banking & Financials', country: '🇺🇸 NYSE' },
  { ticker: 'WMT', name: 'Walmart Inc.', sector: 'Retail & Grocery', country: '🇺🇸 NYSE' },
  { ticker: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer Goods', country: '🇺🇸 NYSE' },
  { ticker: 'ORCL', name: 'Oracle Corporation', sector: 'Enterprise Cloud & Data', country: '🇺🇸 NYSE' },
  { ticker: 'AMD', name: 'Advanced Micro Devices', sector: 'Semiconductors', country: '🇺🇸 NASDAQ' },
];

const CompanySearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const filtered = POPULAR_COMPANIES.filter(c => 
    c.ticker.toLowerCase().includes(query.toLowerCase()) || 
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.sector.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (tickerSymbol: string) => {
    const cleanTicker = tickerSymbol.trim().toUpperCase();
    if (!cleanTicker) return;
    setQuery('');
    setIsFocused(false);
    navigate(`/company/${cleanTicker}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleSelect(query.trim());
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto" style={{ zIndex: 100 }}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <Search className="absolute left-4 text-blue-400/70 pointer-events-none transition-colors" size={18} />
        <input 
          type="text"
          className="input w-full pl-11 pr-20 py-3.5 text-sm rounded-2xl transition-all font-sans bg-[#0e1627]/90 border border-slate-700/60 focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/15 text-slate-100 placeholder:text-slate-400/70 shadow-lg"
          placeholder="Search Fortune 500 ticker (e.g. NVDA, AAPL, MSFT, AMZN, GOOGL)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 220)}
        />
        
        {query.trim() && (
          <div className="absolute right-2.5 flex items-center gap-1.5">
            <button 
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
              title="Clear"
            >
              <X size={15} />
            </button>
            <button 
              type="submit" 
              className="p-1.5 rounded-xl bg-blue-600/30 text-blue-300 hover:bg-blue-600/50 hover:text-white transition-all shadow-sm flex items-center gap-1 text-xs font-semibold px-2.5"
            >
              <span>Go</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </form>
      
      {/* Dropdown Suggestions — Positioned lowered cleanly below search box */}
      {isFocused && (
        <div 
          className="absolute top-[calc(100%+10px)] left-0 w-full rounded-2xl border border-blue-500/25 p-2.5 shadow-2xl backdrop-blur-2xl animate-fade-in z-[999]" 
          style={{ backgroundColor: 'rgba(11, 17, 30, 0.97)', maxHeight: '380px', overflowY: 'auto' }}
        >
          {query.trim() && (
            <div 
              onMouseDown={() => handleSelect(query.trim())}
              className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-transparent hover:from-blue-600/30 hover:via-indigo-600/30 text-blue-300 cursor-pointer mb-2.5 transition-all border border-blue-500/30 shadow-md group"
            >
              <div className="flex items-center gap-2.5 font-bold text-sm">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 group-hover:scale-105 transition-transform">
                  <Search size={15} />
                </div>
                <span>Analyze ticker <span className="text-white font-mono bg-blue-500/20 px-2 py-0.5 rounded border border-blue-400/30">"{query.toUpperCase()}"</span></span>
              </div>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-blue-400" />
            </div>
          )}

          <div className="px-3.5 py-2 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center justify-between">
            <span>{query.trim() ? 'Matching Equities' : 'Featured Market Equities'}</span>
            <span className="text-[10px] font-mono text-slate-500 font-medium">NSE & NASDAQ</span>
          </div>

          {filtered.length > 0 ? (
            filtered.map(company => (
              <div 
                key={company.ticker}
                className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-800/60 cursor-pointer transition-all border border-transparent hover:border-slate-700/50 mb-1 group"
                onMouseDown={() => handleSelect(company.ticker)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-800/90 text-blue-400 border border-slate-700/50 group-hover:border-blue-500/40 group-hover:bg-blue-500/10 transition-colors">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <span className="font-mono tracking-wide">{company.ticker}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60">
                        {company.country}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-medium mt-0.5">{company.name}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    {company.sector}
                  </span>
                  <ArrowRight size={14} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))
          ) : (
            <div 
              onMouseDown={() => handleSelect(query.trim())}
              className="p-4 text-center text-sm text-blue-300 cursor-pointer hover:bg-slate-800/60 rounded-xl transition-colors font-medium"
            >
              Click to research <strong>"{query.toUpperCase()}"</strong> with AI Agent Engine
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanySearch;
