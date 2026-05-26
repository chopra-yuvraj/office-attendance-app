'use client';
import { useAuth } from '@/context/AuthContext';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';

export default function WorkerProfilePage() {
  const { user, loading, logout } = useAuth();

  if (loading) return (
    <div className="flex flex-col gap-6">
      <CardSkeleton />
    </div>
  );

  if (!user) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p className="text-red-600 font-medium">Not logged in</p>
      <a href="/login" className="text-sm text-blue-600 underline mt-2 inline-block">Go to Login</a>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>

      <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4">
        {/* Avatar & Name */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">{user.fullName}</p>
            <p className="text-sm text-slate-500">@{user.username}</p>
          </div>
        </div>

        {/* Details */}
        <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
          <ProfileRow label="Role" value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} />
          <ProfileRow label="Mobile" value={user.mobile} />
          <ProfileRow label="Min Daily Hours" value={`${user.minDailyWorkHours} hours`} />
          <ProfileRow label="Salary Per Day" value={`₹${user.salaryPerDay}`} />
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-3">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Account</h2>
        <p className="text-xs text-slate-400">To update your details or reset your password, please contact your administrator.</p>
        <button
          onClick={logout}
          className="mt-2 w-full py-2.5 rounded-lg bg-red-50 text-red-600 font-semibold text-sm border border-red-200 hover:bg-red-100 transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
}
