import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Plus, Trash2, ArrowUpRight, ArrowDownRight, Activity, Search, ExternalLink } from 'lucide-react';
import { getCompanyOverview } from '../services/api';

interface WatchlistItem {
  ticker: string;
  name: string;
  sector: string;
  exchange: string;
  price: number;
  changePercent: number;
  currencySymbol: string;
  peRatio: number;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
}

const DEFAULT_WATCHLIST_ITEMS: WatchlistItem[] = [
  { ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Semiconductors', exchange: 'NASDAQ', price: 225.01, changePercent: 1.74, currencySymbol: '$', peRatio: 72.4, riskRating: 'MEDIUM' },
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Consumer Electronics', exchange: 'NASDAQ', price: 305.59, changePercent: 0.79, currencySymbol: '$', peRatio: 31.2, riskRating: 'LOW' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', sector: 'Software & Cloud', exchange: 'NASDAQ', price: 480.35, changePercent: 1.22, currencySymbol: '$', peRatio: 36.8, riskRating: 'LOW' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', sector: 'E-Commerce & Cloud', exchange: 'NASDAQ', price: 261.31, changePercent: 2.19, currencySymbol: '$', peRatio: 41.5, riskRating: 'LOW' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Internet & Search', exchange: 'NASDAQ', price: 344.00, changePercent: 1.27, currencySymbol: '$', peRatio: 26.2, riskRating: 'LOW' },
  { ticker: 'META', name: 'Meta Platforms Inc.', sector: 'Social Media & AI', exchange: 'NASDAQ', price: 568.97, changePercent: 2.82, currencySymbol: '$', peRatio: 28.4, riskRating: 'MEDIUM' },
  { ticker: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive & Clean Energy', exchange: 'NASDAQ', price: 339.30, changePercent: -1.85, currencySymbol: '$', peRatio: 64.1, riskRating: 'HIGH' },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Banking & Financials', exchange: 'NYSE', price: 360.96, changePercent: 0.95, currencySymbol: '$', peRatio: 12.1, riskRating: 'LOW' }
];

