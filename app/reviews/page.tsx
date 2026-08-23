'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Search, Filter, Clock } from 'lucide-react';
import { dashboardProducts, mockProduct } from '@/data/mockProducts';

export default function ReviewsInbox() {
  const [backendProducts, setBackendProducts] = useState<any[]>([]);

  const [totalProducts, setTotalProducts] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);
  const [prevCount, setPrevCount] = useState(-1);

  useEffect(() => {
    // Initial fetch
    fetch('https://deliverflow-2foc.onrender.com/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBackendProducts(data);
          setTotalProducts(data.length);
          setPrevCount(data.length);
        }
      })
      .catch(console.error);

    if (!isProcessing) return;

    const interval = setInterval(() => {
      fetch('https://deliverflow-2foc.onrender.com/products')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            if (prevCount !== -1 && data.length === prevCount && data.length > 0) {
              // If count stopped increasing, assume processing is finished
              setIsProcessing(false);
            } else if (data.length >= 2000) {
              setIsProcessing(false);
            }
            setPrevCount(data.length);
            setTotalProducts(data.length);
            setBackendProducts(data);
          }
        })
        .catch(console.error);
    }, 3000);
    return () => clearInterval(interval);
  }, [prevCount, isProcessing]);

  const calculateConfidence = (p: any) => {
    let score = 98;
    let reasons = [];
    // Brand logic removed: Since the input system (like E1) has missing brands by default, 
    // having a brand in the description isn't a conflict, it's exactly what the AI is supposed to extract!
    
    // 2. Regulatory & Commerce Checks
    // B2B products require dimensions for shipping/logistics
    const hasDimensions = Array.isArray(p.attributes) && p.attributes.some((a: any) => 
      a.name && (a.name.toLowerCase().includes('size') || a.name.toLowerCase().includes('length') || a.name.toLowerCase().includes('weight'))
    );
    
    if (!hasDimensions && p.attributes && p.attributes.length > 0) {
      score -= 15;
      reasons.push('Missing Critical Logistics Data (Size/Weight)');
    }

    // 3. AI Extraction Quality
    if (!p.attributes || p.attributes.length < 3) {
      score -= 10;
      reasons.push('Sparse Attribute Extraction');
    }

    return {
      score: Math.max(0, score),
      reason: reasons.length > 0 ? reasons.join(' | ') : 'Verified',
      isHighConfidence: score >= 80
    };
  };

  const allProducts = [
    ...backendProducts.map(p => {
      const conf = calculateConfidence(p);
      return {
        ...p,
        id: p.id.toString(),
        confidence: conf.score,
        reviewReason: conf.reason,
        status: p.status === 'reviewed' ? 'Verified' : 
                p.status === 'enriched' ? (conf.isHighConfidence ? 'Verified' : 'Needs Review') : p.status
      };
    })
  ];

  const reviewQueue = allProducts.filter(p => p.status.toLowerCase() === 'needs review');

  // De-duplicate just for the mock UI
  const uniqueQueue = Array.from(new Map(reviewQueue.map(item => [item.id, item])).values());

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B132B]">Review Inbox</h1>
          <p className="text-sm text-slate-500 mt-1">Human-in-the-loop validation for AI extractions with low confidence or conflicts.</p>
        </div>
        <div className="flex gap-4 items-center">
          {isProcessing && totalProducts < 2000 && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm animate-in fade-in zoom-in duration-300">
               <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></div>
               Processing {totalProducts} / 2000 rows
            </div>
          )}
          <div className="text-right ml-4">
            <div className="text-2xl font-bold text-[#DC2626]">{uniqueQueue.length}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search pending reviews by MPN, Brand, or attribute..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-[#0969DA]/20 outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-200">
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Product</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Reason for Review</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Confidence</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {uniqueQueue.map(p => (
              <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <p className="font-bold text-[#0B132B] group-hover:text-[#0969DA] transition-colors">{p.mpn}</p>
                  <p className="text-slate-500 mt-0.5">{p.brand}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-red-50 text-red-600 text-xs font-medium border border-red-200/60">
                    <AlertCircle className="w-3 h-3"/> {p.reviewReason || 'Low AI Confidence'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                     <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div className={`h-full ${p.confidence > 90 ? 'bg-[#16A34A]' : p.confidence > 70 ? 'bg-amber-500' : 'bg-[#DC2626]'}`} style={{width: `${p.confidence}%`}}></div>
                     </div>
                     <span className="text-xs font-medium">{p.confidence}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/products/${p.id}/review`} className="text-[#0969DA] font-semibold text-sm border border-blue-200 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors inline-block">
                    Review Item
                  </Link>
                </td>
              </tr>
            ))}
            
            {uniqueQueue.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3 opacity-20" />
                  <p className="font-semibold text-lg text-slate-700">Inbox Zero!</p>
                  <p className="mt-1">There are no products waiting for human review.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
