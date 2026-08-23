
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Clock, FileText, CheckSquare, Download, Settings, Bell } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const topNavItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'History', href: '/history' },
  ];
  
  const sideNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Sources', href: '/sources', icon: FileText },
    { name: 'Reviews', href: '/reviews', icon: CheckSquare },
    { name: 'Exports', href: '/exports', icon: Download },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#111827] font-sans antialiased">
      {/* Top Navigation Bar */}
      <header className="h-[52px] bg-[#0B132B] border-b border-[#0B132B]/80 flex items-center justify-between px-5 shrink-0 text-white z-10 selection:bg-blue-500/30">
        
        {/* Left: Logo & Brand */}
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="DeliverFlow Logo" className="w-7 h-7 rounded border border-white/10" />
          <div className="flex items-baseline gap-2">
            <h1 className="font-semibold text-[15px] tracking-tight">DeliverFlow</h1>
            <span className="text-white/20 text-sm hidden sm:inline">/</span>
            <p className="text-[12px] text-white/50 font-medium tracking-wide hidden sm:inline">AI Product Intelligence</p>
          </div>
        </div>

        {/* Right: Nav Links & Actions */}
        <div className="flex items-center gap-5">
          <nav className="hidden md:flex items-center gap-5">
            {topNavItems.map(item => {
              const active = pathname.startsWith(item.href);
              return (
                <Link key={item.name} href={item.href}
                  className={`text-[13px] font-medium transition-colors duration-150 ${
                    active ? 'text-white' : 'text-white/50 hover:text-white'
                  }`}>
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-4 border-l border-white/20 pl-6">
            
            {/* Settings Dropdown */}
            <div className="relative">
              <button 
                onClick={() => { setShowSettings(!showSettings); setShowProfile(false); }} 
                className={`p-1.5 rounded-md transition-colors duration-200 cursor-pointer ${showSettings ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
              >
                <Settings className="w-4 h-4" />
              </button>
              
              {showSettings && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configuration</p>
                  </div>
                  <button onClick={() => { alert('API Keys configuration coming soon!'); setShowSettings(false); }} className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0969DA] transition-colors">API Keys</button>
                  <button onClick={() => { alert('Webhooks integration coming soon!'); setShowSettings(false); }} className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0969DA] transition-colors">Webhooks</button>
                  <button onClick={() => { alert('Team Members management coming soon!'); setShowSettings(false); }} className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0969DA] transition-colors">Team Members</button>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => { setShowProfile(!showProfile); setShowSettings(false); }} 
                className={`w-7 h-7 rounded-full bg-[#0969DA] text-white flex items-center justify-center font-bold text-xs shadow-inner transition-all cursor-pointer ${showProfile ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-[#0B132B]' : 'hover:ring-2 hover:ring-blue-400 hover:ring-offset-2 hover:ring-offset-[#0B132B]'}`}
              >
                A
              </button>
              
              {showProfile && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-slate-100 mb-1 bg-slate-50/50 rounded-t-xl -mt-1.5">
                    <p className="text-sm font-bold text-slate-900">Admin User</p>
                    <p className="text-xs text-slate-500 font-medium">admin@deliverflow.ai</p>
                  </div>
                  <button onClick={() => { alert('My Account page coming soon!'); setShowProfile(false); }} className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors mt-1">My Account</button>
                  <button onClick={() => { alert('Billing & Plans coming soon!'); setShowProfile(false); }} className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Billing & Plans</button>
                  <div className="border-t border-slate-100 my-1.5"></div>
                  <button onClick={() => { alert('Signing out...'); setShowProfile(false); }} className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">Sign Out</button>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-[220px] bg-[#FAFAFA] border-r border-gray-200 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-3 py-4 space-y-1">
            {sideNavItems.map(item => {
              const active = pathname.startsWith(item.href);
              return (
                <Link key={item.name} href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                    active ? 'bg-white text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-gray-200/60' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
                  }`}>
                  <item.icon className={`w-[15px] h-[15px] ${active ? 'text-gray-900' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-[#FAFAFA] p-8 lg:px-12 lg:py-10">
          <div className="mx-auto max-w-[1040px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
