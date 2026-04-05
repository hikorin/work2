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

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        
        {/* Left: Recipe Creation & Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 500 }}>レシピ設計</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input placeholder="品名" value={recipeName} onChange={e => setRecipeName(e.target.value)} />
            <input type="number" placeholder="予定販売価格 (¥)" value={targetPrice || ''} onChange={e => setTargetPrice(Number(e.target.value))} />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', opacity: 0.7, marginLeft: '8px' }}>納品回数</label>
                <input type="number" placeholder="納品回数" value={deliveryBatches || ''} onChange={e => setDeliveryBatches(Number(e.target.value))} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', opacity: 0.7, marginLeft: '8px' }}>1回の量</label>
                <input type="number" placeholder="出来量" value={batchYield || ''} onChange={e => setBatchYield(Number(e.target.value))} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '10px' }}>
              <input type="number" placeholder="一杯分" value={bowlAmount || ''} onChange={e => setBowlAmount(Number(e.target.value))} />
              <select value={bowlUnit} onChange={e => setBowlUnit(e.target.value)}>
                <option value="L">L</option><option value="ml">ml</option><option value="kg">kg</option><option value="g">g</option>
              </select>
            </div>
            
            <input type="number" placeholder="梱包料 (¥)" value={packingFee || ''} onChange={e => setPackingFee(Number(e.target.value))} />
            <button onClick={handleCreate} style={{ background: '#ffffff', color: 'var(--bg-secondary)', fontWeight: 'bold' }}>＋ レシピ作成</button>
          </div>

          <h3 style={{ marginTop: '20px', color: 'rgba(255,255,255,0.7)' }}>登録済みレシピ 一覧</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recipes.map(r => (
              <div key={r.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div 
                  onClick={() => { setSelectedRecipeId(r.id); fetchCostAndItems(r.id); }}
                  className="glass-panel"
                  style={{ 
                    flex: 1, 
                    padding: '15px', 
                    margin: 0,
                    cursor: 'pointer',
                    background: selectedRecipeId === r.id ? 'white' : 'rgba(255,255,255,0.1)',
                    color: selectedRecipeId === r.id ? 'var(--bg-secondary)' : 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{r.name}</span>
                  <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{r.delivery_batches}回分</span>
                </div>
                <span onClick={() => handleDeleteRecipe(r.id)} style={{ cursor: 'pointer', opacity: 0.5 }}>🗑️</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Cost Analysis & Item List */}
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 500, marginBottom: '20px' }}>原価分析</h2>
          {selectedRecipeId ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {selectedCost && (
                <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--accent-pink)', padding: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>1杯あたりの原価</span>
                      <div style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--accent-pink)' }}>¥{selectedCost.bowl_cost?.toFixed(2)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>粗利率</span>
                      <div style={{ fontSize: '2rem', fontWeight: 500, color: selectedCost.gross_profit_margin >= 30 ? '#B2FFD6' : '#FFC48C' }}>
                        {selectedCost.gross_profit_margin?.toFixed(1)}%
                      </div>
                    </div>
                    <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '15px', marginTop: '10px' }}>
                      <div><span style={{ fontSize: '0.75rem', opacity: 0.5 }}>1回の総原価</span><br />¥{selectedCost.batch_cost?.toLocaleString()}</div>
                      <div><span style={{ fontSize: '0.75rem', opacity: 0.5 }}>納品原価</span><br />¥{selectedCost.delivery_cost?.toLocaleString()}</div>
                      <div><span style={{ fontSize: '0.75rem', opacity: 0.5 }}>販売価格</span><br />¥{selectedCost.target_price?.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div style={{ overflowX: 'auto' }}>
                <h3 style={{ marginBottom: '15px', fontSize: '1.2rem', opacity: 0.9 }}>構成材料リスト</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--glass-border)', textAlign: 'left', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                      <th style={{ padding: '10px' }}>名称</th>
                      <th style={{ padding: '10px' }}>使用量</th>
                      <th style={{ padding: '10px' }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipeItems.map(it => (
                      <tr key={it.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        <td style={{ padding: '10px' }}>{it.name}</td>
                        <td style={{ padding: '10px' }}>{it.quantity}{it.unit_type || ''}</td>
                        <td style={{ padding: '10px' }}><span onClick={() => handleDeleteItem(it.id)} style={{ cursor: 'pointer' }}>🗑️</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Item Form */}
              <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.05)', padding: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>材料を追加</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <select value={itemType} onChange={e => setItemType(e.target.value)}>
                    <option value="ingredient">原材料</option><option value="recipe">別レシピ</option>
                  </select>
                  {itemType === 'ingredient' ? (
                    <select value={selectedIngId} onChange={e => setSelectedIngId(Number(e.target.value))}>
                      <option value="">選択...</option>
                      {ingredients.map(i => <option key={i.id} value={i.id}>{i.name} (¥{i.unit_price?.toFixed(1)}/{i.unit_type})</option>)}
                    </select>
                  ) : (
                    <select value={selectedChildId} onChange={e => setSelectedChildId(Number(e.target.value))}>
                      <option value="">選択...</option>
                      {recipes.filter(r => r.id !== selectedRecipeId).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="number" placeholder="使用量" value={itemQty || ''} onChange={e => setItemQty(Number(e.target.value))} style={{ flex: 1 }} />
                  <button onClick={handleAddItem} style={{ background: '#ffffff', color: 'var(--bg-secondary)' }}>追加</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', borderStyle: 'dashed', background: 'transparent' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>左のリストからレシピを選んで解析を開始</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
