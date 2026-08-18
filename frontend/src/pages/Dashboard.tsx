import React from 'react';
import { useNavigate } from 'react-router-dom';
import CompanySearch from '../components/search/CompanySearch';
import { TrendingUp, Activity, AlertCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto w-full animate-fade-in pt-6 pb-12">
      {/* Hero Header */}
      <div className="text-center relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-40 bg-gradient-to-r from-blue-600/15 via-indigo-600/20 to-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-4 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          <span>Autonomous Multi-Market Agentic Engine</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-white leading-tight">
          Autonomous Financial <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">Intelligence</span>
        </h1>
        <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Ask complex questions, analyze real-time market data, run ML anomaly risk models, and generate evidence-backed research instantly.
        </p>
      </div>

      {/* Main Search Hero Card */}
      <div className="glass-panel p-8 md:p-10 flex flex-col items-center justify-center text-center relative overflow-visible border border-slate-700/60 bg-gradient-to-b from-[#0e1628]/90 via-[#0d1424]/90 to-[#0a0f1d]/90 shadow-2xl rounded-3xl">
        <h3 className="text-xl md:text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span>What would you like to research today?</span>
        </h3>
        
        <div className="w-full max-w-2xl relative my-2">
           <CompanySearch />
        </div>
        
        <div className="flex gap-2.5 mt-8 flex-wrap justify-center max-w-4xl">
          <button onClick={() => navigate('/company/NVDA')} className="quick-tag hover:-translate-y-0.5 transition-transform bg-blue-500/10 border-blue-500/30">
            <span>🟢</span> <span className="font-semibold text-slate-200">NVIDIA</span> <span className="text-xs text-blue-400 font-mono">(NVDA)</span>
          </button>
          <button onClick={() => navigate('/company/AAPL')} className="quick-tag hover:-translate-y-0.5 transition-transform">
            <span>🍏</span> <span className="font-semibold text-slate-200">Apple</span> <span className="text-xs text-blue-400 font-mono">(AAPL)</span>
          </button>
          <button onClick={() => navigate('/company/MSFT')} className="quick-tag hover:-translate-y-0.5 transition-transform">
            <span>💻</span> <span className="font-semibold text-slate-200">Microsoft</span> <span className="text-xs text-blue-400 font-mono">(MSFT)</span>
          </button>
          <button onClick={() => navigate('/company/AMZN')} className="quick-tag hover:-translate-y-0.5 transition-transform">
            <span>📦</span> <span className="font-semibold text-slate-200">Amazon</span> <span className="text-xs text-blue-400 font-mono">(AMZN)</span>
          </button>
          <button onClick={() => navigate('/company/GOOGL')} className="quick-tag hover:-translate-y-0.5 transition-transform">
            <span>🔍</span> <span className="font-semibold text-slate-200">Alphabet</span> <span className="text-xs text-blue-400 font-mono">(GOOGL)</span>
          </button>
          <button onClick={() => navigate('/company/META')} className="quick-tag hover:-translate-y-0.5 transition-transform">
            <span>♾️</span> <span className="font-semibold text-slate-200">Meta</span> <span className="text-xs text-blue-400 font-mono">(META)</span>
          </button>
          <button onClick={() => navigate('/company/TSLA')} className="quick-tag hover:-translate-y-0.5 transition-transform">
            <span>⚡</span> <span className="font-semibold text-slate-200">Tesla</span> <span className="text-xs text-blue-400 font-mono">(TSLA)</span>
          </button>
          <button onClick={() => navigate('/company/JPM')} className="quick-tag hover:-translate-y-0.5 transition-transform">
            <span>🏦</span> <span className="font-semibold text-slate-200">JPMorgan</span> <span className="text-xs text-blue-400 font-mono">(JPM)</span>
          </button>
        </div>
      </div>

      {/* Feature Navigation Grid */}
      <div className="grid gap-6 mt-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <div 
          onClick={() => navigate('/market')}
          className="glass-panel p-6 flex items-start gap-4 hover:border-blue-500/50 hover:bg-slate-800/40 transition-all cursor-pointer rounded-2xl group border border-slate-800"
        >
           <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
             <TrendingUp size={22} />
           </div>
           <div>
             <h4 className="font-bold mb-1 text-white text-base group-hover:text-blue-300 transition-colors">Market Overview</h4>
             <p className="text-xs text-slate-400 leading-relaxed">S&P 500, NASDAQ 100, Dow Jones, sector momentum & live exchange feeds.</p>
           </div>
        </div>
        
        <div 
          onClick={() => navigate('/watchlist')}
          className="glass-panel p-6 flex items-start gap-4 hover:border-emerald-500/50 hover:bg-slate-800/40 transition-all cursor-pointer rounded-2xl group border border-slate-800"
        >
           <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
             <Activity size={22} />
           </div>
           <div>
             <h4 className="font-bold mb-1 text-white text-base group-hover:text-emerald-300 transition-colors">Portfolio Watchlist</h4>
             <p className="text-xs text-slate-400 leading-relaxed">Track US Fortune 500 stocks with quantitative Z-score & ML risk ratings.</p>
           </div>
        </div>
        
        <div 
          onClick={() => navigate('/company/NVDA')}
          className="glass-panel p-6 flex items-start gap-4 hover:border-amber-500/50 hover:bg-slate-800/40 transition-all cursor-pointer rounded-2xl group border border-slate-800"
        >
           <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
             <AlertCircle size={22} />
           </div>
           <div>
             <h4 className="font-bold mb-1 text-white text-base group-hover:text-amber-300 transition-colors">SEC & Regulatory RAG</h4>
             <p className="text-xs text-slate-400 leading-relaxed">RAG vector store search over 10-K, 10-Q & regulatory disclosures.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
