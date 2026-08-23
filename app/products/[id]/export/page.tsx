
'use client';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Download, ArrowRight } from 'lucide-react';

export default function ExportSuccess() {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center relative overflow-hidden">
        {/* Subtle confetti background simulation */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle at center, #16A34A 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
        
        <div className="w-20 h-20 bg-[#ECFDF3] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-[#16A34A]" />
        </div>
        
        <h1 className="text-3xl font-bold text-[#062E6F] mb-2">Product Record Verified!</h1>
        <p className="text-slate-500 mb-8">Your product intelligence is ready for use.</p>

        <div className="bg-slate-50 rounded-xl border border-slate-100 p-6 max-w-md mx-auto mb-8 text-left flex gap-4 items-center">
          <img src="https://images.unsplash.com/photo-1584820927498-cafeec25cbb4?auto=format&fit=crop&q=80&w=100&h=100" alt="Valve" className="w-20 h-20 rounded shadow-sm object-cover" />
          <div>
            <h3 className="font-bold text-lg text-slate-800">VAL-316-100</h3>
            <p className="text-sm text-slate-500 mb-2">Acme Industrial</p>
            <div className="flex gap-2 text-xs font-medium text-slate-500">
               <span className="bg-[#ECFDF3] text-[#16A34A] px-2 py-0.5 rounded">94% Confidence</span>
               <span>6 Attributes</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-8">
           <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 rounded-md font-medium hover:bg-slate-50 shadow-sm">
             <Download className="w-5 h-5 text-[#0969DA]"/> Export JSON
           </button>
           <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 rounded-md font-medium hover:bg-slate-50 shadow-sm">
             <Download className="w-5 h-5 text-[#16A34A]"/> Export CSV
           </button>
        </div>

        <button onClick={() => router.push('/dashboard')} className="text-[#0969DA] font-medium hover:underline inline-flex items-center gap-1">
          Back to Dashboard <ArrowRight className="w-4 h-4"/>
        </button>
      </div>
    </div>
  )
}
