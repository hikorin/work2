/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
const API = 'http://100.98.193.61:8000/api';

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

  const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: 'white', width: '100%', boxSizing: 'border-box' as const };

  return (
    <div className="glass-panel" style={{ minHeight: '60vh' }}>
      <h2 style={{ color: 'var(--primary-color)' }}>請求書作成</h2>
      <p style={{ color: 'var(--text-secondary)' }}>期間と納品先を指定して請求書を自動生成します。</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', marginTop: '1rem' }}>
        <input style={inputStyle} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} onKeyDown={e => e.preventDefault()} />
        <input style={inputStyle} type="date" value={endDate} onChange={e => setEndDate(e.target.value)} onKeyDown={e => e.preventDefault()} />
        <select style={inputStyle} value={selectedDest} onChange={e => setSelectedDest(Number(e.target.value))}>
          <option value="">納品先を選択...</option>
          {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <button onClick={handleGenerate} style={{ background: '#ff5252', color: '#fff', padding: '10px', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer', minHeight: '44px' }}>請求書を作成</button>
      </div>

      {invoiceResult && !invoiceDetail && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#222', borderRadius: '8px' }}>
          <p>{invoiceResult.message}</p>
          {invoiceResult.total_amount !== undefined && <p>合計: ¥{invoiceResult.total_amount?.toLocaleString()}</p>}
        </div>
      )}

      {invoiceDetail && (
        <div style={{ marginTop: '2rem', background: '#fafafa', color: '#111', padding: '2rem', borderRadius: '8px' }}>
          <h3 style={{ textAlign: 'center', margin: '0 0 1rem' }}>請 求 書</h3>
          <p><strong>請求先:</strong> {invoiceDetail.destination_name} 様</p>
          <p><strong>請求期間:</strong> {invoiceDetail.target_start_date} 〜 {invoiceDetail.target_end_date}</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead><tr style={{ background: '#e5e5e5' }}>
                <th style={{ padding: '8px', border: '1px solid #ccc' }}>納品日</th>
                <th style={{ padding: '8px', border: '1px solid #ccc' }}>番号</th>
                <th style={{ padding: '8px', border: '1px solid #ccc' }}>品名</th>
                <th style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'right' }}>数量</th>
                <th style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'right' }}>単価</th>
                <th style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'right' }}>小計</th>
              </tr></thead>
              <tbody>
                {invoiceDetail.details?.map((d: any, i: number) => (
                  <tr key={i}>
                    <td style={{ padding: '8px', border: '1px solid #ccc' }}>{d.delivery_date}</td>
                    <td style={{ padding: '8px', border: '1px solid #ccc' }}>{d.delivery_number}</td>
                    <td style={{ padding: '8px', border: '1px solid #ccc' }}>{d.recipe_name}</td>
                    <td style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'right' }}>{d.quantity}</td>
                    <td style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'right' }}>¥{d.unit_price?.toLocaleString()}</td>
                    <td style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'right' }}>¥{d.subtotal?.toLocaleString()}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 'bold', background: '#e5e5e5' }}>
                  <td colSpan={5} style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'right' }}>請求金額</td>
                  <td style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'right', fontSize: '1.2rem', color: '#16a34a' }}>¥{invoiceDetail.total_amount?.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {invoices.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>過去の請求書一覧</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead><tr style={{ borderBottom: '1px solid #444', color: '#aaa' }}>
                <th style={{ padding: '8px' }}>ID</th><th style={{ padding: '8px' }}>請求先</th><th style={{ padding: '8px' }}>期間</th><th style={{ padding: '8px' }}>金額</th><th style={{ padding: '8px' }}>状態</th><th style={{ padding: '8px' }}>詳細</th>
              </tr></thead>
              <tbody>{invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '8px' }}>{inv.id}</td>
                  <td style={{ padding: '8px' }}>{inv.destination_name}</td>
                  <td style={{ padding: '8px' }}>{inv.target_start_date}〜{inv.target_end_date}</td>
                  <td style={{ padding: '8px', color: '#4ade80' }}>¥{inv.total_amount?.toLocaleString()}</td>
                  <td style={{ padding: '8px' }}>{inv.status}</td>
                  <td style={{ padding: '8px' }}><button onClick={() => fetchInvoiceDetail(inv.id)} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', minHeight: '36px' }}>表示</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
