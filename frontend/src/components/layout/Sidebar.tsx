import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LineChart, History, Star, Settings, Cpu, Globe } from 'lucide-react';

const getItemStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.85rem 1.25rem',
  borderRadius: 'var(--radius-lg)',
  color: isActive ? '#fff' : 'var(--text-secondary)',
  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
  boxShadow: isActive ? 'inset 2px 0 0 0 #3b82f6' : 'none',
  fontWeight: isActive ? '600' : '500',
  textDecoration: 'none',
  fontSize: '0.9rem',
  transition: 'all var(--transition-fast)',
  marginBottom: '0.25rem'
});

const Sidebar: React.FC = () => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: LineChart, label: 'Market Overview', path: '/market', badge: 'Live' },
    { icon: Star, label: 'Watchlist', path: '/watchlist', badge: 'NSE/US' },
    { icon: History, label: 'Research History', path: '/history' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="flex flex-col h-full p-4" style={{ width: '260px', borderRight: 'var(--glass-border)', backgroundColor: 'var(--bg-secondary)' }}>
      {/* Brand Header */}
      <div className="flex items-center gap-3.5 mb-8 mt-4 px-4">
        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)', flexShrink: 0 }}>
          <Cpu size={22} />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[22px] font-black tracking-tight text-white leading-none mb-1.5" style={{ textShadow: '0 2px 10px rgba(255,255,255,0.1)' }}>FinSight<span className="text-blue-400">.ai</span></span>
          <span className="text-[10px] text-blue-300 font-bold tracking-[0.2em] uppercase flex items-center gap-1.5 opacity-90">
            <Globe size={11} /> Multi-Market
          </span>
        </div>
      </div>

      <nav className="flex flex-col gap-1.5 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => getItemStyle(isActive)}
          >
            <div className="flex items-center gap-3">
              <item.icon size={18} style={{ color: 'inherit' }} />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      
      <div className="mt-auto system-status">
        <p className="text-[11px] font-semibold text-secondary uppercase tracking-wider m-0">System</p>
        <div className="flex items-center gap-2">
          <div className="status-indicator"></div>
          <span className="text-[11px] font-mono font-bold text-emerald-400">AI Active</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
