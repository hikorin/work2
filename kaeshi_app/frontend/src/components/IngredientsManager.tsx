/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';

const API = 'http://127.0.0.1:8001/api';

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

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 500 }}>原材料マスター管理</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>材料の仕入れ価格と量を登録してください。</p>

      {/* Input Group */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '30px' }}>
        <input type="text" placeholder="材料名" value={name} onChange={e => setName(e.target.value)} />
        <input type="number" placeholder="価格(税込)" value={price || ''} onChange={e => setPrice(Number(e.target.value))} />
        <input type="number" placeholder="量" value={qty || ''} onChange={e => setQty(Number(e.target.value))} />
        <select value={unitType} onChange={e => setUnitType(e.target.value)}>
          <option value="g">g</option><option value="kg">kg</option><option value="ml">ml</option><option value="L">L</option><option value="本">本</option>
        </select>
        <button onClick={handleSaveIngredient} style={{ background: '#ffffff', color: 'var(--bg-secondary)', fontWeight: 'bold' }}>
          {editId ? '更新' : '+ 追加'}
        </button>
      </div>

      <h3 style={{ marginBottom: '15px', color: 'rgba(255,255,255,0.9)' }}>仕入原材料一覧</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--glass-border)', textAlign: 'left', color: 'rgba(255,255,255,0.6)' }}>
              <th style={{ padding: '12px' }}>材料名</th>
              <th style={{ padding: '12px' }}>仕入単価</th>
              <th style={{ padding: '12px' }}>仕入量</th>
              <th style={{ padding: '12px' }}>単価(自動)</th>
              <th style={{ padding: '12px' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map(i => (
              <tr key={i.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}>
                <td style={{ padding: '12px' }}>{i.name}</td>
                <td style={{ padding: '12px' }}>¥{i.price?.toLocaleString()}</td>
                <td style={{ padding: '12px' }}>{i.quantity}{i.unit_type}</td>
                <td style={{ padding: '12px', color: '#B2FFD6', fontWeight: 500 }}>¥{i.unit_price?.toFixed(2)}</td>
                <td style={{ padding: '12px' }}>
                  <span onClick={() => handleEditIngredient(i)} style={{ cursor: 'pointer', marginRight: '15px' }}>✏️</span>
                  <span onClick={() => handleDeleteIngredient(i.id)} style={{ cursor: 'pointer' }}>🗑️</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ margin: '40px 0', borderTop: '1px solid var(--glass-border)' }}></div>

      <h2 style={{ fontSize: '1.8rem', fontWeight: 500 }}>納入先マスター</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '20px' }}>
        <input type="text" placeholder="店舗名" value={destName} onChange={e => setDestName(e.target.value)} />
        <input type="text" placeholder="住所" value={destAddr} onChange={e => setDestAddr(e.target.value)} />
        <button onClick={handleSaveDest} style={{ background: '#ffffff', color: 'var(--bg-secondary)', fontWeight: 'bold' }}>
          {editDestId ? '更新' : '+ 登録'}
        </button>
      </div>

      <div style={{ overflowX: 'auto', marginTop: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {destinations.map(d => (
              <tr key={d.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '12px', fontWeight: 500 }}>{d.name}</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{d.address}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <span onClick={() => { setEditDestId(d.id); setDestName(d.name); setDestAddr(d.address); }} style={{ cursor: 'pointer', marginRight: '15px' }}>✏️</span>
                  <span onClick={() => handleDeleteDest(d.id)} style={{ cursor: 'pointer' }}>🗑️</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
