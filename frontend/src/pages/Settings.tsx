import React, { useState } from 'react';
import { Settings as SettingsIcon, Key, Globe, Check, Save } from 'lucide-react';

const Settings: React.FC = () => {
  const [defaultCurrency, setDefaultCurrency] = useState<'INR' | 'USD'>('INR');
  const [defaultExchange, setDefaultExchange] = useState<'NSE' | 'NASDAQ'>('NSE');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full pb-12 animate-fade-in">
      
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <SettingsIcon className="text-accent-primary" size={28} />
          Platform Preferences & API Settings
        </h1>
        <p className="text-secondary text-sm mt-1">
          Configure financial data providers, currency conversion parameters, and AI model settings.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-semibold flex items-center gap-2">
          <Check size={18} />
          <span>Platform preferences successfully updated and saved!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        
        {/* Regional & Currency Preferences */}
        <div className="glass-panel p-6 flex flex-col gap-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b pb-3 border-[var(--border-color)]">
            <Globe size={20} className="text-blue-400" />
            Market & Currency Preferences
          </h3>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-2">Default Base Currency</label>
              <select 
                value={defaultCurrency} 
                onChange={(e: any) => setDefaultCurrency(e.target.value)}
                className="input text-sm"
              >
                <option value="INR">🇮🇳 INR - Indian Rupee (₹)</option>
                <option value="USD">🇺🇸 USD - United States Dollar ($)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-2">Primary Stock Exchange</label>
              <select 
                value={defaultExchange} 
                onChange={(e: any) => setDefaultExchange(e.target.value)}
                className="input text-sm"
              >
                <option value="NSE">National Stock Exchange of India (NSE)</option>
                <option value="NASDAQ">NASDAQ Stock Market (USA)</option>
              </select>
            </div>
          </div>
        </div>

        {/* API Credentials */}
        <div className="glass-panel p-6 flex flex-col gap-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b pb-3 border-[var(--border-color)]">
            <Key size={20} className="text-amber-400" />
            Provider API Keys & Services
          </h3>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">Alpha Vantage Market News API Key</label>
              <input type="password" value="••••••••••••••••" readOnly className="input text-xs font-mono" />
              <span className="text-[11px] text-emerald-400 mt-1 block">Active • Ingesting real-time sentiment streams</span>
            </div>

            <div>
              <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">Qdrant Vector Database Host</label>
              <input type="text" value="http://localhost:6333" readOnly className="input text-xs font-mono" />
              <span className="text-[11px] text-blue-400 mt-1 block">Vector RAG retriever active for SEC filings</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary px-6 py-2.5 flex items-center gap-2">
            <Save size={16} />
            <span>Save Preferences</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default Settings;
