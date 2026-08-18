import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import CompanyOverview from '../components/company/CompanyOverview';
import CompanySearch from '../components/search/CompanySearch';
import { ChevronLeft, Newspaper, ExternalLink, Bot, CheckCircle2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { getCompanyOverview, getCompanyNews } from '../services/api';

const CompanyProfile: React.FC = () => {
  const { ticker } = useParams<{ ticker: string }>();
  const [queryInput, setQueryInput] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [researchResult, setResearchResult] = useState<any>(null);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [showRollbackConfirm, setShowRollbackConfirm] = useState<string | null>(null);

  if (!ticker) return <div>Invalid Ticker</div>;

  const { data: overviewData, isError: overviewError, isLoading: overviewLoading } = useQuery({
    queryKey: ['company-overview', ticker],
    queryFn: () => getCompanyOverview(ticker),
    retry: false
  });

  const { data: newsData, isLoading: newsLoading } = useQuery({
    queryKey: ['news', ticker],
    queryFn: () => getCompanyNews(ticker),
    enabled: !overviewError && !!overviewData
  });

  const handleResearch = async (queryText?: string) => {
    const activeQuery = queryText || queryInput || `Generate comprehensive financial report for ${ticker}`;
    setIsResearching(true);
    setResearchError(null);
    setResearchResult({
      ticker: ticker.toUpperCase(),
      query: activeQuery,
      execution_steps: ["Starting LangGraph research pipeline..."],
      verification_status: "INITIALIZING",
      report_markdown: ""
    });

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/analyst/research/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ticker, query: activeQuery })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let partialChunk = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = (partialChunk + chunk).split('\n');
        partialChunk = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const rawData = JSON.parse(trimmed.slice(6));
              if (rawData.event === 'step') {
                setResearchResult((prev: any) => {
                  const currentSteps = prev?.execution_steps || [];
                  return {
                    ...prev,
                    execution_steps: [...currentSteps, rawData.step]
                  };
                });
              } else if (rawData.event === 'result') {
                setResearchResult((prev: any) => ({
                  ...rawData.data,
                  thread_id: rawData.data?.thread_id || prev?.thread_id
                }));
              } else if (rawData.event === 'error') {
                setResearchError(rawData.detail || 'Streaming research failed.');
              }
            } catch (e) {
              console.error('Failed to parse SSE line:', e);
            }
          }
        }
      }
    } catch (err: any) {
      setResearchError(err.message || 'Research execution failed.');
    } finally {
      setIsResearching(false);
    }
  };

  const handleResume = async (approve: boolean) => {
    const activeThreadId = researchResult?.thread_id || `thread_${ticker ? ticker.toLowerCase() : 'tsla'}_default`;
    setIsResearching(true);
    setResearchError(null);
    
    // Add temporary log to trajectory indicating response is resuming
    setResearchResult((prev: any) => {
      const currentSteps = prev?.execution_steps || [];
      return {
        ...prev,
        execution_steps: [...currentSteps, approve ? "Resuming with human analyst approval..." : `Resuming with revision request: "${feedbackInput}"`]
      };
    });

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/analyst/research/resume/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          thread_id: activeThreadId,
          approve,
          feedback: feedbackInput
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let partialChunk = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = (partialChunk + chunk).split('\n');
        partialChunk = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const rawData = JSON.parse(trimmed.slice(6));
              if (rawData.event === 'step') {
                setResearchResult((prev: any) => {
                  const currentSteps = prev?.execution_steps || [];
                  return {
                    ...prev,
                    execution_steps: [...currentSteps, rawData.step]
                  };
                });
              } else if (rawData.event === 'result') {
                setResearchResult({
                  ...rawData.data,
                  thread_id: rawData.data?.thread_id || activeThreadId
                });
              } else if (rawData.event === 'error') {
                setResearchError(rawData.detail || 'Streaming resume failed.');
              }
            } catch (e) {
              console.error('Failed to parse SSE line:', e);
            }
          }
        }
      }
      setFeedbackInput('');
    } catch (err: any) {
      setResearchError(err.message || 'Resuming research failed.');
    } finally {
      setIsResearching(false);
    }
  };

  const fetchCheckpoints = async (threadId: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/analyst/research/${threadId}/checkpoints`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setCheckpoints(data);
      }
    } catch (e) {
      console.error('Failed to fetch checkpoints:', e);
    }
  };

  const handleRollback = async (checkpointId: string) => {
    if (!researchResult || !researchResult.thread_id) return;
    setIsResearching(true);
    setResearchError(null);
    setShowRollbackConfirm(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/analyst/research/${researchResult.thread_id}/rollback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ checkpoint_id: checkpointId })
      });
      if (!response.ok) {
        throw new Error(`Rollback failed with status: ${response.status}`);
      }
      const data = await response.json();
      setResearchResult(data);
    } catch (err: any) {
      setResearchError(err.message || 'Rollback execution failed.');
    } finally {
      setIsResearching(false);
    }
  };

  useEffect(() => {
    if (researchResult?.thread_id) {
      fetchCheckpoints(researchResult.thread_id);
    } else {
      setCheckpoints([]);
    }
  }, [researchResult?.thread_id, researchResult?.verification_status]);


  if (overviewError || (!overviewLoading && !overviewData)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-3xl mx-auto text-center px-4 py-8 animate-fade-in">
        <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-6 shadow-xl">
          <AlertCircle size={48} />
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">
          Company Ticker <span className="text-amber-400 font-mono">"{ticker.toUpperCase()}"</span> Not Found
        </h2>
        <p className="text-slate-400 text-sm md:text-base max-w-xl mb-8 leading-relaxed">
          We could not find any active equity listings or regulatory disclosures for <strong>"{ticker.toUpperCase()}"</strong> on US Fortune 500 (NASDAQ/NYSE) stock exchanges.
        </p>

        {/* Search Input Box */}
        <div className="w-full max-w-lg mb-8">
          <CompanySearch />
        </div>

        {/* Featured Traded Equities Grid */}
        <div className="glass-panel p-6 w-full border border-slate-800 rounded-2xl bg-slate-900/60 shadow-lg">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Try searching for featured Fortune 500 equities:
          </p>
          <div className="flex flex-wrap gap-2.5 justify-center">
            <Link to="/company/NVDA" className="quick-tag">🟢 NVIDIA (NVDA)</Link>
            <Link to="/company/AAPL" className="quick-tag">🍏 Apple (AAPL)</Link>
            <Link to="/company/MSFT" className="quick-tag">💻 Microsoft (MSFT)</Link>
            <Link to="/company/AMZN" className="quick-tag">📦 Amazon (AMZN)</Link>
            <Link to="/company/GOOGL" className="quick-tag">🔍 Alphabet (GOOGL)</Link>
            <Link to="/company/META" className="quick-tag">♾️ Meta (META)</Link>
            <Link to="/company/TSLA" className="quick-tag">⚡ Tesla (TSLA)</Link>
          </div>
        </div>

        <Link to="/" className="mt-8 text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors">
          <ChevronLeft size={16} /> Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      <Link to="/" className="flex items-center gap-2 text-secondary hover:text-white w-fit transition-colors">
        <ChevronLeft size={20} />
        <span>Back to Dashboard</span>
      </Link>

      <CompanyOverview ticker={ticker} />

      <div className="flex flex-col gap-6 mt-4">
        
        {/* Main Content Area */}
        <div className="flex flex-col gap-6">
          
          {/* LangGraph Ask AI Analyst Box */}
          <div className="glass-panel p-6">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Bot size={22} className="text-accent-primary" />
                  Ask LangGraph AI Analyst
                </h3>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-semibold">
                  <Sparkles size={12} /> SEC Grounded Multi-Agent
                </span>
             </div>
             
             <div className="mb-5 flex flex-col md:flex-row md:items-center gap-3">
               <span className="text-secondary text-xs font-medium uppercase tracking-wider">Quick actions:</span>
               <div className="flex gap-2 flex-wrap">
                 <button 
                   onClick={() => handleResearch(`Generate comprehensive SEC research report for ${ticker}`)}
                   className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-full text-xs cursor-pointer hover:bg-blue-500/20 transition-colors border border-blue-500/20 flex items-center gap-1.5 font-medium">
                   <span>📊</span> Full SEC & News Report
                 </button>
                 <button 
                   onClick={() => handleResearch(`Analyze cash flow and solvency metrics for ${ticker}`)}
                   className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs cursor-pointer hover:bg-emerald-500/20 transition-colors border border-emerald-500/20 flex items-center gap-1.5 font-medium">
                   <span>💰</span> Solvency & Cash Flow
                 </button>
                 <button 
                   onClick={() => handleResearch(`Identify main risk factors and competitive threats for ${ticker}`)}
                   className="px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-full text-xs cursor-pointer hover:bg-amber-500/20 transition-colors border border-amber-500/20 flex items-center gap-1.5 font-medium">
                   <span>⚠️</span> Risk & Catalyst Analysis
                 </button>
               </div>
             </div>

             <form onSubmit={(e) => { e.preventDefault(); handleResearch(); }} className="flex items-center gap-2">
               <input 
                 type="text" 
                 value={queryInput}
                 onChange={(e) => setQueryInput(e.target.value)}
                 className="input flex-1" 
                 placeholder={`Ask a question about ${ticker} financial metrics, filings, or news...`} 
                 disabled={isResearching}
               />
               <button type="submit" disabled={isResearching} className="btn btn-primary flex items-center gap-2">
                 {isResearching ? (
                   <>
                     <Loader2 size={16} className="animate-spin" />
                     <span>Analyzing...</span>
                   </>
                 ) : (
                   <>
                     <Bot size={16} />
                     <span>Research</span>
                   </>
                 )}
               </button>
             </form>

             {/* Research Error Message */}
             {researchError && (
               <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                 {researchError}
               </div>
             )}

             {/* Loading State Skeleton */}
             {isResearching && !researchResult && (
               <div className="mt-6 p-6 rounded-xl border border-[var(--border-color)] flex flex-col gap-5 bg-[var(--bg-primary)] animate-pulse">
                 <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
                   <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                     <Loader2 size={20} className="text-blue-400 animate-spin" />
                   </div>
                   <div>
                     <div className="h-4 w-48 bg-blue-500/10 rounded mb-2"></div>
                     <div className="h-3 w-32 bg-[var(--border-color)] rounded"></div>
                   </div>
                 </div>
                 <div className="flex flex-col gap-3 mt-2">
                   <div className="h-3 w-full bg-[var(--border-color)] rounded"></div>
                   <div className="h-3 w-5/6 bg-[var(--border-color)] rounded"></div>
                   <div className="h-3 w-4/6 bg-[var(--border-color)] rounded"></div>
                 </div>
               </div>
             )}

             {/* Research Output Panel */}
             {researchResult && !isResearching && (
               <div className="mt-6 p-6 rounded-xl border border-blue-500/20 flex flex-col gap-5 animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)' }}>
                 
                 {/* Verification & Metadata Header */}
                 <div className="flex flex-wrap items-center justify-between border-b pb-4 border-[var(--border-color)]">
                   <div className="flex items-center gap-2">
                     <CheckCircle2 size={18} className="text-emerald-400" />
                     <span className="font-bold text-sm text-emerald-400">
                       Status: {researchResult.verification_status}
                     </span>
                     <span className="text-xs text-secondary ml-2">
                       (SEC Filings: {researchResult.sec_filings_count} | News: {researchResult.news_articles_count})
                     </span>
                   </div>
                 </div>

                 {/* Human-in-the-Loop Review Controls */}
                 {researchResult.verification_status === "PENDING_HUMAN_REVIEW" && (
                   <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-500/5 flex flex-col gap-4 mb-4">
                     <div>
                       <h4 className="text-sm font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                         <Bot size={16} /> Human-in-the-Loop Approval Pending
                       </h4>
                       <p className="text-xs text-secondary leading-relaxed">
                         A draft report has been synthesized. Review the content below, then choose to Approve and Finalize, or submit revision feedback to the Fact Checker Agent.
                       </p>
                     </div>
                     <div className="flex flex-col gap-2">
                       <textarea
                         value={feedbackInput}
                         onChange={(e) => setFeedbackInput(e.target.value)}
                         placeholder="Provide optional feedback/revisions for the agent here..."
                         className="input text-xs h-20 w-full resize-none bg-slate-950 border-slate-800 text-slate-200"
                       />
                       <div className="flex gap-2 justify-end">
                         <button
                           type="button"
                           onClick={() => handleResume(false)}
                           className="btn btn-secondary text-xs px-3.5 py-1.5 flex items-center gap-1 cursor-pointer"
                         >
                           Request Revisions
                         </button>
                         <button
                           type="button"
                           onClick={() => handleResume(true)}
                           className="btn btn-primary text-xs px-4 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 flex items-center gap-1 font-bold cursor-pointer"
                         >
                           <CheckCircle2 size={13} /> Approve & Finalize
                         </button>
                       </div>
                     </div>
                   </div>
                 )}

                  {/* Version History / Checkpoint Rollbacks */}
                  {researchResult && researchResult.thread_id && checkpoints.length > 0 && (
                    <div className="p-5 rounded-xl border border-blue-500/20 bg-[rgba(255,255,255,0.01)] flex flex-col gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-blue-400 flex items-center gap-1.5 mb-1">
                          <Sparkles size={16} /> Research Version History
                        </h4>
                        <p className="text-xs text-secondary leading-relaxed">
                          Revert the agent's state to any prior checkpoint in this session. Reverting will load the state snapshot of that step. Checkpoints are preserved in history.
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                        {checkpoints.map((cp: any) => (
                          <div 
                            key={cp.checkpoint_id} 
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-900 gap-2 hover:border-slate-800 transition-colors"
                          >
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-white">{cp.label}</span>
                              <span className="text-[10px] text-secondary font-mono">
                                {new Date(cp.timestamp).toLocaleString()} • ID: {cp.checkpoint_id.slice(0, 8)}
                              </span>
                            </div>
                            
                            <div>
                              {showRollbackConfirm === cp.checkpoint_id ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleRollback(cp.checkpoint_id)}
                                    className="btn btn-primary bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 text-[10px] px-2 py-1 font-bold cursor-pointer"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setShowRollbackConfirm(null)}
                                    className="btn btn-secondary text-[10px] px-2 py-1 cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setShowRollbackConfirm(cp.checkpoint_id)}
                                  disabled={researchResult.restored_from_checkpoint === cp.checkpoint_id || (cp.checkpoint_id === checkpoints[0]?.checkpoint_id && !researchResult.restored_from_checkpoint)}
                                  className="btn btn-ghost border border-slate-800 text-secondary hover:text-white disabled:opacity-30 text-[10px] px-2.5 py-1 cursor-pointer"
                                >
                                  Revert to this version
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                 {/* Execution Workflow Steps */}
                 {researchResult.execution_steps?.length > 0 && (
                   <div className="rounded-xl bg-[#0a0a0a] border border-[var(--border-color)] overflow-hidden shadow-inner mb-6">
                     <div className="flex items-center gap-2 px-4 py-2 bg-[rgba(255,255,255,0.02)] border-b border-[var(--border-color)]">
                       <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                       <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                       <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                       <p className="text-[10px] font-semibold text-secondary ml-2 uppercase tracking-widest font-mono">LangGraph Trajectory</p>
                     </div>
                     <div className="p-4 flex flex-col gap-1.5 overflow-x-auto">
                       {researchResult.execution_steps.map((step: string, idx: number) => (
                         <div key={idx} className="text-[11px] font-mono text-blue-300 leading-relaxed whitespace-nowrap">
                           {step}
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                 {/* Synthesized Markdown Output */}
                 <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] p-6 md:p-8 markdown-body text-sm leading-relaxed">
                   <ReactMarkdown>
                     {researchResult.report_markdown}
                   </ReactMarkdown>
                 </div>

                 {/* Verified Citation Sources */}
                 {researchResult.sources?.length > 0 && (
                   <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                     <p className="text-xs font-bold text-secondary mb-3 uppercase tracking-wider">Verified Data Sources & Citations</p>
                     <div className="flex flex-wrap gap-2">
                       {researchResult.sources.map((src: any, i: number) => (
                         <a 
                           key={i} 
                           href={src.url} 
                           target="_blank" 
                           rel="noreferrer"
                           className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-[var(--bg-secondary)] hover:bg-blue-500/20 text-blue-400 border border-[var(--border-color)] transition-colors"
                         >
                           <span>{src.title}</span>
                           <ExternalLink size={11} />
                         </a>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
             )}
          </div>
          
          {/* Catalyst News Stream */}
          <div className="glass-panel p-6">
             <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
               <Newspaper size={20} className="text-accent-primary" />
               Recent Catalyst News
             </h3>
             <div className="flex flex-col gap-4">
                {newsLoading && <div className="text-secondary animate-pulse text-sm">Loading news via Alpha Vantage...</div>}
                
                {newsData?.error && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded text-sm mb-2">
                    {newsData.message}
                  </div>
                )}
                
                {newsData?.news?.slice(0, 5).map((article: any) => (
                  <div key={article.article_id} className="flex gap-4 p-4 rounded-lg transition-colors" style={{ backgroundColor: 'var(--bg-primary)' }}>
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-secondary">{new Date(article.published_at).toLocaleDateString()} • {article.source_name}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          article.provider_sentiment === 'Somewhat-Bullish' || article.provider_sentiment === 'Bullish' ? 'bg-emerald-500/10 text-emerald-400' :
                          article.provider_sentiment === 'Somewhat-Bearish' || article.provider_sentiment === 'Bearish' ? 'bg-red-500/10 text-red-400' :
                          'bg-gray-500/10 text-gray-400'
                        }`}>
                          {article.provider_sentiment.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm mb-2 hover:text-blue-400 transition-colors">
                        <a href={article.source_url} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                           {article.headline} <ExternalLink size={12} />
                        </a>
                      </h4>
                      <p className="text-xs text-secondary line-clamp-2">{article.summary}</p>
                    </div>
                  </div>
                ))}
                
                {!newsLoading && (!newsData?.news || newsData.news.length === 0) && (
                   <div className="text-sm text-secondary p-4 text-center">No recent news found for {ticker}.</div>
                )}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CompanyProfile;
