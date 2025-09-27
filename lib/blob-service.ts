import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'

export interface BlobUploadResult {
  url: string
  downloadUrl: string
  pathname: string
}

/**
 * Uploads a base64 image to Vercel Blob with a UUID-based filename
 * @param base64Data - Base64 encoded image data (with or without data URL prefix)
 * @param mimeType - MIME type of the image (e.g., 'image/png', 'image/jpeg')
 * @param folder - Optional folder name to organize uploads
 * @returns Promise with blob URL and metadata
 */
export async function uploadImageToBlob(
  base64Data: string,
  mimeType: string = 'image/png',
  folder: string = 'designs'
): Promise<BlobUploadResult> {
  try {
    console.log('🔄 Starting image upload to Vercel Blob...')
    
    // Clean base64 data (remove data URL prefix if present)
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '')
    
    // Generate UUID-based filename
    const fileExtension = mimeType.split('/')[1] || 'png'
    const filename = `${uuidv4()}.${fileExtension}`
    const fullPathname = `${folder}/${filename}`
    
    console.log(`📁 Upload path: ${fullPathname}`)
    console.log(`📏 Base64 data length: ${cleanBase64.length} characters`)
    
    // Convert base64 to buffer
    const buffer = Buffer.from(cleanBase64, 'base64')
    console.log(`📦 Buffer size: ${buffer.length} bytes (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`)
    
    // Upload to Vercel Blob
    const blob = await put(fullPathname, buffer, {
      access: 'public',
      contentType: mimeType,
    })
    
    console.log('✅ Image uploaded successfully to Vercel Blob')
    console.log(`🔗 Blob URL: ${blob.url}`)
    
    return {
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
    }
  } catch (error) {
    console.error('❌ Failed to upload image to Vercel Blob:', error)
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Creates a thumbnail from an image and uploads it to Vercel Blob
 * For now, this returns the same URL as the main image
 * In the future, this could be enhanced to create actual thumbnails
 * @param base64Data - Base64 encoded image data
 * @param mimeType - MIME type of the image
 * @param folder - Optional folder name
 * @returns Promise with thumbnail blob URL
 */
export async function uploadThumbnailToBlob(
  base64Data: string,
  mimeType: string = 'image/png',
  folder: string = 'thumbnails'
): Promise<BlobUploadResult> {
  // For now, create a separate upload for thumbnails
  // In the future, this could be enhanced to create actual resized thumbnails
  return uploadImageToBlob(base64Data, mimeType, folder)
}

/**
 * Extracts MIME type from base64 data URL
 * @param dataUrl - Base64 data URL
 * @returns MIME type string
 */
export function extractMimeTypeFromDataUrl(dataUrl: string): string {
  const match = dataUrl.match(/^data:([^;]+);base64,/)
  return match ? match[1] : 'image/png'
}
