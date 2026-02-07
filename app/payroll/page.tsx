'use client';

import { useState } from 'react';
import { DollarSign, Calendar, Download, Users, FileText } from 'lucide-react';

export default function PayrollPage() {
  const [selectedMonth, setSelectedMonth] = useState('2026-02');

  const payrollSummary = [
    { label: 'Total Payroll', value: 'RM 892,450', icon: DollarSign, color: 'bg-green-500' },
    { label: 'Employees Paid', value: '142', icon: Users, color: 'bg-blue-500' },
    { label: 'Pending Approval', value: '3', icon: FileText, color: 'bg-amber-500' },
    { label: 'Processing Date', value: 'Feb 28', icon: Calendar, color: 'bg-purple-500' },
  ];

  const recentPayrolls = [
    { month: 'January 2026', total: 'RM 848,200', status: 'completed' },
    { month: 'December 2025', total: 'RM 895,600', status: 'completed' },
    { month: 'November 2025', total: 'RM 842,100', status: 'completed' },
  ];

  const deductions = [
    { label: 'EPF (Employee)', amount: 'RM 98,170', percentage: '11%' },
    { label: 'EPF (Employer)', amount: 'RM 116,019', percentage: '13%' },
    { label: 'SOCSO', amount: 'RM 17,849', percentage: '2%' },
    { label: 'PCB (Tax)', amount: 'RM 45,500', percentage: '~5%' },
  ];

  return (
    <main className="p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payroll</h1>
          <p className="text-slate-500 mt-1">Manage salaries and payroll processing</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#135bec]"
          >
            <option value="2026-02">February 2026</option>
            <option value="2026-01">January 2026</option>
            <option value="2025-12">December 2025</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#135bec] text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {payrollSummary.map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className={`${item.color} p-2.5 rounded-lg w-fit mb-3`}>
              <item.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{item.value}</p>
            <p className="text-sm text-slate-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payrolls */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Payroll History</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {recentPayrolls.map((payroll, index) => (
              <div key={index} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{payroll.month}</p>
                  <p className="text-xs text-slate-500">{payroll.total}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  Completed
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Deductions Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Statutory Deductions</h2>
          </div>
          <div className="p-5 space-y-3">
            {deductions.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.percentage}</p>
                </div>
                <p className="text-sm font-semibold text-slate-700">{item.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
