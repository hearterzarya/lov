'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewLicensePage() {
  const [form, setForm] = useState({
    customerEmail: '',
    customerName: '',
    customerPhone: '',
    planType: 'LIFETIME',
    seats: 1,
    maxSeats: 5,
    validFrom: '',
    expiresAt: '',
    notes: ''
  })
  const [result, setResult] = useState<any>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/admin/licenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    if (data.license) {
      setResult(data.license)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-white mb-6">Create New License</h1>

      {result ? (
        <div className="bg-green-900/30 border border-green-600 rounded-lg p-6">
          <h2 className="text-xl font-bold text-green-400 mb-2">License Created!</h2>
          <p className="text-gray-300 mb-4">License Key:</p>
          <div className="bg-gray-800 p-4 rounded font-mono text-xl text-white text-center mb-4">
            {result.licenseKey}
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigator.clipboard.writeText(result.licenseKey)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Copy Key
            </button>
            <button onClick={() => router.push('/admin/licenses')} className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600">
              View All Licenses
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg space-y-4">
          <div>
            <label className="block text-gray-300 mb-1">Customer Email *</label>
            <input type="email" required value={form.customerEmail} onChange={e => setForm({ ...form, customerEmail: e.target.value })} className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Customer Name *</label>
            <input type="text" required value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Customer Phone</label>
            <input type="text" value={form.customerPhone} onChange={e => setForm({ ...form, customerPhone: e.target.value })} className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Plan Type</label>
            <select value={form.planType} onChange={e => setForm({ ...form, planType: e.target.value })} className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600">
              <option value="LIFETIME">LIFETIME</option>
              <option value="YEARLY">YEARLY</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Seats</label>
            <input type="number" min="1" value={form.seats} onChange={e => setForm({ ...form, seats: parseInt(e.target.value) })} className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Max Seats</label>
            <input type="number" min="1" value={form.maxSeats} onChange={e => setForm({ ...form, maxSeats: parseInt(e.target.value) })} className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Valid From</label>
            <input type="date" value={form.validFrom} onChange={e => setForm({ ...form, validFrom: e.target.value })} className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Expires At</label>
            <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600" rows={3} />
          </div>
          <button type="submit" className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 font-semibold">
            Create License
          </button>
        </form>
      )}
    </div>
  )
}
