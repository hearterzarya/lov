import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateLicenseKey } from '@/lib/crypto'

// GET /api/admin/licenses
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { customerEmail: { contains: search } },
        { customerName: { contains: search } },
        { licenseKey: { contains: search } }
      ]
    }

    const [licenses, total] = await Promise.all([
      prisma.license.findMany({
        where,
        include: { activations: { where: { isActive: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.license.count({ where })
    ]) as [any[], number]

    return NextResponse.json({
      licenses: licenses.map((l: any) => ({
        id: l.id,
        licenseKey: l.licenseKey,
        customerEmail: l.customerEmail,
        customerName: l.customerName,
        customerPhone: l.customerPhone,
        planType: l.planType,
        status: l.status,
        activatedAt: l.activatedAt?.toISOString() || null,
        currentHW: l.currentHW,
        seats: l.seats,
        maxSeats: l.maxSeats,
        banned: l.banned,
        createdAt: l.createdAt.toISOString(),
        activations: l.activations.map((a: any) => ({
          hwId: a.hwId,
          platform: a.platform,
          activatedAt: a.activatedAt.toISOString(),
          lastSeen: a.lastSeen.toISOString(),
          isActive: a.isActive
        }))
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('List licenses error:', error)
    return NextResponse.json({ error: 'Failed to fetch licenses' }, { status: 500 })
  }
}

// POST /api/admin/licenses
export async function POST(request: Request) {
  try {
    const { customerEmail, customerName, customerPhone, planType, seats, maxSeats, validFrom, expiresAt, notes } = await request.json()

    let licenseKey
    do {
      licenseKey = generateLicenseKey()
    } while (await prisma.license.findUnique({ where: { licenseKey } }))

    const license = await prisma.license.create({
      data: {
        licenseKey,
        customerEmail,
        customerName,
        customerPhone,
        planType: planType || 'LIFETIME',
        seats: seats || 1,
        maxSeats: maxSeats || 5,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        notes,
        createdBy: 'admin'
      }
    })

    await prisma.auditLog.create({
      data: {
        licenseId: license.id,
        action: 'ADMIN_EDIT',
        details: 'License created',
        performedBy: 'admin'
      }
    })

    return NextResponse.json({ license })
  } catch (error) {
    console.error('Create license error:', error)
    return NextResponse.json({ error: 'Failed to create license' }, { status: 500 })
  }
}
