import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database/client"
import crypto from "crypto"

// Generate PayHere hash for security
function generatePayHereHash(merchantId: string, orderId: string, amount: string, currency: string, merchantSecret: string): string {
  const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase()
  const hashString = merchantId + orderId + amount + currency + hashedSecret
  return crypto.createHash('md5').update(hashString).digest('hex').toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    const { package: packageType, amount, userId, designId, userEmail, userName, userPhone } = await request.json()

    if (!packageType || !amount || !userId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Create payment record in database
    const paymentResult = await query(
      `INSERT INTO payments (user_id, amount, currency, points, payment_method, payment_id, status, payhere_order_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        amount, // Amount in LKR (decimal)
        "LKR",
        0, // Design packages don't give points
        "payhere",
        `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique payment ID
        "pending",
        `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // Generate unique order ID
      ]
    )

    const payment = paymentResult.rows[0]

    // Generate PayHere hash server-side for security
    const merchantId = process.env.PAYHERE_MERCHANT_ID || "1221149"
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "your-merchant-secret"
    const orderId = payment.payhere_order_id // Use the generated order ID
    const amountFormatted = amount.toFixed(2)
    const currency = "LKR"
    
    const hash = generatePayHereHash(merchantId, orderId, amountFormatted, currency, merchantSecret)

    // Get user details for payment
    const userResult = await query(
      'SELECT full_name FROM users WHERE id = $1',
      [userId]
    )

    const userProfile = userResult.rows[0]
    const fullName = userProfile?.full_name || userName || "User"
    const nameParts = fullName.split(" ")
    const firstName = nameParts[0] || "User"
    const lastName = nameParts.slice(1).join(" ") || ""

    return NextResponse.json({ 
      success: true, 
      paymentId: payment.id,
      orderId: payment.payhere_order_id, // Use the PayHere order ID
      hash,
      merchantId,
      amount: amountFormatted,
      currency,
      firstName,
      lastName,
      email: userEmail,
      phone: userPhone || "" // Use phone from request or empty string
    })

  } catch (error) {
    console.error("Payment API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("order_id")

    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 })
    }

    // Get payment details by PayHere order ID (not the UUID primary key)
    const paymentResult = await query(
      'SELECT * FROM payments WHERE payhere_order_id = $1',
      [orderId]
    )

    if (paymentResult.rows.length === 0) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    const payment = paymentResult.rows[0]

    return NextResponse.json({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      points: payment.points,
      status: payment.status,
      payment_id: payment.payment_id,
      payhere_order_id: payment.payhere_order_id,
      payment_method: payment.payment_method,
      created_at: payment.created_at
    })

  } catch (error) {
    console.error("Payment fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
