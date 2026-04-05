import { useState, useMemo } from 'react';
import './index.css';
import IngredientsManager from './components/IngredientsManager';
import RecipeEditor from './components/RecipeEditor';
import DeliveryManager from './components/DeliveryManager';
import InvoiceGenerator from './components/InvoiceGenerator';

const tabs = [
  { key: 'master', label: 'マスター管理', icon: '📦' },
  { key: 'recipes', label: 'レシピ原価', icon: '🍜' },
  { key: 'deliveries', label: '納品管理', icon: '🚚' },
  { key: 'invoices', label: '請求書管理', icon: '🧾' },
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
    <div className="glass-container">
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-pink)' }}></div>
          <span style={{ fontSize: '0.9rem', fontWeight: 500, letterSpacing: '0.1em', opacity: 0.8 }}>PREMIUM MANAGEMENT</span>
        </div>
        <div style={{ fontSize: '1.2rem', cursor: 'pointer', opacity: 0.7 }}>⚙️</div>
      </div>

      <div style={{ display: 'flex', flex: 1, gap: '40px', minHeight: '60vh' }}>
        {/* Floating Side Navigation */}
        <nav style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px', 
          justifyContent: 'center',
          padding: '10px'
        }}>
          {tabs.map(tab => (
            <div 
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              title={tab.label}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: activeTab === tab.key ? 'white' : 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '1.6rem',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: activeTab === tab.key ? '0 10px 20px rgba(0,0,0,0.1)' : 'none',
                transform: activeTab === tab.key ? 'scale(1.1)' : 'scale(1)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              {tab.icon}
            </div>
          ))}
        </nav>

        {/* Dynamic Panel Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1, margin: 0, fontWeight: 500 }}>
              {activeTab === 'master' && <>MASTER<br />DATABASE</>}
              {activeTab === 'recipes' && <>RECIPE<br />ANALYSIS</>}
              {activeTab === 'deliveries' && <>DELIVERY<br />TRACKER</>}
              {activeTab === 'invoices' && <>INVOICE<br />FACTORY</>}
            </h1>
            <p style={{ marginTop: '20px', fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.6 }}>
              {activeTab === 'master' && "全ての原材料と単価データを一元管理します。"}
              {activeTab === 'recipes' && "配合を変えながら原価と利益率をリアルタイムにシミュレート。"}
              {activeTab === 'deliveries' && "毎日の納品データを管理し、原価計算の精度を高めます。"}
              {activeTab === 'invoices' && "納品実績に基づいた正確な請求書を瞬時に生成します。"}
            </p>
          </div>

          <div className="glass-panel" style={{ flex: 1, maxHeight: '500px', overflowY: 'auto' }}>
            {ActiveComponent}
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
            <button onClick={() => alert('機能準備中！🎉')}>詳細を表示</button>
            <button className="secondary" onClick={() => setActiveTab('master')}>トップに戻る</button>
          </div>
        </div>
      </div>

      {/* Decorative vertical slider accent like the image */}
      <div style={{ 
        position: 'absolute', 
        right: '40px', 
        top: '20%', 
        bottom: '20%', 
        width: '6px', 
        borderRadius: '3px',
        background: 'linear-gradient(to bottom, #7d84ff, #ff8e9c, #7d84ff)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ 
          width: '12px', 
          height: '12px', 
          borderRadius: '50%', 
          background: 'white', 
          border: '3px solid #ff8e9c',
          boxShadow: '0 0 10px rgba(0,0,0,0.2)' 
        }}></div>
      </div>
    </div>
  );
}

export default App;
