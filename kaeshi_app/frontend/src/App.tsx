import { useState, useMemo } from 'react';
import './index.css';
import IngredientsManager from './components/IngredientsManager';
import RecipeEditor from './components/RecipeEditor';
import DeliveryManager from './components/DeliveryManager';
import InvoiceGenerator from './components/InvoiceGenerator';

const tabs = [
  { key: 'master', label: 'DATABASE', icon: '📦' },
  { key: 'recipes', label: 'ANALYSIS', icon: '🍜' },
  { key: 'deliveries', label: 'TRACKER', icon: '🚚' },
  { key: 'invoices', label: 'FACTORY', icon: '🧾' },
];

function App() {
  const [activeTab, setActiveTab] = useState('master');

  const ActiveComponent = useMemo(() => {
    switch (activeTab) {
      case 'master': return <IngredientsManager />;
      case 'recipes': return <RecipeEditor />;
      case 'deliveries': return <DeliveryManager />;
      case 'invoices': return <InvoiceGenerator />;
      default: return <IngredientsManager />;
    }
  }, [activeTab]);

  return (
    <div className="app-container">
      {/* 🏢 SYLEISH SIDE RAIL NAVIGATION */}
      <nav className="sidebar-nav">
        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--accent-pink)', marginBottom: '40px', letterSpacing: '-0.05em' }}>K / C / I</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
          {tabs.map(tab => (
            <div 
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              title={tab.label}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: activeTab === tab.key ? 'white' : 'transparent',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '1.4rem',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: activeTab === tab.key ? '0 8px 20px rgba(0,0,0,0.1)' : 'none',
                color: activeTab === tab.key ? 'var(--bg-secondary)' : 'white',
                border: activeTab === tab.key ? 'none' : '1px solid rgba(255,255,255,0.1)'
              }}
            >
              {tab.icon}
            </div>
          ))}
        </div>
        <div style={{ opacity: 0.5, fontSize: '0.8rem', fontWeight: 700 }}>VER 3.0</div>
      </nav>

      {/* 🚀 MAIN STAGE: DASHBOARD CONTENT */}
      <main className="main-stage">
        {/* Dynamic Header Area */}
        <header style={{ padding: '30px 40px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="hero-title">{tabs.find(t => t.key === activeTab)?.label}</h1>
            <p className="hero-subtitle">
              {activeTab === 'master' && "CORE DATA & INGREDIENT INVENTORY"}
              {activeTab === 'recipes' && "COST SIMULATION & MARGIN OPTIMIZATION"}
              {activeTab === 'deliveries' && "OPERATION LOGS & DELIVERY HISTORY"}
              {activeTab === 'invoices' && "AUTOMATED INVOICING & ARCHIVES"}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-pink)' }}></div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }}></div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }}></div>
          </div>
        </header>

        {/* Content Viewport */}
        <div className="content-scroller">
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            {ActiveComponent}
          </div>
        </div>

        {/* Status Bar / Footer (Inside stage) */}
        <footer style={{ 
          padding: '12px 40px', 
          background: 'rgba(255,255,255,0.05)', 
          borderTop: '1px solid var(--glass-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          fontWeight: 600,
          opacity: 0.6
        }}>
          <div>KAESHI COST INTELLIGENCE // DASHBOARD ACTIVE</div>
          <div style={{ letterSpacing: '0.1em' }}>NETWORK SECURE // 200 OK</div>
        </footer>
      </main>
    </div>
  );
}

export default App;
