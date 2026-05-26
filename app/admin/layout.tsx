'use client';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin/dashboard',  label: '📊 Dashboard' },
  { href: '/admin/attendance', label: '📋 Attendance' },
  { href: '/admin/production', label: '🏭 Production' },
  { href: '/admin/workers',    label: '👷 Workers' },
  { href: '/admin/leave',      label: '🏖️ Leave Requests' },
  { href: '/admin/export',     label: '📤 Export' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      {/* Sidebar — hidden on mobile, shown on desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-800 text-white min-h-screen px-4 py-6 justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-xl font-bold mb-6">Admin Panel</p>
          {NAV_ITEMS.map(item => (
            <SidebarLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={pathname.startsWith(item.href)}
            />
          ))}
        </div>

        {/* Bottom of sidebar: user info + logout */}
        <div className="border-t border-slate-700 pt-4 mt-4 flex flex-col gap-3">
          {user && (
            <p className="text-xs text-slate-400 truncate">
              Signed in as <span className="text-slate-200 font-medium">{user.fullName}</span>
            </p>
          )}
          <button
            onClick={logout}
            className="w-full text-sm font-medium text-red-300 hover:text-white hover:bg-red-600/30 px-3 py-2 rounded-lg transition text-left"
          >
            ↪ Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden bg-slate-800 text-white px-4 py-3 flex items-center justify-between">
        <span className="text-lg font-bold">Admin Panel</span>
        <button
          onClick={logout}
          className="text-sm font-medium bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg transition"
        >
          Logout
        </button>
      </div>

      {/* Mobile nav bar */}
      <div className="lg:hidden bg-slate-700 overflow-x-auto">
        <div className="flex px-2 py-1.5 gap-1 min-w-max">
          {NAV_ITEMS.map(item => (
            <a
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                pathname.startsWith(item.href)
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-600'
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function SidebarLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <a
      href={href}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      }`}
    >
      {label}
    </a>
  );
}
