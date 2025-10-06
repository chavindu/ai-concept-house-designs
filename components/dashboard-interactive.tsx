"use client"

import { Button } from "@/components/ui/button"
import { Download, Share2, Eye } from "lucide-react"

interface Design {
  id: string
  title: string
  prompt: string
  image_url?: string
  is_public: boolean
}

interface DashboardInteractiveProps {
  designs: Design[]
}

export function DashboardInteractive({ designs }: DashboardInteractiveProps) {
  return (
    <>
      {designs.map((design) => (
        <div key={design.id} className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              if (design.image_url) {
                const link = document.createElement('a');
                link.href = design.image_url;
                link.download = `${design.title || 'design'}-${design.id}.png`;
                link.click();
              }
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: design.title || 'Generated Design',
                  text: design.prompt,
                  url: window.location.href
                });
              } else {
                // Fallback to copying to clipboard
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
            }}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              // Toggle public status
              // This would need to be implemented with a server action
              alert('Share to community feature coming soon!');
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            {design.is_public ? 'Remove from Gallery' : 'Add to Gallery'}
          </Button>
        </div>
      ))}
    </>
  )
}
