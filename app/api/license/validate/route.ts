import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { hwId } = await request.json()

    const activation = await prisma.activation.findFirst({
      where: { hwId, isActive: true },
      include: { license: { select: { licenseKey: true, status: true, banned: true, expiresAt: true } } }
    })

    if (!activation) {
      return NextResponse.json({ valid: false, status: 'NOT_ACTIVATED' })
    }

    const license = activation.license

    if (license.banned || license.status === 'EXPIRED' || license.status === 'SUSPENDED') {
      return NextResponse.json({ valid: false, status: license.status })
    }

    if (license.expiresAt && license.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, status: 'EXPIRED' })
    }

    return NextResponse.json({ valid: true, status: 'ACTIVE', licenseKey: license.licenseKey })
  } catch (error) {
    console.error('Validate error:', error)
    return NextResponse.json({ valid: false, status: 'SERVER_ERROR' }, { status: 500 })
  }
}
