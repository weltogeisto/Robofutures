import React from 'react';
import { Activity, Layers, Map, TrendingUp } from 'lucide-react';

const NAV = [
  { id: 'overview', icon: Activity, label: 'Overview' },
  { id: 'thesis', icon: Layers, label: 'Thesis' },
  { id: 'valuechain', icon: Map, label: 'Value Chain' },
  { id: 'signals', icon: TrendingUp, label: 'Signals' },
];

export default function Sidebar({ tab, onTab, alertCount }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Bot size={20} />
        <span>Robofutures</span>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Navigation</div>
          {NAV.map(item => (
            <button
              key={item.id}
              className={`nav-item ${tab === item.id ? 'active' : ''}`}
              onClick={() => onTab(item.id)}
            >
              <item.icon size={14} />
              {item.label}
              {item.id === 'signals' && unread && (
                <span className="badge badge-red" style={{ marginLeft: 'auto', padding: '1px 6px', fontSize: 10 }}>
                  {alertCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </aside>
  );
}