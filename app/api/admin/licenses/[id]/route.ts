import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const license = await prisma.license.findUnique({
      where: { id },
      include: {
        activations: { orderBy: { activatedAt: 'desc' } },
        auditLogs: { orderBy: { createdAt: 'desc' }, take: 50 }
      }
    })

    if (!license) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 })
    }

    return NextResponse.json({ license })
  } catch (error) {
    console.error('Get license error:', error)
    return NextResponse.json({ error: 'Failed to fetch license' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const data = await request.json()
    const { status: newStatus, banned, banReason, seats, notes } = data

    const license = await prisma.license.update({
      where: { id },
      data: {
        ...(newStatus && { status: newStatus }),
        ...(banned !== undefined && { banned }),
        ...(banReason !== undefined && { banReason }),
        ...(seats && { seats }),
        ...(notes !== undefined && { notes })
      }
    })

    await prisma.auditLog.create({
      data: {
        licenseId: id,
        action: 'ADMIN_EDIT',
        details: `Updated: ${JSON.stringify(data)}`,
        performedBy: 'admin'
      }
    })

    return NextResponse.json({ license })
  } catch (error) {
    console.error('Update license error:', error)
    return NextResponse.json({ error: 'Failed to update license' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await prisma.activation.deleteMany({ where: { licenseId: id } })
    await prisma.auditLog.deleteMany({ where: { licenseId: id } })
    await prisma.license.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete license error:', error)
    return NextResponse.json({ error: 'Failed to delete license' }, { status: 500 })
  }
}
