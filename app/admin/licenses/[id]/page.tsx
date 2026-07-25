'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type Activation = { id: string; hwId: string; platform: string; browserName: string | null; activatedAt: string; lastSeen: string; isActive: boolean }
type AuditLog = { id: string; action: string; details: string | null; createdAt: string; performedBy: string | null }
type License = { id: string; licenseKey: string; customerEmail: string; customerName: string; planType: string; status: string; activatedAt: string | null; seats: number; maxSeats: number; banned: boolean; banReason: string | null; createdAt: string; activations: Activation[]; auditLogs: AuditLog[] }

export default function LicenseDetailPage() {
  const params = useParams<{ id: string }>()
  const [license, setLicense] = useState<License | null>(null)

  useEffect(() => {
    if (!params.id) return
    fetch(`/api/admin/licenses/${params.id}`)
      .then(res => res.json())
      .then(setLicense)
      .catch(console.error)
  }, [params.id])

  if (!license) return <div className="text-gray-400">Loading...</div>

  const handleAction = async (action: string, body?: any) => {
    await fetch(`/api/admin/licenses/${license.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    })
    setLicense({ ...license, status: body?.status || license.status, banned: body?.banned ?? license.banned, banReason: body?.banReason ?? license.banReason })
  }

  return (
    <div className="max-w-4xl">
      <Link href="/admin/licenses" className="text-gray-400 hover:text-white mb-4 inline-block">&larr; Back to Licenses</Link>
      <h1 className="text-3xl font-bold text-white mb-6">License Detail</h1>

      <div className="bg-gray-800 p-6 rounded-lg mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-white font-mono">{license.licenseKey}</h2>
            <p className="text-gray-400">{license.customerName} &lt;{license.customerEmail}&gt;</p>
          </div>
          <span className={`px-3 py-1 rounded text-sm ${license.status === 'ACTIVE' ? 'bg-green-600' : 'bg-yellow-600'}`}>{license.status}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-gray-300">
          <div><span className="text-gray-500">Plan:</span> {license.planType}</div>
          <div><span className="text-gray-500">Seats:</span> {license.seats} / {license.maxSeats}</div>
          <div><span className="text-gray-500">Activated:</span> {license.activatedAt ? new Date(license.activatedAt).toLocaleString() : 'No'}</div>
          <div><span className="text-gray-500">Banned:</span> {license.banned ? 'Yes' : 'No'}</div>
          <div><span className="text-gray-500">Created:</span> {new Date(license.createdAt).toLocaleString()}</div>
        </div>

        <div className="flex gap-2 mt-6">
          {license.status !== 'SUSPENDED' && (
            <button onClick={() => handleAction('suspend', { status: 'SUSPENDED' })} className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">Suspend</button>
          )}
          {license.status === 'SUSPENDED' && (
            <button onClick={() => handleAction('reactivate', { status: 'ACTIVE' })} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Reactivate</button>
          )}
          {!license.banned && (
            <button onClick={() => handleAction('ban', { banned: true, banReason: 'Banned by admin', status: 'REVOKED' })} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Ban</button>
          )}
          {license.banned && (
            <button onClick={() => handleAction('unban', { banned: false, banReason: null, status: 'ACTIVE' })} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Unban</button>
          )}
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg mb-6">
        <h3 className="text-xl font-bold text-white mb-4">Activations ({license.activations.length})</h3>
        {license.activations.length === 0 ? (
          <p className="text-gray-400">No activations yet.</p>
        ) : (
          <table className="w-full text-gray-300 text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2">HW ID</th>
                <th className="text-left py-2">Platform</th>
                <th className="text-left py-2">Activated</th>
                <th className="text-left py-2">Last Seen</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {license.activations.map(a => (
                <tr key={a.id} className="border-b border-gray-700/50">
                  <td className="py-2 font-mono">{a.hwId.substring(0, 16)}...</td>
                  <td className="py-2">{a.platform}</td>
                  <td className="py-2">{new Date(a.activatedAt).toLocaleString()}</td>
                  <td className="py-2">{new Date(a.lastSeen).toLocaleString()}</td>
                  <td className="py-2"><span className={a.isActive ? 'text-green-400' : 'text-gray-500'}>{a.isActive ? 'Active' : 'Inactive'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-white mb-4">Audit Log</h3>
        <table className="w-full text-gray-300 text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2">Action</th>
              <th className="text-left py-2">Details</th>
              <th className="text-left py-2">By</th>
              <th className="text-left py-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {license.auditLogs.map(log => (
              <tr key={log.id} className="border-b border-gray-700/50">
                <td className="py-2">{log.action}</td>
                <td className="py-2">{log.details}</td>
                <td className="py-2">{log.performedBy}</td>
                <td className="py-2">{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
