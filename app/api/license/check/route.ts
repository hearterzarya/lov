import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { hwId, licenseKey } = await request.json()

    // If licenseKey provided, validate it directly
    if (licenseKey) {
      const license = await prisma.license.findUnique({
        where: { licenseKey }
      })

      if (!license) {
        return NextResponse.json({ valid: false, status: 'INVALID_KEY', message: 'License key not found.' })
      }

      if (license.banned) {
        return NextResponse.json({ valid: false, status: 'BANNED', message: 'License has been banned.' })
      }

      if (license.status === 'EXPIRED' || (license.expiresAt && license.expiresAt < new Date())) {
        return NextResponse.json({ valid: false, status: 'EXPIRED', message: 'License has expired.' })
      }

      if (license.status === 'SUSPENDED') {
        return NextResponse.json({ valid: false, status: 'SUSPENDED', message: 'License is suspended.' })
      }

      // Check if this hwId is already activated
      if (hwId) {
        const activation = await prisma.activation.findFirst({
          where: { licenseId: license.id, hwId, isActive: true }
        })

        if (activation) {
          await prisma.activation.update({
            where: { id: activation.id },
            data: { lastSeen: new Date(), isActive: true }
          })
          await prisma.license.update({
            where: { id: license.id },
            data: { lastHeartbeat: new Date() }
          })

          return NextResponse.json({
            valid: true,
            status: 'ACTIVE',
            message: 'License is active.',
            license: {
              planType: license.planType,
              expiresAt: license.expiresAt?.toISOString() || null,
              features: ['unlimited']
            }
          })
        }

        // Key valid but this device not activated
        return NextResponse.json({
          valid: false,
          status: 'NOT_ACTIVATED',
          message: 'Key valid but this device is not activated.',
          needsActivation: true
        })
      }

      return NextResponse.json({
        valid: false,
        status: 'NEEDS_ACTIVATION',
        message: 'Please activate this license.',
        needsActivation: true
      })
    }

    // Fallback: hwId only lookup
    const activation = await prisma.activation.findFirst({
      where: { hwId, isActive: true },
      include: { license: true }
    })

    if (!activation) {
      return NextResponse.json({ valid: false, status: 'NOT_ACTIVATED', message: 'No active activation found. Please enter your license key.' })
    }

    const license = activation.license

    if (license.banned) {
      return NextResponse.json({ valid: false, status: 'BANNED', message: 'License has been banned.' })
    }

    if (license.status === 'EXPIRED' || (license.expiresAt && license.expiresAt < new Date())) {
      return NextResponse.json({ valid: false, status: 'EXPIRED', message: 'License has expired.' })
    }

    if (license.status === 'SUSPENDED') {
      return NextResponse.json({ valid: false, status: 'SUSPENDED', message: 'License is suspended.' })
    }

    return NextResponse.json({
      valid: true,
      status: 'ACTIVE',
      license: {
        planType: license.planType,
        expiresAt: license.expiresAt?.toISOString() || null,
        features: ['unlimited']
      }
    })
  } catch (error) {
    console.error('Check error:', error)
    return NextResponse.json({ valid: false, status: 'SERVER_ERROR', message: 'Something went wrong.' }, { status: 500 })
  }
}
