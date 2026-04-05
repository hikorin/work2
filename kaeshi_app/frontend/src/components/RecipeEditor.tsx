/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
const API = 'http://127.0.0.1:8001/api';

export default function RecipeEditor() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [recipeName, setRecipeName] = useState('');
  const [deliveryBatches, setDeliveryBatches] = useState(1.0);
  const [batchYield, setBatchYield] = useState(1.0);
  const [bowlAmount, setBowlAmount] = useState(0);
  const [bowlUnit, setBowlUnit] = useState('L');
  const [packingFee, setPackingFee] = useState(0);
  const [targetPrice, setTargetPrice] = useState(0);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [selectedCost, setSelectedCost] = useState<any>(null);
  const [recipeItems, setRecipeItems] = useState<any[]>([]);
  const [itemType, setItemType] = useState('ingredient');
  const [selectedIngId, setSelectedIngId] = useState<number | ''>('');
  const [selectedChildId, setSelectedChildId] = useState<number | ''>('');
  const [itemQty, setItemQty] = useState(0);

  const fetchData = async () => {
    try {
      const [rr, ir] = await Promise.all([fetch(`${API}/recipes/`), fetch(`${API}/ingredients/`)]);
      if (rr.ok) setRecipes(await rr.json());
      if (ir.ok) setIngredients(await ir.json());
    } catch (e) { console.error(e); }
  };
  useEffect(() => { fetchData(); }, []);

  const fetchCostAndItems = async (id: number) => {
    const [cr, ir] = await Promise.all([fetch(`${API}/recipes/${id}/cost`), fetch(`${API}/recipes/${id}/items`)]);
    if (cr.ok) setSelectedCost(await cr.json());
    if (ir.ok) setRecipeItems(await ir.json());
  };

  const handleCreate = async () => {
    if (!recipeName) return;
    await fetch(`${API}/recipes/`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: recipeName, delivery_batches: deliveryBatches, batch_yield: batchYield, bowl_amount: bowlAmount, bowl_unit: bowlUnit, packing_fee: packingFee, target_price: targetPrice })
    });
    setRecipeName(''); setDeliveryBatches(1); setBatchYield(1); setBowlAmount(0); setPackingFee(0); setTargetPrice(0);
    fetchData();
  };

  const handleAddItem = async () => {
    if (!selectedRecipeId || itemQty <= 0) return;
    await fetch(`${API}/recipes/${selectedRecipeId}/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredient_id: itemType === 'ingredient' ? selectedIngId || null : null, child_recipe_id: itemType === 'recipe' ? selectedChildId || null : null, quantity: itemQty })
    });
    setItemQty(0);
    fetchCostAndItems(selectedRecipeId);
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!selectedRecipeId) return;
    await fetch(`${API}/recipes/${selectedRecipeId}/items/${itemId}`, { method: 'DELETE' });
    fetchCostAndItems(selectedRecipeId);
  };

  const handleDeleteRecipe = async (id: number) => {
    if (!confirm('削除しますか？')) return;
    await fetch(`${API}/recipes/${id}`, { method: 'DELETE' });
    if (selectedRecipeId === id) { setSelectedRecipeId(null); setSelectedCost(null); setRecipeItems([]); }
    fetchData();
  };

  const inp = { padding: '8px', background: '#222', color: '#fff', border: '1px solid #555', borderRadius: '4px', width: '100%', boxSizing: 'border-box' as const };

  return (
    <div className="glass-panel" style={{ minHeight: '80vh' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {/* Left */}
        <div>
          <h2 style={{ color: 'var(--primary-color)' }}>レシピ登録</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1.5rem' }}>
            <input style={inp} placeholder="品名" value={recipeName} onChange={e => setRecipeName(e.target.value)} />
            <input style={inp} type="number" step="any" placeholder="販売価格" value={targetPrice || ''} onChange={e => setTargetPrice(Number(e.target.value))} />
            <label style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '4px' }}>納品 = 何回作成分か</label>
            <input style={inp} type="number" step="any" placeholder="何回分 (例: 3)" value={deliveryBatches || ''} onChange={e => setDeliveryBatches(Number(e.target.value))} />
            <label style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '4px' }}>1回の出来上がり量</label>
            <input style={inp} type="number" step="any" placeholder="出来上がり量 (例: 2.0)" value={batchYield || ''} onChange={e => setBatchYield(Number(e.target.value))} />
            <label style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '4px' }}>ラーメン一杯の使用量</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '6px' }}>
              <input style={inp} type="number" step="any" placeholder="一杯の量 (例: 0.06)" value={bowlAmount || ''} onChange={e => setBowlAmount(Number(e.target.value))} />
              <select style={inp} value={bowlUnit} onChange={e => setBowlUnit(e.target.value)}>
                <option value="L">L</option><option value="ml">ml</option><option value="kg">kg</option><option value="g">g</option>
              </select>
            </div>
            <input style={inp} type="number" step="any" placeholder="梱包料" value={packingFee || ''} onChange={e => setPackingFee(Number(e.target.value))} />
            <button onClick={handleCreate} style={{ background: '#4ade80', color: '#000', padding: '10px', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer', minHeight: '44px' }}>＋ レシピ作成</button>
          </div>
          <h3 style={{ color: '#aaa' }}>レシピ一覧</h3>
          {recipes.map(r => (
            <div key={r.id} style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
              <button onClick={() => { setSelectedRecipeId(r.id); fetchCostAndItems(r.id); }} style={{ flex: 1, textAlign: 'left', padding: '10px', background: selectedRecipeId === r.id ? 'rgba(74,222,128,0.2)' : '#222', border: selectedRecipeId === r.id ? '1px solid #4ade80' : '1px solid #444', color: '#fff', borderRadius: '4px', cursor: 'pointer', minHeight: '44px' }}>
                {r.name} <span style={{ color: '#888', fontSize: '0.75rem' }}>({r.delivery_batches}回分)</span>
              </button>
              <button onClick={() => handleDeleteRecipe(r.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', padding: '0 10px', cursor: 'pointer', minHeight: '44px' }}>🗑️</button>
            </div>
          ))}
        </div>

        {/* Right */}
        <div>
          <h2 style={{ color: 'var(--primary-color)' }}>原価計算</h2>
          {selectedRecipeId ? (<>
            {selectedCost && (
              <div style={{ background: 'rgba(255,82,82,0.1)', border: '1px solid #ff5252', padding: '14px', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div><span style={{ color: '#aaa', fontSize: '0.75rem' }}>1回の原価</span><br />¥{selectedCost.batch_cost?.toFixed(0)}</div>
                  <div><span style={{ color: '#aaa', fontSize: '0.75rem' }}>1杯の原価</span><br /><span style={{ color: '#ff8a80', fontSize: '1.3rem', fontWeight: 'bold' }}>¥{selectedCost.bowl_cost?.toFixed(2)}</span></div>
                  <div><span style={{ color: '#aaa', fontSize: '0.75rem' }}>納品原価(梱包込)</span><br />¥{selectedCost.delivery_cost?.toFixed(0)}</div>
                  <div><span style={{ color: '#aaa', fontSize: '0.75rem' }}>販売価格</span><br />¥{selectedCost.target_price?.toFixed(0)}</div>
                  <div style={{ gridColumn: 'span 2', borderTop: '1px dashed #555', paddingTop: '8px' }}>
                    <span style={{ color: '#aaa' }}>粗利</span>
                    <p style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '4px 0', color: selectedCost.gross_profit >= 0 ? '#4ade80' : '#ff5252' }}>
                      ¥{selectedCost.gross_profit?.toFixed(0)} ({selectedCost.gross_profit_margin?.toFixed(1)}%)
                    </p>
                  </div>
                </div>
              </div>
            )}
            {recipeItems.length > 0 && (
              <div style={{ marginBottom: '1.5rem', overflowX: 'auto' }}>
                <h3>構成材料</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead><tr style={{ borderBottom: '1px solid #444', color: '#aaa' }}>
                    <th style={{ padding: '6px' }}>材料</th><th style={{ padding: '6px' }}>1回の使用量</th><th style={{ padding: '6px' }}>削除</th>
                  </tr></thead>
                  <tbody>{recipeItems.map((it: any) => (
                    <tr key={it.id} style={{ borderBottom: '1px solid #333' }}>
                      <td style={{ padding: '6px' }}>{it.name}</td>
                      <td style={{ padding: '6px' }}>{it.quantity}{it.unit_type || ''}</td>
                      <td style={{ padding: '6px' }}><button onClick={() => handleDeleteItem(it.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', minHeight: '36px' }}>🗑️</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
            <div style={{ background: '#2a2a2a', padding: '14px', borderRadius: '8px' }}>
              <h3 style={{ marginTop: 0 }}>材料追加</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <select value={itemType} onChange={e => setItemType(e.target.value)} style={inp}>
                  <option value="ingredient">原材料</option><option value="recipe">別レシピ</option>
                </select>
                {itemType === 'ingredient' ? (
                  <select value={selectedIngId} onChange={e => setSelectedIngId(Number(e.target.value))} style={inp}>
                    <option value="">選択...</option>
                    {ingredients.map(i => <option key={i.id} value={i.id}>{i.name} (¥{i.unit_price?.toFixed(1)}/{i.unit_type})</option>)}
                  </select>
                ) : (
                  <select value={selectedChildId} onChange={e => setSelectedChildId(Number(e.target.value))} style={inp}>
                    <option value="">選択...</option>
                    {recipes.filter(r => r.id !== selectedRecipeId).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                )}
              </div>
              <label style={{ color: '#aaa', fontSize: '0.8rem' }}>1回作るときの使用量</label>
              <input style={{ ...inp, marginBottom: '8px' }} type="number" step="any" placeholder="例: 1.8" value={itemQty || ''} onChange={e => setItemQty(Number(e.target.value))} />
              <button onClick={handleAddItem} style={{ width: '100%', background: '#3b82f6', color: '#fff', padding: '10px', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer', minHeight: '44px' }}>材料を追加</button>
            </div>
          </>) : <p style={{ color: '#888' }}>左からレシピを選択</p>}
        </div>
      </div>
    </div>
  );
}
