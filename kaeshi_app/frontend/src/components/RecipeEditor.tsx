/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
const API = '/api';

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

  const handleUpdate = async () => {
    if (!selectedRecipeId || !recipeName) return;
    await fetch(`${API}/recipes/${selectedRecipeId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: recipeName, delivery_batches: deliveryBatches, batch_yield: batchYield, bowl_amount: bowlAmount, bowl_unit: bowlUnit, packing_fee: packingFee, target_price: targetPrice })
    });
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
    const res = await fetch(`${API}/recipes/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      alert(err.detail || '削除に失敗しました（他のデータと紐付いている可能性があります）');
      return;
    }
    if (selectedRecipeId === id) { setSelectedRecipeId(null); setSelectedCost(null); setRecipeItems([]); }
    fetchData();
  };

  const handleSelectRecipe = (r: any) => {
    setSelectedRecipeId(r.id);
    setRecipeName(r.name);
    setDeliveryBatches(r.delivery_batches);
    setBatchYield(r.batch_yield);
    setBowlAmount(r.bowl_amount);
    setBowlUnit(r.bowl_unit);
    setPackingFee(r.packing_fee);
    setTargetPrice(r.target_price);
    fetchCostAndItems(r.id);
  };

  const resetForm = () => {
    setSelectedRecipeId(null); setSelectedCost(null); setRecipeItems([]);
    setRecipeName(''); setDeliveryBatches(1); setBatchYield(1); setBowlAmount(0); setPackingFee(0); setTargetPrice(0);
  };

  return (
    <div className="k-card" style={{ minHeight: '80vh' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {/* Left */}
        <div>
          <h2 className="k-heading">{selectedRecipeId ? 'レシピ編集' : 'レシピ登録'}</h2>
          <p className="k-subheading" style={{ marginTop: '-0.5rem' }}>{selectedRecipeId ? 'Edit Recipe' : 'Recipe Registration'}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1.5rem' }}>
            <input className="k-input" placeholder="品名" value={recipeName} onChange={e => setRecipeName(e.target.value)} />
            <input className="k-input" type="number" step="any" placeholder="販売価格" value={targetPrice || ''} onChange={e => setTargetPrice(Number(e.target.value))} />
            <label className="k-label">納品 = 何回作成分か</label>
            <input className="k-input" type="number" step="any" placeholder="何回分 (例: 3)" value={deliveryBatches || ''} onChange={e => setDeliveryBatches(Number(e.target.value))} />
            <label className="k-label">1回の出来上がり量</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '6px' }}>
              <input className="k-input" type="number" step="any" placeholder="出来上がり量 (例: 2.0)" value={batchYield || ''} onChange={e => setBatchYield(Number(e.target.value))} />
              <div className="k-td center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: 'none' }}>{bowlUnit}</div>
            </div>
            <label className="k-label">ラーメン一杯の使用量</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '6px' }}>
              <input className="k-input" type="number" step="any" placeholder="一杯の量 (例: 0.06)" value={bowlAmount || ''} onChange={e => setBowlAmount(Number(e.target.value))} />
              <select className="k-select" value={bowlUnit} onChange={e => setBowlUnit(e.target.value)}>
                <option value="L">L</option><option value="ml">ml</option><option value="kg">kg</option><option value="g">g</option>
              </select>
            </div>
            <input className="k-input" type="number" step="any" placeholder="梱包料" value={packingFee || ''} onChange={e => setPackingFee(Number(e.target.value))} />
            
            {selectedRecipeId ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleUpdate} className="k-btn k-btn-primary" style={{ flex: 1 }}>更新</button>
                <button onClick={resetForm} className="k-btn k-btn-secondary" style={{ flex: 1 }}>キャンセル</button>
              </div>
            ) : (
              <button onClick={handleCreate} className="k-btn k-btn-primary">＋ レシピ作成</button>
            )}
            
          </div>
          <h3 className="k-subheading" style={{ fontSize: '0.65rem', fontWeight: 600 }}>レシピ一覧</h3>
          {recipes.map(r => (
            <div key={r.id} style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
              <button onClick={() => handleSelectRecipe(r)} className="k-btn" style={{ flex: 1, textAlign: 'left', background: selectedRecipeId === r.id ? 'var(--primary-container)' : 'var(--surface-container-low)', border: selectedRecipeId === r.id ? '1px solid var(--primary-color)' : '1px solid rgba(169,180,185,0.15)', color: 'var(--text-primary)', justifyContent: 'flex-start' }}>
                {r.name} <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>({r.delivery_batches}回分)</span>
              </button>
              <button onClick={() => handleDeleteRecipe(r.id)} className="k-btn k-btn-icon k-btn-danger" style={{ border: '1px solid rgba(169,180,185,0.15)', minHeight: '44px' }}><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>delete</span></button>
            </div>
          ))}
        </div>

        {/* Right */}
        <div>
          <h2 className="k-heading">原価計算</h2>
          <p className="k-subheading" style={{ marginTop: '-0.5rem' }}>Cost Analysis</p>
          {selectedRecipeId ? (<>
            {selectedCost && (
              <div style={{ background: 'var(--primary-container)', border: '1px solid rgba(86,94,116,0.15)', padding: '14px', borderRadius: '2px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div><span className="k-subheading" style={{ fontWeight: 600 }}>1回の原価</span><br /><span className="num" style={{ fontWeight: 300 }}>¥{selectedCost.batch_cost?.toFixed(0)}</span></div>
                  <div><span className="k-subheading" style={{ fontWeight: 600 }}>1杯の原価</span><br /><span className="num" style={{ color: 'var(--primary-dim)', fontSize: '1.3rem', fontWeight: 400 }}>¥{selectedCost.bowl_cost?.toFixed(2)}</span></div>
                  <div><span className="k-subheading" style={{ fontWeight: 600 }}>納品原価(梱包込)</span><br /><span className="num" style={{ fontWeight: 300 }}>¥{selectedCost.delivery_cost?.toFixed(0)}</span></div>
                  <div><span className="k-subheading" style={{ fontWeight: 600 }}>販売価格</span><br /><span className="num" style={{ fontWeight: 300 }}>¥{selectedCost.target_price?.toFixed(0)}</span></div>
                  <div style={{ gridColumn: 'span 2', borderTop: '1px solid rgba(86,94,116,0.12)', paddingTop: '8px' }}>
                    <span className="k-subheading" style={{ fontWeight: 600 }}>粗利</span>
                    <p className="num" style={{ fontSize: '1.4rem', fontWeight: 400, margin: '4px 0', color: selectedCost.gross_profit >= 0 ? 'var(--accent-green)' : 'var(--error)' }}>
                      ¥{selectedCost.gross_profit?.toFixed(0)} ({selectedCost.gross_profit_margin?.toFixed(1)}%)
                    </p>
                  </div>
                </div>
              </div>
            )}
            {recipeItems.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 className="k-subheading" style={{ fontSize: '0.65rem', fontWeight: 600 }}>構成材料</h3>
                <div className="k-table-wrapper">
                  <table className="k-table">
                    <thead><tr>
                      <th className="k-th">材料</th>
                      <th className="k-th">1回の使用量</th>
                      <th className="k-th right">削除</th>
                    </tr></thead>
                    <tbody>{recipeItems.map((it: any) => (
                      <tr key={it.id}>
                        <td className="k-td">{it.name}</td>
                        <td className="k-td num">{it.quantity}{it.unit_type || ''}</td>
                        <td className="k-td right"><button onClick={() => handleDeleteItem(it.id)} className="k-btn k-btn-icon k-btn-danger" style={{ minHeight: '36px' }}><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>delete</span></button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            )}
            <div style={{ background: 'var(--surface-container-low)', padding: '14px', borderRadius: '2px', border: '1px solid rgba(169,180,185,0.1)' }}>
              <h3 className="k-subheading" style={{ marginTop: 0, fontSize: '0.65rem', fontWeight: 600 }}>材料追加</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <select value={itemType} onChange={e => setItemType(e.target.value)} className="k-select">
                  <option value="ingredient">原材料</option><option value="recipe">別レシピ</option>
                </select>
                {itemType === 'ingredient' ? (
                  <select value={selectedIngId} onChange={e => setSelectedIngId(Number(e.target.value))} className="k-select">
                    <option value="">選択...</option>
                    {ingredients.map(i => <option key={i.id} value={i.id}>{i.name} (¥{i.unit_price?.toFixed(1)}/{i.unit_type})</option>)}
                  </select>
                ) : (
                  <select value={selectedChildId} onChange={e => setSelectedChildId(Number(e.target.value))} className="k-select">
                    <option value="">選択...</option>
                    {recipes.filter(r => r.id !== selectedRecipeId).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                )}
              </div>
              <label className="k-label">1回作るときの使用量</label>
              <input className="k-input" style={{ marginBottom: '8px' }} type="number" step="any" placeholder="例: 1.8" value={itemQty || ''} onChange={e => setItemQty(Number(e.target.value))} />
              <button onClick={handleAddItem} className="k-btn k-btn-primary" style={{ width: '100%' }}>材料を追加</button>
            </div>
          </>) : <p className="k-td" style={{ borderBottom: 'none' }}>左からレシピを選択</p>}
        </div>
      </div>
    </div>
  );
}
