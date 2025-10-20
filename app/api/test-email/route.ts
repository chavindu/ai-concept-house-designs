import { type NextRequest, NextResponse } from "next/server"
import { sendDesignPackageConfirmation, sendAdminDesignPackageNotification } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { userEmail, userName, orderId, amount } = await request.json()

    if (!userEmail || !userName || !orderId || !amount) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Check email configuration
    const emailConfig = {
      SMTP_HOST: process.env.SMTP_HOST ? 'SET' : 'NOT SET',
      SMTP_USER: process.env.SMTP_USER ? 'SET' : 'NOT SET',
      SMTP_PASS: process.env.SMTP_PASS ? 'SET' : 'NOT SET',
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@bitlab.lk'
    }

    console.log(`Email config check:`, emailConfig)

    // Test user confirmation email
    console.log(`Sending test user confirmation email to: ${userEmail}`)
    const userEmailResult = await sendDesignPackageConfirmation(
      userEmail,
      userName,
      'Basic Design Package',
      amount,
      orderId
    )
    console.log(`User email sent:`, userEmailResult)

    // Test admin notification email
    const mockUser = {
      id: 'test-user-id',
      email: userEmail,
      full_name: userName
    }

    const mockDesignDetails = {
      designId: 'test-design-id',
      imageUrl: 'https://example.com/test-design.png',
      prompt: 'Test design prompt',
      style: 'Modern',
      buildingType: 'House',
      perspective: 'Front View'
    }

    console.log(`Sending test admin notification email`)
    const adminEmailResult = await sendAdminDesignPackageNotification(
      mockUser,
      mockDesignDetails,
      'Basic Design Package',
      amount,
      orderId
    )
    console.log(`Admin email sent:`, adminEmailResult)

    return NextResponse.json({ 
      success: true, 
      emailConfig,
      userEmailSent: userEmailResult,
      adminEmailSent: adminEmailResult
    })

  } catch (error) {
    console.error("Test email error:", error)
    return NextResponse.json({ error: "Email test failed", details: error.message }, { status: 500 })
  }
}
