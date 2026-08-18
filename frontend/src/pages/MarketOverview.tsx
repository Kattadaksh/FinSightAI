import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Globe, Zap, ShieldCheck } from 'lucide-react';
import { getCompanyOverview } from '../services/api';

interface IndexItem {
  symbol: string;
  name: string;
  value: string;
  change: string;
  changePercent: number;
  region: 'US' | 'GLOBAL';
}

const MARKET_INDICES: IndexItem[] = [
  { symbol: 'GSPC', name: 'S&P 500', value: '5,560.80', change: '+42.10', changePercent: 0.76, region: 'US' },
  { symbol: 'IXIC', name: 'NASDAQ 100', value: '18,640.20', change: '+210.50', changePercent: 1.14, region: 'US' },
  { symbol: 'DJI', name: 'Dow Jones', value: '40,820.50', change: '+180.30', changePercent: 0.44, region: 'US' },
  { symbol: 'RUT', name: 'Russell 2000', value: '2,150.40', change: '+15.20', changePercent: 0.71, region: 'US' },
  { symbol: 'XLK', name: 'S&P Tech Sector', value: '228.60', change: '+3.40', changePercent: 1.51, region: 'US' },
  { symbol: 'XLF', name: 'S&P Financials', value: '42.80', change: '+0.35', changePercent: 0.82, region: 'US' }
];

const TOP_MOVERS = [
  { ticker: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', price: '$225.01', change: '+1.74%', positive: true, sector: 'Semiconductors' },
  { ticker: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', price: '$305.59', change: '+0.79%', positive: true, sector: 'Consumer Electronics' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', price: '$480.35', change: '+1.22%', positive: true, sector: 'Software & Cloud' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', price: '$261.31', change: '+2.19%', positive: true, sector: 'E-Commerce & Cloud' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', price: '$344.00', change: '+1.27%', positive: true, sector: 'Internet & Search' },
  { ticker: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', price: '$568.97', change: '+2.82%', positive: true, sector: 'Social Media & AI' },
  { ticker: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', price: '$339.30', change: '-1.85%', positive: false, sector: 'Automotive' },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE', price: '$360.96', change: '+0.95%', positive: true, sector: 'Banking' }
];

const SECTORS = [
  { name: 'US Semiconductors', growth: '+3.12%', sentiment: 'Bullish', topTicker: 'NVDA' },
  { name: 'Hyperscale Cloud & Tech', growth: '+1.85%', sentiment: 'Bullish', topTicker: 'MSFT' },
  { name: 'Consumer Electronics', growth: '+1.10%', sentiment: 'Bullish', topTicker: 'AAPL' },
  { name: 'E-Commerce & Digital', growth: '+2.15%', sentiment: 'Bullish', topTicker: 'AMZN' },
  { name: 'Banking & Financials', growth: '+0.95%', sentiment: 'Moderate', topTicker: 'JPM' },
  { name: 'Automotive & EVs', growth: '-1.88%', sentiment: 'Moderate', topTicker: 'TSLA' }
];

const MarketOverview: React.FC = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState(TOP_MOVERS);

  useEffect(() => {
    let isMounted = true;
    const fetchLivePrices = async () => {
      const updated = await Promise.all(
        TOP_MOVERS.map(async (stock) => {
          try {
            const data = await getCompanyOverview(stock.ticker);
            if (data && data.price !== undefined) {
              const sym = data.currency_symbol || '$';
              const priceStr = `${sym}${Number(data.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              const chgPct = data.change_percent ?? 0;
              const changeStr = `${chgPct >= 0 ? '+' : ''}${Number(chgPct).toFixed(2)}%`;
              return {
                ...stock,
                price: priceStr,
                change: changeStr,
                positive: chgPct >= 0
              };
            }
          } catch (e) {
            // Keep initial fallback if request fails
          }
          return stock;
        })
      );
      if (isMounted) {
        setStocks(updated);
      }
    };

    fetchLivePrices();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-12 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Globe className="text-accent-primary" size={28} />
            Fortune 500 Market Intelligence
          </h1>
          <p className="text-secondary text-sm mt-1">
            Real-time market tracking across US Fortune 500 equities on NASDAQ and NYSE.
          </p>
        </div>
      </div>

      {/* Indices Ribbon Grid */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {MARKET_INDICES.map(index => (
          <div key={index.symbol} className="glass-panel p-4 flex flex-col justify-between hover:border-blue-500/40 transition-colors">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-secondary">{index.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 font-semibold">
                {index.region}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-white font-mono">{index.value}</span>
              <span className={`text-xs font-bold font-mono ${index.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {index.change} ({index.changePercent}%)
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Active Equities Table & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Active Equities Watch Table */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity size={22} className="text-blue-400" />
                Active Fortune 500 Equities
              </h2>
              <span className="text-xs text-secondary font-mono">Live Feeds</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-xs text-secondary font-mono uppercase">
                    <th className="pb-3">Ticker / Exchange</th>
                    <th className="pb-3">Company Name</th>
                    <th className="pb-3">Sector</th>
                    <th className="pb-3">Market Price</th>
                    <th className="pb-3">24h Change</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map(stock => (
                    <tr key={stock.ticker} className="cursor-pointer hover:bg-[var(--bg-secondary)]/50 transition-colors border-b border-[var(--border-color)]/30" onClick={() => navigate(`/company/${stock.ticker}`)}>
                      <td className="py-3.5 font-mono font-bold text-blue-400">
                        <div className="flex items-center gap-2">
                          <span>{stock.ticker}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-secondary border border-[var(--border-color)]">
                            {stock.exchange}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 font-semibold text-white">{stock.name}</td>
                      <td className="py-3.5 text-secondary text-xs">{stock.sector}</td>
                      <td className="py-3.5 font-mono font-bold tabular-nums text-white">{stock.price}</td>
                      <td className={`py-3.5 font-mono font-bold tabular-nums ${stock.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {stock.change}
                      </td>
                      <td className="py-3.5">
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/company/${stock.ticker}`); }}
                          className="px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-lg border border-blue-500/20 transition-colors"
                        >
                          Inspect AI
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Sector Intelligence */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Zap size={18} className="text-amber-400" />
              Sector Pulse & Heatmap
            </h3>
            
            <div className="flex flex-col gap-3">
              {SECTORS.map(sec => (
                <div key={sec.name} className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex justify-between items-center hover:border-blue-500/30 transition-colors">
                  <div>
                    <div className="font-bold text-sm text-white mb-0.5">{sec.name}</div>
                    <div className="text-xs text-secondary flex items-center gap-2">
                      <span>Top: <strong className="text-blue-400 font-mono">{sec.topTicker}</strong></span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">{sec.sentiment}</span>
                    </div>
                  </div>
                  <span className={`font-mono font-bold text-sm px-2.5 py-1 rounded-lg border ${sec.growth.startsWith('+') ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                    {sec.growth}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-400" />
              Fortune 500 Coverage Notice
            </h3>
            <p className="text-xs text-secondary leading-relaxed">
              Real-time financial disclosures and filings are retrieved via SEC EDGAR and market feeds. Use standard US tickers like <code className="text-blue-400 font-mono">NVDA</code>, <code className="text-blue-400 font-mono">AAPL</code>, or <code className="text-blue-400 font-mono">MSFT</code> for instant AI analyst retrieval.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MarketOverview;
