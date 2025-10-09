<!-- be9e8cd4-9f09-4af3-97d3-e4bf338789e6 df540506-cee0-4f5f-a2ef-114312d7e7f7 -->
# Perspective Editing & Regeneration Feature

## Overview

Enable users to generate an initial architectural design (default: front view), then generate additional perspectives (front-left, front-right) by editing the original image. Cache all perspectives and allow instant switching between generated views.

## Core Functionality

### User Flow:

1. User fills form, front view is selected by default
2. Click "Generate Design (1 Point)" → generates front view image
3. "Generate Design" button is replaced by "Regenerate (1 Point)" and "Reset" buttons
4. Canvas shows image with 3 perspective buttons below it
5. Click "Front-Left View (1 Point)" → edits front view image to show front-left perspective (costs 1 point)
6. Click "Front-Right View (1 Point)" → edits front view image to show front-right perspective (costs 1 point)
7. Click back to "Front View" → shows cached front view (0 points, instant)
8. Click "Regenerate (1 Point)" → regenerates currently displayed perspective as new variation
9. Click "Reset" → clears all cached perspectives and returns to initial state

## Key Changes

### 1. Update Design Context (`lib/design-context.tsx`)

- Add `generatedPerspectives` state: object storing all generated perspective images
  ```typescript
  {
    'front': { imageUrl: '...', thumbnailUrl: '...', designId: '...' },
    'front-left': { imageUrl: '...', thumbnailUrl: '...', designId: '...' },
    'front-right': { imageUrl: '...', thumbnailUrl: '...', designId: '...' }
  }
  ```

- Add `currentPerspective` state: tracks which perspective is currently displayed
- Add `originalFormData` state: stores form parameters from initial generation
- Add `baseImageForEditing` state: stores the front view image used as base for editing
- Add helper functions:
  - `addGeneratedPerspective(perspective, imageData)`
  - `switchPerspective(perspective)`
  - `clearAllPerspectives()`

### 2. Update Design Canvas (`components/design-canvas.tsx`)

- **Keep** perspective buttons below canvas (already exist)
- Update perspective button rendering:
  - If perspective exists in `generatedPerspectives`: show "Front-Left View (Generated)"
  - If not generated yet: show "Front-Left View (1 Point)"
  - If currently displayed: highlight button with `variant="default"`
  - If other perspective: use `variant="outline"`
- Update perspective button click handler:
  - If perspective cached in context: `switchPerspective()` (instant, 0 points)
  - If not cached: call `/api/edit-design-perspective` to generate it (1 point)
- **Remove** the old non-functional "Regenerate (1 Point)" button
- **Keep** Download/Share buttons as-is

### 3. Update Design Generator (`components/design-generator.tsx`)

- **Don't add** perspective selector UI (it stays on canvas)
- Default perspective to "front" on component mount
- Update "Generate Design (1 Point)" button:
  - Hide this button when `generatedDesign` exists
  - Show "Regenerate (1 Point)" button when `generatedDesign` exists
  - Show "Reset" button next to Regenerate button
- Implement Regenerate handler:
  - Gets current perspective from context
  - Calls `/api/generate-design` with same form data + current perspective
  - Replaces the current perspective in `generatedPerspectives` cache
  - Costs 1 point
- Implement Reset handler:
  - Calls `clearAllPerspectives()` from context
  - Clears `generatedDesign`
  - Shows "Generate Design (1 Point)" button again
- **Remove** the old event listener for 'regenerate-with-perspective'

### 4. Update AI Service (`lib/ai-service.ts`)

- Add `editArchitecturalDesignPerspective()` function:
  - Parameters: `baseImageUrl`, `newPerspective`, `originalPrompt`, `isFreeUser`
  - Convert base image URL to base64 if needed
  - Create edit instruction: `"Transform this architectural rendering to show a {newPerspective} perspective view. Maintain all architectural features, materials, design elements, and styling exactly as shown. Only change the viewing angle to {newPerspective}."`
  - Call Gemini API with multi-modal input:
    ```typescript
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64ImageData,
          mimeType: mimeType
        }
      },
      editInstruction
    ]);
    ```

  - Return edited image in same format as `generateArchitecturalDesign()`
  - Apply watermark if free user

