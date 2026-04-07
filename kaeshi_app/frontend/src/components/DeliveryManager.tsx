/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
const API = '/api';

export default function DeliveryManager() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [deliveryDate, setDeliveryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [destId, setDestId] = useState<number | ''>('');
  const [items, setItems] = useState<{ recipe_id: number | ''; quantity: number }[]>([{ recipe_id: '', quantity: 1 }]);
  const [editingId, setEditingId] = useState<number | null>(null);

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
      resetForm();
      fetchAll();
    } else {
      const err = await res.json();
      alert(err.detail || '登録に失敗しました');
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !destId || items.some(i => !i.recipe_id)) return;
    const body = { delivery_date: deliveryDate, destination_id: destId, items: items.map(i => ({ recipe_id: Number(i.recipe_id), quantity: i.quantity })) };
    const res = await fetch(`${API}/deliveries/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) {
      alert(`納品記録を更新しました`);
      resetForm();
      fetchAll();
    } else {
      const err = await res.json();
      alert(err.detail || '更新に失敗しました');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setDeliveryDate(new Date().toISOString().split('T')[0]);
    setDestId('');
    setItems([{ recipe_id: '', quantity: 1 }]);
  };

  const handleEdit = (d: any) => {
    setEditingId(d.id);
    setDeliveryDate(d.delivery_date);
    setDestId(d.destination_id);
    setItems(d.items.map((i: any) => ({ recipe_id: i.recipe_id, quantity: i.quantity })));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('この納品記録を削除しますか？')) return;
    const res = await fetch(`${API}/deliveries/${id}`, { method: 'DELETE' });
    if (res.ok) fetchAll();
    else { const err = await res.json(); alert(err.detail || '削除に失敗しました'); }
  };

  const inputStyle = { padding: '10px', borderRadius: '0', border: 'none', borderBottom: '1px solid var(--outline-variant)', background: 'transparent', color: 'var(--text-primary)', width: '100%', boxSizing: 'border-box' as const, fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 as const, fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s' };
  const btnStyle = { border: 'none', borderRadius: '2px', cursor: 'pointer', fontWeight: 300 as const, minHeight: '44px', fontFamily: "'Noto Sans JP', sans-serif", fontSize: '0.75rem', letterSpacing: '0.08em', transition: 'opacity 0.2s' };

  return (
    <div className="glass-panel" style={{ minHeight: '60vh' }}>
      <h2 style={{ color: 'var(--text-primary)', fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 100, fontSize: '1.4rem', letterSpacing: '-0.02em' }}>{editingId ? '納品編集' : '納品登録'}</h2>
      <p style={{ color: 'var(--text-secondary)', fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>{editingId ? 'Edit Delivery' : 'Delivery Records & Logistics'}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
        <input style={inputStyle} type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} onKeyDown={e => e.preventDefault()} />
        <select style={inputStyle} value={destId} onChange={e => setDestId(Number(e.target.value))}>
          <option value="">納品先を選択...</option>
          {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <h3 style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>納品品目</h3>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <select style={inputStyle} value={item.recipe_id} onChange={e => updateRow(idx, 'recipe_id', Number(e.target.value))}>
            <option value="">品名を選択...</option>
            {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <input style={{ ...inputStyle, width: '80px' }} type="number" value={item.quantity} onChange={e => updateRow(idx, 'quantity', Number(e.target.value))} min={1} />
          <button onClick={() => removeRow(idx)} style={{ ...btnStyle, background: 'transparent', color: 'var(--error)', padding: '0 10px' }}><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>delete</span></button>
        </div>
      ))}
      <button onClick={addRow} style={{ ...btnStyle, background: 'var(--surface-container)', color: 'var(--text-primary)', padding: '8px 16px', marginBottom: '1rem' }}>＋ 品目追加</button>
      <br />
      
      {editingId ? (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleUpdate} style={{ ...btnStyle, background: 'var(--primary-color)', color: 'var(--on-primary)', padding: '12px 24px', flex: 1 }}>記録を更新する</button>
          <button onClick={resetForm} style={{ ...btnStyle, background: 'var(--surface-container-high)', color: 'var(--text-primary)', padding: '12px 24px', flex: 1, border: '1px solid var(--outline-variant)' }}>キャンセル</button>
        </div>
      ) : (
        <button onClick={handleSubmit} style={{ ...btnStyle, background: 'var(--primary-color)', color: 'var(--on-primary)', padding: '12px 24px', width: '100%' }}>納品を登録する</button>
      )}

      <hr style={{ borderColor: 'rgba(169,180,185,0.15)', margin: '2rem 0', borderStyle: 'solid', borderWidth: '0 0 1px 0' }} />

      <h3 style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>納品履歴</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead><tr style={{ borderBottom: '1px solid var(--outline-variant)', color: 'var(--text-secondary)' }}>
            <th style={{ padding: '12px 8px', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, textAlign: 'left' }}>番号</th>
            <th style={{ padding: '12px 8px', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, textAlign: 'left' }}>日付</th>
            <th style={{ padding: '12px 8px', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, textAlign: 'left' }}>納品先</th>
            <th style={{ padding: '12px 8px', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, textAlign: 'left' }}>品目</th>
            <th style={{ padding: '12px 8px', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, textAlign: 'right' }}>操作</th>
          </tr></thead>
          <tbody>{deliveries.map((d: any) => (
            <tr key={d.id} style={{ borderBottom: '1px solid rgba(169,180,185,0.08)' }}>
              <td className="manrope-numbers" style={{ padding: '10px 8px', color: 'var(--primary-color)', fontWeight: 400 }}>{d.delivery_number}</td>
              <td className="manrope-numbers" style={{ padding: '10px 8px', fontWeight: 300 }}>{d.delivery_date}</td>
              <td style={{ padding: '10px 8px', fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}>{d.destination_name}</td>
              <td style={{ padding: '10px 8px', fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300, fontSize: '0.8rem' }}>{d.items?.map((i: any) => `${i.recipe_name}×${i.quantity}`).join(', ')}</td>
              <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                {d.invoice_id ? <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}>請求済</span> :
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleEdit(d)} style={{ ...btnStyle, background: 'transparent', color: 'var(--primary-color)', padding: '4px 10px' }}><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>edit</span></button>
                    <button onClick={() => handleDelete(d.id)} style={{ ...btnStyle, background: 'transparent', color: 'var(--error)', padding: '4px 10px' }}><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>delete</span></button>
                  </div>
                }
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
