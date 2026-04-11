/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';

const API = '/api/company';

export default function SettingsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState({
    name: '',
    address: '',
    phone: '',
    bank_account: ''
  });

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    try {
      const res = await fetch(`${API}/`);
      if (res.ok) {
        setInfo(await res.json());
      }
    } catch (e) {
      console.error('自社情報の取得に失敗しました', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info)
      });
      if (res.ok) {
        alert('設定を保存しました！');
      } else {
        alert('保存に失敗しました');
      }
    } catch (e) {
      alert('エラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>読み込み中...</div>;

  return (
    <div className="k-card" style={{ minHeight: '60vh' }}>
      <h2 className="k-heading">システム設定</h2>
      <p className="k-subheading">Company Profile & Bank Details</p>

      <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="k-field">
          <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 500 }}>請求者名（自社名）</label>
          <input 
            className="k-input" 
            type="text" 
            value={info.name} 
            onChange={e => setInfo({...info, name: e.target.value})} 
            placeholder="例: 株式会社 〇〇"
          />
        </div>

        <div className="k-field">
          <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 500 }}>住所</label>
          <input 
            className="k-input" 
            type="text" 
            value={info.address} 
            onChange={e => setInfo({...info, address: e.target.value})} 
            placeholder="例: 東京都〇〇区..."
          />
        </div>

        <div className="k-field">
          <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 500 }}>電話番号</label>
          <input 
            className="k-input" 
            type="text" 
            value={info.phone} 
            onChange={e => setInfo({...info, phone: e.target.value})} 
            placeholder="例: 03-1234-5678"
          />
        </div>

        <div className="k-field">
          <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 500 }}>振込先情報</label>
          <textarea 
            className="k-input" 
            style={{ height: '80px', padding: '10px' }}
            value={info.bank_account} 
            onChange={e => setInfo({...info, bank_account: e.target.value})} 
            placeholder="例: 〇〇銀行 〇〇支店 普通 1234567 カ)〇〇"
          />
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>※請求書の最下部に表示されます</p>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <button 
            onClick={handleSave} 
            className="k-btn k-btn-primary" 
            style={{ padding: '12px 30px', width: '100%' }}
            disabled={saving}
          >
            {saving ? '保存中...' : '設定を保存する'}
          </button>
        </div>
      </div>
    </div>
  );
}
