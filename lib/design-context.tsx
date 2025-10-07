"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface GeneratedDesign {
  imageUrl: string
  thumbnailUrl: string
  isWatermarked: boolean
  prompt: string
  designId?: string
  remainingPoints: number
  perspective?: string
}

interface PerspectiveImageData {
  imageUrl: string
  thumbnailUrl: string
  designId: string
  isWatermarked: boolean
  prompt: string
  remainingPoints: number
}

interface GeneratedPerspectives {
  'front'?: PerspectiveImageData
  'front-left'?: PerspectiveImageData
  'front-right'?: PerspectiveImageData
}

interface DesignFormData {
  buildingType: string
  style: string
  landSize: number
  landUnit: string
  floors: any[]
  hasPool: boolean
  hasBalcony: boolean
  hasTerrace: boolean
  perspective: string
}

interface DesignContextType {
  generatedDesign: GeneratedDesign | null
  setGeneratedDesign: (design: GeneratedDesign | null) => void
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
  generatedPerspectives: GeneratedPerspectives
  currentPerspective: string
  originalFormData: DesignFormData | null
  baseImageForEditing: string | null
  addGeneratedPerspective: (perspective: string, imageData: PerspectiveImageData) => void
  switchPerspective: (perspective: string) => void
  clearAllPerspectives: () => void
  setOriginalFormData: (formData: DesignFormData) => void
  setBaseImageForEditing: (imageUrl: string) => void
}

const DesignContext = createContext<DesignContextType | undefined>(undefined)

export function DesignProvider({ children }: { children: ReactNode }) {
  const [generatedDesign, setGeneratedDesign] = useState<GeneratedDesign | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPerspectives, setGeneratedPerspectives] = useState<GeneratedPerspectives>({})
  const [currentPerspective, setCurrentPerspective] = useState<string>('front')
  const [originalFormData, setOriginalFormData] = useState<DesignFormData | null>(null)
  const [baseImageForEditing, setBaseImageForEditing] = useState<string | null>(null)

  const addGeneratedPerspective = (perspective: string, imageData: PerspectiveImageData) => {
    setGeneratedPerspectives(prev => ({
      ...prev,
      [perspective]: imageData
    }))
  }

  const switchPerspective = (perspective: string) => {
    const perspectiveData = generatedPerspectives[perspective as keyof GeneratedPerspectives]
    if (perspectiveData) {
      setCurrentPerspective(perspective)
      setGeneratedDesign({
        imageUrl: perspectiveData.imageUrl,
        thumbnailUrl: perspectiveData.thumbnailUrl,
        isWatermarked: perspectiveData.isWatermarked,
        prompt: perspectiveData.prompt,
        designId: perspectiveData.designId,
        remainingPoints: perspectiveData.remainingPoints,
        perspective: perspective
      })
    }
  }

  const clearAllPerspectives = () => {
    setGeneratedPerspectives({})
    setGeneratedDesign(null)
    setCurrentPerspective('front')
    setOriginalFormData(null)
    setBaseImageForEditing(null)
  }

  return (
    <DesignContext.Provider value={{
      generatedDesign,
      setGeneratedDesign,
      isGenerating,
      setIsGenerating,
      generatedPerspectives,
      currentPerspective,
      originalFormData,
      baseImageForEditing,
      addGeneratedPerspective,
      switchPerspective,
      clearAllPerspectives,
      setOriginalFormData,
      setBaseImageForEditing
    }}>
      {children}
    </DesignContext.Provider>
  )
}

export function useDesign() {
  const context = useContext(DesignContext)
  if (context === undefined) {
    throw new Error('useDesign must be used within a DesignProvider')
  }
  return context
}
