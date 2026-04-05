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

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 500, marginBottom: '20px' }}>納品トラッカー</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div>
          <label style={{ fontSize: '0.75rem', opacity: 0.7, marginLeft: '8px' }}>納品日</label>
          <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} onKeyDown={e => e.preventDefault()} />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', opacity: 0.7, marginLeft: '8px' }}>納品先</label>
          <select value={destId} onChange={e => setDestId(Number(e.target.value))}>
            <option value="">納品先を選択...</option>
            {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>

      <h3 style={{ marginBottom: '15px', fontSize: '1.2rem', opacity: 0.9 }}>納品品目</h3>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 50px', gap: '10px', marginBottom: '10px' }}>
          <select value={item.recipe_id} onChange={e => updateRow(idx, 'recipe_id', Number(e.target.value))}>
            <option value="">品名を選択...</option>
            {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <input type="number" value={item.quantity} onChange={e => updateRow(idx, 'quantity', Number(e.target.value))} min={1} />
          <span onClick={() => removeRow(idx)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</span>
        </div>
      ))}
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button className="secondary" onClick={addRow} style={{ flex: 1 }}>＋ 品目追加</button>
        <button onClick={handleSubmit} style={{ flex: 2, background: 'white', color: 'var(--bg-secondary)', fontWeight: 'bold' }}>納品を確定する</button>
      </div>

      <div style={{ margin: '40px 0', borderTop: '1px solid var(--glass-border)' }}></div>

      <h3 style={{ marginBottom: '15px', fontSize: '1.2rem', opacity: 0.9 }}>最新の納品履歴</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--glass-border)', textAlign: 'left', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
              <th style={{ padding: '12px' }}>番号</th>
              <th style={{ padding: '12px' }}>日付</th>
              <th style={{ padding: '12px' }}>納品先</th>
              <th style={{ padding: '12px' }}>内容</th>
              <th style={{ padding: '12px' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.slice(0, 10).map((d: any) => (
              <tr key={d.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '12px', color: 'var(--accent-pink)', fontWeight: 600 }}>{d.delivery_number}</td>
                <td style={{ padding: '12px' }}>{d.delivery_date}</td>
                <td style={{ padding: '12px' }}>{d.destination_name}</td>
                <td style={{ padding: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {d.items?.map((i: any) => `${i.recipe_name}×${i.quantity}`).join(', ')}
                </td>
                <td style={{ padding: '12px' }}>
                  {d.invoice_id ? 
                    <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>請求完了</span> :
                    <span onClick={() => handleDelete(d.id)} style={{ cursor: 'pointer' }}>🗑️</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
