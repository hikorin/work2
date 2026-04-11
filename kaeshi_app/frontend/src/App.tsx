import { useState } from 'react';
import './index.css';
import IngredientsManager from './components/IngredientsManager';
import RecipeEditor from './components/RecipeEditor';
import DeliveryManager from './components/DeliveryManager';
import InvoiceGenerator from './components/InvoiceGenerator';
import SettingsManager from './components/SettingsManager';

const tabs = [
  { key: 'deliveries', label: '納品管理', icon: 'local_shipping' },
  { key: 'invoices', label: '請求書', icon: 'description' },
  { key: 'recipes', label: 'レシピ原価', icon: 'restaurant_menu' },
  { key: 'master', label: 'マスター管理', icon: 'inventory_2' },
  { key: 'settings', label: '設定', icon: 'settings' },
];

function App() {
  const [activeTab, setActiveTab] = useState('deliveries');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 70;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    const currentIndex = tabs.findIndex(t => t.key === activeTab);
    if (isLeftSwipe && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].key);
    } else if (isRightSwipe && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].key);
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '70px', background: 'var(--bg-color)' }}>
      {/* Header - Fixed/Sticky with Logo Background Match */}
      <header className="no-print" style={{ 
        padding: '0.8rem 1rem', 
        textAlign: 'center', 
        borderBottom: '1px solid rgba(169,180,185,0.15)',
        position: 'sticky',
        top: 0,
        backgroundColor: '#FFFFFF', // Matches logo background
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.png" alt="歩輝勇データベース" style={{ height: '44px', objectFit: 'contain' }} />
          <h1 className="k-heading" style={{ margin: 0, fontSize: '1.2rem', color: '#000000' }}>
            データベース
          </h1>
        </div>
      </header>

      {/* Main Content with Swipe capability */}
      <main 
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ padding: '0 0.5rem', touchAction: 'pan-y' }}
      >
        {/* Page title */}
        <div className="no-print" style={{ padding: '1rem 0.5rem 0' }}>
          <h2 className="k-heading" style={{ fontSize: '1.3rem' }}>
            {tabs.find(t => t.key === activeTab)?.label}
          </h2>
          <p className="k-subheading">
            Management & Precision Cost Simulation
          </p>
        </div>
        
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
          {activeTab === 'deliveries' && <DeliveryManager />}
          {activeTab === 'invoices' && <InvoiceGenerator />}
          {activeTab === 'recipes' && <RecipeEditor />}
          {activeTab === 'master' && <IngredientsManager />}
          {activeTab === 'settings' && <SettingsManager />}
        </div>
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
