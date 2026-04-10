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

  return (
    <div className="k-card" style={{ minHeight: '60vh' }}>
      <h2 className="k-heading">原材料マスター管理</h2>
      <p className="k-subheading">Raw Material Master Management</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
        <input className="k-input" type="text" placeholder="例: 特選醤油" value={name} onChange={e => setName(e.target.value)} />
        <input className="k-input" type="number" placeholder="価格(税込)" value={price || ''} onChange={e => setPrice(Number(e.target.value))} />
        <input className="k-input" type="number" placeholder="量" value={qty || ''} onChange={e => setQty(Number(e.target.value))} />
        <select className="k-select" value={unitType} onChange={e => setUnitType(e.target.value)}>
          <option value="g">g</option><option value="kg">kg</option><option value="ml">ml</option><option value="L">L</option><option value="本">本</option>
        </select>
        <button onClick={handleSaveIngredient} className="k-btn k-btn-primary">{editId ? '更新' : '＋ 追加'}</button>
      </div>

      <h3 className="k-subheading" style={{ fontSize: '0.65rem', fontWeight: 600 }}>登録済み原材料リスト</h3>
      <div className="k-table-wrapper">
        <table className="k-table">
          <thead><tr>
            <th className="k-th">材料名</th>
            <th className="k-th right">金額</th>
            <th className="k-th right">仕入量</th>
            <th className="k-th center">単位</th>
            <th className="k-th right">単価(自動)</th>
            <th className="k-th right">操作</th>
          </tr></thead>
          <tbody>{ingredients.map(i => (
            <tr key={i.id} style={{ transition: 'background 0.15s' }}>
              <td className="k-td" style={{ fontSize: '0.875rem' }}>{i.name}</td>
              <td className="k-td num right" style={{ fontSize: '0.875rem' }}>¥{i.price?.toLocaleString()}</td>
              <td className="k-td num right" style={{ fontSize: '0.875rem', color: 'var(--primary-color)' }}>{i.quantity}</td>
              <td className="k-td center" style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{i.unit_type}</td>
              <td className="k-td num right" style={{ fontSize: '0.875rem' }}>¥{i.unit_price?.toFixed(2)}/{i.unit_type}</td>
              <td className="k-td right">
                <button onClick={() => handleEditIngredient(i)} className="k-btn k-btn-icon" style={{ fontSize: '0.8rem' }}><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>edit</span></button>
                <button onClick={() => handleDeleteIngredient(i.id)} className="k-btn k-btn-icon k-btn-danger" style={{ fontSize: '0.8rem' }}><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>delete</span></button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <hr style={{ borderColor: 'rgba(169,180,185,0.15)', margin: '2rem 0', borderStyle: 'solid', borderWidth: '0 0 1px 0' }} />

      <h2 className="k-heading">納入先マスター</h2>
      <p className="k-subheading">Delivery Destinations</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
        <input className="k-input" type="text" placeholder="店舗名" value={destName} onChange={e => setDestName(e.target.value)} />
        <input className="k-input" type="text" placeholder="住所" value={destAddr} onChange={e => setDestAddr(e.target.value)} />
        <button onClick={handleSaveDest} className="k-btn k-btn-primary">{editDestId ? '更新' : '＋ 追加'}</button>
      </div>
      <div className="k-table-wrapper">
        <table className="k-table">
          <thead><tr>
            <th className="k-th">店舗名</th>
            <th className="k-th">住所</th>
            <th className="k-th right">操作</th>
          </tr></thead>
          <tbody>{destinations.map(d => (
            <tr key={d.id}>
              <td className="k-td" style={{ fontSize: '0.875rem' }}>{d.name}</td>
              <td className="k-td" style={{ fontSize: '0.875rem' }}>{d.address}</td>
              <td className="k-td right">
                <button onClick={() => { setEditDestId(d.id); setDestName(d.name); setDestAddr(d.address); }} className="k-btn k-btn-icon"><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>edit</span></button>
                <button onClick={() => handleDeleteDest(d.id)} className="k-btn k-btn-icon k-btn-danger"><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>delete</span></button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
