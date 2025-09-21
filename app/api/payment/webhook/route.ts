import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { addPoints } from "@/lib/points"

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

    // Verify the payment signature (implement proper verification in production)
    // const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET
    // const local_md5sig = md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + merchant_secret)

    const supabase = await createClient()

    // Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", order_id)
      .single()

    if (paymentError || !payment) {
      console.error("Payment not found:", order_id)
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Check if payment is successful
    if (status_code === "2") {
      // Payment successful
      try {
        // Update payment status
        await supabase
          .from("payments")
          .update({
            status: "completed",
            payhere_payment_id: formData.get("payment_id") as string,
            updated_at: new Date().toISOString(),
          })
          .eq("id", order_id)

        // Add points to user account
        await addPoints(
          custom_1, // user_id
          Number.parseInt(custom_2), // points
          `Points purchased - ${payment.plan_id}`,
          "purchased",
        )

        console.log(`Payment successful for order ${order_id}, added ${custom_2} points to user ${custom_1}`)

        return NextResponse.json({ status: "success" })
      } catch (error) {
        console.error("Error processing successful payment:", error)

        // Update payment status to failed
        await supabase
          .from("payments")
          .update({
            status: "failed",
            error_message: "Failed to add points",
            updated_at: new Date().toISOString(),
          })
          .eq("id", order_id)

        return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
      }
    } else {
      // Payment failed
      await supabase
        .from("payments")
        .update({
          status: "failed",
          error_message: `Payment failed with status code: ${status_code}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order_id)

      console.log(`Payment failed for order ${order_id} with status code ${status_code}`)
      return NextResponse.json({ status: "failed" })
    }
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
