'use client';
import { useState } from 'react';
import { StatusBadge } from '../shared/StatusBadge';
import { HoursFlagBadge } from '../shared/HoursFlagBadge';

const COLUMNS = [
  { key: 'worker',           label: 'Worker',        width: 'min-w-[160px]' },
  { key: 'date',             label: 'Date',           width: 'min-w-[110px]' },
  { key: 'inTime',           label: 'IN Time',        width: 'min-w-[120px]' },
  { key: 'outTime',          label: 'OUT Time',       width: 'min-w-[120px]' },
  { key: 'workedHours',      label: 'Hours',          width: 'min-w-[70px]'  },
  { key: 'hoursFlag',        label: 'Flag',           width: 'min-w-[120px]' },
  { key: 'status',           label: 'Status',         width: 'min-w-[110px]' },
  { key: 'actions',          label: 'Actions',        width: 'min-w-[180px]' },
];

interface Props {
  records: any[];
  onApprove: (id: string) => void;
  onCorrect: (record: any) => void;
  onViewAudit?: (record: any) => void;
}

/** Get a thumbnail-renderable URL from a Google Drive webViewLink or fileId */
function getDriveThumbnailUrl(punch: { driveFileId?: string; driveWebViewLink?: string } | null): string | null {
  if (!punch) return null;
  if (punch.driveFileId === 'manual_entry' || punch.driveWebViewLink === '#') return null;
  if (punch.driveFileId) {
    // Google Drive direct thumbnail URL (works when file has public reader permission)
    return `https://drive.google.com/thumbnail?id=${punch.driveFileId}&sz=w400`;
  }
  return null;
}

/** Build a Google Maps search URL from stored punch coordinates */
function getGoogleMapsUrl(punch: { coords?: { lat?: number; lng?: number } } | null): string | null {
  if (!punch?.coords?.lat || !punch?.coords?.lng) return null;
  return `https://www.google.com/maps/search/?api=1&query=${punch.coords.lat},${punch.coords.lng}`;
}

export default function AdminDashboardTable({ records, onApprove, onCorrect, onViewAudit }: Props) {
  const [viewingPhoto, setViewingPhoto] = useState<{ url: string; label: string } | null>(null);

  return (
    <>
      <div className="overflow-x-auto rounded-xl shadow bg-white">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-white">
            <tr>
              {COLUMNS.map(col => (
                <th key={col.key} className={`px-4 py-3 font-medium whitespace-nowrap ${col.width}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-8 text-center text-slate-400">
                  No records found for the selected filters.
                </td>
              </tr>
            )}
            {records.map((rec, i) => {
              const inPhotoUrl = getDriveThumbnailUrl(rec.inPunch);
              const outPhotoUrl = getDriveThumbnailUrl(rec.outPunch);
              const inMapsUrl = getGoogleMapsUrl(rec.inPunch);
              const outMapsUrl = getGoogleMapsUrl(rec.outPunch);

              return (
                <tr key={rec._id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-4 py-3 font-medium text-slate-800">{rec.userId?.fullName ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{new Date(rec.date).toLocaleDateString()}</td>

                  {/* IN Time with photo + location icons */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span>{rec.inPunch ? new Date(rec.inPunch.timestamp).toLocaleTimeString() : '—'}</span>
                      {inPhotoUrl && (
                        <button
                          onClick={() => setViewingPhoto({ url: inPhotoUrl, label: `${rec.userId?.fullName ?? 'Worker'} — IN Punch` })}
                          className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                          title="View IN photo"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                      )}
                      {inMapsUrl ? (
                        <a
                          href={inMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                          title="View IN location on Google Maps"
                        >
                          <span className="text-sm leading-none">📍</span>
                        </a>
                      ) : rec.inPunch ? (
                        <span className="text-[10px] text-slate-400" title="No location data">N/A</span>
                      ) : null}
                    </div>
                  </td>

                  {/* OUT Time with photo + location icons */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span>{rec.outPunch ? new Date(rec.outPunch.timestamp).toLocaleTimeString() : '—'}</span>
                      {outPhotoUrl && (
                        <button
                          onClick={() => setViewingPhoto({ url: outPhotoUrl, label: `${rec.userId?.fullName ?? 'Worker'} — OUT Punch` })}
                          className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-orange-50 text-orange-600 hover:bg-orange-100 transition"
                          title="View OUT photo"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                      )}
                      {outMapsUrl ? (
                        <a
                          href={outMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                          title="View OUT location on Google Maps"
                        >
                          <span className="text-sm leading-none">📍</span>
                        </a>
                      ) : rec.outPunch ? (
                        <span className="text-[10px] text-slate-400" title="No location data">N/A</span>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {rec.totalWorkedMinutes != null
                      ? `${Math.floor(rec.totalWorkedMinutes/60)}h ${rec.totalWorkedMinutes%60}m`
                      : '—'}
                  </td>
                  <td className="px-4 py-3"><HoursFlagBadge flag={rec.hoursFlag} /></td>
                  <td className="px-4 py-3"><StatusBadge status={rec.status} /></td>
                  <td className="px-4 py-3 flex gap-2">
                    {rec.status === 'pending' && (
                      <button
                        onClick={() => onApprove(rec._id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => onCorrect(rec)}
                      className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition"
                    >
                      Correct
                    </button>
                    {onViewAudit && rec.corrections?.length > 0 && (
                      <button
                        onClick={() => onViewAudit(rec)}
                        className="bg-slate-600 hover:bg-slate-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition"
                      >
                        🔍 History
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Feature 4: Photo Viewer Modal */}
      {viewingPhoto && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setViewingPhoto(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-700">{viewingPhoto.label}</h3>
              <button
                onClick={() => setViewingPhoto(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition text-slate-500"
              >
                ✕
              </button>
            </div>
            {/* Image */}
            <div className="p-4 flex items-center justify-center bg-slate-50 min-h-[300px]">
              <img
                src={viewingPhoto.url}
                alt={viewingPhoto.label}
                className="max-w-full max-h-[60vh] rounded-lg shadow-sm object-contain"
                onError={(e) => {
                  // Fallback: try iframe if img fails
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    // Extract fileId from thumbnail URL and create an embeddable link
                    const match = viewingPhoto.url.match(/id=([^&]+)/);
                    if (match) {
                      const iframe = document.createElement('iframe');
                      iframe.src = `https://drive.google.com/file/d/${match[1]}/preview`;
                      iframe.className = 'w-full h-[400px] rounded-lg';
                      iframe.setAttribute('allowfullscreen', 'true');
                      parent.appendChild(iframe);
                    } else {
                      parent.innerHTML = '<p class="text-sm text-slate-400">Unable to load photo</p>';
                    }
                  }
                }}
              />
            </div>
            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-200 flex justify-end">
              <a
                href={viewingPhoto.url.replace('/thumbnail?id=', '/file/d/').replace(/&sz=.*/, '/view')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Open in Google Drive ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
