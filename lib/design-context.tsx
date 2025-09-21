"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface GeneratedDesign {
  imageUrl: string
  thumbnailUrl: string
  descriptionEn: string
  descriptionSi: string
  isWatermarked: boolean
  prompt: string
  designId?: string
  remainingPoints: number
}

interface DesignContextType {
  generatedDesign: GeneratedDesign | null
  setGeneratedDesign: (design: GeneratedDesign | null) => void
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
}

const DesignContext = createContext<DesignContextType | undefined>(undefined)

export function DesignProvider({ children }: { children: ReactNode }) {
  const [generatedDesign, setGeneratedDesign] = useState<GeneratedDesign | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  return (
    <DesignContext.Provider value={{
      generatedDesign,
      setGeneratedDesign,
      isGenerating,
      setIsGenerating
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
