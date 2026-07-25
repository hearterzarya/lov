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
      return NextResponse.json({ ok: false, message: 'Activation not found.' }, { status: 404 })
    }

    await prisma.activation.update({
      where: { id: activation.id },
      data: { lastSeen: new Date() }
    })

    await prisma.license.update({
      where: { id: activation.licenseId },
      data: { lastHeartbeat: new Date() }
    })

    await prisma.auditLog.create({
      data: {
        licenseId: activation.licenseId,
        action: 'HEARTBEAT',
        performedBy: 'system'
      }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Heartbeat error:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
