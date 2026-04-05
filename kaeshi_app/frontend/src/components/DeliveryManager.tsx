/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
const API = 'http://127.0.0.1:8001/api';

export default function DeliveryManager() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [selectedDest, setSelectedDest] = useState<number | ''>('');
  const [selectedRecipe, setSelectedRecipe] = useState<number | ''>('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [destRes, recRes, delRes] = await Promise.all([
        fetch(`${API}/destinations/`), fetch(`${API}/recipes/`), fetch(`${API}/deliveries/`)
      ]);
      if (destRes.ok) setDestinations(await destRes.json());
      if (recRes.ok) setRecipes(await recRes.json());
      if (delRes.ok) setDeliveries(await delRes.json());
    } catch (e) { console.error(e); }
  };

  const handleAdd = async () => {
    if (!selectedDest || !selectedRecipe || !amount || !date) return;
    const res = await fetch(`${API}/deliveries/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination_id: selectedDest, recipe_id: selectedRecipe, quantity: Number(amount), delivery_date: date })
    });
    if (res.ok) { setAmount(''); fetchAll(); }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>納品トラック</h2>
        <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>各拠点への商品供給を正確に記録・追跡します。</p>
      </div>

      <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '15px', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5, marginLeft: '8px', marginBottom: '5px', display: 'block' }}>日付</label>
          <input className="crystal-input" type="date" value={date} onChange={e => setDate(e.target.value)} onKeyDown={e => e.preventDefault()} />
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5, marginLeft: '8px', marginBottom: '5px', display: 'block' }}>納品先</label>
          <select className="crystal-input" value={selectedDest} onChange={e => setSelectedDest(Number(e.target.value))}>
            <option value="">配送先を選択...</option>
            {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5, marginLeft: '8px', marginBottom: '5px', display: 'block' }}>品目</label>
          <select className="crystal-input" value={selectedRecipe} onChange={e => setSelectedRecipe(Number(e.target.value))}>
            <option value="">レシピを選択...</option>
            {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5, marginLeft: '8px', marginBottom: '5px', display: 'block' }}>数量</label>
          <input className="crystal-input" type="number" placeholder="単位(ml)" value={amount} onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
        <div style={{ paddingBottom: '3px' }}>
          <button className="crystal-btn" onClick={handleAdd} style={{ width: '100%', height: '48px' }}>記録 🛰️</button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: '600px' }}>
          <thead>
            <tr>
              <th style={{ width: '80px' }}>NO.</th>
              <th style={{ width: '120px' }}>日付</th>
              <th>配送先・品目</th>
              <th style={{ textAlign: 'right' }}>数量</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.slice().reverse().map(del => (
              <tr key={del.id}>
                <td style={{ opacity: 0.4, fontSize: '0.8rem' }}>D-{del.id.toString().padStart(4, '0')}</td>
                <td style={{ fontWeight: 500 }}>{del.delivery_date}</td>
                <td>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{del.recipe_name}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '2px' }}>TO: {del.destination_name}</div>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--accent-pink)', fontSize: '1rem' }}>
                  {del.quantity?.toLocaleString()} <span style={{ fontSize: '0.7rem', fontWeight: 400, opacity: 0.6 }}>ml</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
