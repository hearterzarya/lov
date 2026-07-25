import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { licenseKey, hwId, platform, browserName, browserVersion } = await request.json()

    const license = await prisma.license.findUnique({
      where: { licenseKey }
    })

    if (!license) {
      return NextResponse.json({ success: false, error: 'INVALID_KEY', message: 'License key not found.' }, { status: 404 })
    }

    if (license.banned) {
      return NextResponse.json({ success: false, error: 'BANNED', message: 'License has been banned.' }, { status: 403 })
    }

    if (license.status === 'EXPIRED' || (license.expiresAt && license.expiresAt < new Date())) {
      return NextResponse.json({ success: false, error: 'EXPIRED', message: 'License has expired.' }, { status: 403 })
    }

    if (license.status === 'SUSPENDED') {
      return NextResponse.json({ success: false, error: 'SUSPENDED', message: 'License is suspended.' }, { status: 403 })
    }

    // Check if this hwId already activated for this license
    const existing = await prisma.activation.findUnique({
      where: { licenseId_hwId: { licenseId: license.id, hwId } }
    })

    if (existing) {
      await prisma.activation.update({
        where: { id: existing.id },
        data: { lastSeen: new Date(), isActive: true }
      })
      await prisma.license.update({
        where: { id: license.id },
        data: { lastHeartbeat: new Date() }
      })
      await prisma.auditLog.create({
        data: {
          licenseId: license.id,
          action: 'REACTIVATED',
          details: `Reactivated on ${platform}`,
          performedBy: 'system'
        }
      })
      return NextResponse.json({
        success: true,
        status: 'REACTIVATED',
        message: 'License reactivated on this device.',
        activation: { licenseId: license.id, planType: license.planType, activatedAt: existing.activatedAt.toISOString(), expiresAt: license.expiresAt?.toISOString() || null }
      })
    }

    // Check seat count
    const activeCount = await prisma.activation.count({
      where: { licenseId: license.id, isActive: true }
    })

    if (activeCount >= license.seats) {
      return NextResponse.json({ success: false, error: 'SEAT_LIMIT', message: 'All seats used. Deactivate another device first.' }, { status: 403 })
    }

    // Create new activation
    const activation = await prisma.activation.create({
      data: {
        licenseId: license.id,
        hwId,
        platform: platform || 'unknown',
        browserName,
        browserVersion
      }
    })

    await prisma.license.update({
      where: { id: license.id },
      data: { currentHW: hwId, activatedAt: new Date(), activatedBy: hwId, lastHeartbeat: new Date() }
    })

    await prisma.auditLog.create({
      data: {
        licenseId: license.id,
        action: 'ACTIVATED',
        details: `Activated on ${platform} (${browserName || 'unknown'})`,
        performedBy: 'system'
      }
    })

    return NextResponse.json({
      success: true,
      status: 'ACTIVATED',
      message: 'License activated successfully!',
      activation: { licenseId: license.id, planType: license.planType, activatedAt: activation.activatedAt.toISOString(), expiresAt: license.expiresAt?.toISOString() || null }
    })
  } catch (error) {
    console.error('Activate error:', error)
    return NextResponse.json({ success: false, error: 'SERVER_ERROR', message: 'Something went wrong.' }, { status: 500 })
  }
}
