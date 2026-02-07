'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
// Ensure these types/functions exist in your project, or replace with mock data if testing
import { Employee } from '@/app/types/employee';
import { getEmployeeById } from '@/app/data/employees';
import { Document, getDocumentsByEmployee } from '@/lib/mock-data';

export default function EmployeeDetailPage() {
  const params = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      // Safe check for ID
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      
      if (id) {
        // Fetch Employee Data
        // If you don't have the real API yet, you might need to wrap this in a try/catch
        try {
          const emp = await getEmployeeById(id);
          if (isMounted && emp) {
            setEmployee(emp);
            
            // Fetch Documents
            const docs = getDocumentsByEmployee(id);
            setDocuments(docs);
            
            // Select the first unverified doc, or first doc default
            const unverified = docs.find((d) => !d.is_verified);
            setSelectedDoc(unverified || docs[0] || null);
          }
        } catch (error) {
          console.error("Failed to fetch data", error);
        }
        setIsLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  if (isLoading) {
    return (
      <main className="p-10">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#135bec]"></div>
        </div>
      </main>
    );
  }

  if (!employee) {
    return (
      <main className="p-10">
        <div className="text-center py-12">
          <p className="text-slate-500">Employee not found.</p>
        </div>
      </main>
    );
  }

  const getDocTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      mykad: 'MyKad / IC',
      passport: 'Passport',
      visa: 'Visa / Work Permit',
      certificate: 'Certificate',
    };
    return labels[type] || type;
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  };

  const verifiedCount = documents.filter((d) => d.is_verified).length;
  const completionPercent = documents.length > 0
    ? Math.round((verifiedCount / documents.length) * 100)
    : 0;

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Active',
      on_leave: 'On Leave',
      probation: 'Probation',
      terminated: 'Terminated',
    };
    return labels[status] || status;
  };

  // Detect employee type based on documents
  const isLocal = documents.some((d) => d.doc_type === 'mykad');
  const isExpat = documents.some((d) => d.doc_type === 'passport');

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#f6f6f8] relative">
      {/* Header with Banner, Profile & Employee Info */}
      <header className="bg-white border-b border-slate-200 shrink-0">

        {/* Breadcrumb & Profile Header */}
        <div className="px-8 pb-6">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm font-medium text-slate-500 py-4">
            <Link href="/employees" className="hover:text-[#135bec] transition-colors">
              Employees
            </Link>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-slate-700">{employee.firstName} {employee.lastName}</span>
          </nav>

          {/* Employee Info with Avatar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-4">
            <div className="flex items-end gap-6">
              {/* Large Profile Picture */}
              <div className="relative">
                {employee.avatarUrl ? (
                  <Image
                    src={employee.avatarUrl}
                    alt={`${employee.firstName} ${employee.lastName}`}
                    width={112}
                    height={112}
                    className="size-28 rounded-full object-cover ring-4 ring-white shadow-xl"
                  />
                ) : (
                  <div className="size-28 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 ring-4 ring-white shadow-xl flex items-center justify-center text-4xl font-bold text-white">
                    {employee.firstName?.[0]}{employee.lastName?.[0]}
                  </div>
                )}
                {/* Online indicator */}
                <div className={`absolute bottom-2 right-2 size-5 rounded-full border-4 border-white ${
                  employee.status === 'active' ? 'bg-green-500' :
                  employee.status === 'on_leave' ? 'bg-amber-500' : 'bg-blue-500'
                }`}></div>
              </div>

              {/* Name & Details */}
              <div className="pb-1">
                <h2 className="text-3xl font-bold text-slate-900">
                  {employee.firstName} {employee.lastName}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[20px] text-slate-400">work</span>
                    <span className="font-medium">{employee.role}</span>
                  </span>
                  <span className="size-1.5 rounded-full bg-slate-300"></span>
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[20px] text-slate-400">apartment</span>
                    <span>{employee.department}</span>
                  </span>
                  <span className="size-1.5 rounded-full bg-slate-300"></span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${
                    employee.status === 'active' ? 'bg-green-100 text-green-700' :
                    employee.status === 'on_leave' ? 'bg-amber-100 text-amber-700' :
                    employee.status === 'probation' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                  }`}>
                    <span className={`size-2 rounded-full ${
                      employee.status === 'active' ? 'bg-green-500' :
                      employee.status === 'on_leave' ? 'bg-amber-500' :
                      employee.status === 'probation' ? 'bg-blue-500' : 'bg-red-500'
                    }`}></span>
                    {getStatusLabel(employee.status)}
                  </span>

                  {/* Local/Expat Badge - AI Detected */}
                  {(isLocal || isExpat) && (
                    <>
                      <span className="size-1.5 rounded-full bg-slate-300"></span>

                      {isLocal && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          <span>🇲🇾</span>
                          <span>Local Citizen</span>
                        </span>
                      )}

                      {isExpat && !isLocal && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-orange-50 text-orange-700 border border-orange-100">
                          <span>🌍</span>
                          <span>Expatriate</span>
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Additional Info */}
                {(employee.email || employee.phone || employee.location) && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-slate-500">
                    {employee.email && (
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">mail</span>
                        {employee.email}
                      </span>
                    )}
                    {employee.phone && (
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">phone</span>
                        {employee.phone}
                      </span>
                    )}
                    {employee.location && (
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        {employee.location}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Completion Progress Card */}
            <div className="flex items-center gap-4 bg-slate-50 rounded-xl px-5 py-4 border border-slate-200 mt-6 md:mt-0">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Document Compliance</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold text-slate-900">{completionPercent}%</span>
                  <span className="text-sm text-slate-500">({verifiedCount}/{documents.length})</span>
                </div>
              </div>
              <div className="w-32 h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    completionPercent === 100 ? 'bg-green-500' :
                    completionPercent >= 50 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${completionPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto flex flex-col xl:flex-row gap-8 items-start">
          
          {/* Left Column: Document List */}
          <div className="flex-1 w-full space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Compliance Documents</h3>
              <button className="text-sm font-medium text-[#135bec] hover:text-blue-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download All
              </button>
            </div>

            {/* Document Cards Stack */}
            <div className="space-y-4">
              {documents.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">folder_off</span>
                  <p className="text-slate-500">No documents uploaded yet</p>
                </div>
              ) : (
                documents.map((doc) => {
                  const isSelected = selectedDoc?.id === doc.id;
                  const isVerified = doc.is_verified;

                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`
                        relative bg-white rounded-xl p-4 flex items-center gap-4 transition-all cursor-pointer
                        ${isSelected
                          ? 'border-2 border-[#135bec] shadow-lg shadow-blue-100'
                          : 'border border-slate-200 hover:shadow-md'
                        }
                      `}
                    >
                      {isSelected && (
                        <div className="absolute -left-0.5 top-4 w-1 h-12 bg-[#135bec] rounded-r-lg"></div>
                      )}

                      <div className={`
                        size-12 rounded-lg flex items-center justify-center shrink-0
                        ${isVerified
                          ? 'bg-green-50 text-green-600'
                          : 'bg-amber-50 text-amber-600'
                        }
                      `}>
                        <span className="material-symbols-outlined">
                          {isVerified ? 'check_circle' : 'pending'}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-slate-900 truncate">
                            {getDocTypeLabel(doc.doc_type)}
                          </h4>
                          {!isVerified && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide">
                              Action Required
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {isVerified
                            ? `Verified on ${formatDate(doc.created_at)}`
                            : 'Waiting for verification'
                          }
                        </p>
                      </div>

                      <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50">
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                    </div>
                  );
                })
              )}

              {/* Upload New Document Card */}
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-4 flex items-center gap-4 opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                <div className="size-12 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">upload_file</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-slate-900">Upload New Document</h4>
                  <p className="text-xs text-slate-500">Add additional compliance documents</p>
                </div>
                <button className="px-4 py-2 text-xs font-medium text-[#135bec] border border-[#135bec]/30 hover:bg-[#135bec]/5 rounded-lg transition-colors">
                  Upload
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: OCR Verification Panel */}
          {selectedDoc && (
            <div className="w-full xl:w-[450px] shrink-0 xl:sticky xl:top-0">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
                
                {/* Panel Header */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-slate-900">Document Verification</h3>
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                      Auto-Detected
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    System has analyzed <span className="font-medium text-slate-700">{getDocTypeLabel(selectedDoc.doc_type)}</span>. Please review the extracted data below.
                  </p>
                </div>

                {/* Document Preview Area */}
                <div className="relative h-48 bg-slate-100 w-full overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-slate-400">description</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-white">
                    <div>
                      <p className="text-xs font-medium opacity-80">Source File</p>
                      <p className="text-sm font-bold truncate">{getDocTypeLabel(selectedDoc.doc_type)}.pdf</p>
                    </div>
                    <button className="size-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors">
                      <span className="material-symbols-outlined text-[18px]">open_in_full</span>
                    </button>
                  </div>
                </div>

                {/* Extracted Data Fields */}
                <div className="p-5 space-y-5">
                  <div className="space-y-4">
                    {/* Document Number */}
                    <div className="group relative">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Document Number
                      </label>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 group-hover:border-[#135bec]/50 transition-colors">
                        <span className="font-mono text-sm font-medium text-slate-900">
                          {selectedDoc.doc_number || 'N/A'}
                        </span>
                        <span className="material-symbols-outlined text-green-500 text-[18px]" title="High Confidence">
                          check_circle
                        </span>
                      </div>
                    </div>

                    {/* Expiry Date */}
                    {selectedDoc.expiry_date && (
                      <div className="group relative">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Expiry Date
                          </label>
                          {!selectedDoc.is_verified && (
                            <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                              Review Needed
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white border-2 border-[#135bec]/30 shadow-sm ring-2 ring-[#135bec]/5">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#135bec] text-[20px]">calendar_month</span>
                            <span className="text-base font-bold text-slate-900">{selectedDoc.expiry_date}</span>
                          </div>
                          <button className="text-slate-400 hover:text-[#135bec] transition-colors">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                        </div>
                        <p className="mt-1.5 text-xs text-slate-400">
                          Confidence Score: <span className="text-green-600 font-medium">98% Match</span>
                        </p>
                      </div>
                    )}

                    {/* Issuing Country */}
                    <div className="group relative">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Issuing Country
                      </label>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 group-hover:border-[#135bec]/50 transition-colors">
                        <span className="text-sm font-medium text-slate-900">
                          {selectedDoc.issuing_country || 'N/A'}
                        </span>
                        <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-3">
                    {!selectedDoc.is_verified ? (
                      <>
                        <button className="w-full py-3 px-4 bg-[#135bec] hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md shadow-blue-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-[20px]">verified</span>
                          Confirm & Verify
                        </button>
                        <button className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                          Reject Document
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center justify-center gap-2 py-3 text-green-600">
                        <span className="material-symbols-outlined">verified</span>
                        <span className="font-semibold">Document Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}