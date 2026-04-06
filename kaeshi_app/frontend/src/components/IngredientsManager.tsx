/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';

const API = 'http://100.98.193.61:8000/api';

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

  const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: 'white', width: '100%', boxSizing: 'border-box' as const };
  const btnStyle = { padding: '10px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' as const, minHeight: '44px' };

  return (
    <div className="glass-panel" style={{ minHeight: '60vh' }}>
      <h2 style={{ color: 'var(--primary-color)' }}>原材料マスター管理</h2>
      <p style={{ color: 'var(--text-secondary)' }}>材料を買ってきたら、名前・価格・量を登録してください。</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
        <input style={inputStyle} type="text" placeholder="材料名" value={name} onChange={e => setName(e.target.value)} />
        <input style={inputStyle} type="number" placeholder="価格(税込)" value={price || ''} onChange={e => setPrice(Number(e.target.value))} />
        <input style={inputStyle} type="number" placeholder="量" value={qty || ''} onChange={e => setQty(Number(e.target.value))} />
        <select style={inputStyle} value={unitType} onChange={e => setUnitType(e.target.value)}>
          <option value="g">g</option><option value="kg">kg</option><option value="ml">ml</option><option value="L">L</option><option value="本">本</option>
        </select>
        <button onClick={handleSaveIngredient} style={{ ...btnStyle, background: '#ff5252', color: 'white' }}>{editId ? '更新' : '＋ 追加'}</button>
      </div>

      <h3>登録済み原材料リスト</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '1px solid #444', color: '#aaa' }}>
            <th style={{ padding: '8px' }}>材料名</th><th style={{ padding: '8px' }}>金額</th><th style={{ padding: '8px' }}>仕入量</th><th style={{ padding: '8px' }}>単位</th><th style={{ padding: '8px' }}>単価(自動)</th><th style={{ padding: '8px' }}>操作</th>
          </tr></thead>
          <tbody>{ingredients.map(i => (
            <tr key={i.id} style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: '8px' }}>{i.name}</td>
              <td style={{ padding: '8px' }}>¥{i.price?.toLocaleString()}</td>
              <td style={{ padding: '8px' }}>{i.quantity}</td>
              <td style={{ padding: '8px' }}>{i.unit_type}</td>
              <td style={{ padding: '8px', color: '#4ade80' }}>¥{i.unit_price?.toFixed(2)}/{i.unit_type}</td>
              <td style={{ padding: '8px' }}>
                <button onClick={() => handleEditIngredient(i)} style={{ ...btnStyle, background: '#3b82f6', color: '#fff', marginRight: '4px', padding: '6px 10px' }}>✏️</button>
                <button onClick={() => handleDeleteIngredient(i.id)} style={{ ...btnStyle, background: '#ef4444', color: '#fff', padding: '6px 10px' }}>🗑️</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <hr style={{ borderColor: '#333', margin: '2rem 0' }} />

      <h2 style={{ color: 'var(--primary-color)' }}>納入先マスター</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
        <input style={inputStyle} type="text" placeholder="店舗名" value={destName} onChange={e => setDestName(e.target.value)} />
        <input style={inputStyle} type="text" placeholder="住所" value={destAddr} onChange={e => setDestAddr(e.target.value)} />
        <button onClick={handleSaveDest} style={{ ...btnStyle, background: '#ff5252', color: 'white' }}>{editDestId ? '更新' : '＋ 追加'}</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '1px solid #444', color: '#aaa' }}>
            <th style={{ padding: '8px' }}>店舗名</th><th style={{ padding: '8px' }}>住所</th><th style={{ padding: '8px' }}>操作</th>
          </tr></thead>
          <tbody>{destinations.map(d => (
            <tr key={d.id} style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: '8px' }}>{d.name}</td>
              <td style={{ padding: '8px' }}>{d.address}</td>
              <td style={{ padding: '8px' }}>
                <button onClick={() => { setEditDestId(d.id); setDestName(d.name); setDestAddr(d.address); }} style={{ ...btnStyle, background: '#3b82f6', color: '#fff', marginRight: '4px', padding: '6px 10px' }}>✏️</button>
                <button onClick={() => handleDeleteDest(d.id)} style={{ ...btnStyle, background: '#ef4444', color: '#fff', padding: '6px 10px' }}>🗑️</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
