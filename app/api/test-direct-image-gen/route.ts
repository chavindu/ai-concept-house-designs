import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 TESTING DIRECT IMAGE GENERATION")
    console.log("=".repeat(50))
    
    const { apiKey, prompt } = await request.json()
    
    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 })
    }
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }
    
    console.log("🔑 Using API key:", apiKey.substring(0, 10) + "...")
    console.log("📝 Prompt:", prompt.substring(0, 100) + "...")
    
    const startTime = Date.now()
    
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" })
    
    console.log("🤖 Model initialized: gemini-2.5-flash-image-preview")
    
    // Prepare the prompt for image generation
    const imagePrompt = `Create an image: ${prompt}`
    
    console.log("📤 Sending request to Gemini API...")
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
          console.log("-".repeat(40))
          
          // Create a data URL for the image
          const dataUrl = `data:${mimeType};base64,${imageData}`
          
          const processingTime = Date.now() - startTime
          
          console.log("✅ IMAGE GENERATION SUCCESSFUL!")
          console.log("Base64 URL length:", dataUrl.length)
          console.log("Processing time:", processingTime, "ms")
          
          return NextResponse.json({
            success: true,
            imageUrl: dataUrl,
            processingTime,
            prompt: imagePrompt,
            mimeType,
            dataSize: imageData.length,
          })
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
    
    const processingTime = Date.now() - startTime
    
    return NextResponse.json({
      success: false,
      error: "No image generated. Model returned text instead.",
      textResponse: text,
      processingTime,
      prompt: imagePrompt,
    })
    
  } catch (error) {
    console.log("\n❌ DIRECT IMAGE GENERATION ERROR:")
    console.log("=".repeat(80))
    console.error("Error:", error)
    console.error("Error message:", error instanceof Error ? error.message : String(error))
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.log("=".repeat(80))
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      processingTime: Date.now() - Date.now(),
    }, { status: 500 })
  }
}
