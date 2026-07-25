import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { hwId } = await request.json()

    const activation = await prisma.activation.findFirst({
      where: { hwId, isActive: true },
      include: { license: true }
    })

    if (!activation) {
      return NextResponse.json({ valid: false, status: 'NOT_ACTIVATED', message: 'No active activation found.' })
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
