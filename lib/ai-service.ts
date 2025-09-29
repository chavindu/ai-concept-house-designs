import { GoogleGenerativeAI } from "@google/generative-ai"
import { uploadImageToBlob, uploadThumbnailToBlob, extractMimeTypeFromDataUrl } from "./blob-service"

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

export interface AIGenerationResult {
  imageUrl: string
  thumbnailUrl: string
  descriptionEn: string
  descriptionSi: string
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
    try {
      // Add timeout to image generation
      imageResult = await Promise.race([
        generateArchitecturalImage(prompt),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Image generation timeout after 60 seconds')), 60000)
        )
      ])
      console.log("✅ Image generation completed")
      console.log("Image URL length:", imageResult.imageUrl.length)
      console.log("Image URL preview:", imageResult.imageUrl.substring(0, 100) + "...")
    } catch (imageError) {
      console.error("❌ STEP 4 FAILED: Image generation error:", imageError)
      throw imageError // Re-throw to trigger fallback
    }
    
    // STEP 5: Generate Descriptions
    console.log("\n" + "=".repeat(80))
    console.log("📝 STEP 5: Generating Bilingual Descriptions")
    console.log("=".repeat(80))
    
    const descriptions = await Promise.race([
      generateBilingualDescriptions(prompt),
      new Promise<{english: string, sinhala: string}>((_, reject) => 
        setTimeout(() => reject(new Error('Description generation timeout after 30 seconds')), 30000)
      )
    ])
    console.log("✅ Description generation completed")
    console.log("English description:", descriptions.english)
    console.log("Sinhala description:", descriptions.sinhala)
    
    // STEP 6: Prepare Result
    console.log("\n" + "=".repeat(80))
    console.log("📦 STEP 6: Preparing Final Result")
    console.log("=".repeat(80))
    
    const result = {
      imageUrl: imageResult.imageUrl,
      thumbnailUrl: imageResult.thumbnailUrl,
      descriptionEn: descriptions.english,
      descriptionSi: descriptions.sinhala,
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
    
    let descriptions = {
      english: "Image generation failed. Please try again or contact support.",
      sinhala: "රූප ජනනය අසාර්ථක විය. කරුණාකර නැවත උත්සාහ කරන්න හෝ සහාය අමතන්න."
    }
    
    try {
      descriptions = await generateBilingualDescriptions(prompt)
    } catch (descError) {
      console.error("❌ Description generation also failed")
    }
    
    // Return the error message as the "image" URL (as text)
    const errorText = `Image Generation Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    const errorImageUrl = `data:text/plain;base64,${Buffer.from(errorText).toString('base64')}`
    
    console.log("📝 Returning error text as image:", errorText)
    
    return {
      imageUrl: errorImageUrl,
      thumbnailUrl: errorImageUrl,
      descriptionEn: descriptions.english,
      descriptionSi: descriptions.sinhala,
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

async function generateBilingualDescriptions(prompt: string): Promise<{english: string, sinhala: string}> {
  console.log("\n" + "-".repeat(60))
  console.log("📝 DESCRIPTION GENERATION: Starting bilingual description generation")
  console.log("-".repeat(60))
  
  try {
    console.log("🔑 Creating GoogleGenerativeAI instance for descriptions...")
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)
    console.log("✅ GoogleGenerativeAI instance created")
    
    console.log("🤖 Getting model instance...")
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" })
    console.log("✅ Model instance created: gemini-2.5-flash-image-preview")
    
    const descriptionPrompt = `
    Based on this architectural design prompt: "${prompt}"
    
    Generate two concise descriptions (approximately 50 words each):
    
    1. English description: Write a professional, evocative description of the architectural design
    2. Sinhala description: Write the same description in Sinhala, using natural contemporary style with commonly used English words where appropriate
    
    Format your response as:
    ENGLISH: [description]
    SINHALA: [description]
    `
    
    console.log("\n📝 DESCRIPTION PROMPT TO SEND TO GEMINI:")
    console.log("=".repeat(80))
    console.log(descriptionPrompt)
    console.log("=".repeat(80))
    console.log("📏 Description prompt length:", descriptionPrompt.length, "characters")
    
    console.log("\n📤 Sending description request to Gemini API...")
    console.log("⏱️ Request started at:", new Date().toISOString())
    
    const result = await model.generateContent(descriptionPrompt)
    console.log("📥 Received response from Gemini API")
    console.log("⏱️ Response received at:", new Date().toISOString())
    
    const response = await result.response
    const text = response.text()
    
    console.log("\n📝 RAW RESPONSE FROM GEMINI:")
    console.log("=".repeat(80))
    console.log(text)
    console.log("=".repeat(80))
    console.log("Text length:", text.length, "characters")
    
    // Parse the response
    console.log("\n🔍 Parsing response for English and Sinhala descriptions...")
    const englishMatch = text.match(/ENGLISH:\s*([\s\S]+?)(?=SINHALA:|$)/)
    const sinhalaMatch = text.match(/SINHALA:\s*([\s\S]+)$/)
    
    console.log("English match found:", !!englishMatch)
    console.log("Sinhala match found:", !!sinhalaMatch)
    
    const english = englishMatch?.[1]?.trim() || "A beautiful architectural design featuring modern elements and thoughtful space planning."
    const sinhala = sinhalaMatch?.[1]?.trim() || "අලංකාර ගෘහ නිර්මාණයක් යනු නවීන මූලද්‍රව්‍ය සහ සැලකිලිමත් අවකාශ සැලසුම් සහිতව ඉදිකරන ලද ගෘහයකි."
    
    console.log("\n✅ DESCRIPTION GENERATION SUCCESSFUL!")
    console.log("🇬🇧 English description:", english)
    console.log("🇱🇰 Sinhala description:", sinhala)
    
    return { english, sinhala }
    
  } catch (error) {
    console.log("\n❌ DESCRIPTION GENERATION ERROR:")
    console.log("=".repeat(80))
    console.error("Error:", error)
    console.error("Error message:", error instanceof Error ? error.message : String(error))
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.log("=".repeat(80))
    
    // Try fallback to previous model if the new one fails
    try {
      console.log("\n🔄 Trying fallback to gemini-2.5-flash-image-preview...")
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" })
      
      const fallbackPrompt = `
      Based on this architectural design prompt: "${prompt}"
      
      Generate two concise descriptions (approximately 50 words each):
      
      1. English description: Write a professional, evocative description of the architectural design
      2. Sinhala description: Write the same description in Sinhala, using natural contemporary style with commonly used English words where appropriate
      
      Format your response as:
      ENGLISH: [description]
      SINHALA: [description]
      `
      
      const result = await fallbackModel.generateContent(fallbackPrompt)
      const response = await result.response
      const text = response.text()
      
      const englishMatch = text.match(/ENGLISH:\s*([\s\S]+?)(?=SINHALA:|$)/)
      const sinhalaMatch = text.match(/SINHALA:\s*([\s\S]+)$/)
      
      const english = englishMatch?.[1]?.trim() || "A beautiful architectural design featuring modern elements and thoughtful space planning."
      const sinhala = sinhalaMatch?.[1]?.trim() || "අලංකාර ගෘහ නිර්මාණයක් යනු නවීන මූලද්‍රව්‍ය සහ සැලකිලිමත් අවකාශ සැලසුම් සහිතව ඉදිකරන ලද ගෘහයකි."
      
      console.log("✅ Fallback successful")
      return { english, sinhala }
    } catch (fallbackError) {
      console.error("❌ Fallback also failed:", fallbackError)
    }
    
    console.log("🔄 Using hardcoded fallback descriptions")
    return {
      english: "A beautiful architectural design featuring modern elements and thoughtful space planning.",
      sinhala: "අලංකාර ගෘහ නිර්මාණයක් යනු නවීන මූලද්‍රව්‍ය සහ සැලකිලිමත් අවකාශ සැලසුම් සහිතව ඉදිකරන ලද ගෘහයකි."
    }
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
