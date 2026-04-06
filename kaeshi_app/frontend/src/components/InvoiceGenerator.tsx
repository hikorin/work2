/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
const API = 'http://100.98.193.61:8080/api';

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

  const inputStyle = { padding: '10px', borderRadius: '0', border: 'none', borderBottom: '1px solid var(--outline-variant)', background: 'transparent', color: 'var(--text-primary)', width: '100%', boxSizing: 'border-box' as const, fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 as const, fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s' };

  return (
    <div className="glass-panel" style={{ minHeight: '60vh' }}>
      <h2 style={{ color: 'var(--text-primary)', fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 100, fontSize: '1.4rem', letterSpacing: '-0.02em' }}>請求書作成</h2>
      <p style={{ color: 'var(--text-secondary)', fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>Automated Invoicing & Archives</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', marginTop: '1rem' }}>
        <input style={inputStyle} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} onKeyDown={e => e.preventDefault()} />
        <input style={inputStyle} type="date" value={endDate} onChange={e => setEndDate(e.target.value)} onKeyDown={e => e.preventDefault()} />
        <select style={inputStyle} value={selectedDest} onChange={e => setSelectedDest(Number(e.target.value))}>
          <option value="">納品先を選択...</option>
          {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <button onClick={handleGenerate} style={{ background: 'var(--primary-color)', color: 'var(--on-primary)', padding: '10px', fontWeight: 300, border: 'none', borderRadius: '2px', cursor: 'pointer', minHeight: '44px', fontFamily: "'Noto Sans JP', sans-serif", fontSize: '0.75rem', letterSpacing: '0.08em', transition: 'opacity 0.2s' }}>請求書を作成</button>
      </div>

      {invoiceResult && !invoiceDetail && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--surface-container-low)', borderRadius: '2px', border: '1px solid rgba(169,180,185,0.1)' }}>
          <p style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}>{invoiceResult.message}</p>
          {invoiceResult.total_amount !== undefined && <p className="manrope-numbers" style={{ fontWeight: 400 }}>合計: ¥{invoiceResult.total_amount?.toLocaleString()}</p>}
        </div>
      )}

      {invoiceDetail && (
        <div style={{ marginTop: '2rem', background: '#ffffff', color: 'var(--text-primary)', padding: '2rem', borderRadius: '2px', border: '1px solid rgba(169,180,185,0.15)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h3 style={{ textAlign: 'center', margin: '0 0 1rem', fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 100, fontSize: '1.3rem', letterSpacing: '0.3em' }}>請 求 書</h3>
          <p style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300, fontSize: '0.875rem' }}><strong style={{ fontWeight: 500 }}>請求先:</strong> {invoiceDetail.destination_name} 様</p>
          <p style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300, fontSize: '0.875rem' }}><strong style={{ fontWeight: 500 }}>請求期間:</strong> {invoiceDetail.target_start_date} 〜 {invoiceDetail.target_end_date}</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead><tr style={{ background: 'var(--surface-container-high)' }}>
                <th style={{ padding: '8px', border: '1px solid var(--outline-variant)', fontSize: '0.7rem', fontWeight: 500, fontFamily: "'Noto Sans JP', sans-serif" }}>納品日</th>
                <th style={{ padding: '8px', border: '1px solid var(--outline-variant)', fontSize: '0.7rem', fontWeight: 500, fontFamily: "'Noto Sans JP', sans-serif" }}>番号</th>
                <th style={{ padding: '8px', border: '1px solid var(--outline-variant)', fontSize: '0.7rem', fontWeight: 500, fontFamily: "'Noto Sans JP', sans-serif" }}>品名</th>
                <th style={{ padding: '8px', border: '1px solid var(--outline-variant)', fontSize: '0.7rem', fontWeight: 500, fontFamily: "'Noto Sans JP', sans-serif", textAlign: 'right' }}>数量</th>
                <th style={{ padding: '8px', border: '1px solid var(--outline-variant)', fontSize: '0.7rem', fontWeight: 500, fontFamily: "'Noto Sans JP', sans-serif", textAlign: 'right' }}>単価</th>
                <th style={{ padding: '8px', border: '1px solid var(--outline-variant)', fontSize: '0.7rem', fontWeight: 500, fontFamily: "'Noto Sans JP', sans-serif", textAlign: 'right' }}>小計</th>
              </tr></thead>
              <tbody>
                {invoiceDetail.details?.map((d: any, i: number) => (
                  <tr key={i}>
                    <td className="manrope-numbers" style={{ padding: '8px', border: '1px solid var(--outline-variant)', fontWeight: 300, fontSize: '0.8rem' }}>{d.delivery_date}</td>
                    <td className="manrope-numbers" style={{ padding: '8px', border: '1px solid var(--outline-variant)', fontWeight: 300, fontSize: '0.8rem' }}>{d.delivery_number}</td>
                    <td style={{ padding: '8px', border: '1px solid var(--outline-variant)', fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300, fontSize: '0.8rem' }}>{d.recipe_name}</td>
                    <td className="manrope-numbers" style={{ padding: '8px', border: '1px solid var(--outline-variant)', textAlign: 'right', fontWeight: 300, fontSize: '0.8rem' }}>{d.quantity}</td>
                    <td className="manrope-numbers" style={{ padding: '8px', border: '1px solid var(--outline-variant)', textAlign: 'right', fontWeight: 300, fontSize: '0.8rem' }}>¥{d.unit_price?.toLocaleString()}</td>
                    <td className="manrope-numbers" style={{ padding: '8px', border: '1px solid var(--outline-variant)', textAlign: 'right', fontWeight: 300, fontSize: '0.8rem' }}>¥{d.subtotal?.toLocaleString()}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 'bold', background: 'var(--surface-container-high)' }}>
                  <td colSpan={5} style={{ padding: '8px', border: '1px solid var(--outline-variant)', textAlign: 'right', fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 500, fontSize: '0.8rem' }}>請求金額</td>
                  <td className="manrope-numbers" style={{ padding: '8px', border: '1px solid var(--outline-variant)', textAlign: 'right', fontSize: '1.1rem', color: 'var(--accent-green)', fontWeight: 500 }}>¥{invoiceDetail.total_amount?.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {invoices.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>過去の請求書一覧</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--outline-variant)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 8px', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, textAlign: 'left' }}>ID</th>
                <th style={{ padding: '12px 8px', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, textAlign: 'left' }}>請求先</th>
                <th style={{ padding: '12px 8px', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, textAlign: 'left' }}>期間</th>
                <th style={{ padding: '12px 8px', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, textAlign: 'right' }}>金額</th>
                <th style={{ padding: '12px 8px', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, textAlign: 'left' }}>状態</th>
                <th style={{ padding: '12px 8px', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, textAlign: 'right' }}>詳細</th>
              </tr></thead>
              <tbody>{invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid rgba(169,180,185,0.08)' }}>
                  <td className="manrope-numbers" style={{ padding: '10px 8px', fontWeight: 300 }}>{inv.id}</td>
                  <td style={{ padding: '10px 8px', fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}>{inv.destination_name}</td>
                  <td className="manrope-numbers" style={{ padding: '10px 8px', fontWeight: 300, fontSize: '0.8rem' }}>{inv.target_start_date}〜{inv.target_end_date}</td>
                  <td className="manrope-numbers" style={{ padding: '10px 8px', color: 'var(--primary-color)', fontWeight: 400, textAlign: 'right' }}>¥{inv.total_amount?.toLocaleString()}</td>
                  <td style={{ padding: '10px 8px', fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300, fontSize: '0.8rem' }}>{inv.status}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right' }}><button onClick={() => fetchInvoiceDetail(inv.id)} style={{ background: 'var(--primary-color)', color: 'var(--on-primary)', border: 'none', borderRadius: '2px', padding: '6px 14px', cursor: 'pointer', minHeight: '36px', fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.08em', transition: 'opacity 0.2s' }}>表示</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