### 5. Create API Route (`app/api/edit-design-perspective/route.ts`)

- Accept POST with: `{ baseImageUrl, newPerspective, originalFormData }`
- Verify authentication (JWT from header)
- Check user points (need at least 1 point)
- Deduct 1 point from user
- Determine if free user (for watermarking)
- Call `editArchitecturalDesignPerspective()` from ai-service
- On success:
  - Save edited design to database with perspective field
  - Return: `{ imageUrl, thumbnailUrl, isWatermarked, perspective, designId, remainingPoints }`
- On error:
  - Refund the 1 point
  - Return: `{ error: message, pointRefunded: true }`

### 6. Update Generate API Route (`app/api/generate-design/route.ts`)

- Store `formData` in response for regeneration
- Ensure perspective is included in saved design record
- Return perspective in response

### 7. Update Prompt Generator (`lib/prompt-generator.ts`)

- Already includes perspective in prompts - no changes needed
- Perspective is passed as `formData.perspective`

## Implementation Details

### Perspective Caching Strategy:

- Store all generated perspectives in memory (context) during session
- Save each perspective to database when generated
- On page refresh, user needs to regenerate (session cache lost)
- Future enhancement: could load from database on mount

### Point System:

- First image (front view): 1 point
- Each additional perspective (front-left, front-right): 1 point each
- Switching between cached perspectives: 0 points
- Regenerating current perspective: 1 point
- Maximum cost for all 3 perspectives: 3 points

### Button States:

**Generator Section:**

- Before generation: "Generate Design (1 Point)" + "Reset" (disabled)
- After generation: "Regenerate (1 Point)" + "Reset"

**Canvas Perspective Buttons:**

- Not generated: "Front-Left View (1 Point)" - outline variant
- Generated but not current: "Front-Left View (Generated)" - outline variant
- Generated and current: "Front-Left View (Generated)" - default variant

### Error Handling:

- If perspective edit fails: refund point, show error message
- Show "Retry" button that attempts the edit again
- User can switch back to working perspective
- Original front view always preserved as base

## Files to Create/Modify

**Create:**

- `app/api/edit-design-perspective/route.ts` - New API endpoint

**Modify:**

- `lib/design-context.tsx` - Add perspective caching
- `lib/ai-service.ts` - Add edit function
- `components/design-canvas.tsx` - Update perspective buttons logic
- `components/design-generator.tsx` - Add Regenerate/Reset buttons
- `app/api/generate-design/route.ts` - Return form data in response

## Technical Notes

### Gemini Multi-Modal API:

```typescript
// Pass both image and text to Gemini
const result = await model.generateContent([
  {
    inlineData: {
      data: base64ImageData,  // Base64 string without data URL prefix
      mimeType: "image/png"
    }
  },
  "Transform this to front-left perspective..."
]);
```

### Base Image Selection:

- Always use the **front view** as base for editing
- Front-left and front-right are both generated from front view
- This ensures consistency across perspectives

### To-dos

- [x] Add editArchitecturalDesign() function to lib/ai-service.ts for image-to-image editing
- [x] Add originalFormData, currentImageUrl, and currentPerspective to design context
- [x] Create app/api/edit-design-perspective/route.ts for handling perspective edits with point management
- [x] Update design-canvas.tsx perspective button logic to show cached/uncached states and handle clicks
- [x] Replace Generate button with Regenerate/Reset buttons after generation in design-generator.tsx
- [x] Add perspective edit instruction helper to prompt-generator.ts (no changes needed - already included)
- [x] Modify generate-design route to store and return form data for regeneration

## Implementation Status: ✅ COMPLETED

All tasks have been successfully implemented and the perspective editing feature is ready for use!

### Key Features Delivered:
- ✅ Perspective caching and instant switching
- ✅ Image editing with Gemini's multi-modal API
- ✅ Point management with automatic refunds on errors
- ✅ Regenerate and Reset functionality
- ✅ Smart button states and user feedback
- ✅ Error handling and retry mechanisms
