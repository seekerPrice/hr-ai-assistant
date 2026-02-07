import { Employee } from '@/app/types/employee';
import { Users, UserCheck, Clock, UserPlus } from 'lucide-react';

interface EmployeeStatsProps {
  employees: Employee[];
}

export function EmployeeStats({ employees }: EmployeeStatsProps) {
  const totalCount = employees.length;
  const activeCount = employees.filter((e) => e.status === 'active').length;
  const onLeaveCount = employees.filter((e) => e.status === 'on_leave').length;

  const now = new Date();
  const thisMonth = employees.filter((e) => {
    const startDate = new Date(e.startDate);
    return (
      startDate.getMonth() === now.getMonth() &&
      startDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const stats = [
    { label: 'Total Employees', value: totalCount, icon: Users, color: 'text-slate-600' },
    { label: 'Active', value: activeCount, icon: UserCheck, color: 'text-green-600' },
    { label: 'On Leave', value: onLeaveCount, icon: Clock, color: 'text-amber-600' },
    { label: 'New This Month', value: thisMonth, icon: UserPlus, color: 'text-indigo-600' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-lg shadow-sm p-4 border border-slate-200"
        >
          <div className="flex items-center gap-3">
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <div>
              <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
