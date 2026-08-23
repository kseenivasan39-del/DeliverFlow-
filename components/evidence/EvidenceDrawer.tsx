
import { X, ExternalLink } from 'lucide-react';
import { ProductAttribute } from '@/types';
import { mockSources } from '@/data/mockProducts';

export default function EvidenceDrawer({ attribute, evidences, onClose }: { attribute: any, evidences: any[], onClose: () => void }) {
  // Find evidence matching the attribute name
  const ev = evidences?.find(e => e.attribute_name === attribute.name) || { source: "System Extraction", page: "N/A", snippet: "No direct snippet found." };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity" onClick={onClose}></div>
      <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white shadow-2xl z-50 p-6 overflow-y-auto transform transition-transform border-l border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[#062E6F]">Evidence Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500"/></button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Attribute</label>
            <p className="text-base font-medium text-slate-800">{attribute.name}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Extracted Value</label>
            <p className="text-xl font-bold text-slate-800">{attribute.value}</p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Confidence</label>
              <span className="text-sm font-bold">{attribute.confidence}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-[#0969DA]" style={{width: `${attribute.confidence}%`}}></div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 space-y-4">
             <div>
               <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Source</label>
               <p className="text-base font-medium text-slate-800">{ev.source}</p>
               {ev.page && <p className="text-sm text-slate-500">Page {ev.page}</p>}
             </div>
             
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#16A34A] rounded-l-lg"></div>
                <p className="text-sm text-slate-700 italic">
                  "...{ev.snippet}..."
                </p>
             </div>

             <button 
               onClick={() => alert(`Opening Document Viewer for: ${ev.source}\n\n(In the full Enterprise version, this opens the original PDF and highlights the exact snippet.)`)}
               className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-md text-sm font-medium hover:bg-slate-50 text-[#062E6F] transition-colors mt-4"
             >
               Open Source Document <ExternalLink className="w-4 h-4"/>
             </button>
          </div>
        </div>
      </div>
    </>
  )
}
