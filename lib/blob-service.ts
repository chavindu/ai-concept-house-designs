import { BlobServiceClient, BlockBlobClient } from '@azure/storage-blob'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'

export interface BlobUploadResult {
  url: string
  downloadUrl: string
  pathname: string
}

// Initialize Azure Blob Service Client
let blobServiceClient: BlobServiceClient | null = null

function getBlobServiceClient(): BlobServiceClient {
  if (!blobServiceClient) {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
    if (!connectionString) {
      throw new Error('AZURE_STORAGE_CONNECTION_STRING environment variable is required')
    }
    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
  }
  return blobServiceClient
}

/**
 * Ensures a container exists, creates it if it doesn't
 */
async function ensureContainerExists(containerName: string): Promise<void> {
  const blobServiceClient = getBlobServiceClient()
  const containerClient = blobServiceClient.getContainerClient(containerName)
  
  try {
    await containerClient.createIfNotExists({
      access: 'blob', // Allow public read access on create
    })

    // Ensure public access is enabled even if container already exists
    try {
      const access = await containerClient.getAccessPolicy()
      const currentAccess = (access as any)?.blobPublicAccess as string | undefined
      if (!currentAccess || (currentAccess !== 'blob' && currentAccess !== 'container')) {
        // Pass an empty signed identifiers array to avoid SDK iterable error
        await containerClient.setAccessPolicy([], { access: 'blob' })
      }
    } catch (accessError) {
      // If get/set access policy fails due to permissions, log and continue
      console.warn(`Warning: could not verify/set public access for container ${containerName}:`, accessError)
    }
  } catch (error) {
    console.error(`Failed to create container ${containerName}:`, error)
    throw error
  }
}

/**
 * Uploads a base64 image to Azure Blob Storage with a UUID-based filename
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
    console.log('🔄 Starting image upload to Azure Blob Storage...')
    
    // Clean base64 data (remove data URL prefix if present)
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '')
    
    // Generate UUID-based filename
    const fileExtension = mimeType.split('/')[1] || 'png'
    const filename = `${uuidv4()}.${fileExtension}`
    // Since the container is the folder, the blob name should NOT repeat the folder
    const blobName = `${filename}`
    
    console.log(`📁 Upload path: ${blobName}`)
    console.log(`📏 Base64 data length: ${cleanBase64.length} characters`)
    
    // Convert base64 to buffer
    const buffer = Buffer.from(cleanBase64, 'base64')
    console.log(`📦 Buffer size: ${buffer.length} bytes (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`)
    
    // Ensure container exists
    await ensureContainerExists(folder)
    
    // Get blob client
    const blobServiceClient = getBlobServiceClient()
    const containerClient = blobServiceClient.getContainerClient(folder)
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)
    
    // Upload to Azure Blob Storage
    const uploadResponse = await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: {
        blobContentType: mimeType,
      },
    })
    
    // Construct the public URL
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME
    if (!accountName) {
      throw new Error('AZURE_STORAGE_ACCOUNT_NAME environment variable is required')
    }
    
    const url = `https://${accountName}.blob.core.windows.net/${folder}/${blobName}`
    
    console.log('✅ Image uploaded successfully to Azure Blob Storage')
    console.log(`🔗 Blob URL: ${url}`)
    
    return {
      url,
      downloadUrl: url, // Same as URL for public blobs
      pathname: blobName,
    }
  } catch (error) {
    console.error('❌ Failed to upload image to Azure Blob Storage:', error)
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Creates a thumbnail from an image and uploads it to Azure Blob Storage
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
  try {
    console.log('🔄 Creating thumbnail with Sharp...')
    
    // Clean base64 data (remove data URL prefix if present)
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '')
    
    // Convert base64 to buffer
    const originalBuffer = Buffer.from(cleanBase64, 'base64')
    console.log(`📦 Original buffer size: ${originalBuffer.length} bytes (${(originalBuffer.length / 1024 / 1024).toFixed(2)} MB)`)
    
    // Create thumbnail with Sharp
    const thumbnailBuffer = await sharp(originalBuffer)
      .resize(512, 512, {
        fit: 'cover', // Crop to maintain aspect ratio
        position: 'center' // Center the crop
      })
      .jpeg({
        quality: 80, // 80% quality for good compression
        progressive: true, // Progressive JPEG for faster loading
        mozjpeg: true // Use mozjpeg encoder for better compression
      })
      .toBuffer()
    
    console.log(`📦 Thumbnail buffer size: ${thumbnailBuffer.length} bytes (${(thumbnailBuffer.length / 1024).toFixed(2)} KB)`)
    console.log(`📉 Compression ratio: ${((originalBuffer.length - thumbnailBuffer.length) / originalBuffer.length * 100).toFixed(1)}% reduction`)
    
    // Generate UUID-based filename with .jpg extension for thumbnails
    const filename = `${uuidv4()}.jpg`
    const blobName = `${filename}`
    
    console.log(`📁 Thumbnail upload path: ${blobName}`)
    
    // Ensure container exists
    await ensureContainerExists(folder)
    
    // Get blob client
    const blobServiceClient = getBlobServiceClient()
    const containerClient = blobServiceClient.getContainerClient(folder)
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)
    
    // Upload thumbnail to Azure Blob Storage
    const uploadResponse = await blockBlobClient.upload(thumbnailBuffer, thumbnailBuffer.length, {
      blobHTTPHeaders: {
        blobContentType: 'image/jpeg',
      },
    })
    
    // Construct the public URL
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME
    if (!accountName) {
      throw new Error('AZURE_STORAGE_ACCOUNT_NAME environment variable is required')
    }
    
    const url = `https://${accountName}.blob.core.windows.net/${folder}/${blobName}`
    
    console.log('✅ Thumbnail uploaded successfully to Azure Blob Storage')
    console.log(`🔗 Thumbnail URL: ${url}`)
    
    return {
      url,
      downloadUrl: url, // Same as URL for public blobs
      pathname: blobName,
    }
  } catch (error) {
    console.error('❌ Failed to create and upload thumbnail:', error)
    throw new Error(`Failed to create thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
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

/**
 * Gets the best available image URL (thumbnail first, then fallback to full image)
 * @param thumbnailUrl - Thumbnail URL
 * @param imageUrl - Full image URL
 * @param fallback - Fallback URL if neither is available
 * @returns Best available image URL
 */
export function getBestImageUrl(thumbnailUrl?: string | null, imageUrl?: string | null, fallback: string = '/placeholder.svg'): string {
  if (thumbnailUrl && thumbnailUrl !== imageUrl) {
    return thumbnailUrl
  }
  if (imageUrl) {
    return imageUrl
  }
  return fallback
}
