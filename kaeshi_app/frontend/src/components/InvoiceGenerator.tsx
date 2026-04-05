/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
const API = `http://${window.location.hostname}:8001/api`;

export default function InvoiceGenerator() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [selectedDest, setSelectedDest] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [invoiceResult, setInvoiceResult] = useState<any>(null);
  const [invoiceDetail, setInvoiceDetail] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    setStartDate(new Date(y, m, 1).toISOString().split('T')[0]);
    setEndDate(new Date(y, m + 1, 0).toISOString().split('T')[0]);
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [dRes, iRes] = await Promise.all([fetch(`${API}/destinations/`), fetch(`${API}/invoices/`)]);
      if (dRes.ok) setDestinations(await dRes.json());
      if (iRes.ok) setInvoices(await iRes.json());
    } catch (e) { console.error(e); }
  };

  const handleGenerate = async () => {
    if (!selectedDest || !startDate || !endDate) return;
    const res = await fetch(`${API}/invoices/generate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination_id: selectedDest, start_date: startDate, end_date: endDate })
    });
    if (res.ok) {
      const data = await res.json();
      setInvoiceResult(data);
      if (data.invoice?.id) fetchInvoiceDetail(data.invoice.id);
      fetchAll();
    }
  };

  const fetchInvoiceDetail = async (id: number) => {
    const res = await fetch(`${API}/invoices/${id}`);
    if (res.ok) setInvoiceDetail(await res.json());
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>請求書生成</h2>
        <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>納品実績に基づいた正確な請求書を瞬時に出力します。</p>
      </div>

      <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '15px', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <label style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 800, marginBottom: '5px', display: 'block' }}>開始日</label>
          <input className="crystal-input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} onKeyDown={e => e.preventDefault()} />
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 800, marginBottom: '5px', display: 'block' }}>終了日</label>
          <input className="crystal-input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} onKeyDown={e => e.preventDefault()} />
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 800, marginBottom: '5px', display: 'block' }}>請求先</label>
          <select className="crystal-input" value={selectedDest} onChange={e => setSelectedDest(Number(e.target.value))}>
            <option value="">納品先を選択...</option>
            {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div style={{ paddingBottom: '3px' }}>
          <button className="crystal-btn" onClick={handleGenerate} style={{ width: '100%', height: '48px' }}>作成 🏗️</button>
        </div>
      </div>

      {invoiceDetail && (
        <div className="glass-card" style={{ background: 'white', color: '#1a1b4b', padding: '50px', borderRadius: '30px', boxShadow: '0 20px 60px rgba(30, 27, 75, 0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.8rem', letterSpacing: '0.3em', color: 'var(--bg-secondary)', margin: 0 }}>INVOICE</h3>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.5, fontWeight: 700 }}>宛先：</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{invoiceDetail.destination_name} 様</div>
            </div>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
            <thead>
              <tr style={{ background: 'rgba(125, 132, 255, 0.1)', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700 }}>
                <th style={{ padding: '15px' }}>日付</th>
                <th style={{ padding: '15px' }}>品名</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>数量</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>単価</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>小計</th>
              </tr>
            </thead>
            <tbody>
              {invoiceDetail.details?.map((d: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid #f0f1f5', fontSize: '0.85rem', color: '#1a1b4b' }}>
                  <td style={{ padding: '15px' }}>{d.delivery_date}</td>
                  <td style={{ padding: '15px', fontWeight: 700 }}>{d.recipe_name}</td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>{d.quantity}</td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>¥{d.unit_price?.toLocaleString()}</td>
                  <td style={{ padding: '15px', textAlign: 'right', fontWeight: 700 }}>¥{d.subtotal?.toLocaleString()}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={4} style={{ padding: '30px 15px 15px', textAlign: 'right', fontWeight: 800, fontSize: '0.9rem' }}>合計請求金額</td>
                <td style={{ padding: '30px 15px 15px', textAlign: 'right', fontSize: '2rem', fontWeight: 900, color: 'var(--accent-pink)' }}>¥{invoiceDetail.total_amount?.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          
          <div style={{ textAlign: 'center' }}>
            <button className="crystal-btn" onClick={() => window.print()}>PDF出力 / 印刷 🖨️</button>
          </div>
        </div>
      )}

      {invoices.length > 0 && (
        <div style={{ marginTop: '50px' }}>
          <h3 style={{ fontSize: '1rem', opacity: 0.6, marginBottom: '20px' }}>過去の発行履歴</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {invoices.map(inv => (
              <div key={inv.id} onClick={() => fetchInvoiceDetail(inv.id)} className="glass-card" style={{ padding: '15px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0 }}>
                <div>
                  <span style={{ fontWeight: 800, color: 'var(--accent-pink)', marginRight: '15px' }}>#{inv.id.toString().padStart(4, '0')}</span>
                  <span style={{ fontWeight: 600 }}>{inv.destination_name}</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>¥{inv.total_amount?.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
