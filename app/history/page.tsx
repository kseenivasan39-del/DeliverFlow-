import { Activity, Clock, User, Settings, Shield } from 'lucide-react';

export default function HistoryPage() {
  const events = [
    {
      id: 1,
      type: 'user',
      title: 'Human Review Completed',
      description: 'Jane Doe verified conflicting attribute "Pressure" for product VAL-316-100.',
      time: '10 minutes ago',
      icon: User,
      color: 'bg-blue-100 text-blue-600 border-blue-200'
    },
    {
      id: 2,
      type: 'system',
      title: 'Batch Ingestion Started',
      description: 'System automatically ingested 45 new products from Source URL: acme-valves.com/catalog.',
      time: '2 hours ago',
      icon: Settings,
      color: 'bg-slate-100 text-slate-600 border-slate-200'
    },
    {
      id: 3,
      type: 'security',
      title: 'API Key Generated',
      description: 'Admin user generated a new REST API secret key for "Shopify Prod".',
      time: 'Yesterday at 4:30 PM',
      icon: Shield,
      color: 'bg-purple-100 text-purple-600 border-purple-200'
    },
    {
      id: 4,
      type: 'user',
      title: 'Manual Export Initiated',
      description: 'Admin user downloaded JSON export for 12 verified products.',
      time: 'Yesterday at 2:15 PM',
      icon: User,
      color: 'bg-blue-100 text-blue-600 border-blue-200'
    },
    {
      id: 5,
      type: 'system',
      title: 'AI Processing Completed',
      description: 'Processed 150 legacy datasheets. 142 marked Verified, 8 flagged for Human Review.',
      time: 'Aug 20 at 9:00 AM',
      icon: Activity,
      color: 'bg-green-100 text-green-600 border-green-200'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B132B]">System History</h1>
          <p className="text-sm text-slate-500 mt-1">Audit log of all manual reviews, system events, and integrations.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
        <div className="relative border-l-2 border-slate-100 ml-3 md:ml-6 space-y-8 py-4">
          
          {events.map((event) => {
            const Icon = event.icon;
            return (
              <div key={event.id} className="relative pl-8 md:pl-12">
                <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white ${event.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                    <h3 className="font-bold text-slate-800">{event.title}</h3>
                    <span className="flex items-center text-xs font-semibold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                      <Clock className="w-3 h-3 mr-1.5"/> {event.time}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{event.description}</p>
                </div>
              </div>
            )
          })}
          
        </div>
      </div>
    </div>
  );
}
