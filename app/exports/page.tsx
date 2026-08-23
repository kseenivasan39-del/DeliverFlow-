'use client';
import { useState, useEffect } from 'react';
import { Download, Terminal, Settings, ExternalLink, Webhook, X, Copy, Check } from 'lucide-react';
import { dashboardProducts, mockProduct } from '@/data/mockProducts';
import { exactUnihackCsvString } from '@/data/unihackCsv';

export default function ExportsPage() {
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
    const descUpper = p.description ? p.description.toUpperCase() : '';
    if (descUpper.includes('3M') || descUpper.includes('DIABLO') || descUpper.includes('MILW')) {
      if (!p.brand || p.brand.includes('Unbranded')) { score -= 35; reasons.push('Data Conflict: Hidden Brand'); }
    } else if (!p.brand || p.brand.includes('Unbranded')) { score -= 25; reasons.push('Missing Brand'); }
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

  const readyToExport = allProducts.filter(p => p.status.toLowerCase() === 'verified');
  // De-duplicate just for the mock UI
  const uniqueExport = Array.from(new Map(readyToExport.map(item => [item.id, item])).values());
  
  const [showApiModal, setShowApiModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('sk_test_51Nx82fL9p3mVz...');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 relative">
      
      {/* API Key Modal */}
      {showApiModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Your New API Key</h3>
              <button onClick={() => setShowApiModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-lg mb-6">
                <strong>Important:</strong> Please copy this key now. For security reasons, you will not be able to see it again.
              </div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Secret Key</label>
              <div className="flex gap-2 mb-6">
                <input type="text" readOnly value="sk_test_51Nx82fL9p3mVz..." className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono text-sm focus:outline-none" />
                <button onClick={handleCopy} className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors">
                  {copied ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <button onClick={() => setShowApiModal(false)} className="w-full bg-[#0969DA] text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                I have saved my key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Webhook Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Add Webhook Endpoint</h3>
              <button onClick={() => setShowWebhookModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Payload URL</label>
                <input type="text" placeholder="https://your-pim-system.com/webhooks/deliverflow" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0969DA]/20 focus:border-[#0969DA]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Secret (Optional)</label>
                <input type="text" placeholder="Used to secure webhook payloads" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0969DA]/20 focus:border-[#0969DA]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Events to send</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#0969DA] focus:ring-[#0969DA]" /> product.verified</label>
                  <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" className="rounded border-slate-300 text-[#0969DA] focus:ring-[#0969DA]" /> product.processing_failed</label>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button onClick={() => setShowWebhookModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
              <button onClick={() => setShowWebhookModal(false)} className="px-4 py-2 text-sm font-semibold bg-[#16A34A] text-white hover:bg-green-700 rounded-lg transition-colors">Save Endpoint</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B132B]">Data Export Pipeline</h1>
          <p className="text-sm text-slate-500 mt-1">Connect your PIM, ERP, or download enriched product data.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowApiModal(true)}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Settings className="w-4 h-4 inline mr-2"/> Configure API
          </button>
          <button 
            onClick={() => {
              // 1. Get the 252-column header row
              const lines = exactUnihackCsvString.split('\n');
              const headerLine = lines[0];
              const headers = headerLine.split(',');
              
              // 2. Map dynamically exported products to the 252-column schema
              const rows = uniqueExport.map(p => {
                const cols = new Array(headers.length).fill('');
                // Map known fields based on the Unihack schema format
                cols[10] = p.mpn || ''; // MPN
                cols[11] = p.description || p.mpn || ''; // Description
                cols[15] = p.brand || ''; // Brand
                cols[25] = p.brand || ''; // Manufacturer
                cols[27] = p.mpn || ''; // Model
                
                // Add extracted attributes dynamically if they exist
                if (Array.isArray(p.attributes)) {
                  let attrSlot = 50;
                  p.attributes.forEach((attr: any) => {
                    if (attrSlot < 150 && attr.name && attr.value) {
                      cols[attrSlot] = attr.name;
                      cols[attrSlot+1] = attr.value;
                      attrSlot += 3; // jump to next attribute name slot
                    }
                  });
                }
                
                return cols.map(c => `"${c.replace(/"/g, '""')}"`).join(',');
              });
              
              const csvContent = headerLine + '\n' + rows.join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'Unihack_Expected_Deliver_Output.csv';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}
            className="bg-[#0969DA] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 inline mr-2"/> Export All ({uniqueExport.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Ready for Export</h2>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{uniqueExport.length} Verified Items</span>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-200">
                  <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">MPN</th>
                  <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Brand</th>
                  <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {uniqueExport.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-bold text-[#0B132B]">{p.mpn}</td>
                    <td className="px-6 py-4 text-slate-600">{p.brand}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <a href={`http://localhost:8000/products/${p.id.replace('p', '')}/export/json`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-[#0969DA] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition-colors border border-blue-100">
                          JSON
                        </a>
                        <a href={`http://localhost:8000/products/${p.id.replace('p', '')}/export/csv`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-[#16A34A] bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded transition-colors border border-green-100">
                          CSV
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-white/5"><Terminal className="w-32 h-32"/></div>
            <h3 className="font-bold text-lg mb-2 relative z-10">REST API Integration</h3>
            <p className="text-slate-400 text-sm mb-6 relative z-10">Programmatically fetch verified product data directly into your systems.</p>
            
            <div className="space-y-3 relative z-10">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500 font-mono mb-1 uppercase tracking-wider">Endpoint</div>
                <code className="text-sm text-green-400 font-mono break-all">GET /api/v1/products/verified</code>
              </div>
              <button 
                onClick={() => setShowApiModal(true)}
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                Generate API Key <ExternalLink className="w-4 h-4"/>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100">
                <Webhook className="w-5 h-5 text-purple-600"/>
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Webhooks</h3>
                <p className="text-xs text-slate-500">Real-time sync</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-4">Automatically push product data to your PIM the second it is marked as Verified by human review.</p>
            <button 
              onClick={() => setShowWebhookModal(true)}
              className="w-full py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
            >
              Configure Webhooks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
