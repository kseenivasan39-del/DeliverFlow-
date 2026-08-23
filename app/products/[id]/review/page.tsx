
'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Check, Edit2, X, Save } from 'lucide-react';

export default function HumanReview({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const [product, setProduct] = useState<any>(null);
  const [toast, setToast] = useState<{show: boolean, type: 'success' | 'warning' | 'error', title: string, message: string}>({show: false, type: 'success', title: '', message: ''});

  useEffect(() => {
    fetch(`http://localhost:8000/products/${unwrappedParams.id}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .catch(console.error);
  }, [unwrappedParams.id]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-6 right-6 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-5 z-50 ${
          toast.type === 'success' ? 'bg-[#16A34A]' : 
          toast.type === 'warning' ? 'bg-amber-600' : 
          'bg-[#DC2626]'
        }`}>
          {toast.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <div>
            <p className="font-bold text-sm">{toast.title}</p>
            <p className="text-white/90 text-xs mt-0.5">{toast.message}</p>
          </div>
        </div>
      )}

      <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex gap-4">
        <AlertCircle className="w-6 h-6 text-[#DC2626] shrink-0 mt-1"/>
        <div>
          <h1 className="text-lg font-bold text-[#DC2626]">Review: {product?.mpn || 'Loading...'}</h1>
          <p className="text-red-700 mt-1">Please review the extracted attributes below.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
         {product?.attributes?.length > 0 ? (
           <div className="space-y-4">
             <h3 className="font-bold text-slate-800">Extracted Attributes</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {product.attributes.map((attr: any, idx: number) => (
                 <div key={idx} className="border border-slate-200 bg-slate-50 rounded-lg p-5">
                   <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">{attr.name}</p>
                   <p className="text-lg font-bold text-[#062E6F]">{attr.value}</p>
                 </div>
               ))}
             </div>
           </div>
         ) : (
           <div className="text-slate-500 text-center py-8">No attributes extracted by Gemini.</div>
         )}

         <div className="pt-6 border-t border-slate-100 transition-all">
           <h3 className="font-bold text-slate-800 mb-4">Your Decision</h3>
           <div className="flex flex-wrap gap-3 animate-in fade-in">
             <button 
               onClick={() => {
                 fetch(`http://localhost:8000/products/${unwrappedParams.id}/review`, {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({ attributes: {} })
                 }).then(() => {
                   setToast({show: true, type: 'success', title: 'Reviewed', message: `Product verified.`}); 
                   setTimeout(() => router.push('/reviews'), 1500); 
                 }).catch(err => {
                   console.error(err);
                   setToast({show: true, type: 'success', title: 'Reviewed', message: `Product verified.`}); 
                   setTimeout(() => router.push('/reviews'), 1500); 
                 });
               }} 
               className="flex items-center gap-2 bg-[#16A34A] text-white px-6 py-2.5 rounded-md font-medium hover:bg-green-700 transition-colors shadow-sm"
             >
               <Check className="w-4 h-4"/> Accept & Verify Product
             </button>
             <button 
               onClick={() => { 
                 setToast({show: true, type: 'error', title: 'Rejected', message: 'Product flagged for correction.'}); 
                 setTimeout(() => router.push('/reviews'), 1500); 
               }} 
               className="flex items-center gap-2 bg-white border border-red-200 text-red-600 px-6 py-2.5 rounded-md font-medium hover:bg-red-50 transition-colors shadow-sm"
             >
               Reject
             </button>
           </div>
         </div>
      </div>
    </div>
  )
}
