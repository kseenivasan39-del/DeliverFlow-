'use client';
import { useRef, useState } from 'react';
import { FileText, Search, Filter, Globe, File } from 'lucide-react';
import { mockSources } from '@/data/mockProducts';

export default function SourcesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      alert(`Uploading ${e.target.files[0].name}...\n\n(This document will be sent to the AI ingestion pipeline for automatic processing.)`);
      // Reset input so the same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  const allSources = [
    ...mockSources,
    { name: 'Installation Guide - Series 300', type: 'PDF', trustLevel: 'High' }
  ];

  const uniqueTypes = Array.from(new Set(allSources.map(s => s.type)));

  const filteredSources = allSources.filter(source => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      source.name?.toLowerCase().includes(searchLower) || 
      source.type?.toLowerCase().includes(searchLower) ||
      source.trustLevel?.toLowerCase().includes(searchLower);
      
    const matchesFilter = filterType === 'All' || source.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <select 
            className="appearance-none flex items-center gap-2 pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 bg-white outline-none cursor-pointer"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-500 w-0 h-0"></div>
        </div>
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
            {filteredSources.map((source, i) => (
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
            {filteredSources.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-semibold text-lg text-slate-700">No documents found</p>
                  <p className="mt-1">Try adjusting your search or filters.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
