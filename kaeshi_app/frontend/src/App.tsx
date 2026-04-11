import { useState } from 'react';
import './index.css';
import IngredientsManager from './components/IngredientsManager';
import RecipeEditor from './components/RecipeEditor';
import DeliveryManager from './components/DeliveryManager';
import InvoiceGenerator from './components/InvoiceGenerator';
import SettingsManager from './components/SettingsManager';

const tabs = [
  { key: 'master', label: 'マスター管理', icon: 'inventory_2' },
  { key: 'recipes', label: 'レシピ原価', icon: 'restaurant_menu' },
  { key: 'deliveries', label: '納品管理', icon: 'local_shipping' },
  { key: 'invoices', label: '請求書', icon: 'description' },
  { key: 'settings', label: '設定', icon: 'settings' },
];

function App() {
  const [activeTab, setActiveTab] = useState('master');

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '70px', background: 'var(--bg-color)' }}>
      {/* Header */}
      <header className="no-print" style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid rgba(169,180,185,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.png" alt="歩輝勇データベース" style={{ height: '50px', objectFit: 'contain' }} />
          <h1 className="k-heading" style={{ margin: 0, fontSize: '1.2rem' }}>
            データベース
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '0 0.5rem' }}>
        {/* Page title */}
        <div className="no-print" style={{ padding: '1rem 0.5rem 0' }}>
          <h2 className="k-heading" style={{ fontSize: '1.3rem' }}>
            {tabs.find(t => t.key === activeTab)?.label}
          </h2>
          <p className="k-subheading">
            Management & Precision Cost Simulation
          </p>
        </div>
        {activeTab === 'master' && <IngredientsManager />}
        {activeTab === 'recipes' && <RecipeEditor />}
        {activeTab === 'deliveries' && <DeliveryManager />}
        {activeTab === 'invoices' && <InvoiceGenerator />}
        {activeTab === 'settings' && <SettingsManager />}
      </main>

      {/* Bottom Navigation (Mobile First) */}
      <nav className="k-nav no-print">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`k-nav-item ${activeTab === tab.key ? 'active' : ''}`}
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
