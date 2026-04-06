/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';

const API = '/api';

export default function IngredientsManager() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [qty, setQty] = useState<number>(0);
  const [unitType, setUnitType] = useState('g');
  const [destName, setDestName] = useState('');
  const [destAddr, setDestAddr] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editDestId, setEditDestId] = useState<number | null>(null);

  const fetchAll = async () => {
    try {
      const [iRes, dRes] = await Promise.all([fetch(`${API}/ingredients/`), fetch(`${API}/destinations/`)]);
      if (iRes.ok) setIngredients(await iRes.json());
      if (dRes.ok) setDestinations(await dRes.json());
    } catch (e) { console.error(e); }
  };
  useEffect(() => { fetchAll(); }, []);

  const handleSaveIngredient = async () => {
    if (!name || price <= 0 || qty <= 0) return;
    const body = { name, price, quantity: qty, unit_type: unitType };
    const url = editId ? `${API}/ingredients/${editId}` : `${API}/ingredients/`;
    const method = editId ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setName(''); setPrice(0); setQty(0); setEditId(null);
    fetchAll();
  };

  const handleDeleteIngredient = async (id: number) => {
    if (!confirm('この材料を削除しますか？')) return;
    await fetch(`${API}/ingredients/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const handleEditIngredient = (ing: any) => {
    setEditId(ing.id); setName(ing.name); setPrice(ing.price); setQty(ing.quantity); setUnitType(ing.unit_type);
  };

  const handleSaveDest = async () => {
    if (!destName) return;
    const body = { name: destName, address: destAddr };
    const url = editDestId ? `${API}/destinations/${editDestId}` : `${API}/destinations/`;
    const method = editDestId ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setDestName(''); setDestAddr(''); setEditDestId(null);
    fetchAll();
  };

  const handleDeleteDest = async (id: number) => {
    if (!confirm('この納入先を削除しますか？')) return;
    await fetch(`${API}/destinations/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const inputStyle = { padding: '10px', borderRadius: '2px', border: 'none', borderBottom: '1px solid var(--outline-variant)', background: 'transparent', color: 'var(--text-primary)', width: '100%', boxSizing: 'border-box' as const, fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 as const, fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s' };
  const btnStyle = { padding: '10px 16px', border: 'none', borderRadius: '2px', cursor: 'pointer', fontWeight: 300 as const, minHeight: '44px', fontFamily: "'Noto Sans JP', sans-serif", fontSize: '0.75rem', letterSpacing: '0.08em', transition: 'opacity 0.2s' };

  return (
    <div className="glass-panel" style={{ minHeight: '60vh' }}>
      <h2 style={{ color: 'var(--text-primary)', fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 100, fontSize: '1.4rem', letterSpacing: '-0.02em' }}>原材料マスター管理</h2>
      <p style={{ color: 'var(--text-secondary)', fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>Raw Material Master Management</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
        <input style={inputStyle} type="text" placeholder="例: 特選醤油" value={name} onChange={e => setName(e.target.value)} />
        <input style={inputStyle} type="number" placeholder="価格(税込)" value={price || ''} onChange={e => setPrice(Number(e.target.value))} />
        <input style={inputStyle} type="number" placeholder="量" value={qty || ''} onChange={e => setQty(Number(e.target.value))} />
        <select style={inputStyle} value={unitType} onChange={e => setUnitType(e.target.value)}>
          <option value="g">g</option><option value="kg">kg</option><option value="ml">ml</option><option value="L">L</option><option value="本">本</option>
        </select>
        <button onClick={handleSaveIngredient} style={{ ...btnStyle, background: 'var(--primary-color)', color: 'var(--on-primary)' }}>{editId ? '更新' : '＋ 追加'}</button>
      </div>

      <h3 style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>登録済み原材料リスト</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '1px solid var(--outline-variant)', color: 'var(--text-secondary)' }}>
            <th style={{ padding: '12px 8px', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, textAlign: 'left' }}>材料名</th>
            <th style={{ padding: '12px 8px', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, textAlign: 'right' }}>金額</th>
            <th style={{ padding: '12px 8px', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, textAlign: 'right' }}>仕入量</th>
            <th style={{ padding: '12px 8px', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, textAlign: 'center' }}>単位</th>
            <th style={{ padding: '12px 8px', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, textAlign: 'right' }}>単価(自動)</th>
            <th style={{ padding: '12px 8px', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, textAlign: 'right' }}>操作</th>
          </tr></thead>
          <tbody>{ingredients.map(i => (
            <tr key={i.id} style={{ borderBottom: '1px solid rgba(169,180,185,0.08)', transition: 'background 0.15s' }}>
              <td style={{ padding: '10px 8px', fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300, fontSize: '0.875rem' }}>{i.name}</td>
              <td className="manrope-numbers" style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 300, fontSize: '0.875rem' }}>¥{i.price?.toLocaleString()}</td>
              <td className="manrope-numbers" style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 300, fontSize: '0.875rem', color: 'var(--primary-color)' }}>{i.quantity}</td>
              <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: '0.625rem', color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{i.unit_type}</td>
              <td className="manrope-numbers" style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 300, fontSize: '0.875rem' }}>¥{i.unit_price?.toFixed(2)}/{i.unit_type}</td>
              <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                <button onClick={() => handleEditIngredient(i)} style={{ ...btnStyle, background: 'transparent', color: 'var(--text-secondary)', padding: '6px 8px', fontSize: '0.8rem' }}><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>edit</span></button>
                <button onClick={() => handleDeleteIngredient(i.id)} style={{ ...btnStyle, background: 'transparent', color: 'var(--error)', padding: '6px 8px', fontSize: '0.8rem' }}><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>delete</span></button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <hr style={{ borderColor: 'rgba(169,180,185,0.15)', margin: '2rem 0', borderStyle: 'solid', borderWidth: '0 0 1px 0' }} />

      <h2 style={{ color: 'var(--text-primary)', fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 100, fontSize: '1.4rem', letterSpacing: '-0.02em' }}>納入先マスター</h2>
      <p style={{ color: 'var(--text-secondary)', fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>Delivery Destinations</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
        <input style={inputStyle} type="text" placeholder="店舗名" value={destName} onChange={e => setDestName(e.target.value)} />
        <input style={inputStyle} type="text" placeholder="住所" value={destAddr} onChange={e => setDestAddr(e.target.value)} />
        <button onClick={handleSaveDest} style={{ ...btnStyle, background: 'var(--primary-color)', color: 'var(--on-primary)' }}>{editDestId ? '更新' : '＋ 追加'}</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '1px solid var(--outline-variant)', color: 'var(--text-secondary)' }}>
            <th style={{ padding: '12px 8px', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, textAlign: 'left' }}>店舗名</th>
            <th style={{ padding: '12px 8px', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, textAlign: 'left' }}>住所</th>
            <th style={{ padding: '12px 8px', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, textAlign: 'right' }}>操作</th>
          </tr></thead>
          <tbody>{destinations.map(d => (
            <tr key={d.id} style={{ borderBottom: '1px solid rgba(169,180,185,0.08)' }}>
              <td style={{ padding: '10px 8px', fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300, fontSize: '0.875rem' }}>{d.name}</td>
              <td style={{ padding: '10px 8px', fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300, fontSize: '0.875rem' }}>{d.address}</td>
              <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                <button onClick={() => { setEditDestId(d.id); setDestName(d.name); setDestAddr(d.address); }} style={{ ...btnStyle, background: 'transparent', color: 'var(--text-secondary)', padding: '6px 8px' }}><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>edit</span></button>
                <button onClick={() => handleDeleteDest(d.id)} style={{ ...btnStyle, background: 'transparent', color: 'var(--error)', padding: '6px 8px' }}><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>delete</span></button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
