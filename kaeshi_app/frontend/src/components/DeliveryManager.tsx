/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
const API = 'http://127.0.0.1:8001/api';

export default function DeliveryManager() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [deliveryDate, setDeliveryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [destId, setDestId] = useState<number | ''>('');
  const [items, setItems] = useState<{ recipe_id: number | ''; quantity: number }[]>([{ recipe_id: '', quantity: 1 }]);

  const fetchAll = async () => {
    try {
      const [dRes, rRes, dlRes] = await Promise.all([
        fetch(`${API}/destinations/`), fetch(`${API}/recipes/`), fetch(`${API}/deliveries/`)
      ]);
      if (dRes.ok) setDestinations(await dRes.json());
      if (rRes.ok) setRecipes(await rRes.json());
      if (dlRes.ok) setDeliveries(await dlRes.json());
    } catch (e) { console.error(e); }
  };
  useEffect(() => { fetchAll(); }, []);

  const addRow = () => setItems([...items, { recipe_id: '', quantity: 1 }]);
  const removeRow = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateRow = (idx: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[idx] as any)[field] = value;
    setItems(newItems);
  };

  const handleSubmit = async () => {
    if (!destId || items.some(i => !i.recipe_id)) return;
    const body = { delivery_date: deliveryDate, destination_id: destId, items: items.map(i => ({ recipe_id: Number(i.recipe_id), quantity: i.quantity })) };
    const res = await fetch(`${API}/deliveries/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) {
      const data = await res.json();
      alert(`納品登録完了！ 納品番号: ${data.delivery_number}`);
      setItems([{ recipe_id: '', quantity: 1 }]);
      fetchAll();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('この納品記録を削除しますか？')) return;
    const res = await fetch(`${API}/deliveries/${id}`, { method: 'DELETE' });
    if (res.ok) fetchAll();
    else { const err = await res.json(); alert(err.detail); }
  };

  const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: 'white', width: '100%', boxSizing: 'border-box' as const };
  const btnStyle = { border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' as const, minHeight: '44px' };

  return (
    <div className="glass-panel" style={{ minHeight: '60vh' }}>
      <h2 style={{ color: 'var(--primary-color)' }}>納品管理</h2>
      <p style={{ color: 'var(--text-secondary)' }}>日々の納品を記録します。納品番号は自動で付与されます。</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
        <input style={inputStyle} type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} onKeyDown={e => e.preventDefault()} />
        <select style={inputStyle} value={destId} onChange={e => setDestId(Number(e.target.value))}>
          <option value="">納品先を選択...</option>
          {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <h3>納品品目</h3>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <select style={inputStyle} value={item.recipe_id} onChange={e => updateRow(idx, 'recipe_id', Number(e.target.value))}>
            <option value="">品名を選択...</option>
            {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <input style={{ ...inputStyle, width: '80px' }} type="number" value={item.quantity} onChange={e => updateRow(idx, 'quantity', Number(e.target.value))} min={1} />
          <button onClick={() => removeRow(idx)} style={{ ...btnStyle, background: '#ef4444', color: '#fff', padding: '0 10px' }}>🗑️</button>
        </div>
      ))}
      <button onClick={addRow} style={{ ...btnStyle, background: '#333', color: '#fff', padding: '8px 16px', marginBottom: '1rem' }}>＋ 品目追加</button>
      <br />
      <button onClick={handleSubmit} style={{ ...btnStyle, background: '#4ade80', color: '#000', padding: '12px 24px', width: '100%' }}>納品を登録する</button>

      <hr style={{ borderColor: '#333', margin: '2rem 0' }} />

      <h3>納品履歴</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead><tr style={{ borderBottom: '1px solid #444', color: '#aaa' }}>
            <th style={{ padding: '8px' }}>番号</th><th style={{ padding: '8px' }}>日付</th><th style={{ padding: '8px' }}>納品先</th><th style={{ padding: '8px' }}>品目</th><th style={{ padding: '8px' }}>操作</th>
          </tr></thead>
          <tbody>{deliveries.map((d: any) => (
            <tr key={d.id} style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: '8px', color: '#4ade80' }}>{d.delivery_number}</td>
              <td style={{ padding: '8px' }}>{d.delivery_date}</td>
              <td style={{ padding: '8px' }}>{d.destination_name}</td>
              <td style={{ padding: '8px' }}>{d.items?.map((i: any) => `${i.recipe_name}×${i.quantity}`).join(', ')}</td>
              <td style={{ padding: '8px' }}>
                {d.invoice_id ? <span style={{ color: '#888' }}>請求済</span> :
                  <button onClick={() => handleDelete(d.id)} style={{ ...btnStyle, background: '#ef4444', color: '#fff', padding: '4px 10px' }}>🗑️</button>}
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
