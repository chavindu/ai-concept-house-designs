import { NextRequest, NextResponse } from "next/server"
import { uploadImageToBlob } from "@/lib/blob-service"

export async function POST(request: NextRequest) {
  try {
    const { base64Data, mimeType } = await request.json()
    
    if (!base64Data) {
      return NextResponse.json(
        { error: "Base64 data is required" },
        { status: 400 }
      )
    }

    const result = await uploadImageToBlob(base64Data, mimeType || 'image/png', 'test')
    
    return NextResponse.json({
      success: true,
      blobUrl: result.url,
      downloadUrl: result.downloadUrl,
      pathname: result.pathname
    })
  } catch (error) {
    console.error("Blob upload test error:", error)
    return NextResponse.json(
      { error: "Failed to upload to blob storage" },
      { status: 500 }
    )
  }
}
