'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { watermarkDocument } from '@/lib/watermark';

interface FileWithStatus {
  file: File;
  status: 'pending' | 'processing' | 'done' | 'error';
  extractedData?: Record<string, string>;
  error?: string;
}

export default function NewEmployeePage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === 'application/pdf'
    );
    if (droppedFiles.length > 0) {
      const newFiles = droppedFiles.map((file) => ({
        file,
        status: 'pending' as const,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
      setError(null);
    } else if (e.dataTransfer.files.length > 0) {
      setError('Only PDF files are allowed');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
      ? Array.from(e.target.files).filter((file) => file.type === 'application/pdf')
      : [];
    if (selectedFiles.length > 0) {
      const newFiles = selectedFiles.map((file) => ({
        file,
        status: 'pending' as const,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
      setError(null);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const analyzeDocuments = async () => {
    if (files.length === 0) return;

    setError(null);
    setIsProcessing(true);

    const updatedFiles = [...files];

    for (let i = 0; i < updatedFiles.length; i++) {
      if (updatedFiles[i].status === 'done') continue;

      updatedFiles[i].status = 'processing';
      setFiles([...updatedFiles]);

      try {
        // Apply watermark to document before sending to AI
        const watermarkedBase64 = await watermarkDocument(updatedFiles[i].file);

        // Call the API to extract data
        const response = await fetch('/api/extract-document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file: watermarkedBase64,
            fileName: updatedFiles[i].file.name,
            fileType: updatedFiles[i].file.type,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to extract document data');
        }

        const data = await response.json();
        updatedFiles[i].status = 'done';
        updatedFiles[i].extractedData = data.extractedData;
      } catch (err) {
        updatedFiles[i].status = 'error';
        updatedFiles[i].error = err instanceof Error ? err.message : 'Failed to process';
      }

      setFiles([...updatedFiles]);
    }

    setIsProcessing(false);
  };

  const handleConfirm = async () => {
    const allExtractedData = files
      .filter((f) => f.status === 'done' && f.extractedData)
      .map((f) => f.extractedData);

    if (allExtractedData.length === 0) return;

    // TODO: Save to database
    router.push('/employees');
  };

  // Merge all extracted data for display
  const mergedExtractedData = files
    .filter((f) => f.status === 'done' && f.extractedData)
    .reduce((acc, f) => ({ ...acc, ...f.extractedData }), {} as Record<string, string>);

  const hasExtractedData = Object.keys(mergedExtractedData).length > 0;
  const hasPendingFiles = files.some((f) => f.status === 'pending');
  const allDone = files.length > 0 && files.every((f) => f.status === 'done');

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#f6f6f8]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shrink-0">
        <div className="px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm font-medium text-slate-500 mb-4">
            <Link href="/employees" className="hover:text-[#135bec] transition-colors">
              Employees
            </Link>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-[#135bec]">Add New Employee</span>
          </nav>

          <h1 className="text-3xl font-bold text-slate-900">Add New Employee</h1>
          <p className="text-slate-500 mt-1">Upload ID documents and let AI extract the information</p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* Left: Upload Area */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-slate-400">upload_file</span>
                  Upload Documents
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Upload MyKad, Passport, or any ID documents (multiple files supported)
                </p>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  m-6 p-8 border-2 border-dashed rounded-xl text-center transition-all cursor-pointer
                  ${isDragging
                    ? 'border-[#135bec] bg-blue-50'
                    : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                  }
                `}
              >
                <div className="py-4">
                  <div className="size-16 mx-auto rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                  </div>
                  <p className="text-slate-600 font-medium">
                    Drag and drop your documents here
                  </p>
                  <p className="text-sm text-slate-400 mt-1">or</p>
                  <label className="mt-4 inline-block">
                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <span className="px-4 py-2 bg-[#135bec] text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                      Browse Files
                    </span>
                  </label>
                  <p className="text-xs text-slate-400 mt-4">
                    Supports PDF files only (max 10MB each)
                  </p>
                </div>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mx-6 mb-6 space-y-3">
                  {files.map((fileItem, index) => (
                    <div
                      key={`${fileItem.file.name}-${index}`}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        fileItem.status === 'done'
                          ? 'bg-green-50 border-green-200'
                          : fileItem.status === 'error'
                          ? 'bg-red-50 border-red-200'
                          : fileItem.status === 'processing'
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${
                        fileItem.status === 'done'
                          ? 'bg-green-100 text-green-600'
                          : fileItem.status === 'error'
                          ? 'bg-red-100 text-red-600'
                          : fileItem.status === 'processing'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {fileItem.status === 'processing' ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                        ) : (
                          <span className="material-symbols-outlined text-xl">
                            {fileItem.status === 'done' ? 'check_circle' : fileItem.status === 'error' ? 'error' : 'description'}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{fileItem.file.name}</p>
                        <p className="text-xs text-slate-500">
                          {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                          {fileItem.status === 'done' && ' • Extracted'}
                          {fileItem.status === 'error' && ` • ${fileItem.error}`}
                          {fileItem.status === 'processing' && ' • Processing...'}
                        </p>
                      </div>

                      {fileItem.status !== 'processing' && (
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">close</span>
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Analyze Button */}
                  {hasPendingFiles && !isProcessing && (
                    <button
                      onClick={analyzeDocuments}
                      className="w-full mt-4 px-6 py-3 bg-[#135bec] text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                      Analyze {files.filter((f) => f.status === 'pending').length} Document{files.filter((f) => f.status === 'pending').length > 1 ? 's' : ''} with AI
                    </button>
                  )}

                  {isProcessing && (
                    <div className="text-center py-2 text-sm text-slate-500">
                      Processing documents...
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Right: Extracted Data Preview */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-0">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-slate-900">Extracted Information</h3>
                  {hasExtractedData && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                      AI Extracted
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {hasExtractedData
                    ? `Data merged from ${files.filter((f) => f.status === 'done').length} document(s)`
                    : files.length > 0
                    ? 'Click "Analyze with AI" to extract data'
                    : 'Upload documents to see extracted data'
                  }
                </p>
              </div>

              <div className="p-5">
                {hasExtractedData ? (
                  <div className="space-y-4">
                    {Object.entries(mergedExtractedData).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                          {key.replace(/_/g, ' ')}
                        </label>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-sm font-medium text-slate-900">{value}</span>
                          <span className="material-symbols-outlined text-green-500 text-[18px]">
                            check_circle
                          </span>
                        </div>
                      </div>
                    ))}

                    <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col gap-3">
                      <button
                        onClick={handleConfirm}
                        disabled={!allDone}
                        className="w-full py-3 px-4 bg-[#135bec] hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-[20px]">person_add</span>
                        Create Employee
                      </button>
                      <button
                        onClick={() => setFiles([])}
                        className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : files.length > 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2">auto_awesome</span>
                    <p className="text-sm font-medium text-slate-600">{files.length} document{files.length > 1 ? 's' : ''} ready</p>
                    <p className="text-xs mt-1">Click "Analyze with AI" to extract information</p>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2">description</span>
                    <p className="text-sm">No documents uploaded yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
