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
          <span style={{ fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.1em', opacity: 0.8 }}>PREMIUM ACCOUNTING</span>
        </div>
        <div style={{ fontSize: '1.2rem', cursor: 'pointer', opacity: 0.7 }}>⚙️</div>
      </div>

      <div className="main-layout">
        {/* Responsive Side/Bottom Navigation */}
        <nav className="side-nav" style={{ 
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
              className="side-nav-item"
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
                border: '1px solid rgba(255,255,255,0.2)',
                color: activeTab === tab.key ? 'var(--bg-secondary)' : 'white'
              }}
            >
              {tab.icon}
            </div>
          ))}
        </nav>

        {/* Dynamic Panel Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '40px' }}>
            <h1 className="hero-title">
              {activeTab === 'master' && <>MASTER<br />DATABASE</>}
              {activeTab === 'recipes' && <>RECIPE<br />ANALYSIS</>}
              {activeTab === 'deliveries' && <>DELIVERY<br />TRACKER</>}
              {activeTab === 'invoices' && <>INVOICE<br />FACTORY</>}
            </h1>
            <p className="hero-p" style={{ marginTop: '10px', fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: 1.5 }}>
              {activeTab === 'master' && "全ての原材料と単価データを、一箇所でスマートに管理しましょう。"}
              {activeTab === 'recipes' && "材料の配合を変えながら、原価と利益率の黄金比をシミュレート。"}
              {activeTab === 'deliveries' && "毎日の納品を確実に記録し、正確な原価推移を把握します。"}
              {activeTab === 'invoices' && "納品データに基づいた正確な請求書を、いつでも瞬時に生成。"}
            </p>
          </div>

          <div className="glass-panel" style={{ flex: 1, minHeight: '400px', maxHeight: '550px', overflowY: 'auto' }}>
            {ActiveComponent}
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button key="detail" onClick={() => alert('機能準備中！🎉')}>詳細を表示</button>
            <button key="back" className="secondary" onClick={() => setActiveTab('master')}>トップに戻る</button>
          </div>
        </div>
      </div>

      {/* Decorative vertical slider accent - hidden on mobile */}
      <div className="decorative-slider" style={{ 
        position: 'absolute', 
        right: '40px', 
        top: '25%', 
        bottom: '25%', 
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
