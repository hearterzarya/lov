import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature') || ''

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (webhookSecret) {
      const expected = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex')
      if (signature !== expected) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const event = JSON.parse(body)
    const eventType = event.event

    if (eventType === 'payment.captured') {
      const payment = event.payload.payment.entity
      const notes = payment.notes || {}

      let licenseKey
      do {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
        const segments = []
        for (let i = 0; i < 4; i++) {
          let segment = ''
          for (let j = 0; j < 4; j++) {
            segment += chars[Math.floor(Math.random() * chars.length)]
          }
          segments.push(segment)
        }
        licenseKey = 'EB-' + segments.join('-')
      } while (await prisma.license.findUnique({ where: { licenseKey } }))

      const license = await prisma.license.create({
        data: {
          licenseKey,
          customerEmail: notes.email || payment.email || '',
          customerName: notes.name || payment.name || 'Customer',
          customerPhone: notes.phone || '',
          planType: 'LIFETIME',
          seats: 1,
          maxSeats: 5,
          orderId: payment.order_id,
          status: 'ACTIVE'
        }
      })

      await prisma.webhookLog.create({
        data: {
          licenseId: license.id,
          event: 'LICENSE_ACTIVATED',
          payload: JSON.stringify(event),
          status: 'SENT'
        }
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
