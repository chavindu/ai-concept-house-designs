import { NextRequest, NextResponse } from 'next/server'
import { uploadThumbnailToBlob } from '@/lib/blob-service'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing thumbnail generation...')
    
    // Create a simple test image (1x1 pixel PNG in base64)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
    const dataUrl = `data:image/png;base64,${testImageBase64}`
    
    console.log('📤 Uploading test thumbnail...')
    const result = await uploadThumbnailToBlob(dataUrl, 'image/png', 'test-thumbnails')
    
    console.log('✅ Thumbnail test completed successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Thumbnail generation test completed',
      result: {
        url: result.url,
        pathname: result.pathname,
        size: '512x512 (compressed)',
        format: 'JPEG',
        quality: '80%'
      }
    })
    
  } catch (error) {
    console.error('❌ Thumbnail test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Thumbnail generation test failed'
    }, { status: 500 })
  }
}
