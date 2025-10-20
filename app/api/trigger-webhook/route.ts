import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database/client"

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Get payment details
    const paymentResult = await query(
      'SELECT * FROM payments WHERE payhere_order_id = $1',
      [orderId]
    )

    if (paymentResult.rows.length === 0) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    const payment = paymentResult.rows[0]

    // Simulate PayHere webhook data
    const mockWebhookData = new FormData()
    mockWebhookData.append('merchant_id', process.env.PAYHERE_MERCHANT_ID || '1221149')
    mockWebhookData.append('order_id', orderId)
    mockWebhookData.append('payhere_amount', payment.amount.toString())
    mockWebhookData.append('payhere_currency', 'LKR')
    mockWebhookData.append('status_code', '2') // Success
    mockWebhookData.append('payment_id', `pay_${Date.now()}`)
    mockWebhookData.append('custom_1', payment.user_id) // user_id
    mockWebhookData.append('custom_2', '0') // points
    mockWebhookData.append('custom_3', '') // design_id (empty for now)

    // Generate mock signature
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || 'your-merchant-secret'
    const crypto = require('crypto')
    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase()
    const signatureString = mockWebhookData.get('merchant_id') + orderId + payment.amount + 'LKR' + '2' + hashedSecret
    const mockSignature = crypto.createHash('md5').update(signatureString).digest('hex').toUpperCase()
    mockWebhookData.append('md5sig', mockSignature)

    // Call the webhook endpoint
    const webhookResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/payment/webhook`, {
      method: 'POST',
      body: mockWebhookData
    })

    const webhookResult = await webhookResponse.json()

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook triggered successfully',
      webhookResult,
      paymentStatus: payment.status
    })

  } catch (error) {
    console.error("Manual webhook trigger error:", error)
    return NextResponse.json({ error: "Failed to trigger webhook", details: error.message }, { status: 500 })
  }
}
