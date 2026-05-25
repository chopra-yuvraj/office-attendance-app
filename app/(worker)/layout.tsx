export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Nav */}
      <header className="bg-blue-700 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <span className="text-lg font-bold tracking-wide">WorkForce App</span>
        <button className="text-sm underline">Logout</button>
      </header>

      {/* Main content — full width on mobile */}
      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        {children}
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="bg-white border-t border-gray-200 flex justify-around py-2 sm:hidden">
        <NavItem icon="🏠" label="Home" href="/worker/home" />
        <NavItem icon="📋" label="Leave"  href="/worker/leave" />
        <NavItem icon="👤" label="Profile" href="/worker/profile" />
      </nav>
    </div>
  );
}

function NavItem({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <a href={href} className="flex flex-col items-center gap-1 text-slate-500 hover:text-blue-600">
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </a>
  );
}
