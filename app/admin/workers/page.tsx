'use client';
import { useState, useCallback } from 'react';
import useSWR from 'swr';
import WorkerProfileForm from '@/components/admin/WorkerProfileForm';
import AttendanceHistoryDrawer from '@/components/admin/AttendanceHistoryDrawer';
import { apiGet, apiPut, apiDelete } from '@/lib/apiClient';

interface Worker {
  _id: string;
  fullName: string;
  username: string;
  role: 'office' | 'factory';
  mobile: string;
  salaryPerDay: number;
  minDailyWorkHours: number;
  bankAccountNumber: string;
  aadhaarNumber: string;
  isActive: boolean;
  emergencyContacts?: { name: string; mobile: string }[];
}

const fetcher = (url: string) => apiGet(url).then(d => d);

export default function AdminWorkersPage() {
  const { data, error, isLoading, mutate } = useSWR('/api/admin/users?limit=100', fetcher);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [historyWorker, setHistoryWorker] = useState<{ _id: string; fullName: string } | null>(null);
  const [deactivating, setDeactivating] = useState<{ _id: string; fullName: string; isActive: boolean } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  // When "Edit" is clicked, fetch full (decrypted) worker details from the /api/admin/users/:id endpoint
  const handleEdit = useCallback(async (worker: Worker) => {
    setLoadingDetail(true);
    try {
      const full = await apiGet(`/api/admin/users/${worker._id}`);
      setSelectedWorker({
        ...full,
        _id: full._id,
      });
    } catch {
      // Fallback: use the masked data from the list if detail fetch fails
      setSelectedWorker(worker);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    setSelectedWorker(null);
  }, []);

  const handleSaved = useCallback(() => {
    mutate(); // Refresh the worker list
  }, [mutate]);

  // Feature 3: Deactivate/Reactivate worker
  async function handleDeactivateConfirm() {
    if (!deactivating) return;
    setActionLoading(true);
    try {
      if (deactivating.isActive) {
        // Deactivate
        await apiDelete(`/api/admin/users/${deactivating._id}`);
      } else {
        // Reactivate
        await apiPut(`/api/admin/users/${deactivating._id}`, { isActive: true });
      }
      mutate();
    } catch (err) {
      console.error('Worker status change failed', err);
    } finally {
      setActionLoading(false);
      setDeactivating(null);
    }
  }

  // Build initialData record for the form from the selected worker
  function buildFormData(w: Worker): Record<string, string> {
    const d: Record<string, string> = {
      fullName:          w.fullName || '',
      mobile:            w.mobile || '',
      username:          w.username || '',
      role:              w.role || '',
      salaryPerDay:      String(w.salaryPerDay ?? ''),
      minDailyWorkHours: String(w.minDailyWorkHours ?? ''),
      bankAccountNumber: w.bankAccountNumber || '',
      aadhaarNumber:     w.aadhaarNumber || '',
    };
    if (w.emergencyContacts?.[0]) {
      d.contact1Name = w.emergencyContacts[0].name || '';
      d.contact1Mobile = w.emergencyContacts[0].mobile || '';
    }
    if (w.emergencyContacts?.[1]) {
      d.contact2Name = w.emergencyContacts[1].name || '';
      d.contact2Mobile = w.emergencyContacts[1].mobile || '';
    }
    return d;
  }

  const workers: Worker[] = data?.users ?? [];
  const filtered = workers.filter(w => {
    // Filter by active/inactive toggle
    if (!showInactive && !w.isActive) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return w.fullName.toLowerCase().includes(q)
      || w.username.toLowerCase().includes(q)
      || w.mobile.includes(q);
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-800">Manage Workers</h1>

      {/* Form Section */}
      <WorkerProfileForm
        key={selectedWorker?._id ?? 'create'}
        workerId={selectedWorker?._id}
        initialData={selectedWorker ? buildFormData(selectedWorker) : undefined}
        onSaved={handleSaved}
        onCancel={selectedWorker ? handleClear : undefined}
      />

      {/* Worker List Section */}
      <section className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="text-lg font-bold text-slate-700 flex-1">
            Workers
            {data && <span className="ml-2 text-sm font-normal text-slate-400">({filtered.length})</span>}
          </h2>
          <div className="flex items-center gap-3">
            {/* Show inactive toggle */}
            <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={e => setShowInactive(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Show Inactive
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by name, username, or mobile…"
                className="border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-full sm:w-72"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="p-8 text-center text-slate-400">
            <div className="inline-block w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin mb-2" />
            <p className="text-sm">Loading workers…</p>
          </div>
        )}

        {error && (
          <div className="p-6 text-center text-red-600 text-sm">
            Failed to load workers. <button onClick={() => mutate()} className="underline text-blue-600">Retry</button>
          </div>
        )}

        {loadingDetail && (
          <div className="fixed inset-0 bg-black/20 z-40 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg px-6 py-4 flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-sm text-slate-600">Loading worker details…</span>
            </div>
          </div>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-sm">
            {searchTerm ? 'No workers match your search.' : 'No workers found. Create one above.'}
          </div>
        )}

        {!isLoading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Full Name</th>
                  <th className="px-5 py-3">Username</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Mobile</th>
                  <th className="px-5 py-3">Salary/Day</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(w => (
                  <tr
                    key={w._id}
                    className={`transition hover:bg-blue-50/50 ${
                      selectedWorker?._id === w._id ? 'bg-blue-50 ring-1 ring-inset ring-blue-200' : ''
                    } ${!w.isActive ? 'opacity-60' : ''}`}
                  >
                    <td className="px-5 py-3 font-medium text-slate-800 whitespace-nowrap">{w.fullName}</td>
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{w.username}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        w.role === 'office'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-teal-100 text-teal-700'
                      }`}>
                        {w.role.charAt(0).toUpperCase() + w.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{w.mobile}</td>
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap">₹{w.salaryPerDay}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${w.isActive ? 'bg-green-500' : 'bg-red-400'}`} />
                      <span className="text-xs text-slate-500">{w.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(w)}
                          disabled={loadingDetail}
                          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => setHistoryWorker({ _id: w._id, fullName: w.fullName })}
                          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          History
                        </button>
                        {/* Feature 3: Deactivate/Reactivate */}
                        <button
                          onClick={() => setDeactivating({ _id: w._id, fullName: w.fullName, isActive: w.isActive })}
                          className={`inline-flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg transition ${
                            w.isActive
                              ? 'text-red-500 hover:text-red-700 hover:bg-red-50'
                              : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                          }`}
                        >
                          {w.isActive ? (
                            <>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                              Deactivate
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Reactivate
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Attendance History Drawer */}
      {historyWorker && (
        <AttendanceHistoryDrawer
          workerId={historyWorker._id}
          workerName={historyWorker.fullName}
          onClose={() => setHistoryWorker(null)}
        />
      )}

      {/* Feature 3: Deactivate Confirmation Modal */}
      {deactivating && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{deactivating.isActive ? '⚠️' : '✅'}</span>
              <h2 className="text-lg font-bold text-slate-800">
                {deactivating.isActive ? 'Deactivate Worker' : 'Reactivate Worker'}
              </h2>
            </div>
            <p className="text-sm text-slate-600">
              {deactivating.isActive
                ? <>Are you sure you want to deactivate <strong>{deactivating.fullName}</strong>? They will no longer be able to log in or punch attendance. Historical records will be preserved.</>
                : <>Are you sure you want to reactivate <strong>{deactivating.fullName}</strong>? They will be able to log in and punch attendance again.</>
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeactivating(null)}
                disabled={actionLoading}
                className="flex-1 border border-slate-300 rounded-lg py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivateConfirm}
                disabled={actionLoading}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold text-white transition disabled:opacity-50 ${
                  deactivating.isActive
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {actionLoading
                  ? 'Processing…'
                  : deactivating.isActive ? 'Deactivate' : 'Reactivate'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
