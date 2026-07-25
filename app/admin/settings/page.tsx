'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>

      <div className="bg-gray-800 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Authentication</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1">Admin Password</label>
            <input type="password" defaultValue="admin123" className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600" readOnly />
            <p className="text-gray-500 text-sm mt-1">Set via ADMIN_PASSWORD env var</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Webhook</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1">Razorpay Webhook Secret</label>
            <input type="text" placeholder="Set via RAZORPAY_WEBHOOK_SECRET env var" className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600" readOnly />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4">Pricing</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1">LIFETIME Plan Price (₹)</label>
            <input type="number" defaultValue="999" className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">YEARLY Plan Price (₹)</label>
            <input type="number" defaultValue="999" className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600" />
          </div>
        </div>
      </div>

      {saved && <p className="text-green-400 mt-4">Settings saved!</p>}
    </div>
  )
}
