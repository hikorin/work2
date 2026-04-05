import { useState } from 'react';
import './index.css';
import IngredientsManager from './components/IngredientsManager';
import RecipeEditor from './components/RecipeEditor';
import DeliveryManager from './components/DeliveryManager';
import InvoiceGenerator from './components/InvoiceGenerator';

const tabs = [
  { key: 'master', label: 'マスター管理', icon: '📦' },
  { key: 'recipes', label: 'レシピ原価', icon: '🍜' },
  { key: 'deliveries', label: '納品管理', icon: '🚚' },
  { key: 'invoices', label: '請求書', icon: '🧾' },
];

function App() {
  const [activeTab, setActiveTab] = useState('master');

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '70px' }}>
      {/* Header */}
      <header style={{ padding: '1rem', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', background: 'linear-gradient(90deg, #ff5252, #ff8a80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Kaeshi Cost Manager
        </h1>
      </header>

      {/* Main Content */}
      <main style={{ padding: '0 0.5rem' }}>
        {activeTab === 'master' && <IngredientsManager />}
        {activeTab === 'recipes' && <RecipeEditor />}
        {activeTab === 'deliveries' && <DeliveryManager />}
        {activeTab === 'invoices' && <InvoiceGenerator />}
      </main>

      {/* Bottom Navigation (Mobile First) */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#1a1a1a', borderTop: '1px solid #333',
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
              color: activeTab === tab.key ? '#ff5252' : '#888',
              fontSize: '0.65rem', minHeight: '44px', justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
