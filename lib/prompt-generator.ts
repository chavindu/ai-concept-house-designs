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
  console.log("🎨 Generating structured prompt for form data:", formData)

  // Validate floors range (1–5)
  const floorCount = Array.isArray(formData.floors) ? formData.floors.length : 0
  if (floorCount < 1 || floorCount > 5) {
    throw new Error(`Invalid number of floors: ${floorCount}. Supported range is 1–5.`)
  }

  // Convert land size to perches for consistency
  let landSizeInPerches = formData.landSize
  switch (formData.landUnit) {
    case "sqft":
      landSizeInPerches = formData.landSize / 435.6
      break
    case "sqm":
      landSizeInPerches = formData.landSize / 25.29285264
      break
    case "acres":
      landSizeInPerches = formData.landSize * 160
      break
    case "hectares":
      landSizeInPerches = formData.landSize * 395.37
      break
    // 'perches' stays as is
  }

  const totalCarParks = formData.floors.reduce((sum, floor) => sum + (floor.carParks || 0), 0)

  const styleBlock = getArchitecturalStyleBlock(formData.style)
  const formVariablesBlock = buildFormVariablesBlock({
    floors: formData.floors,
    landSizeInPerches,
    totalCarParks,
    hasPool: formData.hasPool,
    hasBalcony: formData.hasBalcony,
    hasTerrace: formData.hasTerrace,
    perspective: formData.perspective,
  })

  const prompt = `${styleBlock}\n\n${formVariablesBlock}`.trim()
  console.log("📝 Generated prompt:", prompt)
  console.log("📏 Prompt length:", prompt.length, "characters")
  return prompt
}

function getArchitecturalStyleBlock(styleInput: string): string {
  const normalized = normalizeStyleName(styleInput)
  if (normalized === "minimalist-tropical") {
    return [
      "Core Philosophy:",
      "The design must be a fusion of minimalist architectural principles with tropical climate adaptation. It must emphasize clean lines, volumetric purity, and a profound, seamless connection to a lush landscape, drawing inspiration from the sophisticated modernism of contemporary Southeast Asian and South American architecture.",
      "Architectural Language:",
      "• Style: Contemporary Tropical Minimalism. The aesthetic is clean, light, and sophisticated, creating tranquil spaces that breathe.",
      "• Form: A dynamic composition of strong rectilinear and cubic geometry. The design must feature interlocking and cantilevered volumes, double-height spaces, and a carefully considered interplay between solid planes and transparent voids.",
      "• Roof System: A clean, flat concrete roof with deep, sharp-edged overhangs to provide essential shade. This is the primary roof form.",
      "Tectonic & Material Palette:",
      "• Primary Structure & Walls: Primarily smooth white or grey plastered finishes to create a bright, airy canvas. This is accented with feature walls of fair-faced concrete or exposed natural brick (in dark or red tones) to add texture and warmth.",
      "• Screens & Shading: Natural hardwood (e.g., Teak, Ipe) is essential for creating privacy and controlling sunlight. It must be used for elements like vertical louvers, brise-soleil, cladding, and privacy screens.",
      "• Fenestration (Glazing): Expansive floor-to-ceiling glass panels and sliding doors are mandatory to dissolve the indoor-outdoor boundary. Frames must be minimal and sleek, in black or dark charcoal aluminum.",
      "Key Design Principles:",
      "• Indoor-Outdoor Fusion: The boundary between interior and exterior must be blurred. This is achieved through retractable glass walls, internal courtyards, and covered terraces that function as true outdoor living rooms.",
      "• Biophilic Integration: Landscaping is a core architectural component, not an afterthought. Lush tropical planting (palms, monsteras, hanging vines) must be woven directly into the building's fabric through ground-level gardens, double-height internal courtyards, and integrated planter boxes.",
      "• Planting: Lush, curated tropical landscaping is essential. Use species like palm trees, Coconut trees, monstera, and hanging vines to soften the hard architectural lines and provide privacy.",
      "Fixed Design Language & Materials",
      "• Light & Ventilation: The design must intelligently control natural light and airflow. Architectural elements like brise-soleil and perforated screens are not just decorative; they are functional components that create dynamic patterns of light and shadow.",
      "• Integration of Features: Balconies, terraces, and carports are not \"add-ons.\" They must be designed as integral parts of the building's form—appearing as cantilevered volumes or sheltered voids carved from the main structure.",
    ].join("\n")
  }
  // Default to Minimalist Tropical for now
  return getArchitecturalStyleBlock("minimalist-tropical")
}

