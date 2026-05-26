'use client';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Nav */}
      <header className="bg-blue-700 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <span className="text-lg font-bold tracking-wide">WorkForce App</span>
        <div className="flex items-center gap-3">
          {user && <span className="text-xs text-blue-200 hidden sm:inline">{user.fullName}</span>}
          <button
            onClick={logout}
            className="text-sm font-medium bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content — full width on mobile */}
      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        {children}
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="bg-white border-t border-gray-200 flex justify-around py-2 sm:hidden">
        <NavItem icon="🏠" label="Home"    href="/worker/home"    active={pathname === '/worker/home'} />
        <NavItem icon="📋" label="Leave"   href="/worker/leave"   active={pathname === '/worker/leave'} />
        <NavItem icon="👤" label="Profile" href="/worker/profile" active={pathname === '/worker/profile'} />
      </nav>
    </div>
  );
}

function NavItem({ icon, label, href, active }: { icon: string; label: string; href: string; active?: boolean }) {
  return (
    <a href={href} className={`flex flex-col items-center gap-1 transition ${active ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'}`}>
      <span className="text-xl">{icon}</span>
      <span className={`text-xs font-medium ${active ? 'font-bold' : ''}`}>{label}</span>
    </a>
  );
}
