'use client';
import { useRef } from 'react';
import { FileText, Search, Filter, Globe, File } from 'lucide-react';
import { mockSources } from '@/data/mockProducts';

export default function SourcesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      alert(`Uploading ${e.target.files[0].name}...\n\n(This document will be sent to the AI ingestion pipeline for automatic processing.)`);
      // Reset input so the same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B132B]">Global Source Repository</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all manufacturer PDFs and websites ingested across your organization.</p>
        </div>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="sr-only" 
          accept=".pdf,.csv,.txt"
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-white border border-slate-200 text-[#0969DA] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
        >
          Upload Source
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search documents by name, type, or content..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-[#0969DA]/20 outline-none"
          />
        </div>
        <button 
          onClick={() => alert('Advanced filtering (by Manufacturer, Trust Level, and Content Type) is coming in the Enterprise release.')}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-200">
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Document Name</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Type</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Associated Products</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Trust Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockSources.map((source, i) => (
              <tr key={i} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => alert(`Opening Document Viewer for: ${source.name}`)}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                      {source.type === 'PDF' ? <FileText className="w-4 h-4 text-[#0969DA]" /> : <Globe className="w-4 h-4 text-[#0969DA]" />}
                    </div>
                    <span className="font-semibold text-slate-700 group-hover:text-[#0969DA] transition-colors">
                      {source.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200/60">
                    {source.type === 'PDF' ? <File className="w-3 h-3"/> : <Globe className="w-3 h-3"/>}
                    {source.type}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-slate-600">
                  {((i * 3 + 2) % 5) + 1} Products
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm ${
                    source.trustLevel === 'High' ? 'bg-[#ECFDF3] text-[#16A34A] border-green-200/60' : 
                    source.trustLevel === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-200/60' : 
                    'bg-red-50 text-red-600 border-red-200/60'
                  }`}>
                    {source.trustLevel} Trust
                  </span>
                </td>
              </tr>
            ))}
            
            {/* Add a few more mock rows to make it look full */}
            <tr className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => alert(`Opening Document Viewer for: Installation Guide`)}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                      <FileText className="w-4 h-4 text-[#0969DA]" />
                    </div>
                    <span className="font-semibold text-slate-700 group-hover:text-[#0969DA] transition-colors">
                      Installation Guide - Series 300
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200/60">
                    <File className="w-3 h-3"/> PDF
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-slate-600">
                  12 Products
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm bg-[#ECFDF3] text-[#16A34A] border-green-200/60">
                    High Trust
                  </span>
                </td>
              </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
