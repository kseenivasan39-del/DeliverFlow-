'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { dashboardProducts, mockProduct } from '@/data/mockProducts';

export default function Dashboard() {
  const [showToast, setShowToast] = useState(false);
  const [backendProducts, setBackendProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBackendProducts(data);
        }
      })
      .catch(console.error);
  }, []);

  const calculateConfidence = (p: any) => {
    let score = 98;
    let reasons = [];
    const hasDimensions = Array.isArray(p.attributes) && p.attributes.some((a: any) => a.name && (a.name.toLowerCase().includes('size') || a.name.toLowerCase().includes('length')));
    if (!hasDimensions && p.attributes && p.attributes.length > 0) { score -= 15; reasons.push('Missing Logistics Data'); }
    if (!p.attributes || p.attributes.length < 3) { score -= 10; reasons.push('Sparse Attributes'); }
    return { score: Math.max(0, score), isHighConfidence: score >= 80 };
  };

  const allProducts = [
    ...backendProducts.map(p => {
      const conf = calculateConfidence(p);
      return {
        ...p,
        id: p.id.toString(),
        confidence: conf.score,
        status: p.status === 'reviewed' ? 'Verified' : 
                p.status === 'enriched' ? (conf.isHighConfidence ? 'Verified' : 'Needs Review') : p.status
      };
    })
  ];
  
  // De-duplicate for UI counting
  const uniqueProducts = Array.from(new Map(allProducts.map(item => [item.id, item])).values());
  const verifiedCount = uniqueProducts.filter(p => p.status.toLowerCase() === 'verified').length;
  const reviewCount = uniqueProducts.filter(p => p.status.toLowerCase() === 'needs review').length;
  const lowConfCount = uniqueProducts.filter(p => p.confidence < 80).length;
  const baseTotal = uniqueProducts.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 bg-[#0969DA] text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-5 z-50 no-print">
          <FileText className="w-5 h-5" />
          <div>
            <p className="font-bold text-sm">Generating Report</p>
            <p className="text-blue-50 text-xs mt-0.5">Preparing Executive Summary PDF...</p>
          </div>
        </div>
      )}
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B132B]">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of your AI product intelligence pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={async () => {
              if(confirm('Are you sure you want to clear the entire database?')) {
                await fetch('http://localhost:8000/products/reset', { method: 'DELETE' });
                setBackendProducts([]);
              }
            }}
            className="px-4 py-2 bg-red-50 border border-red-200 text-sm font-semibold rounded-lg text-red-600 hover:bg-red-100 transition-all shadow-sm flex items-center gap-2"
          >
            Reset Database
          </button>
          <button 
            onClick={() => {
              setShowToast(true);
              setTimeout(() => {
                setShowToast(false);
                window.print();
              }, 1500);
            }}
            className="px-4 py-2 bg-white border border-slate-200 text-sm font-semibold rounded-lg text-slate-700 hover:bg-slate-50 hover:text-[#0969DA] hover:border-[#0969DA]/30 transition-all shadow-sm flex items-center gap-2"
          >
            Export Report
          </button>
          <Link href="/products/new" className="inline-flex items-center justify-center bg-[#0969DA] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
            + Process New
          </Link>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Products', val: baseTotal.toString(), trend: 'Processed this session', accent: 'bg-[#0969DA]' },
          { label: 'Verified Products', val: verifiedCount.toString(), trend: baseTotal > 0 ? `${Math.round((verifiedCount/baseTotal)*100)}% auto-verified` : 'No data yet', accent: 'bg-[#16A34A]' },
          { label: 'Needs Review', val: reviewCount.toString(), trend: 'Requires attention', accent: 'bg-[#DC2626]' },
          { label: 'Low Confidence', val: lowConfCount.toString(), trend: 'Score < 80%', accent: 'bg-amber-500' }
        ].map((s, i) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden relative group p-6">
            <div className={`absolute top-0 left-0 w-full h-1 ${s.accent} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
            <p className="text-sm font-medium text-slate-500">{s.label}</p>
            <div className="mt-4 flex items-baseline gap-3">
              <p className="text-3xl font-bold tracking-tight text-[#0B132B]">{s.val}</p>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">{s.trend}</p>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0B132B]">Recent Processing Activity</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[180px]">MPN</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Brand</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {uniqueProducts.slice(0, 5).map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-4 px-6 align-middle">
                    <Link href={`/products/${p.id}`} className="font-mono text-sm text-[#0B132B] font-semibold group-hover:text-[#0969DA] transition-colors">
                      {p.mpn}
                    </Link>
                  </td>
                  <td className="py-4 px-6 align-middle text-sm text-slate-600 font-medium">
                    {p.brand}
                  </td>
                  <td className="py-4 px-6 align-middle text-right">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm ${
                      p.status.toLowerCase() === 'verified' 
                        ? 'bg-[#ECFDF3] text-[#16A34A] border-green-200/60' 
                        : 'bg-red-50 text-red-600 border-red-200/60'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full shadow-[0_0_4px_rgba(34,197,94,0.6)] ${
                        p.status.toLowerCase() === 'verified' ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      {p.confidence}% {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {uniqueProducts.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-500">No recent products.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
