import { useState } from 'react';
import './index.css';
import IngredientsManager from './components/IngredientsManager';
import RecipeEditor from './components/RecipeEditor';
import DeliveryManager from './components/DeliveryManager';
import InvoiceGenerator from './components/InvoiceGenerator';

const tabs = [
  { key: 'master', label: 'マスター管理', icon: 'inventory_2' },
  { key: 'recipes', label: 'レシピ原価', icon: 'restaurant_menu' },
  { key: 'deliveries', label: '納品管理', icon: 'local_shipping' },
  { key: 'invoices', label: '請求書', icon: 'description' },
];

function App() {
  const [activeTab, setActiveTab] = useState('master');

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '70px', background: 'var(--bg-color)' }}>
      {/* Header */}
      <header style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid rgba(169,180,185,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.png" alt="歩輝勇データベース" style={{ height: '50px', objectFit: 'contain' }} />
          <h1 className="thin-header" style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', letterSpacing: '0.05em', fontWeight: 700 }}>
            データベース
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '0 0.5rem' }}>
        {/* Page title */}
        <div style={{ padding: '1rem 0.5rem 0' }}>
          <h2 className="thin-header" style={{ fontSize: '1.3rem', margin: '0 0 2px', color: 'var(--text-primary)', letterSpacing: '-0.02em', fontWeight: 700 }}>
            {tabs.find(t => t.key === activeTab)?.label}
          </h2>
          <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--text-secondary)', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 400 }}>
            Management & Precision Cost Simulation
          </p>
        </div>
        {activeTab === 'master' && <IngredientsManager />}
        {activeTab === 'recipes' && <RecipeEditor />}
        {activeTab === 'deliveries' && <DeliveryManager />}
        {activeTab === 'invoices' && <InvoiceGenerator />}
      </main>

      {/* Bottom Navigation (Mobile First) */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(169,180,185,0.15)',
        display: 'flex', justifyContent: 'space-around',
        padding: '4px 0', zIndex: 1000,
      }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '2px', padding: '6px 0', border: 'none', cursor: 'pointer',
              background: 'transparent',
              color: activeTab === tab.key ? 'var(--primary-color)' : 'var(--outline)',
              fontSize: '0.6rem', minHeight: '44px', justifyContent: 'center',
              fontFamily: "'Noto Sans JP', sans-serif", fontWeight: activeTab === tab.key ? 500 : 300,
              transition: 'color 0.2s ease',
              letterSpacing: '0.02em',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
