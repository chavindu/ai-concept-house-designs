import { GoogleGenerativeAI } from "@google/generative-ai"
import { uploadImageToBlob, uploadThumbnailToBlob, extractMimeTypeFromDataUrl } from "./blob-service"

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

export interface AIGenerationResult {
  imageUrl: string
  thumbnailUrl: string
  isWatermarked: boolean
}

export async function generateArchitecturalDesign(
  prompt: string,
  isFreeUser: boolean = false
): Promise<AIGenerationResult> {
  console.log("=".repeat(80))
  console.log("🚀 STEP 1: Starting architectural design generation")
  console.log("=".repeat(80))
  console.log("📝 Input prompt length:", prompt.length, "characters")
  console.log("👤 User type:", isFreeUser ? "Free (watermarked)" : "Premium")
  console.log("⏱️ Started at:", new Date().toISOString())
  
  try {
    // STEP 2: Check API Key
    console.log("\n" + "=".repeat(80))
    console.log("🔑 STEP 2: Checking API Key")
    console.log("=".repeat(80))
    
    const apiKey = process.env.GOOGLE_AI_API_KEY
    console.log("API Key exists:", !!apiKey)
    console.log("API Key length:", apiKey?.length || 0)
    console.log("API Key preview:", apiKey ? `${apiKey.substring(0, 10)}...` : "NO KEY")
    
    if (!apiKey) {
      throw new Error("GOOGLE_AI_API_KEY environment variable is not set")
    }
    
    // STEP 3: Test API Connection
    console.log("\n" + "=".repeat(80))
    console.log("🔌 STEP 3: Testing API Connection")
    console.log("=".repeat(80))
    
    const genAI = new GoogleGenerativeAI(apiKey)
    console.log("✅ GoogleGenerativeAI instance created")
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" })
    console.log("✅ Model instance created: gemini-2.5-flash-image-preview")
    
    // STEP 4: Generate Image
    console.log("\n" + "=".repeat(80))
    console.log("🖼️ STEP 4: Generating Architectural Image")
    console.log("=".repeat(80))
    console.log("ℹ️ Using gemini-2.5-flash-image-preview for image generation")
    
    let imageResult
    // Retry policy: up to 3 attempts, exponential backoff: 0s, 1s, 2s
    const maxAttempts = 3
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`\n🔁 Image generation attempt ${attempt}/${maxAttempts}`)
        const result = await Promise.race([
          generateArchitecturalImage(prompt),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Image generation timeout after 60 seconds')), 60000)
          )
        ])
        // Detect text-only data URL (non-image) to trigger retry
        const isTextDataUrl = typeof result.imageUrl === 'string' && result.imageUrl.startsWith('data:text/')
        if (isTextDataUrl) {
          console.warn("⚠️ Model returned text-only output instead of image")
          if (attempt < maxAttempts) {
            const backoffMs = (attempt - 1) * 1000
            console.log(`⏳ Retrying after ${backoffMs}ms due to text-only output`)
            if (backoffMs > 0) {
              await new Promise(res => setTimeout(res, backoffMs))
            }
            continue
          }
        }
        imageResult = result
        console.log("✅ Image generation completed")
        console.log("Image URL length:", imageResult.imageUrl.length)
        console.log("Image URL preview:", imageResult.imageUrl.substring(0, 100) + "...")
        break
      } catch (imageError) {
        console.error("❌ STEP 4 FAILED: Image generation error:", imageError)
        if (attempt < maxAttempts) {
          const backoffMs = (attempt - 1) * 1000
          console.log(`⏳ Retrying after ${backoffMs}ms due to error/timeout`)
          if (backoffMs > 0) {
            await new Promise(res => setTimeout(res, backoffMs))
          }
          continue
        }
        throw imageError // Re-throw after final attempt to trigger fallback
      }
    }
    if (!imageResult) {
      throw new Error('Image generation failed after retries')
    }
    
    // STEP 5: Prepare Result
    console.log("\n" + "=".repeat(80))
    console.log("📦 STEP 5: Preparing Final Result")
    console.log("=".repeat(80))
    
    const result = {
      imageUrl: imageResult.imageUrl,
      thumbnailUrl: imageResult.thumbnailUrl,
      isWatermarked: isFreeUser,
    }
    
    console.log("✅ Final result prepared successfully")
    console.log("=".repeat(80))
    console.log("🎉 GENERATION COMPLETE!")
    console.log("=".repeat(80))
    
    return result
    
  } catch (error) {
    console.log("\n" + "=".repeat(80))
    console.log("❌ ERROR OCCURRED")
    console.log("=".repeat(80))
    console.error("Error details:", error)
    console.error("Error message:", error instanceof Error ? error.message : String(error))
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    
    // No fallback images - just return the error text as the "image"
    console.log("\n🔄 NO FALLBACK: Returning error text instead of placeholder images")
    
    // Return the error message as the "image" URL (as text)
    const errorText = `Image Generation Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    const errorImageUrl = `data:text/plain;base64,${Buffer.from(errorText).toString('base64')}`
    
    console.log("📝 Returning error text as image:", errorText)
    
    return {
      imageUrl: errorImageUrl,
      thumbnailUrl: errorImageUrl,
      isWatermarked: isFreeUser,
    }
  }
}

async function uploadToBlob(buffer: Buffer, folder: string, format: string): Promise<string> {
  // TODO: Implement Vercel Blob upload
  // For now, return a placeholder URL
  return `/ai-generated-house-design-concept.jpg`
}

async function createThumbnail(buffer: Buffer, folder: string, format: string): Promise<string> {
  // TODO: Implement thumbnail creation
  // For now, return a placeholder URL
  return `/ai-generated-house-design-concept.jpg`
}

async function generateArchitecturalImage(prompt: string): Promise<{imageUrl: string, thumbnailUrl: string}> {
  console.log("\n" + "-".repeat(60))
  console.log("🖼️ IMAGE GENERATION: Starting architectural image generation")
  console.log("-".repeat(60))
  
  try {
    // Initialize Gemini AI with environment API key
    console.log("🔑 Creating GoogleGenerativeAI instance...")
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)
    console.log("✅ GoogleGenerativeAI instance created")
    
    console.log("🤖 Getting model instance...")
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" })
    console.log("✅ Model instance created: gemini-2.5-flash-image-preview")
    
    // Prepare the prompt for image generation
    const imagePrompt = `Create an image: ${prompt}`
    
    console.log("\n📝 PROMPT TO SEND TO GEMINI:")
    console.log("=".repeat(80))
    console.log(imagePrompt)
    console.log("=".repeat(80))
    console.log("📏 Prompt length:", imagePrompt.length, "characters")
    
    console.log("\n📤 Sending request to Gemini API...")
    console.log("⏱️ Request started at:", new Date().toISOString())
    
    // Generate content
    const result = await model.generateContent(imagePrompt)
    console.log("📥 Received response from Gemini API")
    console.log("⏱️ Response received at:", new Date().toISOString())
    
    const response = await result.response
    console.log("📋 Response object created")
    
    // Check if the response contains images
    console.log("\n🔍 Analyzing response for images...")
    console.log("Response candidates:", response.candidates?.length || 0)
    
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0]
      console.log("First candidate content parts:", candidate.content?.parts?.length || 0)
      
      const images = candidate.content?.parts?.filter(part => part.inlineData)
      console.log("Images found:", images?.length || 0)
      
      if (images && images.length > 0) {
        console.log("🖼️ Found", images.length, "generated image(s)")
        
        // Get the first image
        const firstImage = images[0]
        if (firstImage.inlineData) {
          const imageData = firstImage.inlineData.data
          const mimeType = firstImage.inlineData.mimeType || "image/png"
          
          console.log("\n📸 IMAGE DETAILS:")
          console.log("-".repeat(40))
          console.log("MIME Type:", mimeType)
          console.log("Data Length:", imageData.length, "bytes")
          console.log("Data Size:", (imageData.length / 1024 / 1024).toFixed(2), "MB")
          console.log("Data Preview:", imageData.substring(0, 50) + "...")
          console.log("-".repeat(40))
          
          // Create a data URL for the image
          const dataUrl = `data:${mimeType};base64,${imageData}`
          
          console.log("\n✅ IMAGE GENERATION SUCCESSFUL!")
          console.log("Base64 URL length:", dataUrl.length)
          console.log("Base64 URL preview:", dataUrl.substring(0, 100) + "...")
          
          // Upload to Vercel Blob
          console.log("\n🔄 STEP 7: Uploading image to Vercel Blob...")
          console.log("-".repeat(60))
          
          try {
            const blobResult = await uploadImageToBlob(dataUrl, mimeType, 'designs')
            console.log("✅ Image uploaded to Vercel Blob successfully")
            console.log("🔗 Blob URL:", blobResult.url)
            
            // Upload thumbnail (for now, same image)
            const thumbnailResult = await uploadThumbnailToBlob(dataUrl, mimeType, 'thumbnails')
            console.log("✅ Thumbnail uploaded to Vercel Blob successfully")
            console.log("🔗 Thumbnail URL:", thumbnailResult.url)
            
            return {
              imageUrl: blobResult.url,
              thumbnailUrl: thumbnailResult.url
            }
          } catch (blobError) {
            console.error("❌ Failed to upload to Vercel Blob:", blobError)
            console.log("🔄 Falling back to base64 storage...")
            
            // Fallback to base64 if blob upload fails
            return {
              imageUrl: dataUrl,
              thumbnailUrl: dataUrl
            }
          }
        }
      }
    }
    
    // If no images found, check for text response
    console.log("\n❌ NO IMAGES FOUND - Checking for text response...")
    const text = response.text()
    console.log("📝 TEXT RESPONSE FROM GEMINI:")
    console.log("=".repeat(80))
    console.log(text)
    console.log("=".repeat(80))
    console.log("Text length:", text.length, "characters")
    
    // Return the text as a data URL instead of throwing an error
    const textImageUrl = `data:text/plain;base64,${Buffer.from(text).toString('base64')}`
    console.log("📝 Returning text response as image URL")
    
    return {
      imageUrl: textImageUrl,
      thumbnailUrl: textImageUrl
    }
    
  } catch (error) {
    console.log("\n❌ IMAGE GENERATION ERROR:")
    console.log("=".repeat(80))
    console.error("Error:", error)
    console.error("Error message:", error instanceof Error ? error.message : String(error))
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.log("=".repeat(80))
    
    throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Rate limiting function
const userGenerationCounts = new Map<string, { count: number, resetTime: number }>()

export function checkGenerationLimit(userId: string): boolean {
  const now = Date.now()
  const userData = userGenerationCounts.get(userId)
  
  if (!userData || now > userData.resetTime) {
    // Reset counter (20 generations per hour as per spec)
    userGenerationCounts.set(userId, { count: 1, resetTime: now + (60 * 60 * 1000) })
    return true
  }
  
  if (userData.count >= 20) {
    return false
  }
  
  userData.count++
  return true
}