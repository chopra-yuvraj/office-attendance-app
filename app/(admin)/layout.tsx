export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      {/* Sidebar — hidden on mobile */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-800 text-white min-h-screen px-4 py-6 gap-2">
        <p className="text-xl font-bold mb-6">Admin Panel</p>
        <SidebarLink href="/admin/dashboard"  label="Dashboard" />
        <SidebarLink href="/admin/attendance" label="Attendance" />
        <SidebarLink href="/admin/production" label="Production" />
        <SidebarLink href="/admin/workers"    label="Workers" />
        <SidebarLink href="/admin/leave"      label="Leave Requests" />
        <SidebarLink href="/admin/export"     label="Export" />
      </aside>

      {/* Main content area */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function SidebarLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition text-slate-300 hover:text-white">
      {label}
    </a>
  );
}
