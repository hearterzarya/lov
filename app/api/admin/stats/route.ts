import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const [
      totalLicenses,
      activeLicenses,
      suspendedLicenses,
      expiredLicenses,
      bannedLicenses,
      totalActivations,
      activeActivations,
      recentActivations,
      allLicenses
    ] = (await Promise.all([
      prisma.license.count(),
      prisma.license.count({ where: { status: 'ACTIVE' } }),
      prisma.license.count({ where: { status: 'SUSPENDED' } }),
      prisma.license.count({ where: { status: 'EXPIRED' } }),
      prisma.license.count({ where: { banned: true } }),
      prisma.activation.count(),
      prisma.activation.count({ where: { isActive: true } }),
      prisma.auditLog.findMany({ where: { action: 'ACTIVATED' }, orderBy: { createdAt: 'desc' }, take: 10, include: { license: { select: { customerName: true } } } }),
      prisma.license.findMany()
    ])) as [number, number, number, number, number, number, number, any[], any[]]

    const revenueThisMonth = allLicenses
      .filter(l => l.createdAt.getMonth() === new Date().getMonth() && l.createdAt.getFullYear() === new Date().getFullYear())
      .reduce((sum, l) => sum + (l.planType === 'LIFETIME' ? 999 : 999), 0)

    const revenueTotal = allLicenses.reduce((sum, l) => sum + (l.planType === 'LIFETIME' ? 999 : 999), 0)

    return NextResponse.json({
      totalLicenses,
      activeLicenses,
      suspendedLicenses,
      expiredLicenses,
      bannedLicenses,
      totalActivations,
      activeActivations,
      recentActivations: recentActivations.map((a: any) => ({
        hwId: a.ipAddress || 'unknown',
        activatedAt: a.createdAt.toISOString(),
        customerName: a.license?.customerName || 'Unknown'
      })),
      revenueThisMonth,
      revenueTotal
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
