'use client'

import { useState } from 'react'

export default function LicensePortal() {
  const [key, setKey] = useState('')
  const [hwId, setHwId] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function checkLicense() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/license/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: key, hwId: hwId || 'portal-' + Date.now() })
      })
      const data = await res.json()
      setResult(data)
    } catch (e: any) {
      setResult({ valid: false, status: 'ERROR', message: e.message })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-2">EliteBytes License</h1>
        <p className="text-gray-400 text-sm mb-6">Enter your license key to activate.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm mb-1">License Key</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              placeholder="EB-XXXX-XXXX-XXXX-XXXX"
              className="w-full bg-gray-700 text-white px-4 py-3 rounded font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">Device ID (optional)</label>
            <input
              type="text"
              value={hwId}
              onChange={(e) => setHwId(e.target.value)}
              placeholder="Auto-generated if empty"
              className="w-full bg-gray-700 text-white px-4 py-3 rounded text-sm"
            />
          </div>

          <button
            onClick={checkLicense}
            disabled={loading || !key}
            className="w-full bg-orange-600 text-white py-3 rounded font-bold hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Validate License'}
          </button>
        </div>

        {result && (
          <div className={`mt-6 p-4 rounded ${result.valid ? 'bg-green-900/50 border border-green-600' : 'bg-red-900/50 border border-red-600'}`}>
            <p className={`font-bold ${result.valid ? 'text-green-400' : 'text-red-400'}`}>
              {result.valid ? '✓ Valid License' : '✗ ' + (result.status || 'Invalid')}
            </p>
            <p className="text-gray-300 text-sm mt-1">{result.message}</p>
            {result.license && (
              <div className="mt-2 text-sm text-gray-400">
                <p>Plan: {result.license.planType}</p>
                {result.license.expiresAt && <p>Expires: {new Date(result.license.expiresAt).toLocaleDateString()}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
