'use client';
import { useState, useEffect } from 'react';
import { apiPost, apiPut } from '@/lib/apiClient';
import { Toast } from '@/components/shared/Toast';

const PROFILE_FIELDS = [
  { name: 'fullName',         label: 'Full Name',            type: 'text',   required: true },
  { name: 'mobile',           label: 'Mobile Number',        type: 'tel',    required: true },
  { name: 'username',         label: 'Username',             type: 'text',   required: true },
  { name: 'password',         label: 'Password',             type: 'password', required: true },
  { name: 'bankAccountNumber',label: 'Bank Account Number',  type: 'text',   required: true },
  { name: 'aadhaarNumber',    label: 'Aadhaar Card Number',  type: 'text',   required: true },
  { name: 'salaryPerDay',     label: 'Salary Per Day (₹)',   type: 'number', required: true },
  { name: 'minDailyWorkHours',label: 'Min Daily Work Hours', type: 'number', required: true },
];

interface Props {
  workerId?: string;  // If editing existing worker
  initialData?: Record<string, string>;
  onSaved?: () => void;   // Callback after successful create/update
  onCancel?: () => void;  // Callback to clear selection & return to create mode
}

export default function WorkerProfileForm({ workerId, initialData, onSaved, onCancel }: Props) {
  const [formData, setFormData] = useState<Record<string, string>>(initialData || {});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // J18: Reset Password
  const [showReset, setShowReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Sync form when the parent changes the selected worker
  useEffect(() => {
    setFormData(initialData || {});
    setError('');
    setShowReset(false);
    setNewPassword('');
  }, [workerId, initialData]);

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

  // J24: Wire form submit to API
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      emergencyContacts: [
        { name: formData.contact1Name, mobile: formData.contact1Mobile },
        ...(formData.contact2Name ? [{ name: formData.contact2Name, mobile: formData.contact2Mobile }] : []),
      ],
    };

    try {
      if (workerId) {
        // Edit existing
        await apiPut(`/api/admin/users/${workerId}`, payload);
        setToast({ message: 'Worker profile updated', type: 'success' });
      } else {
        // Create new
        await apiPost('/api/admin/users', payload);
        setToast({ message: 'Worker created successfully', type: 'success' });
        setFormData({});
      }
      onSaved?.();
    } catch (err: any) {
      setError(err.message ?? 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault();
    if (!workerId) return;
    try {
      await apiPut(`/api/admin/users/${workerId}`, { password: newPassword });
      setNewPassword('');
      setShowReset(false);
      setToast({ message: 'Password reset successfully', type: 'success' });
      onSaved?.();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4 max-w-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-700">
            {workerId ? 'Edit Worker Profile' : 'Create Worker Profile'}
          </h2>
          {workerId && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-sm font-medium text-slate-500 hover:text-slate-700 border border-slate-300 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition"
            >
              ✕ Cancel Edit
            </button>
          )}
        </div>

        {workerId && (
          <p className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            ✏️ Editing worker. Change any field and click Save Profile. Leave Password blank to keep current.
          </p>
        )}

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROFILE_FIELDS.filter(f => workerId ? f.name !== 'password' : true).map(field => (
            <div key={field.name} className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-600">{field.label}</label>
              <input
                type={field.type}
                required={field.required && !workerId}
                value={formData[field.name] || ''}
                onChange={updateField(field.name)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
              />
            </div>
          ))}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-600">Role</label>
            <select
              required
              value={formData.role || ''}
              onChange={updateField('role')}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-full bg-white"
            >
              <option value="">— Select role —</option>
              <option value="office">Office</option>
              <option value="factory">Factory</option>
            </select>
          </div>
        </div>

        <h3 className="text-md font-bold text-slate-700 mt-4 border-b pb-2">Emergency Contacts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-600">Contact 1 Name</label>
            <input type="text" required={!workerId} value={formData.contact1Name || ''} onChange={updateField('contact1Name')}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-full" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-600">Contact 1 Mobile</label>
            <input type="tel" required={!workerId} value={formData.contact1Mobile || ''} onChange={updateField('contact1Mobile')}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-full" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-600">Contact 2 Name</label>
            <input type="text" value={formData.contact2Name || ''} onChange={updateField('contact2Name')}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-full" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-600">Contact 2 Mobile</label>
            <input type="tel" value={formData.contact2Mobile || ''} onChange={updateField('contact2Mobile')}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-full" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg py-2.5 px-6 transition self-start disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save Profile'}
        </button>

        {/* J18: Password Reset Section */}
        {workerId && (
          <div className="mt-4 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => setShowReset(!showReset)}
              className="text-sm text-amber-600 hover:underline font-medium"
            >
              🔑 {showReset ? 'Cancel' : 'Reset Password'}
            </button>
            {showReset && (
              <form onSubmit={handlePasswordReset} className="mt-3 flex gap-3">
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="New password"
                  required
                  minLength={6}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm flex-1"
                />
                <button type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-4 py-2 text-sm font-semibold">
                  Reset
                </button>
              </form>
            )}
          </div>
        )}
      </form>
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}
