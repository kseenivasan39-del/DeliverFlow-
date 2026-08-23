
'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, FileText, Download, ChevronRight, Circle, Loader2 } from 'lucide-react';
import EvidenceDrawer from '@/components/evidence/EvidenceDrawer';

export default function ProductDashboard({ params }: { params: Promise<{ id: string }> }) {
  const [selectedAttr, setSelectedAttr] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [product, setProduct] = useState<any | null>(null);
  const unwrappedParams = use(params);

  useEffect(() => {
    fetch(`https://deliverflow-2foc.onrender.com/products/${unwrappedParams.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setProduct(data);
      })
      .catch((err) => {
        console.error(err);
        setProduct({ error: true });
      });
  }, [unwrappedParams.id]);

  if (!product) return <div className="text-center py-20 text-slate-500 flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Loading product {unwrappedParams.id}...</div>;
  if (product.error) return <div className="text-center py-20 text-red-500 font-bold">Product not found in database.</div>;

  const safeAttributes = product.attributes || [];
  const overallConfidence = safeAttributes.length > 0 ? Math.round(safeAttributes.reduce((acc: any, a: any) => acc + a.confidence, 0) / safeAttributes.length) : product.confidence || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#062E6F]">{product.mpn}</h1>
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
              overallConfidence >= 80 
                ? 'bg-[#ECFDF3] text-[#16A34A]' 
                : 'bg-red-50 text-red-600'
            }`}>
              {overallConfidence >= 80 ? 'VERIFIED' : 'NEEDS REVIEW'}
            </span>
          </div>
          <p className="text-slate-500 mt-1">{product.brand} &bull; {product.description}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500 font-medium">Overall Confidence</div>
          <div className={`text-3xl font-bold ${overallConfidence >= 80 ? 'text-[#16A34A]' : 'text-amber-500'}`}>{overallConfidence}%</div>
        </div>
      </div>

      <div className="border-b border-slate-200">
        <nav className="flex gap-6 -mb-px text-sm font-medium">
          {['Overview', 'Evidence', 'Sources', 'Activity'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`pb-3 border-b-2 transition-colors ${activeTab === tab ? 'border-[#0969DA] text-[#0969DA]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 bg-slate-50">
                <h2 className="font-bold text-slate-800">Product Attributes</h2>
              </div>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-white text-slate-500 border-b border-slate-200">
                    <th className="p-4 font-medium">Attribute</th>
                    <th className="p-4 font-medium">Value</th>
                    <th className="p-4 font-medium">Confidence</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {safeAttributes.map((attr: any, i: number) => (
                    <tr key={i} onClick={() => attr.confidence <= 80 ? window.location.href=`/products/${product.id}/review` : setSelectedAttr(attr)} className="hover:bg-slate-50 cursor-pointer transition-colors">
                      <td className="p-4 font-medium text-slate-700">{attr.name}</td>
                      <td className="p-4">{attr.value}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                           <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                             <div className={`h-full ${attr.confidence > 90 ? 'bg-[#16A34A]' : attr.confidence > 70 ? 'bg-amber-500' : 'bg-[#DC2626]'}`} style={{width: `${attr.confidence}%`}}></div>
                           </div>
                           <span className="text-xs font-medium">{attr.confidence}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                         {attr.confidence > 80 ? 
                           <span className="flex items-center gap-1 text-[#16A34A] text-xs font-medium"><CheckCircle2 className="w-3 h-3"/> Verified</span> : 
                           <span className="flex items-center gap-1 text-[#DC2626] text-xs font-medium"><AlertCircle className="w-3 h-3"/> Needs Review</span>
                         }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex gap-4">
               <a href={`https://deliverflow-2foc.onrender.com/products/${product.id}/export/json`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium hover:bg-slate-50">
                 <Download className="w-4 h-4"/> Export JSON
               </a>
               <a href={`https://deliverflow-2foc.onrender.com/products/${product.id}/export/csv`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#0969DA] text-white rounded-md text-sm font-medium hover:bg-blue-700">
                 <Download className="w-4 h-4"/> Export CSV
               </a>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-4">Trust Summary</h3>
              <div className="flex items-center gap-6">
                 <div className="relative w-20 h-20">
                   <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                     <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                     <circle cx="50" cy="50" r="40" fill="none" stroke="#16A34A" strokeWidth="12" strokeDasharray="251" strokeDashoffset={251 * (1 - (safeAttributes.filter((a: any) => a.confidence > 80).length / (safeAttributes.length || 1)))} />
                   </svg>
                   <div className="absolute inset-0 flex items-center justify-center font-bold text-lg text-slate-700">{safeAttributes.filter((a: any) => a.confidence > 80).length}/{safeAttributes.length || 1}</div>
                 </div>
                 <div className="space-y-2 text-sm">
                   <div className="flex items-center justify-between gap-4"><span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#16A34A]"></div>Verified</span> <b>{safeAttributes.filter((a: any) => a.confidence > 80).length}</b></div>
                   <div className="flex items-center justify-between gap-4"><span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#DC2626]"></div>Conflicts</span> <b>{safeAttributes.filter((a: any) => a.confidence <= 80).length}</b></div>
                   <div className="flex items-center justify-between gap-4"><span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-300"></div>Missing Evidence</span> <b>0</b></div>
                 </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4">Top Sources</h3>
            <div className="space-y-3">
             {Array.from(new Set((product.evidences || []).map((e: any) => e.source))).slice(0, 3).map((sourceName: any, i: number) => (
                 <div 
                   key={i} 
                   onClick={() => alert(`Opening Document Viewer for: ${sourceName}\n\n(In the full Enterprise version, this opens the original PDF with highlights.)`)}
                   className="flex gap-3 text-sm border-b border-slate-100 pb-3 last:border-0 last:pb-0 hover:bg-slate-50 cursor-pointer p-2 rounded -mx-2 transition-colors"
                 >
                    <FileText className="w-5 h-5 text-[#0969DA] shrink-0"/>
                    <div>
                      <p className="font-medium text-slate-700">{sourceName}</p>
                      <p className="text-xs text-slate-500">Processed by AI Pipeline</p>
                    </div>
                 </div>
               ))}
            </div>
            <button 
              onClick={() => setActiveTab('Sources')}
              className="w-full mt-4 py-2 border border-slate-200 rounded-md text-sm font-medium hover:bg-slate-50 text-[#0969DA] transition-colors"
            >
              View All Sources
            </button>
          </div>
          </div>
        </div>
      )}

      {activeTab === 'Evidence' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <h2 className="font-bold text-slate-800 border-b border-slate-100 pb-4">Extracted Evidence Snippets</h2>
          <div className="space-y-4">
            {(product.evidences || []).map((ev: any, i: number) => {
              // Find the parent attribute so we can pop open the drawer
              const parentAttr = product.attributes.find((a: any) => a.name === ev.attribute_name);
              return (
                <div 
                  key={i} 
                  onClick={() => parentAttr && setSelectedAttr(parentAttr)}
                  className="flex gap-4 p-4 border border-slate-100 rounded-lg bg-slate-50/50 hover:border-[#0969DA] hover:shadow-sm cursor-pointer transition-all"
                >
                  <FileText className="w-6 h-6 text-[#0969DA] shrink-0 mt-1" />
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-slate-700">{ev.attribute_name}</span>
                      <span className="text-xs bg-[#ECFDF3] text-[#16A34A] px-2 py-0.5 rounded font-medium border border-green-200">Mapped</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">"{ev.snippet}"</p>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Source: {ev.source} {ev.page && `• Page ${ev.page}`}</p>
                  </div>
                </div>
              );
            })}
            {(product.evidences || []).length === 0 && (
              <p className="text-slate-500 text-sm italic">No evidence snippets extracted for this product.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'Sources' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Document Sources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {Array.from(new Set((product.evidences || []).map((e: any) => e.source))).map((sourceName: any, i: number) => (
               <div 
                 key={i} 
                 onClick={() => alert(`Opening Document Viewer for: ${sourceName}\n\n(In the full Enterprise version, this opens the original PDF with highlights.)`)}
                 className="border border-slate-200 rounded-lg p-5 flex items-start gap-4 hover:border-[#0969DA] hover:shadow-md transition-all cursor-pointer"
               >
                 <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                   <FileText className="w-5 h-5 text-[#0969DA]" />
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">{sourceName}</h3>
                   <p className="text-xs text-slate-500">Processed by AI Pipeline</p>
                 </div>
               </div>
             ))}
             {(product.evidences || []).length === 0 && (
               <p className="text-slate-500 text-sm italic">No sources available.</p>
             )}
          </div>
        </div>
      )}

      {activeTab === 'Activity' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-3xl">
          <h2 className="font-bold text-slate-800 border-b border-slate-100 pb-4 mb-8">Processing History</h2>
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[1.1rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
             
             {(product.status === 'reviewed' || overallConfidence >= 80) && (
               <div className="relative flex items-start gap-5">
                  <div className="w-9 h-9 rounded-full bg-[#ECFDF3] border-4 border-white shadow-sm flex items-center justify-center shrink-0 z-10">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  </div>
                  <div className="pt-1.5">
                    <p className="text-sm font-bold text-slate-800">
                      {product.status === 'reviewed' ? 'Manually Verified by Human Reviewer' : 'Auto-Verified by AI Pipeline'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Just now</p>
                  </div>
               </div>
             )}

             {product.status === 'rejected' && (
               <div className="relative flex items-start gap-5">
                  <div className="w-9 h-9 rounded-full bg-red-50 border-4 border-white shadow-sm flex items-center justify-center shrink-0 z-10">
                    <AlertCircle className="w-4 h-4 text-[#DC2626]" />
                  </div>
                  <div className="pt-1.5">
                    <p className="text-sm font-bold text-slate-800">Rejected by Human Reviewer</p>
                    <p className="text-xs text-slate-500 mt-1">Product flagged for correction</p>
                  </div>
               </div>
             )}

             <div className="relative flex items-start gap-5">
                <div className="w-9 h-9 rounded-full bg-blue-50 border-4 border-white shadow-sm flex items-center justify-center shrink-0 z-10">
                  <CheckCircle2 className="w-4 h-4 text-[#0969DA]" />
                </div>
                <div className="pt-1.5">
                  <p className="text-sm font-bold text-slate-800">AI Extraction Completed</p>
                  <p className="text-sm text-slate-600 mt-1">Llama 3 70B (Groq) successfully mapped {safeAttributes.length} attributes.</p>
                  <p className="text-xs text-slate-500 mt-1">A few seconds ago</p>
                </div>
             </div>

             <div className="relative flex items-start gap-5">
                <div className="w-9 h-9 rounded-full bg-slate-100 border-4 border-white shadow-sm flex items-center justify-center shrink-0 z-10">
                  <Circle className="w-4 h-4 text-slate-400" />
                </div>
                <div className="pt-1.5">
                  <p className="text-sm font-bold text-slate-800">Processing Pipeline Initiated</p>
                  <p className="text-xs text-slate-500 mt-1">Triggered via Web UI</p>
                </div>
             </div>
          </div>
        </div>
      )}

      {selectedAttr && (
         <EvidenceDrawer 
           attribute={selectedAttr}
           evidences={product.evidences}
           onClose={() => setSelectedAttr(null)} 
         />
      )}
    </div>
  )
}
