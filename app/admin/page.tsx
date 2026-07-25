'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Stats = {
  totalLicenses: number
  activeLicenses: number
  suspendedLicenses: number
  expiredLicenses: number
  bannedLicenses: number
  totalActivations: number
  activeActivations: number
  recentActivations: { activatedAt: string; customerName: string }[]
  revenueThisMonth: number
  revenueTotal: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(setStats)
      .catch(console.error)
  }, [])

  if (!stats) return <div className="text-gray-400">Loading...</div>

  const cards = [
    { label: 'Total Licenses', value: stats.totalLicenses, color: 'bg-blue-600' },
    { label: 'Active', value: stats.activeLicenses, color: 'bg-green-600' },
    { label: 'Suspended', value: stats.suspendedLicenses, color: 'bg-yellow-600' },
    { label: 'Expired', value: stats.expiredLicenses, color: 'bg-orange-600' },
    { label: 'Banned', value: stats.bannedLicenses, color: 'bg-red-600' },
    { label: 'Active Activations', value: stats.activeActivations, color: 'bg-purple-600' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className={`${card.color} p-6 rounded-lg`}>
            <div className="text-white/70 text-sm">{card.label}</div>
            <div className="text-3xl font-bold text-white mt-1">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Revenue</h2>
        <div className="flex gap-8">
          <div>
            <div className="text-gray-400 text-sm">This Month</div>
            <div className="text-2xl font-bold text-white">₹{stats.revenueThisMonth.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Total</div>
            <div className="text-2xl font-bold text-white">₹{stats.revenueTotal.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activations</h2>
        {stats.recentActivations.length === 0 ? (
          <p className="text-gray-400">No activations yet.</p>
        ) : (
          <table className="w-full text-gray-300">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2">Customer</th>
                <th className="text-left py-2">Activated</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentActivations.map((a, i) => (
                <tr key={i} className="border-b border-gray-700/50">
                  <td className="py-2">{a.customerName}</td>
                  <td className="py-2">{new Date(a.activatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-8 flex gap-4">
        <Link href="/admin/licenses" className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition">
          View All Licenses
        </Link>
        <Link href="/admin/licenses/new" className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition">
          New License
        </Link>
      </div>
    </div>
  )
}