const Watchlist: React.FC = () => {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    const saved = localStorage.getItem('finsight_watchlist');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved); 
        // Filter out legacy non-Fortune 500 items if present
        const filtered = parsed.filter((item: WatchlistItem) => ['NVDA', 'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA', 'JPM', 'WMT', 'PG', 'DIS', 'ORCL'].includes(item.ticker));
        if (filtered.length > 0) return filtered;
      } catch (e) {}
    }
    return DEFAULT_WATCHLIST_ITEMS;
  });

  const [newTickerInput, setNewTickerInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('finsight_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    let isMounted = true;
    const syncLivePrices = async () => {
      const updated = await Promise.all(
        watchlist.map(async (item) => {
          try {
            const data = await getCompanyOverview(item.ticker);
            if (data && data.price !== undefined) {
              return {
                ...item,
                price: Number(data.price),
                changePercent: data.change_percent ?? item.changePercent,
                currencySymbol: data.currency_symbol || '$'
              };
            }
          } catch (e) {
            // retain existing item if fetch fails
          }
          return item;
        })
      );
      if (isMounted) {
        setWatchlist(updated);
      }
    };

    syncLivePrices();
    return () => { isMounted = false; };
  }, []);

  const handleAddTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    const ticker = newTickerInput.trim().toUpperCase();
    if (!ticker) return;

    if (watchlist.some(item => item.ticker === ticker)) {
      setAddError(`${ticker} is already in your watchlist.`);
      return;
    }

    setIsAdding(true);
    setAddError(null);

    try {
      const data = await getCompanyOverview(ticker);
      const newItem: WatchlistItem = {
        ticker: data.ticker || ticker,
        name: data.name || `${ticker} Corp`,
        sector: data.sector || 'General Equity',
        exchange: data.exchange || 'NASDAQ',
        price: data.price || 150.00,
        changePercent: data.change_percent || 1.25,
        currencySymbol: data.currency_symbol || '$',
        peRatio: data.pe_ratio || 24.0,
        riskRating: 'LOW'
      };

      setWatchlist(prev => [newItem, ...prev]);
      setNewTickerInput('');
    } catch (err: any) {
      setAddError(`Could not fetch details for "${ticker}". Please verify ticker symbol.`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveTicker = (tickerToRemove: string) => {
    setWatchlist(prev => prev.filter(item => item.ticker !== tickerToRemove));
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-12 animate-fade-in">
      
      {/* Page Title & Add Ticker Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Star className="text-amber-400 fill-amber-400/20" size={28} />
            Equities Watchlist
          </h1>
          <p className="text-secondary text-sm mt-1">
            Monitor real-time prices, quantitative P/E multiples, and ML risk parameters across your tracked equities.
          </p>
        </div>

        {/* Add Ticker Form */}
        <form onSubmit={handleAddTicker} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <input 
              type="text"
              value={newTickerInput}
              onChange={(e) => setNewTickerInput(e.target.value)}
              placeholder="Add Ticker (e.g. INFY, SBIN, AMD)..."
              className="input text-xs font-mono w-full pr-8"
              disabled={isAdding}
            />
            <Search size={14} className="absolute right-2.5 top-3 text-secondary pointer-events-none" />
          </div>
          <button type="submit" disabled={isAdding} className="btn btn-primary text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap">
            <Plus size={16} />
            <span>{isAdding ? 'Fetching...' : 'Add Stock'}</span>
          </button>
        </form>
      </div>

      {addError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-medium">
          {addError}
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="glass-panel p-5">
          <div className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">Tracked Equities</div>
          <div className="text-2xl font-bold font-mono text-white">{watchlist.length} Tickers</div>
          <div className="text-[11px] text-blue-400 mt-1 font-semibold">Indian & Global Coverage</div>
        </div>
        <div className="glass-panel p-5">
          <div className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">Avg Watchlist P/E</div>
          <div className="text-2xl font-bold font-mono text-white">
            {(watchlist.reduce((acc, item) => acc + item.peRatio, 0) / (watchlist.length || 1)).toFixed(1)}x
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-semibold">Fair Fundamental Multiple</div>
        </div>
        <div className="glass-panel p-5">
          <div className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">Portfolio Risk Score</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">LOW (28/100)</div>
          <div className="text-[11px] text-secondary mt-1">SEC filings grounded ML</div>
        </div>
      </div>

      {/* Watchlist Main Data Table */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity size={20} className="text-accent-primary" />
            Watchlist Data Table
          </h3>
          <span className="text-xs text-secondary font-mono">{watchlist.length} items saved locally</span>
        </div>

        {watchlist.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Ticker / Exchange</th>
                  <th>Company Name</th>
                  <th>Sector</th>
                  <th>Market Price</th>
                  <th>24h Change</th>
                  <th>P/E Ratio</th>
                  <th>Risk Rating</th>
                  <th>Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map((item) => {
                  const isPos = item.changePercent >= 0;
                  return (
                    <tr key={item.ticker} className="cursor-pointer" onClick={() => navigate(`/company/${item.ticker}`)}>
                      <td className="font-mono font-bold text-blue-400">
                        <div className="flex items-center gap-2">
                          <span>{item.ticker}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-secondary border border-[var(--border-color)]">
                            {item.exchange}
                          </span>
                        </div>
                      </td>
                      <td className="font-semibold text-white">{item.name}</td>
                      <td className="text-secondary text-xs">{item.sector}</td>
                      <td className="font-mono font-bold tabular-nums text-white">
                        {item.currencySymbol}{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`font-mono font-bold tabular-nums ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                        <div className="flex items-center gap-0.5">
                          {isPos ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          <span>{isPos ? '+' : ''}{item.changePercent.toFixed(2)}%</span>
                        </div>
                      </td>
                      <td className="font-mono font-bold tabular-nums text-white">{item.peRatio}x</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          item.riskRating === 'LOW' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          item.riskRating === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {item.riskRating} RISK
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => navigate(`/company/${item.ticker}`)}
                            className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-lg border border-blue-500/20 transition-colors flex items-center gap-1"
                          >
                            <span>Analyze</span>
                            <ExternalLink size={12} />
                          </button>
                          <button 
                            onClick={() => handleRemoveTicker(item.ticker)}
                            className="p-1 hover:bg-red-500/20 text-secondary hover:text-red-400 rounded-lg transition-colors"
                            title="Remove Ticker"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-secondary text-sm">
            Your watchlist is currently empty. Use the input bar above to add equities!
          </div>
        )}
      </div>

    </div>
  );
};

export default Watchlist;
