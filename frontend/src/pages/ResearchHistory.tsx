import React from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Bot, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

interface HistoryItem {
  id: string;
  ticker: string;
  query: string;
  date: string;
  status: string;
  filingsCount: number;
  newsCount: number;
}

const SAMPLE_RESEARCH_HISTORY: HistoryItem[] = [
  { id: '1', ticker: 'RELIANCE', query: 'Generate comprehensive financial report for RELIANCE', date: '2026-08-11 10:45', status: 'VERIFIED_SEC_EDGAR', filingsCount: 4, newsCount: 10 },
  { id: '2', ticker: 'TCS', query: 'Analyze IT services cloud margin trends and client retention for TCS', date: '2026-08-11 09:30', status: 'VERIFIED_SEC_EDGAR', filingsCount: 3, newsCount: 8 },
  { id: '3', ticker: 'NVDA', query: 'Inspect Q1 2026 GPU revenue breakdown and gross margin expansion', date: '2026-08-10 16:15', status: 'VERIFIED_SEC_EDGAR', filingsCount: 5, newsCount: 12 },
  { id: '4', ticker: 'INFY', query: 'Analyze cash flow and solvency metrics for INFY', date: '2026-08-10 14:00', status: 'VERIFIED_SEC_EDGAR', filingsCount: 4, newsCount: 7 },
  { id: '5', ticker: 'HDFCBANK', query: 'Evaluate deposit growth and net interest margin (NIM) for HDFCBANK', date: '2026-08-09 11:20', status: 'VERIFIED_SEC_EDGAR', filingsCount: 3, newsCount: 9 }
];

const ResearchHistory: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-12 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <History className="text-accent-primary" size={28} />
          AI Analyst Research History
        </h1>
        <p className="text-secondary text-sm mt-1">
          Audit trail of past LangGraph multi-agent financial research sessions and SEC-grounded reports.
        </p>
      </div>

      {/* History Data Table */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Bot size={20} className="text-blue-400" />
            Execution Sessions Log
          </h3>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
            <Sparkles size={12} /> SEC EDGAR Grounded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="fin-table">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Research Query</th>
                <th>Execution Timestamp</th>
                <th>Verification Status</th>
                <th>Sources Pulled</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_RESEARCH_HISTORY.map((item) => (
                <tr key={item.id} className="cursor-pointer" onClick={() => navigate(`/company/${item.ticker}`)}>
                  <td className="font-mono font-bold text-blue-400">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.ticker}</span>
                    </div>
                  </td>
                  <td className="font-medium text-white max-w-xs truncate">{item.query}</td>
                  <td className="text-secondary text-xs font-mono">{item.date}</td>
                  <td>
                    <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                      <CheckCircle2 size={12} /> VERIFIED
                    </span>
                  </td>
                  <td className="text-xs text-secondary font-mono">
                    {item.filingsCount} Filings • {item.newsCount} News
                  </td>
                  <td>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/company/${item.ticker}`); }}
                      className="px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-lg border border-blue-500/20 transition-colors flex items-center gap-1"
                    >
                      <span>View Report</span>
                      <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ResearchHistory;
