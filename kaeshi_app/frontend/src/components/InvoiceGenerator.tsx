/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
const API = '/api';

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

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    const res = await fetch(`${API}/invoices/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
       fetchAll();
       if (invoiceDetail?.invoice_id === id) fetchInvoiceDetail(id);
    } else {
       const err = await res.json();
       alert(err.detail || '更新に失敗しました');
    }
  };

  const handleDeleteInvoice = async (id: number) => {
    if (!confirm('本当に削除しますか？\n（関連する納品伝票は未請求状態に戻ります）')) return;
    const res = await fetch(`${API}/invoices/${id}`, { method: 'DELETE' });
    if (res.ok) {
       fetchAll();
       if (invoiceDetail?.invoice_id === id) setInvoiceDetail(null);
       if (invoiceResult?.invoice?.id === id) setInvoiceResult(null);
    } else {
       const err = await res.json();
       alert(err.detail || '削除に失敗しました');
    }
  };

  const handleDownloadPdf = async (id: number) => {
    try {
      const res = await fetch(`${API}/invoices/${id}/pdf`);
      if (!res.ok) throw new Error('PDFの生成に失敗しました');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="k-card" style={{ minHeight: '60vh' }}>
      <h2 className="k-heading">請求書作成</h2>
      <p className="k-subheading">Automated Invoicing & Archives</p>

      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', marginTop: '1rem' }}>
        <input className="k-input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} onKeyDown={e => e.preventDefault()} />
        <input className="k-input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} onKeyDown={e => e.preventDefault()} />
        <select className="k-select" value={selectedDest} onChange={e => setSelectedDest(Number(e.target.value))}>
          <option value="">納品先を選択...</option>
          {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <button onClick={handleGenerate} className="k-btn k-btn-primary">請求書を作成</button>
      </div>

      {invoiceResult && !invoiceDetail && (
        <div className="no-print" style={{ marginTop: '2rem', padding: '1rem', background: 'var(--surface-container-low)', borderRadius: '2px', border: '1px solid rgba(169,180,185,0.1)' }}>
          <p style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}>{invoiceResult.message}</p>
          {invoiceResult.total_amount !== undefined && <p className="manrope-numbers" style={{ fontWeight: 400 }}>合計: ¥{invoiceResult.total_amount?.toLocaleString()}</p>}
        </div>
      )}

      {invoiceDetail && (
        <div style={{ marginTop: '2rem', background: '#ffffff', color: 'var(--text-primary)', padding: '2rem', borderRadius: '2px', border: '1px solid rgba(169,180,185,0.15)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ width: '40px' }}></div>
            <h3 style={{ margin: 0, fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 700, fontSize: '1.3rem', letterSpacing: '0.3em' }}>請 求 書</h3>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => handleDownloadPdf(invoiceDetail.invoice_id)} className="k-btn k-btn-success no-print" style={{ padding: '6px 12px', fontSize: '0.7rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>download</span> PDF
              </button>
              <button onClick={() => window.print()} className="k-btn k-btn-primary no-print" style={{ padding: '6px 12px', fontSize: '0.7rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>print</span> 印刷
              </button>
            </div>
          </div>
          <p style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300, fontSize: '0.875rem' }}><strong style={{ fontWeight: 500 }}>請求先:</strong> {invoiceDetail.destination_name} 様</p>
          <p style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300, fontSize: '0.875rem' }}><strong style={{ fontWeight: 500 }}>請求期間:</strong> {invoiceDetail.target_start_date} 〜 {invoiceDetail.target_end_date}</p>
          <div className="k-table-wrapper">
            <table className="k-table" style={{ marginTop: '1rem' }}>
              <thead><tr style={{ background: 'var(--surface-container-high)' }}>
                <th className="k-th" style={{ border: '1px solid var(--outline-variant)' }}>納品日</th>
                <th className="k-th" style={{ border: '1px solid var(--outline-variant)' }}>番号</th>
                <th className="k-th" style={{ border: '1px solid var(--outline-variant)' }}>品名</th>
                <th className="k-th right" style={{ border: '1px solid var(--outline-variant)' }}>数量</th>
                <th className="k-th right" style={{ border: '1px solid var(--outline-variant)' }}>単価</th>
                <th className="k-th right" style={{ border: '1px solid var(--outline-variant)' }}>小計</th>
              </tr></thead>
              <tbody>
                {invoiceDetail.details?.map((d: any, i: number) => (
                  <tr key={i}>
                    <td className="k-td num" style={{ border: '1px solid var(--outline-variant)', fontSize: '0.8rem' }}>{d.delivery_date}</td>
                    <td className="k-td num" style={{ border: '1px solid var(--outline-variant)', fontSize: '0.8rem' }}>{d.delivery_number}</td>
                    <td className="k-td" style={{ border: '1px solid var(--outline-variant)', fontSize: '0.8rem' }}>{d.recipe_name}</td>
                    <td className="k-td num right" style={{ border: '1px solid var(--outline-variant)', fontSize: '0.8rem' }}>{d.quantity}</td>
                    <td className="k-td num right" style={{ border: '1px solid var(--outline-variant)', fontSize: '0.8rem' }}>¥{d.unit_price?.toLocaleString()}</td>
                    <td className="k-td num right" style={{ border: '1px solid var(--outline-variant)', fontSize: '0.8rem' }}>¥{d.subtotal?.toLocaleString()}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 'bold', background: 'var(--surface-container-high)' }}>
                  <td colSpan={5} className="k-td right" style={{ border: '1px solid var(--outline-variant)', fontWeight: 500, fontSize: '0.8rem' }}>請求金額</td>
                  <td className="k-td num right" style={{ border: '1px solid var(--outline-variant)', fontSize: '1.1rem', color: 'var(--accent-green)', fontWeight: 500 }}>¥{invoiceDetail.total_amount?.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {invoices.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 className="k-subheading" style={{ fontSize: '0.65rem', fontWeight: 600 }}>過去の請求書一覧</h3>
          <div className="k-table-wrapper">
            <table className="k-table">
              <thead><tr>
                <th className="k-th">ID</th>
                <th className="k-th">請求先</th>
                <th className="k-th">期間</th>
                <th className="k-th right">金額</th>
                <th className="k-th">状態</th>
                <th className="k-th right">操作</th>
              </tr></thead>
              <tbody>{invoices.map(inv => (
                <tr key={inv.id}>
                  <td className="k-td num">{inv.id}</td>
                  <td className="k-td">{inv.destination_name}</td>
                  <td className="k-td num" style={{ fontSize: '0.8rem' }}>{inv.target_start_date}〜{inv.target_end_date}</td>
                  <td className="k-td num right" style={{ color: 'var(--primary-color)', fontWeight: 400 }}>¥{inv.total_amount?.toLocaleString()}</td>
                  <td className="k-td" style={{ fontSize: '0.8rem' }}>
                    <select 
                      value={inv.status} 
                      onChange={e => handleUpdateStatus(inv.id, e.target.value)}
                      className="k-select"
                      style={{ padding: '4px', border: '1px solid var(--outline-variant)', borderRadius: '2px', fontSize: '0.75rem', width: 'auto' }}
                    >
                      <option value="未払い">未払い</option>
                      <option value="支払済み" style={{ color: 'var(--accent-green)' }}>支払済み</option>
                    </select>
                  </td>
                  <td className="k-td right">
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                      <button onClick={() => fetchInvoiceDetail(inv.id)} className="k-btn k-btn-primary" style={{ padding: '6px 14px', minHeight: '36px', fontSize: '0.7rem' }}>表示</button>
                      <button onClick={() => handleDownloadPdf(inv.id)} className="k-btn k-btn-success" style={{ padding: '6px 10px', minHeight: '36px' }} title="PDFダウンロード"><span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>download</span></button>
                      <button onClick={() => handleDeleteInvoice(inv.id)} className="k-btn k-btn-danger" style={{ padding: '6px 10px', minHeight: '36px' }} title="削除"><span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>delete</span></button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
