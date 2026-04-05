/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
const API = 'http://127.0.0.1:8001/api';

export default function IngredientsManager() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [amount, setAmount] = useState<number | ''>('');
  const [unit, setUnit] = useState('g');

  const fetchIngredients = async () => {
    try {
      const res = await fetch(`${API}/ingredients/`);
      if (res.ok) setIngredients(await res.json());
    } catch (e) {
      console.error('Failed to fetch ingredients:', e);
    }
  };

  useEffect(() => { fetchIngredients(); }, []);

  const handleAdd = async () => {
    if (!name || price === '' || amount === '') return;
    const res = await fetch(`${API}/ingredients/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, unit_price: Number(price), unit_amount: Number(amount), unit })
    });
    if (res.ok) {
      setName(''); setPrice(''); setAmount(''); fetchIngredients();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('削除してよろしいですか？')) return;
    const res = await fetch(`${API}/ingredients/${id}`, { method: 'DELETE' });
    if (res.ok) fetchIngredients();
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>原材料マスター登録</h2>
        <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>材料の仕入れ価格と基準量を入力して、データベースを構築します。</p>
      </div>

      <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '15px', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5, marginLeft: '8px', marginBottom: '4px', display: 'block' }}>品名</label>
          <input className="crystal-input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="例：醤油" />
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5, marginLeft: '8px', marginBottom: '4px', display: 'block' }}>価格(税込)</label>
          <input className="crystal-input" type="number" value={price} onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))} placeholder="¥" />
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5, marginLeft: '8px', marginBottom: '4px', display: 'block' }}>量</label>
          <input className="crystal-input" type="number" value={amount} onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5, marginLeft: '8px', marginBottom: '4px', display: 'block' }}>単位</label>
          <select className="crystal-input" value={unit} onChange={e => setUnit(e.target.value)}>
            <option value="g">g (グラム)</option>
            <option value="ml">ml (ミリリットル)</option>
            <option value="個">個 (個数)</option>
          </select>
        </div>
        <div style={{ paddingBottom: '3px' }}>
          <button className="crystal-btn" onClick={handleAdd} style={{ width: '100%', height: '48px' }}>+ 追加</button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: '600px' }}>
          <thead>
            <tr>
              <th style={{ width: '60px' }}>ID</th>
              <th>材料名</th>
              <th style={{ textAlign: 'right' }}>単価設定</th>
              <th style={{ textAlign: 'right' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map(ing => (
              <tr key={ing.id}>
                <td style={{ opacity: 0.4, fontSize: '0.8rem' }}>#{ing.id}</td>
                <td style={{ fontWeight: 600 }}>{ing.name}</td>
                <td style={{ textAlign: 'right', fontWeight: 500, color: 'var(--accent-pink)' }}>
                  ¥{ing.unit_price?.toLocaleString()} / {ing.unit_amount}{ing.unit}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <span onClick={() => handleDelete(ing.id)} style={{ cursor: 'pointer', opacity: 0.4, fontSize: '0.8rem', padding: '10px' }}>
                    削除 🗑️
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
