'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { Employee } from '@/app/types/employee';
import { getEmployees } from '@/app/data/employees';
import { EmployeeStats } from '@/app/components/employees/EmployeeStats';
import { EmployeeTable } from '@/app/components/employees/EmployeeTable';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchEmployees() {
      const data = await getEmployees();
      if (isMounted) {
        setEmployees(data);
        setIsLoading(false);
      }
    }

    fetchEmployees();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="p-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Employees</h1>
          <p className="text-slate-500 mt-1">
            Manage your team members and their information
          </p>
        </div>
        <Link
          href="/employees/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#135bec] text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Employee
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#135bec]"></div>
        </div>
      ) : (
        <>
          <EmployeeStats employees={employees} />
          <EmployeeTable employees={employees} />
        </>
      )}
    </main>
  );
}
