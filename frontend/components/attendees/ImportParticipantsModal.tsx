'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, XCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { AttendeeImportPreview, AttendeeImportResult, ImportRow } from '@/types';

interface ImportParticipantsModalProps {
  isOpen: boolean;
  eventId: number;
  eventName: string;
  onClose: () => void;
  onComplete: () => void;
}

type ImportStep = 'select' | 'preview' | 'importing' | 'result';

export const ImportParticipantsModal: React.FC<ImportParticipantsModalProps> = ({
  isOpen,
  eventId,
  eventName,
  onClose,
  onComplete,
}) => {
  const [step, setStep] = useState<ImportStep>('select');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<AttendeeImportPreview | null>(null);
  const [result, setResult] = useState<AttendeeImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep('select');
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setIsProcessing(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUploadPreview = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);
    try {
      const previewResult = await api.importAttendeesPreview(eventId, selectedFile);
      setPreview(previewResult);
      setStep('preview');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to preview import';
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) return;
    setStep('importing');
    setIsProcessing(true);
    setError(null);
    try {
      const importResult = await api.importAttendeesConfirm(eventId, selectedFile);
      setResult(importResult);
      setStep('result');
      onComplete();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to import participants';
      setError(message);
      setStep('preview');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="import-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
    >
      <div
        id="import-modal-content"
        className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 id="import-modal-title" className="text-lg font-bold text-slate-900">
              Import Participants
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Event: {eventName}</p>
          </div>
          <button
            id="import-modal-close-btn"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Step: Select File */}
          {step === 'select' && (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700">
                  {selectedFile ? selectedFile.name : 'Click to select an Excel file'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedFile
                    ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                    : 'Supports .xlsx and .xls files (max 10 MB)'}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileSelect}
              />

              {error && (
                <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 text-xs text-slate-600 space-y-1.5">
                <p className="font-semibold text-slate-700">Supported columns:</p>
                <p>Name, Email, Phone Number, Section, Semester</p>
                <p className="text-slate-400">All other columns (e.g. Timestamp, Gender, College ID) will be ignored.</p>
              </div>
            </div>
          )}

          {/* Step: Preview */}
          {step === 'preview' && preview && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700">{preview.filename}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Total rows</span>
                    <p className="font-bold text-slate-900 text-sm">{preview.total_rows}</p>
                  </div>
                  <div>
                    <span className="text-emerald-600 font-medium">Valid</span>
                    <p className="font-bold text-emerald-700 text-sm">{preview.valid_count}</p>
                  </div>
                  <div>
                    <span className="text-rose-600 font-medium">Invalid</span>
                    <p className="font-bold text-rose-700 text-sm">{preview.invalid_count}</p>
                  </div>
                  <div>
                    <span className="text-amber-600 font-medium">Existing</span>
                    <p className="font-bold text-amber-700 text-sm">{preview.existing_count}</p>
                  </div>
                </div>

                {/* Detected columns */}
                <div className="pt-2 border-t border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Detected columns:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {preview.detected_columns.map((col) => (
                      <span
                        key={col}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-medium"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {col}
                      </span>
                    ))}
                  </div>
                  {preview.ignored_column_count > 0 && (
                    <p className="text-xs text-slate-400 mt-1">
                      {preview.ignored_column_count} other column{preview.ignored_column_count !== 1 ? 's' : ''} will be ignored
                    </p>
                  )}
                </div>
              </div>

              {/* Preview table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                  <table className="w-full text-xs text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[10px] font-bold sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left">Row</th>
                        <th className="px-3 py-2 text-left">Name</th>
                        <th className="px-3 py-2 text-left">Email</th>
                        <th className="px-3 py-2 text-left">Phone</th>
                        <th className="px-3 py-2 text-left">Section</th>
                        <th className="px-3 py-2 text-left">Semester</th>
                        <th className="px-3 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {preview.rows.map((row: ImportRow) => (
                        <tr
                          key={row.row_number}
                          className={row.errors ? 'bg-rose-50/50' : ''}
                        >
                          <td className="px-3 py-2 font-medium text-slate-400">{row.row_number}</td>
                          <td className="px-3 py-2">{row.name || <span className="text-slate-300 italic">-</span>}</td>
                          <td className="px-3 py-2">{row.email || <span className="text-slate-300 italic">-</span>}</td>
                          <td className="px-3 py-2">{row.phone_number || <span className="text-slate-300 italic">-</span>}</td>
                          <td className="px-3 py-2">{row.section || <span className="text-slate-300 italic">-</span>}</td>
                          <td className="px-3 py-2">{row.semester || <span className="text-slate-300 italic">-</span>}</td>
                          <td className="px-3 py-2">
                            {row.errors ? (
                              <span className="text-rose-600 font-medium text-[11px]">
                                {(row.errors || []).join('; ')}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
                                <CheckCircle2 className="w-3 h-3" />
                                Ready
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Step: Importing */}
          {step === 'importing' && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-semibold text-slate-700">Importing participants...</p>
              <p className="text-xs text-slate-400 mt-1">Please do not close this dialog.</p>
            </div>
          )}

          {/* Step: Result */}
          {step === 'result' && result && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900">Import Complete</h3>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Processed</span>
                    <p className="font-bold text-slate-900 text-sm">{result.processed} rows</p>
                  </div>
                  <div>
                    <span className="text-emerald-600 font-medium">Imported</span>
                    <p className="font-bold text-emerald-700 text-sm">{result.imported} participants</p>
                  </div>
                  <div>
                    <span className="text-rose-600 font-medium">Invalid rows skipped</span>
                    <p className="font-bold text-rose-700 text-sm">{result.invalid_skipped}</p>
                  </div>
                  <div>
                    <span className="text-amber-600 font-medium">Existing skipped</span>
                    <p className="font-bold text-amber-700 text-sm">{result.existing_skipped}</p>
                  </div>
                </div>
                {result.duplicate_skipped > 0 && (
                  <div className="pt-2 border-t border-slate-200 text-xs">
                    <span className="text-amber-600 font-medium">Duplicate rows skipped:</span>
                    <span className="font-bold text-amber-700 ml-1">{result.duplicate_skipped}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error display during preview/importing */}
          {error && step !== 'select' && (
            <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2 mt-4">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
          {step === 'preview' && (
            <button
              id="import-back-btn"
              onClick={() => {
                setStep('select');
                setPreview(null);
                setError(null);
              }}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          )}

          {step === 'select' && (
            <button
              id="import-preview-btn"
              onClick={handleUploadPreview}
              disabled={!selectedFile || isProcessing}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              {isProcessing ? 'Processing...' : 'Preview Import'}
            </button>
          )}

          {step === 'preview' && (
            <button
              id="import-confirm-btn"
              onClick={handleConfirmImport}
              disabled={preview?.valid_count === 0}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md transition-colors shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {preview && preview.valid_count > 0
                ? `Import ${preview.valid_count} Participant${preview.valid_count !== 1 ? 's' : ''}`
                : 'No valid rows to import'}
            </button>
          )}

          {step === 'result' && (
            <button
              id="import-done-btn"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors shadow-sm"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
