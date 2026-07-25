import type { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900 flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}

function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 p-6 flex flex-col">
      <h1 className="text-2xl font-bold text-white mb-8">EliteBytes</h1>
      <nav className="space-y-2">
        <a href="/admin" className="block text-gray-300 hover:bg-gray-700 px-3 py-2 rounded">Dashboard</a>
        <a href="/admin/licenses" className="block text-gray-300 hover:bg-gray-700 px-3 py-2 rounded">Licenses</a>
        <a href="/admin/licenses/new" className="block text-gray-300 hover:bg-gray-700 px-3 py-2 rounded">New License</a>
        <a href="/admin/settings" className="block text-gray-300 hover:bg-gray-700 px-3 py-2 rounded">Settings</a>
      </nav>
    </aside>
  )
}
