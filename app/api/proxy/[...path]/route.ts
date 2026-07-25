import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Proxy endpoint that mimics powerkits/gringow API format
// The extension calls something like: API_BASE + '/v1/license/check'
// We accept multiple path patterns

export async function GET(request: Request) {
  const url = new URL(request.url)
  const path = url.pathname

  // Support various path patterns the extension might use
  if (path.includes('check') || path.includes('validate') || path.includes('verify')) {
    return handleCheck(request)
  }

  if (path.includes('activate')) {
    return handleActivate(request)
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function POST(request: Request) {
  const url = new URL(request.url)
  const path = url.pathname

  if (path.includes('activate')) {
    return handleActivate(request)
  }

  return handleCheck(request)
}

async function handleCheck(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const headerKey = request.headers.get('x-license-key') || request.headers.get('X-License-Key') || ''
    const key = body.licenseKey || body.key || body.license_key || headerKey
    const hwId = body.hwId || body.deviceId || body.device_id || body.hwid || 'unknown'

    if (!key) {
      return NextResponse.json({ valid: false, status: 'INVALID_KEY', message: 'License key required.', allowed: false })
    }

    const license = await prisma.license.findUnique({ where: { licenseKey: key } })
    if (!license) {
      return NextResponse.json({ valid: false, status: 'INVALID_KEY', message: 'Key not found.', allowed: false })
    }

    if (license.banned) {
      return NextResponse.json({ valid: false, status: 'BANNED', message: 'Banned.', allowed: false })
    }

    if (license.status === 'EXPIRED' || (license.expiresAt && license.expiresAt < new Date())) {
      return NextResponse.json({ valid: false, status: 'EXPIRED', message: 'Expired.', allowed: false })
    }

    if (license.status === 'SUSPENDED') {
      return NextResponse.json({ valid: false, status: 'SUSPENDED', message: 'Suspended.', allowed: false })
    }

    // Check activation
    const existing = await prisma.activation.findFirst({
      where: { licenseId: license.id, hwId, isActive: true }
    })

    if (existing) {
      await prisma.activation.update({ where: { id: existing.id }, data: { lastSeen: new Date(), isActive: true } })
      await prisma.license.update({ where: { id: license.id }, data: { lastHeartbeat: new Date() } })

      return NextResponse.json({
        valid: true,
        status: 'ACTIVE',
        allowed: true,
        bypass_token: existing.id,
        bypass_token_exp: license.expiresAt ? new Date(license.expiresAt).getTime() : null,
        expires_at: license.expiresAt ? license.expiresAt.toISOString() : null,
        activated_at: existing.activatedAt.toISOString(),
        license: {
          planType: license.planType,
          expiresAt: license.expiresAt?.toISOString() || null,
          features: ['unlimited'],
          seats: license.seats,
          maxSeats: license.maxSeats
        }
      })
    }

    // Not activated yet
    return NextResponse.json({
      valid: false,
      status: 'NOT_ACTIVATED',
      allowed: false,
      message: 'Device not activated.',
      needsActivation: true,
      license: {
        planType: license.planType,
        expiresAt: license.expiresAt?.toISOString() || null,
        features: ['unlimited'],
        seats: license.seats,
        maxSeats: license.maxSeats
      }
    })
  } catch (error) {
    return NextResponse.json({ valid: false, status: 'SERVER_ERROR', message: 'Error.', allowed: false }, { status: 500 })
  }
}

async function handleActivate(request: Request) {
  try {
    const body = await request.json()
    const { licenseKey, hwId, deviceId, platform, browserName, browserVersion } = body
    const key = licenseKey || body.key
    const device = hwId || deviceId || body.device_id

    if (!key) {
      return NextResponse.json({ success: false, error: 'INVALID_KEY', message: 'Key required.' })
    }

    const license = await prisma.license.findUnique({ where: { licenseKey: key } })
    if (!license) {
      return NextResponse.json({ success: false, error: 'INVALID_KEY', message: 'Key not found.' })
    }

    if (license.banned) {
      return NextResponse.json({ success: false, error: 'BANNED', message: 'Banned.' })
    }

    if (license.status === 'EXPIRED' || (license.expiresAt && license.expiresAt < new Date())) {
      return NextResponse.json({ success: false, error: 'EXPIRED', message: 'Expired.' })
    }

    if (license.status === 'SUSPENDED') {
      return NextResponse.json({ success: false, error: 'SUSPENDED', message: 'Suspended.' })
    }

    // Check if already activated
    const existing = await prisma.activation.findFirst({
      where: { licenseId: license.id, hwId: device, isActive: true }
    })

    if (existing) {
      await prisma.activation.update({ where: { id: existing.id }, data: { lastSeen: new Date(), isActive: true } })
      return NextResponse.json({ success: true, status: 'REACTIVATED', message: 'Reactivated.' })
    }

    // Check seats
    const activeCount = await prisma.activation.count({ where: { licenseId: license.id, isActive: true } })
    if (activeCount >= license.seats) {
      return NextResponse.json({ success: false, error: 'SEAT_LIMIT', message: 'All seats used.' })
    }

    // Create activation
    const activation = await prisma.activation.create({
      data: { licenseId: license.id, hwId: device || 'unknown', platform: platform || 'unknown', browserName, browserVersion }
    })

    await prisma.license.update({
      where: { id: license.id },
      data: { currentHW: device, activatedAt: new Date(), activatedBy: device, lastHeartbeat: new Date() }
    })

    await prisma.auditLog.create({
      data: { licenseId: license.id, action: 'ACTIVATED', details: `Activated on ${platform}`, performedBy: 'system' }
    })

    return NextResponse.json({
      success: true,
      status: 'ACTIVATED',
      message: 'Activated!',
      activation: { licenseId: license.id, planType: license.planType, activatedAt: activation.activatedAt.toISOString() }
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'SERVER_ERROR', message: 'Error.' }, { status: 500 })
  }
}
