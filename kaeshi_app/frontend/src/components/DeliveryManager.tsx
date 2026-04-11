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

  const handleDownloadPdf = async (id: number, number: string) => {
    try {
      const res = await fetch(`${API}/deliveries/${id}/pdf`);
      if (!res.ok) throw new Error('PDFの生成に失敗しました');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `delivery_${number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="k-card" style={{ minHeight: '60vh' }}>
      <div className="no-print">
        <h2 className="k-heading">{editingId ? '納品編集' : '納品登録'}</h2>
        <p className="k-subheading">{editingId ? 'Edit Delivery' : 'Delivery Records & Logistics'}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          <input 
            className="k-input" 
            type="date" 
            value={deliveryDate} 
            onChange={e => setDeliveryDate(e.target.value)} 
            onKeyDown={e => e.preventDefault()} 
            style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', minWidth: 0 }}
          />
          <select className="k-select" value={destId} onChange={e => setDestId(Number(e.target.value))}>
            <option value="">納品先を選択...</option>
            {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        <h3 className="k-subheading" style={{ fontSize: '0.65rem', fontWeight: 600 }}>納品品目</h3>
        {items.map((item, idx) => (
          <div key={idx} className="k-grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <select className="k-select" value={item.recipe_id} onChange={e => updateRow(idx, 'recipe_id', Number(e.target.value))}>
              <option value="">品名を選択...</option>
              {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <input className="k-input" style={{ width: '80px' }} type="number" value={item.quantity} onChange={e => updateRow(idx, 'quantity', Number(e.target.value))} min={1} />
            <button onClick={() => removeRow(idx)} className="k-btn k-btn-icon k-btn-danger"><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>delete</span></button>
          </div>
        ))}
        <button onClick={addRow} className="k-btn k-btn-secondary" style={{ padding: '8px 16px', marginBottom: '1rem' }}>＋ 品目追加</button>
        <br />
        
        {editingId ? (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={handleUpdate} className="k-btn k-btn-primary" style={{ padding: '12px 24px', flex: 1 }}>記録を更新する</button>
            <button onClick={resetForm} className="k-btn k-btn-secondary" style={{ padding: '12px 24px', flex: 1 }}>キャンセル</button>
          </div>
        ) : (
          <button onClick={handleSubmit} className="k-btn k-btn-primary" style={{ padding: '12px 24px', width: '100%' }}>納品を登録する</button>
        )}

        <hr style={{ borderColor: 'rgba(169,180,185,0.15)', margin: '2rem 0', borderStyle: 'solid', borderWidth: '0 0 1px 0' }} />
      </div>

      <h3 className="k-subheading" style={{ fontSize: '0.65rem', fontWeight: 600 }}>納品履歴</h3>
      <div className="k-table-wrapper">
        <table className="k-table">
          <thead><tr>
            <th className="k-th">番号</th>
            <th className="k-th">日付</th>
            <th className="k-th">納品先</th>
            <th className="k-th">品目</th>
            <th className="k-th" style={{ textAlign: 'right' }}>操作</th>
          </tr></thead>
          <tbody>{deliveries.map((d: any) => (
            <tr key={d.id}>
              <td className="k-td num" style={{ color: 'var(--primary-color)', fontWeight: 400 }}>{d.delivery_number}</td>
              <td className="k-td num">{d.delivery_date}</td>
              <td className="k-td">{d.destination_name}</td>
              <td className="k-td" style={{ fontSize: '0.8rem' }}>{d.items?.map((i: any) => `${i.recipe_name}×${i.quantity}`).join(', ')}</td>
              <td className="k-td right">
                <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                  <button onClick={() => handleDownloadPdf(d.id, d.delivery_number)} className="k-btn k-btn-icon k-btn-success" title="PDFダウンロード"><span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>download</span></button>
                  <button onClick={() => window.print()} className="k-btn k-btn-icon k-btn-primary no-print" title="印刷"><span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>print</span></button>
                  {d.invoice_id ? 
                    <span style={{ 
                      fontSize: '0.65rem', 
                      background: 'var(--surface-container-high)', 
                      color: 'var(--text-secondary)', 
                      padding: '4px 10px', 
                      borderRadius: '12px',
                      fontWeight: 500
                    }}>請求済</span> :
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => handleEdit(d)} className="k-btn k-btn-icon no-print" title="編集"><span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>edit_note</span></button>
                      <button onClick={() => handleDelete(d.id)} className="k-btn k-btn-icon k-btn-danger no-print" title="削除"><span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>delete_forever</span></button>
                    </div>
                  }
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
