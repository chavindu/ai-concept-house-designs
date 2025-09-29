import { architecturalStyleTemplates } from "./architectural-styles"

interface FloorConfig {
  id: string
  name: string
  bedrooms: number
  bathrooms: number
  livingRooms: number
  kitchens: number
  diningRooms: number
  carParks: number
}

interface DesignFormData {
  buildingType: string
  style: string
  landSize: number
  landUnit: string
  floors: FloorConfig[]
  hasPool: boolean
  hasBalcony: boolean
  hasTerrace: boolean
  perspective: string
}

export function generatePrompt(formData: DesignFormData): string {
  console.log("🎨 Generating prompt for form data:", formData)
  
  const styleTemplate = architecturalStyleTemplates[formData.style]

  if (!styleTemplate) {
    throw new Error(`Unknown architectural style: ${formData.style}`)
  }

  console.log("📋 Using style template:", styleTemplate.styleName)

  // Convert land size to perches for consistency
  let landSizeInPerches = formData.landSize
  switch (formData.landUnit) {
    case "sqft":
      landSizeInPerches = formData.landSize / 435.6 // 1 perch = 435.6 sqft
      break
    case "sqm":
      landSizeInPerches = formData.landSize / 25.29285264 // 1 perch = 25.29285264 sqm
      break
    case "acres":
      landSizeInPerches = formData.landSize * 160 // 1 acre = 160 perches
      break
    case "hectares":
      landSizeInPerches = formData.landSize * 395.37 // 1 hectare = 395.37 perches
      break
    // 'perches' stays as is
  }

  const spatialRequirements = generateFloorBasedSpatialRequirements(formData.floors)

  // Generate optional features text
  const optionalFeatures = generateOptionalFeatures(formData)

  // Roof type removed from prompt; styles include roof guidance inherently

  const totalCarParks = formData.floors.reduce((sum, floor) => sum + floor.carParks, 0)

  // Build the complete prompt
  const prompt = `
${styleTemplate.inspiration}

Design Goal:
To generate one design variation for a ${styleTemplate.styleName}. Each result must offer a unique interpretation of the brief by exploring ${styleTemplate.keyElements} while maintaining a cohesive and sophisticated design philosophy.

Output Requirements:
Bilingual Description: Each generated design must be accompanied by a concise, evocative description.
• Length: Approximately 50 words for each language.
• Languages: Provide the description in English / Sinhala
• Sinhala Style: The Sinhala description should be written in a natural, contemporary style, incorporating commonly used English words where appropriate, reflecting modern spoken language.

Output Image Angle: ${formData.perspective} perspective
Time: Daytime

Core Specifications:
• Land: ${Math.round(landSizeInPerches)} perches, flat terrain.
• Number of Floors: ${formData.floors.length} levels maximum.
${totalCarParks > 0 ? `• Parking: A carport or sheltered space for ${totalCarParks} vehicle(s), architecturally integrated into the main building's form.` : ""}

${spatialRequirements}

Key Features:
${styleTemplate.keyFeatures}

Exterior & Landscape Elements:
${formData.hasPool ? "• Pool: 12' x 8' rectangular pool integrated with the architectural design." : ""}
${formData.hasBalcony ? "• Balconies: Integrated into the building form with appropriate railings and overhangs." : ""}
${formData.hasTerrace ? "• Terraces: Roof garden or terrace spaces for outdoor living." : ""}
${optionalFeatures}

Fixed Design Language & Materials:
${styleTemplate.designLanguage}

  

Core Materials:
${styleTemplate.materials}

Creative Direction & Variations:
${styleTemplate.creativeDirection}
`.trim()

  console.log("📝 Generated prompt:", prompt)
  console.log("📏 Prompt length:", prompt.length, "characters")
  
  return prompt
}

function generateFloorBasedSpatialRequirements(floors: FloorConfig[]): string {
  let spatial = "Spatial Requirements:\n\nPrimary Interior Spaces:\n"

  floors.forEach((floor, index) => {
    spatial += `\n${floor.name}\n`

    if (floor.bedrooms > 0) {
      spatial += `• ${floor.bedrooms} - Bedroom(s)\n`
    }
    if (floor.bathrooms > 0) {
      spatial += `• ${floor.bathrooms} - Bathroom(s)\n`
    }
    if (floor.livingRooms > 0) {
      spatial += `• ${floor.livingRooms} - Living room(s)\n`
    }
    if (floor.kitchens > 0) {
      spatial += `• ${floor.kitchens} - Kitchen(s)\n`
    }
    if (floor.diningRooms > 0) {
      spatial += `• ${floor.diningRooms} - Dining room(s)\n`
    }
    if (floor.carParks > 0) {
      spatial += `• ${floor.carParks} - Car park(s)\n`
    }
  })

  return spatial
}

function generateOptionalFeatures(formData: DesignFormData): string {
  const features = []

  if (formData.hasPool) {
    features.push("Swimming pool integrated with landscape design")
  }
  if (formData.hasBalcony) {
    features.push("Balconies with architectural integration")
  }
  if (formData.hasTerrace) {
    features.push("Terrace or roof garden spaces")
  }

  return features.length > 0 ? `• Additional Features: ${features.join(", ")}.` : ""
}

// Roof specification helper removed as roof type is embedded within style templates
