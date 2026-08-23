
'use client';
import { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

export default function Processing({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const unwrappedParams = use(params);
  const fetchedRef = useRef(false);
  const apiDoneRef = useRef(false);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetch(`http://localhost:8000/products/${unwrappedParams.id}/enrich`, { method: 'POST' })
        .then(() => {
          apiDoneRef.current = true;
        })
        .catch(err => console.error("Enrichment failed:", err));
    }

    const startTime = Date.now();
    const DURATION = 6000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      let calculatedP = Math.floor((elapsed / DURATION) * 100);

      setProgress(currentP => {
        if (currentP >= 100) return 100;
        
        if (calculatedP >= 99) {
           if (apiDoneRef.current) {
              return 100;
           }
           return 98;
        }
        
        return calculatedP;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [unwrappedParams.id]);

  useEffect(() => {
    if (progress >= 100) {
      // Pause for 6 seconds at 100% so the user can fully see the final green checkmark and completed state
      const timeout = setTimeout(() => {
        router.push(`/products/${unwrappedParams.id}`);
      }, 6000);
      return () => clearTimeout(timeout);
    }
  }, [progress, router, unwrappedParams.id]);

  const steps = [
    { label: 'Discovering Sources', sub: 'Finding relevant manufacturer websites and documents', at: 0 },
    { label: 'Retrieving Evidence', sub: 'Extracting important sections and snippets', at: 25 },
    { label: 'Extracting Attributes', sub: 'AI is reading and understanding product information', at: 50 },
    { label: 'Validating Values', sub: 'Checking units, ranges and consistency', at: 75 },
    { label: 'Assigning Confidence', sub: 'Scoring each attribute', at: 90 },
    { label: 'Preparing Product Record', sub: 'Finalizing verified product data', at: 98 }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#062E6F]">Analyzing VAL-316-100...</h1>
        <p className="text-slate-500">Our AI is discovering, extracting and validating product information.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.1rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {steps.map((step, i) => {
              const isDone = progress === 100 || progress >= step.at + 15;
              const isCurrent = progress >= step.at && !isDone;
              return (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-300">
                    {isDone ? <CheckCircle2 className="w-5 h-5 text-[#16A34A]" /> : isCurrent ? <Loader2 className="w-5 h-5 text-[#0969DA] animate-spin" /> : <Circle className="w-5 h-5 text-slate-300" />}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-slate-100 shadow-sm bg-white">
                    <h3 className={`font-bold ${isDone || isCurrent ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</h3>
                    <p className="text-sm text-slate-500">{step.sub}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center">
            <h3 className="font-bold text-slate-800 mb-4">Live Progress</h3>
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#0969DA" strokeWidth="10" strokeDasharray="283" strokeDashoffset={283 - (283 * progress) / 100} className="transition-all duration-300" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-[#062E6F]">{progress}%</span>
                <span className="text-xs text-slate-500">In Progress</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
             <h3 className="font-bold text-slate-800 mb-4">What's happening?</h3>
             <ul className="space-y-3 text-sm">
               {progress > 10 && <li className="flex gap-2 text-slate-600"><CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0"/> Found 3 relevant sources</li>}
               {progress > 30 && <li className="flex gap-2 text-slate-600"><CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0"/> Retrieved 8 evidence snippets</li>}
               {progress > 60 && <li className="flex gap-2 text-slate-600"><Loader2 className="w-4 h-4 text-[#0969DA] animate-spin shrink-0"/> Extracting 6 attributes</li>}
             </ul>
             <div className="mt-6 pt-4 border-t border-slate-100">
               <p className="text-sm text-slate-500">Est. time remaining: ~{Math.max(0, Math.ceil((100-progress)/16.6))} sec</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
