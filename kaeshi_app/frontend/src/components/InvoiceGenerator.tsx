/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
const API = 'http://127.0.0.1:8001/api';

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
    } else { const err = await res.json(); alert(err.detail); }
  };

  const fetchInvoiceDetail = async (id: number) => {
    const res = await fetch(`${API}/invoices/${id}`);
    if (res.ok) setInvoiceDetail(await res.json());
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 500, marginBottom: '20px' }}>請求書ファクトリー</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '25px' }}>期間と納品先を指定して、プロフェッショナルな請求書を瞬時に生成します。</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div>
          <label style={{ fontSize: '0.75rem', opacity: 0.7, marginLeft: '8px' }}>開始日</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} onKeyDown={e => e.preventDefault()} />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', opacity: 0.7, marginLeft: '8px' }}>終了日</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} onKeyDown={e => e.preventDefault()} />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', opacity: 0.7, marginLeft: '8px' }}>請求先</label>
          <select value={selectedDest} onChange={e => setSelectedDest(Number(e.target.value))}>
            <option value="">納品先を選択...</option>
            {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button onClick={handleGenerate} style={{ width: '100%', background: 'white', color: 'var(--bg-secondary)', fontWeight: 'bold' }}>請求書を作成</button>
        </div>
      </div>

      {invoiceResult && !invoiceDetail && (
        <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.1)', marginBottom: '30px' }}>
          <p style={{ fontWeight: 500 }}>{invoiceResult.message}</p>
          {invoiceResult.total_amount !== undefined && 
            <p style={{ fontSize: '1.5rem', color: 'var(--accent-pink)', marginTop: '10px' }}>
              合計金額: ¥{invoiceResult.total_amount?.toLocaleString()}
            </p>
          }
        </div>
      )}

      {invoiceDetail && (
        <div className="glass-panel" style={{ background: 'white', color: '#1a1a2e', padding: '40px', borderRadius: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '2rem', letterSpacing: '0.2em', color: 'var(--bg-secondary)', margin: 0 }}>INVOICE</h3>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>請求先</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{invoiceDetail.destination_name} 様</div>
            </div>
          </div>
          
          <p style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '20px' }}>期間: {invoiceDetail.target_start_date} 〜 {invoiceDetail.target_end_date}</p>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(125, 132, 255, 0.05)', textAlign: 'left', fontSize: '0.8rem' }}>
                  <th style={{ padding: '15px', borderBottom: '1px solid #eee' }}>日付</th>
                  <th style={{ padding: '15px', borderBottom: '1px solid #eee' }}>品名</th>
                  <th style={{ padding: '15px', borderBottom: '1px solid #eee', textAlign: 'right' }}>数量</th>
                  <th style={{ padding: '15px', borderBottom: '1px solid #eee', textAlign: 'right' }}>単価</th>
                  <th style={{ padding: '15px', borderBottom: '1px solid #eee', textAlign: 'right' }}>小計</th>
                </tr>
              </thead>
              <tbody>
                {invoiceDetail.details?.map((d: any, i: number) => (
                  <tr key={i} style={{ fontSize: '0.9rem' }}>
                    <td style={{ padding: '15px', borderBottom: '1px solid #f5f5f5' }}>{d.delivery_date}</td>
                    <td style={{ padding: '15px', borderBottom: '1px solid #f5f5f5' }}>{d.recipe_name}</td>
                    <td style={{ padding: '15px', borderBottom: '1px solid #f5f5f5', textAlign: 'right' }}>{d.quantity}</td>
                    <td style={{ padding: '15px', borderBottom: '1px solid #f5f5f5', textAlign: 'right' }}>¥{d.unit_price?.toLocaleString()}</td>
                    <td style={{ padding: '15px', borderBottom: '1px solid #f5f5f5', textAlign: 'right' }}>¥{d.subtotal?.toLocaleString()}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={4} style={{ padding: '20px 15px', textAlign: 'right', fontWeight: 600 }}>合計金額</td>
                  <td style={{ padding: '20px 15px', textAlign: 'right', fontSize: '1.5rem', fontWeight: 700, color: '#ff4d6d' }}>¥{invoiceDetail.total_amount?.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <button className="secondary" style={{ color: 'var(--bg-secondary)', borderColor: 'var(--bg-secondary)' }} onClick={() => window.print()}>PDFとして保存 / 印刷</button>
          </div>
        </div>
      )}

      <div style={{ margin: '40px 0', borderTop: '1px solid var(--glass-border)' }}></div>

      <h3 style={{ marginBottom: '15px', fontSize: '1.2rem', opacity: 0.9 }}>過去の請求書アーカイブ</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--glass-border)', textAlign: 'left', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th style={{ padding: '12px' }}>請求先</th>
              <th style={{ padding: '12px' }}>期間</th>
              <th style={{ padding: '12px' }}>合計金額</th>
              <th style={{ padding: '12px' }}>アクション</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '12px' }}>#{inv.id}</td>
                <td style={{ padding: '12px', fontWeight: 500 }}>{inv.destination_name}</td>
                <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{inv.target_start_date}〜{inv.target_end_date}</td>
                <td style={{ padding: '12px', color: 'var(--accent-pink)', fontWeight: 600 }}>¥{inv.total_amount?.toLocaleString()}</td>
                <td style={{ padding: '12px' }}>
                  <span onClick={() => fetchInvoiceDetail(inv.id)} style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: '15px', fontSize: '0.8rem' }}>表示 👁️</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