function buildFormVariablesBlock(args: {
  floors: FloorConfig[]
  landSizeInPerches: number
  totalCarParks: number
  hasPool: boolean
  hasBalcony: boolean
  hasTerrace: boolean
  perspective: string
}): string {
  const { floors, landSizeInPerches, totalCarParks, hasPool, hasBalcony, hasTerrace, perspective } = args
  const lines: string[] = []

  // Core Specifications
  lines.push("Core Specifications")
  lines.push(`• Number of Floors: ${floors.length}.`)
  lines.push(`• Land Size: ${Math.round(landSizeInPerches)} perches, flat terrain`)
  if (totalCarParks > 0) {
    lines.push(`• Number of Parking Spaces: ${totalCarParks}`)
  }
  lines.push("")

  // Spatial Program
  lines.push("Spatial Program")
  floors.forEach((floor, idx) => {
    const header = `• ${formatFloorHeader(idx)}:`
    const roomLines = buildRoomLines(floor)
    if (roomLines.length > 0) {
      lines.push(header)
      roomLines.forEach((l) => lines.push(`o ${l}`))
    }
  })
  lines.push("")

  // Key Exterior Features
  lines.push("Key Exterior Features ")
  lines.push(`• Pool Availability: ${hasPool ? "Yes" : "No"}`)
  lines.push(`• Balcony Availability: ${hasBalcony ? "Yes" : "No"}`)
  lines.push(`• Roof Terrace Availability: ${hasTerrace ? "Yes" : "No"}`)
  lines.push("")

  // Output Parameters
  lines.push("Output Parameters")
  lines.push(`• Image Angle: ${mapPerspectiveLabel(perspective)}`)
  if (totalCarParks > 0) {
    lines.push(
      "• Image Framing Instructions: The camera angle must be framed to ensure that the integrated carport (with cars) and a leading driveway are prominent and clearly visible along with the main facade."
    )
  }
  lines.push("• Time of Day: Daytime, bright sun with clear shadows")

  return lines.join("\n")
}

function buildRoomLines(floor: FloorConfig): string[] {
  const result: string[] = []
  if (floor.livingRooms > 0) result.push(`${floor.livingRooms} living room`)
  if (floor.diningRooms > 0) result.push(`${floor.diningRooms} dining area`)
  if (floor.kitchens > 0) result.push(`${floor.kitchens} kitchen`)
  if (floor.bedrooms > 0) result.push(`${floor.bedrooms} Bedroom`)
  if (floor.bathrooms > 0) result.push(`${floor.bathrooms} Bathroom`)
  return result
}

function formatFloorHeader(index: number): string {
  switch (index) {
    case 0:
      return "Ground Floor Spaces"
    case 1:
      return "First Floor Spaces"
    case 2:
      return "Second Floor Spaces"
    case 3:
      return "Third Floor Spaces"
    case 4:
      return "Fourth Floor Spaces"
    default:
      return `Level ${index + 1} Spaces`
  }
}

function mapPerspectiveLabel(value: string): string {
  const v = (value || "").toLowerCase()
  if (v === "front") return "Front view"
  if (v === "front-left") return "Left perspective"
  if (v === "front-right") return "Right perspective"
  return value
}

function normalizeStyleName(styleInput: string): string {
  if (!styleInput) return "minimalist-tropical"
  const s = styleInput.trim().toLowerCase()
  if (s === "minimalist tropical" || s === "minimalist-tropical") return "minimalist-tropical"
  return s
}
