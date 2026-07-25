'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type License = {
  id: string
  licenseKey: string
  customerEmail: string
  customerName: string
  planType: string
  status: string
  activatedAt: string | null
  seats: number
  banned: boolean
  createdAt: string
}

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const params = new URLSearchParams({ page: page.toString() })
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)

    fetch(`/api/admin/licenses?${params}`)
      .then(res => res.json())
      .then(data => {
        setLicenses(data.licenses)
        setTotalPages(data.totalPages)
      })
      .catch(console.error)
  }, [search, statusFilter, page])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this license?')) return
    await fetch(`/api/admin/licenses/${id}`, { method: 'DELETE' })
    setLicenses(licenses.filter(l => l.id !== id))
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    await fetch(`/api/admin/licenses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    setLicenses(licenses.map(l => l.id === id ? { ...l, status: newStatus } : l))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Licenses</h1>
        <Link href="/admin/licenses/new" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          + New License
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email, name, or key..."
          className="px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 text-white rounded border border-gray-700"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
          <option value="EXPIRED">EXPIRED</option>
          <option value="REVOKED">REVOKED</option>
        </select>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-gray-300">
          <thead className="bg-gray-700">
            <tr>
              <th className="text-left p-3">Key</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Plan</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Seats</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map(license => (
              <tr key={license.id} className="border-b border-gray-700">
                <td className="p-3 font-mono text-sm">{license.licenseKey}</td>
                <td className="p-3">
                  <div>{license.customerName}</div>
                  <div className="text-gray-500 text-sm">{license.customerEmail}</div>
                </td>
                <td className="p-3">{license.planType}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${license.status === 'ACTIVE' ? 'bg-green-600' : license.status === 'SUSPENDED' ? 'bg-yellow-600' : 'bg-red-600'}`}>
                    {license.status}
                  </span>
                  {license.banned && <span className="ml-2 text-red-400 text-xs">BANNED</span>}
                </td>
                <td className="p-3">{license.seats}</td>
                <td className="p-3 flex gap-2">
                  <Link href={`/admin/licenses/${license.id}`} className="text-blue-400 hover:text-blue-300 text-sm">View</Link>
                  <button onClick={() => handleStatusChange(license.id, 'SUSPENDED')} className="text-yellow-400 hover:text-yellow-300 text-sm">Suspend</button>
                  <button onClick={() => handleDelete(license.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50">
            Previous
          </button>
          <span className="text-gray-400 py-2">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50">
            Next
          </button>
        </div>
      )}
    </div>
  )
}
