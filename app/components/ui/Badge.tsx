import { EmployeeStatus } from '@/app/types/employee';

const statusStyles: Record<EmployeeStatus, string> = {
  active: 'bg-green-100 text-green-700',
  on_leave: 'bg-amber-100 text-amber-700',
  probation: 'bg-blue-100 text-blue-700',
  terminated: 'bg-red-100 text-red-700',
};

const statusLabels: Record<EmployeeStatus, string> = {
  active: 'Active',
  on_leave: 'On Leave',
  probation: 'Probation',
  terminated: 'Terminated',
};

interface BadgeProps {
  status: EmployeeStatus;
}

export function Badge({ status }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
