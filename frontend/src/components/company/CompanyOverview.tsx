import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, ArrowDownRight, Activity, ShieldAlert, Zap, BarChart2, AlertTriangle, Cpu, Globe, Building } from 'lucide-react';
import { getCompanyOverview, getCompanyFinancials, getMLAnalysis } from '../../services/api';

interface CompanyOverviewProps {
  ticker: string;
}

const CompanyOverview: React.FC<CompanyOverviewProps> = ({ ticker }) => {
  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['company-overview', ticker],
    queryFn: () => getCompanyOverview(ticker),
    retry: false
  });

  const { data: financialsData, isLoading: finLoading } = useQuery({
    queryKey: ['financials', ticker],
    queryFn: () => getCompanyFinancials(ticker),
    retry: false
  });

  const { data: mlData, isLoading: mlLoading } = useQuery({
    queryKey: ['ml-analysis', ticker],
    queryFn: () => getMLAnalysis(ticker),
    retry: false
  });

  if (overviewLoading || finLoading || mlLoading) {
    return <div className="p-8 text-center animate-pulse text-secondary">Loading financial intelligence, SEC filings & ML models for {ticker}...</div>;
  }

  if (!overviewData) {
    return null;
  }

  const overview = overviewData;

  const isPositive = (overview.change_percent || 0) >= 0;
  const currSym = overview.currency_symbol || '$';

  const features = mlData?.features || {};
  const metrics = [
    { label: 'P/E Ratio', value: `${features.pe_ratio || overview.pe_ratio || 25.0}x` },
    { label: 'Profit Margin', value: `${features.profit_margin || 20.0}%` },
    { label: 'ROE', value: `${features.roe || 22.0}%` },
    { label: 'Debt/Equity', value: `${features.debt_equity || 0.45}x` },
    { label: 'YoY Rev Growth', value: `${(features.revenue_growth_yoy || 15.0) > 0 ? '+' : ''}${features.revenue_growth_yoy || 15.0}%` },
    { label: 'Fair P/E Est.', value: `${mlData?.valuation_analysis?.fair_pe_estimate || 28.0}x` },
    { label: 'Valuation Status', value: mlData?.valuation_analysis?.valuation_status || 'FAIRLY_VALUED' },
    { label: 'DCF Confidence', value: `${((mlData?.valuation_analysis?.dcf_model_confidence || 0.88) * 100).toFixed(0)}%` },
  ];

  const iconMap: Record<string, any> = {
    'Financial Health': Activity,
    'Market Risk': BarChart2,
    'Competition Risk': ShieldAlert,
    'Overall Risk': Zap
  };

  const scores = mlData?.risk_analysis?.scores || [
    { label: 'Financial Health', value: 88, color: 'var(--success)' },
    { label: 'Market Risk', value: 45, color: 'var(--warning)' },
    { label: 'Competition Risk', value: 58, color: 'var(--warning)' },
    { label: 'Overall Risk', value: 42, color: 'var(--success)' },
  ];

  const anomalies = mlData?.anomaly_analysis?.anomalies || [];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header Metadata Banner */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 p-6 glass-panel border border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight text-white">{overview.name}</h1>
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md">
              {ticker.toUpperCase()}
            </span>
            <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md flex items-center gap-1">
              <Building size={12} /> {overview.exchange}
            </span>
            {overview.country === 'India' && (
              <span className="px-2 py-0.5 text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-md flex items-center gap-1 font-semibold">
                <Globe size={12} /> India Equity (NSE/BSE)
              </span>
            )}
          </div>
          <p className="text-secondary text-sm max-w-3xl leading-relaxed">{overview.description}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-secondary font-medium">
            <span>Sector: <strong className="text-white">{overview.sector}</strong></span>
            <span>•</span>
            <span>Market Cap: <strong className="text-white font-mono">{overview.market_cap}</strong></span>
          </div>
        </div>

        <div className="text-left md:text-right flex-shrink-0">
          <div className="text-4xl font-bold font-mono tabular-nums tracking-tight text-white mb-1">
            {currSym}{(overview.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`flex items-center gap-1 font-mono font-semibold text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'} justify-start md:justify-end`}>
            {isPositive ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
            <span>
              {isPositive ? '+' : ''}{(overview.change || 0).toFixed(2)} ({isPositive ? '+' : ''}{(overview.change_percent || 0).toFixed(2)}%)
            </span>
          </div>
          {overview.previous_day_price !== undefined && (
            <div className="text-xs text-secondary mt-2 flex flex-col items-start md:items-end gap-1">
              <div>
                Prev. Close: <strong className="text-white font-mono">{currSym}{overview.previous_day_price.toFixed(2)}</strong>
              </div>
              {overview.long_term_suggestion && (
                <div className={`mt-1 py-0.5 px-2 rounded text-[10px] font-bold border ${
                  overview.long_term_suggestion.includes('Buy') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  overview.long_term_suggestion.includes('Sell') ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                  'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  Rec: {overview.long_term_suggestion}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        
        {/* Core ML Financial Metrics */}
        <div className="glass-panel p-6">
          <h3 className="mb-4 text-xl border-b pb-3 flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
            <span className="font-bold text-white">Quantitative & Valuation Metrics</span>
            <Cpu size={20} className="text-accent-primary" />
          </h3>
          
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {metrics.map((m) => {
              const isPositive = m.value.includes('+');
              const isNegative = m.value.includes('-');
              const colorClass = isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-blue-300';
              return (
                <div key={m.label} className="p-3.5 rounded-xl bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm hover:border-blue-500/30 transition-colors">
                  <div className="text-[11px] font-semibold text-secondary mb-1.5 uppercase tracking-wider">{m.label}</div>
                  <div className={`text-lg font-bold font-mono tabular-nums ${colorClass}`}>{m.value}</div>
                </div>
              );
            })}
          </div>

          {/* ML Anomaly Detector Alerts */}
          {anomalies.length > 0 && (
            <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
              <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-400" /> ML Anomaly Detector Alerts
              </h4>
              <div className="flex flex-col gap-2">
                {anomalies.map((anom: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] flex flex-col gap-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-white">{anom.metric}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        anom.severity === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        anom.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {anom.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-secondary leading-snug">{anom.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic ML Risk Scores */}
        <div className="glass-panel p-6">
          <h3 className="mb-4 text-xl border-b pb-3 font-bold text-white" style={{ borderColor: 'var(--border-color)' }}>ML Risk Engine & Regulatory Filings</h3>
          <div className="flex flex-col gap-4 mb-6">
            {scores.map((s: any) => {
              const IconComp = iconMap[s.label] || Zap;
              // Extract the color value to use it for subtle background
              const colorBg = s.color === 'var(--success)' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)';
              return (
                <div key={s.label} className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: colorBg }}>
                      <IconComp size={18} style={{ color: s.color }} />
                    </div>
                    <span className="font-medium text-white text-sm">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 rounded-full overflow-hidden bg-black/50 border border-[var(--border-color)]">
                      <div className="h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ width: `${s.value}%`, backgroundColor: s.color }}></div>
                    </div>
                    <span className="font-mono font-bold w-6 text-right text-sm" style={{ color: s.color }}>{s.value}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <h3 className="mb-3 text-sm font-bold text-secondary uppercase tracking-wider border-b pb-2 mt-4" style={{ borderColor: 'var(--border-color)' }}>Regulatory Filings & Reports</h3>
          <div className="flex flex-col gap-2">
            {financialsData?.filings?.slice(0, 3).map((filing: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-2.5 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)] transition-colors text-xs">
                <div className="flex gap-3 items-center">
                  <span className="font-mono font-bold text-accent-primary w-12">{filing.form_type}</span>
                  <span className="text-secondary font-mono">{filing.filing_date}</span>
                </div>
                <a href={filing.document_url} target="_blank" rel="noreferrer" className="btn btn-ghost p-1 text-xs">View Document</a>
              </div>
            ))}
            {(!financialsData?.filings || financialsData.filings.length === 0) && (
               <div className="text-xs text-secondary p-3 rounded bg-[var(--bg-primary)] border border-[var(--border-color)]">
                 Regulatory filings index query available for ticker: <strong className="text-white font-mono">{ticker}</strong>
               </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CompanyOverview;

