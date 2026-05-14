'use client';

import React, { useState } from 'react';
import {
  createAutomaticBackup,
  exportTableAsCSV,
  restoreFromBackup,
  generateDestructiveOperationWarning,
  getAvailableBackups
} from '../utils/databaseSafety';

interface DatabaseSafetyModalProps {
  isOpen: boolean;
  operation: 'delete' | 'modify' | 'create';
  tableName: string;
  recordCount?: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DatabaseSafetyModal({
  isOpen,
  operation,
  tableName,
  recordCount,
  onConfirm,
  onCancel
}: DatabaseSafetyModalProps) {
  const [step, setStep] = useState<'warning' | 'backup' | 'confirm'>('warning');
  const [backupCreated, setBackupCreated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Map operation types to expected types
  const mappedOperation = operation === 'modify' ? 'modify_schema' : operation === 'create' ? 'modify_schema' : operation

  const warning = generateDestructiveOperationWarning(mappedOperation as 'delete' | 'modify_schema' | 'drop_table', {
    recordCount,
    affectedColumns: operation === 'modify' ? [tableName] : undefined,
    affectedTables: operation === 'delete' ? [tableName] : undefined
  });

  const handleCreateBackup = async () => {
    setLoading(true);
    const result = await createAutomaticBackup('current-user', tableName);
    setLoading(false);

    if (result.success) {
      setBackupCreated(true);
      setStep('backup');
    }
  };

  const handleExportCSV = async () => {
    setLoading(true);
    await exportTableAsCSV('current-user', tableName);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-red-600 mb-2">⚠️ Confirm Action</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{warning}</p>
        </div>

        {step === 'warning' && (
          <div className="space-y-3">
            <button
              onClick={handleCreateBackup}
              disabled={loading}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Creating backup...' : '✓ Create Backup First'}
            </button>
            <button
              onClick={handleExportCSV}
              disabled={loading}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Exporting...' : '✓ Download CSV Backup'}
            </button>
            <button
              onClick={onCancel}
              className="w-full bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        )}

        {step === 'backup' && backupCreated && (
          <div className="space-y-3">
            <p className="text-sm text-green-600 font-semibold">✅ Backup created successfully!</p>
            <button
              onClick={() => setStep('confirm')}
              className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              Proceed with {operation.charAt(0).toUpperCase() + operation.slice(1)}
            </button>
            <button
              onClick={onCancel}
              className="w-full bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-3">
            <p className="text-sm text-orange-600 font-bold">
              Type "{operation.toUpperCase()}" to confirm:
            </p>
            <input
              type="text"
              placeholder={operation.toUpperCase()}
              className="w-full border px-3 py-2 rounded text-sm"
              onKeyPress={(e) => {
                if (e.currentTarget.value === operation.toUpperCase() && e.key === 'Enter') {
                  onConfirm();
                }
              }}
            />
            <button
              onClick={onConfirm}
              className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Confirm {operation.charAt(0).toUpperCase() + operation.slice(1)}
            </button>
            <button
              onClick={onCancel}
              className="w-full bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
