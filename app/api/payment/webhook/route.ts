import { type NextRequest, NextResponse } from "next/server"
import { addPoints } from "@/lib/points"
import { query } from "@/lib/database/client"
import { sendDesignPackageConfirmation, sendAdminDesignPackageNotification } from "@/lib/email-service"
import crypto from "crypto"

// Verify PayHere signature
function verifyPayHereSignature(
  merchantId: string,
  orderId: string,
  payhereAmount: string,
  payhereCurrency: string,
  statusCode: string,
  merchantSecret: string,
  receivedSignature: string
): boolean {
  const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase()
  const signatureString = merchantId + orderId + payhereAmount + payhereCurrency + statusCode + hashedSecret
  const localSignature = crypto.createHash('md5').update(signatureString).digest('hex').toUpperCase()
  
  return localSignature === receivedSignature
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract PayHere webhook data
    const merchant_id = formData.get("merchant_id") as string
    const order_id = formData.get("order_id") as string
    const payhere_amount = formData.get("payhere_amount") as string
    const payhere_currency = formData.get("payhere_currency") as string
    const status_code = formData.get("status_code") as string
    const md5sig = formData.get("md5sig") as string
    const custom_1 = formData.get("custom_1") as string // user_id
    const custom_2 = formData.get("custom_2") as string // points
    const custom_3 = formData.get("custom_3") as string // design_id

    // Verify the payment signature
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "your-merchant-secret"
    const isValidSignature = verifyPayHereSignature(
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      merchantSecret,
      md5sig
    )

    if (!isValidSignature) {
      console.error("Invalid PayHere signature for order:", order_id)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Get payment record
    const paymentResult = await query(
      'SELECT * FROM payments WHERE payhere_order_id = $1',
      [order_id]
    )

    if (paymentResult.rows.length === 0) {
      console.error("Payment not found:", order_id)
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    const payment = paymentResult.rows[0]

    // Check if payment is successful
    if (status_code === "2") {
      // Payment successful
      try {
        // Update payment status
        await query(
          `UPDATE payments 
           SET status = $1, payhere_payment_id = $2, updated_at = NOW()
           WHERE payhere_order_id = $3`,
          ["completed", formData.get("payment_id") as string, order_id]
        )

        // Check if this is a design package (no points) or points package
        if (payment.payment_method === "payhere" && payment.points === 0) {
          // Handle design package completion
          console.log(`Design package payment successful for order ${order_id}`)
          
          try {
            // Get user details for email
            const userResult = await query(
              'SELECT id, email, full_name FROM users WHERE id = $1',
              [custom_1]
            )
            const user = userResult.rows[0]
            console.log(`User details for email:`, user)

            // Get design details if design ID is provided
            let designDetails = null
            if (custom_3) {
              try {
                const designResult = await query(
                  'SELECT id, image_url, prompt, style, building_type, perspective FROM designs WHERE id = $1',
                  [custom_3]
                )
                if (designResult.rows.length > 0) {
                  designDetails = {
                    designId: designResult.rows[0].id,
                    imageUrl: designResult.rows[0].image_url,
                    prompt: designResult.rows[0].prompt,
                    style: designResult.rows[0].style,
                    buildingType: designResult.rows[0].building_type,
                    perspective: designResult.rows[0].perspective
                  }
                  console.log(`Design details for email:`, designDetails)
                }
              } catch (error) {
                console.error("Error fetching design details:", error)
              }
            }

            // Check email configuration
            console.log(`Email config check:`, {
              SMTP_HOST: process.env.SMTP_HOST ? 'SET' : 'NOT SET',
              SMTP_USER: process.env.SMTP_USER ? 'SET' : 'NOT SET',
              SMTP_PASS: process.env.SMTP_PASS ? 'SET' : 'NOT SET',
              ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@bitlab.lk'
            })

            // Send confirmation email to user
            if (user) {
              const firstName = user.full_name?.split(' ')[0] || 'User'
              console.log(`Sending user confirmation email to: ${user.email}`)
              const userEmailResult = await sendDesignPackageConfirmation(
                user.email,
                firstName,
                'Basic Design Package',
                payment.amount,
                order_id
              )
              console.log(`User email sent:`, userEmailResult)
            }

            // Send notification email to admin
            console.log(`Sending admin notification email`)
            const adminEmailResult = await sendAdminDesignPackageNotification(
              user,
              designDetails,
              'Basic Design Package',
              payment.amount,
              order_id
            )
            console.log(`Admin email sent:`, adminEmailResult)

            console.log(`Emails sent for design package purchase: ${order_id}`)
          } catch (error) {
            console.error("Error sending design package emails:", error)
            // Don't fail the payment if email sending fails
          }
        } else {
          // Add points to user account for point packages
          await addPoints(
            custom_1, // user_id
            Number.parseInt(custom_2), // points
            `Points purchased - ${payment.payment_id}`,
            "purchased",
          )
          console.log(`Payment successful for order ${order_id}, added ${custom_2} points to user ${custom_1}`)
        }

        return NextResponse.json({ status: "success" })
      } catch (error) {
        console.error("Error processing successful payment:", error)

        // Update payment status to failed
        await query(
          `UPDATE payments 
           SET status = $1, error_message = $2, updated_at = NOW()
           WHERE payhere_order_id = $3`,
          ["failed", "Failed to process payment", order_id]
        )

        return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
      }
    } else {
      // Payment failed
      await query(
        `UPDATE payments 
         SET status = $1, error_message = $2, updated_at = NOW()
         WHERE payhere_order_id = $3`,
        ["failed", `Payment failed with status code: ${status_code}`, order_id]
      )

      console.log(`Payment failed for order ${order_id} with status code ${status_code}`)
      return NextResponse.json({ status: "failed" })
    }
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}