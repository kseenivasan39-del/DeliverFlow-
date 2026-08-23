
'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { UploadCloud, FileText } from 'lucide-react';
import { useRef } from 'react';

export default function NewProduct() {
  const router = useRouter();
  const [mpn, setMpn] = useState('');

  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedFile && selectedFile.name.endsWith('.csv')) {
        setIsProcessingCsv(true);
        const text = await selectedFile.text();
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        if (lines.length > 1) {
          const headers = lines[0].split(',').map(h => h.trim());
          const mpnIdx = headers.findIndex(h => h === 'Mfg_Part_Num' || h === 'PART_NUMBER' || h === 'MPN');
          const brandIdx = headers.findIndex(h => h === 'E1_Brand' || h === 'BRAND_NAME' || h === 'Part_Manuf' || h === 'Brand');
          const descIdx = headers.findIndex(h => h === 'Part_Desc' || h === 'Description' || h === 'SHORT_DESC');
          
          // Process ALL rows dynamically
          const rowsToProcess = lines.slice(1).filter(l => l.trim().length > 0);
          let firstId = null;
          
          // Set up a background processor so we can route the user to the processing page immediately
          // while the rest of the 2,000 products process sequentially in the background.
          const processAll = async () => {
              for (let rowIdx = 0; rowIdx < rowsToProcess.length; rowIdx++) {
                 const line = rowsToProcess[rowIdx];
                 const finalCols = [];
                 let current = '';
                 let inQuotes = false;
                 for (let i = 0; i < line.length; i++) {
                   const char = line[i];
                   if (char === '"' && line[i+1] === '"') {
                     current += '"';
                     i++; 
                   } else if (char === '"') {
                     inQuotes = !inQuotes;
                   } else if (char === ',' && !inQuotes) {
                     finalCols.push(current.trim());
                     current = '';
                   } else {
                     current += char;
                   }
                 }
                 finalCols.push(current.trim());
                 
                 const rowMpn = mpnIdx >= 0 ? finalCols[mpnIdx] : `CSV-MPN-${Math.floor(Math.random()*1000)}`;
                 const rowBrand = brandIdx >= 0 ? finalCols[brandIdx] : 'CSV Brand';
                 const rowDesc = descIdx >= 0 ? finalCols[descIdx] : '';
                 
                 if (rowMpn && rowMpn !== '-- Unbranded --' && rowMpn !== 'null') {
                     try {
                         const res = await fetch('https://deliverflow-2foc.onrender.com/products', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ mpn: rowMpn, brand: rowBrand, description: rowDesc })
                         });
                         const data = await res.json();
                         if (rowIdx === 0) firstId = data.id; // capture first product for immediate routing
                         
                         // Enrich sequentially with a 2-second delay to throttle against rate limits
                         if (data.id) {
                           await fetch(`https://deliverflow-2foc.onrender.com/products/${data.id}/enrich`, { method: 'POST' });
                           // Pause to respect API limits
                           await new Promise(r => setTimeout(r, 2000));
                         }
                     } catch (err) {
                         console.error(`Error processing row ${rowIdx}:`, err);
                     }
                 }
              }
          };

          // Kick off the background queue processing ALL products
          processAll();
          
          // Wait briefly for the first product to be created in the background
          for (let i = 0; i < 20; i++) {
            if (firstId) break;
            await new Promise(r => setTimeout(r, 100));
          }
          
          if (firstId) {
             router.push(`/products/${firstId}/processing`);
          } else {
             router.push('/dashboard');
          }
          return;
        }
      }

      if (!mpn || !brand) {
         alert('Please enter an MPN and Brand, or upload a CSV file.');
         return;
      }
      setIsProcessingCsv(true);
      
      const res = await fetch('https://deliverflow-2foc.onrender.com/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mpn, brand, description })
      });
      const data = await res.json();
      
      router.push(`/products/${data.id}/processing`);
    } catch (err) {
      console.error(err);
      alert('Failed to process products. Check backend connection.');
      setIsProcessingCsv(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#062E6F]">Turn product identifiers into verified product intelligence.</h1>
          <p className="text-slate-500 mt-2">Enter minimal product information and let AI discover, enrich, verify, and structure the product data.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Manufacturer Part Number (MPN)</label>
            <input type="text" value={mpn} onChange={e => setMpn(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 focus:ring-[#0969DA] focus:border-[#0969DA]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
            <input type="text" value={brand} onChange={e => setBrand(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 focus:ring-[#0969DA] focus:border-[#0969DA]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Short Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 focus:ring-[#0969DA] focus:border-[#0969DA]" />
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
              isDragging ? 'border-[#0969DA] bg-blue-100 ring-4 ring-blue-500/20' 
              : selectedFile ? 'border-[#0969DA] bg-blue-50' 
              : 'border-slate-300 hover:bg-slate-50'
            }`}
          >
            <input 
              type="file" 
              className="sr-only" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept=".csv,.pdf,.png,.jpg,.jpeg"
            />
            {selectedFile ? (
              <div className="flex flex-col items-center">
                <FileText className="w-8 h-8 text-[#0969DA] mb-2" />
                <p className="text-sm font-semibold text-[#0969DA]">{selectedFile.name}</p>
                <p className="text-xs text-blue-500 mt-1">Ready to attach {isProcessingCsv && '(Processing...)'}</p>
              </div>
            ) : (
              <div>
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">Drag & drop a file or click to upload</p>
                <p className="text-xs text-slate-500 mt-1">CSV, PDF, PNG, JPG (Max 10MB)</p>
              </div>
            )}
          </div>

          <button disabled={isProcessingCsv} type="submit" className="w-full bg-[#0969DA] text-white py-3 rounded-md font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50">
            {isProcessingCsv ? 'Processing Bulk CSV...' : 'Generate Product Intelligence \u2192'}
          </button>
        </form>
      </div>
      
      <div className="hidden md:flex flex-1 bg-slate-50 rounded-lg border border-slate-100 items-center justify-center p-8">
        <div className="text-center text-slate-400">
           <img src="https://images.unsplash.com/photo-1584820927498-cafeec25cbb4?auto=format&fit=crop&q=80&w=400&h=400" alt="Valve placeholder" className="rounded-lg shadow-md mb-4 mix-blend-multiply opacity-80" />
           <p className="text-sm font-medium">Visual processing ready</p>
        </div>
      </div>
    </div>
  )
}
