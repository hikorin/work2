/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
const API = 'http://127.0.0.1:8001/api';

export default function RecipeEditor() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('tare'); // tare or soup
  const [productionBatch, setProductionBatch] = useState<number | ''>(5000);
  const [servingSize, setServingSize] = useState<number | ''>(100);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [rRes, iRes] = await Promise.all([fetch(`${API}/recipes/`), fetch(`${API}/ingredients/`)]);
      if (rRes.ok) setRecipes(await rRes.json());
      if (iRes.ok) setIngredients(await iRes.json());
    } catch (e) { console.error(e); }
  };

  const addItem = (id: number, isRecipe: boolean) => {
    const list = isRecipe ? recipes : ingredients;
    const item = list.find(x => x.id === id);
    if (!item) return;
    setSelectedItems([...selectedItems, { id, name: item.name, is_recipe: isRecipe, amount: 0 }]);
  };

  const updateItemAmount = (idx: number, val: number) => {
    const newItems = [...selectedItems];
    newItems[idx].amount = val;
    setSelectedItems(newItems);
  };

  const handleCreate = async () => {
    if (!name || !productionBatch || !servingSize || selectedItems.length === 0) return;
    const res = await fetch(`${API}/recipes/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, type, production_batch: Number(productionBatch), serving_size: Number(servingSize),
        items: selectedItems.map(si => ({ item_id: si.id, is_recipe: si.is_recipe, amount: si.amount }))
      })
    });
    if (res.ok) {
      setName(''); setSelectedItems([]); fetchAll();
      const data = await res.json(); fetchAnalysis(data.id);
    }
  };

  const fetchAnalysis = async (id: number) => {
    const res = await fetch(`${API}/recipes/${id}/analysis`);
    if (res.ok) setAnalysis(await res.json());
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px' }}>
        
        {/* Left: Recipe Configuration */}
        <section>
          <div style={{ marginBottom: '25px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '4px' }}>レシピ構成</h2>
            <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>原材料と「かえし」等の入れ子レシピを自由に組み合わせます。</p>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              <select className="crystal-input" onChange={e => addItem(Number(e.target.value.split(':')[0]), e.target.value.includes('R'))}>
                <option value="">+ 材料・レシピを追加</option>
                <optgroup label="原材料">
                  {ingredients.map(i => <option key={`I${i.id}`} value={`${i.id}:I`}>{i.name}</option>)}
                </optgroup>
                <optgroup label="既存レシピ">
                  {recipes.map(r => <option key={`R${r.id}`} value={`${r.id}:R`}>{r.name}</option>)}
                </optgroup>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedItems.map((si, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '14px' }}>
                  <div style={{ flex: 1, fontWeight: 600, fontSize: '0.9rem' }}>{si.name} {si.is_recipe ? '🍜' : '📦'}</div>
                  <input className="crystal-input" style={{ width: '120px' }} type="number" placeholder="量" value={si.amount || ''} onChange={e => updateItemAmount(idx, Number(e.target.value))} />
                  <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>g/ml</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card">
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
               <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5, marginBottom: '5px', display: 'block' }}>レシピ名</label>
                  <input className="crystal-input" value={name} onChange={e => setName(e.target.value)} placeholder="例：特製醤油かえし" />
               </div>
               <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5, marginBottom: '5px', display: 'block' }}>種類</label>
                  <select className="crystal-input" value={type} onChange={e => setType(e.target.value)}>
                    <option value="tare">かえし (Tare)</option>
                    <option value="soup">スープ (Soup)</option>
                  </select>
               </div>
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
               <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5, marginBottom: '5px', display: 'block' }}>仕込み量 (g/ml)</label>
                  <input className="crystal-input" type="number" value={productionBatch} onChange={e => setProductionBatch(Number(e.target.value))} />
               </div>
               <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5, marginBottom: '5px', display: 'block' }}>一杯あたりの使用量 (g/ml)</label>
                  <input className="crystal-input" type="number" value={servingSize} onChange={e => setServingSize(Number(e.target.value))} />
               </div>
             </div>
             <button className="crystal-btn" style={{ width: '100%', marginTop: '20px' }} onClick={handleCreate}>計算・保存</button>
          </div>
        </section>

        {/* Right: Analysis Panel */}
        <aside>
          <div style={{ marginBottom: '25px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '4px' }}>計算レポート</h2>
            <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>最新の原価分析結果を表示します。</p>
          </div>

          {analysis ? (
             <div className="glass-card" style={{ background: 'rgba(255,255,255,0.25)', border: '1px solid var(--accent-pink)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.6, marginBottom: '15px' }}>COST ANALYSIS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>一杯あたりの原価</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-pink)' }}>¥{analysis.cost_per_serving?.toFixed(1)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>仕込み原価 (Total)</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>¥{analysis.total_batch_cost?.toLocaleString()}</div>
                  </div>
                  <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '15px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    仕込み量 {analysis.production_batch}g に対して {analysis.yield_percent}% の歩留まり。
                  </div>
                </div>
             </div>
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', opacity: 0.5, padding: '60px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📊</div>
              データ未算出
            </div>
          )}

          <h3 style={{ marginTop: '30px', marginBottom: '15px', fontSize: '1rem', opacity: 0.7 }}>保存済みレシピ</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recipes.map(r => (
              <div key={r.id} onClick={() => fetchAnalysis(r.id)} style={{ padding: '12px 15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>{r.name}</span>
                <span style={{ opacity: 0.5 }}># {r.id}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
