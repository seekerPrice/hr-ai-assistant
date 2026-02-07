import { Users, UserCheck, Clock, FileCheck } from 'lucide-react';

export default function OverviewPage() {
  const stats = [
    { label: 'Total Employees', value: '156', icon: Users, color: 'bg-blue-500' },
    { label: 'Active', value: '142', icon: UserCheck, color: 'bg-green-500' },
    { label: 'On Leave', value: '8', icon: Clock, color: 'bg-amber-500' },
    { label: 'Documents Verified', value: '89%', icon: FileCheck, color: 'bg-purple-500' },
  ];

  return (
    <main className="p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Overview</h1>
        <p className="text-slate-500 mt-1">HR dashboard at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className={`${stat.color} p-3 rounded-lg w-fit mb-4`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
