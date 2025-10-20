/**
 * Random Avatar Generator Utility
 * Generates random avatar URLs for users who don't have profile pictures
 */

// List of avatar services that provide random avatars
const AVATAR_SERVICES = [
  // DiceBear API - provides various avatar styles
  'https://api.dicebear.com/7.x/avataaars/svg?seed=',
  'https://api.dicebear.com/7.x/personas/svg?seed=',
  'https://api.dicebear.com/7.x/initials/svg?seed=',
  'https://api.dicebear.com/7.x/micah/svg?seed=',
  'https://api.dicebear.com/7.x/miniavs/svg?seed=',
  'https://api.dicebear.com/7.x/open-peeps/svg?seed=',
  'https://api.dicebear.com/7.x/personas/svg?seed=',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=',
  'https://api.dicebear.com/7.x/thumbs/svg?seed=',
]

// Alternative services for fallback
const FALLBACK_AVATAR_SERVICES = [
  'https://ui-avatars.com/api/?name=',
  'https://robohash.org/',
  'https://www.gravatar.com/avatar/',
]

/**
 * Generate a random avatar URL for a user
 * @param seed - Optional seed for consistent avatar generation (e.g., user email or ID)
 * @param name - Optional name for initials-based avatars
 * @returns Random avatar URL
 */
export function generateRandomAvatar(seed?: string, name?: string): string {
  // Use provided seed or generate a random one
  const avatarSeed = seed || Math.random().toString(36).substring(2, 15)
  
  // Choose a random service
  const serviceIndex = Math.floor(Math.random() * AVATAR_SERVICES.length)
  const service = AVATAR_SERVICES[serviceIndex]
  
  // For DiceBear services, append the seed
  if (service.includes('dicebear.com')) {
    return `${service}${avatarSeed}`
  }
  
  // For other services, handle accordingly
  if (service.includes('ui-avatars.com') && name) {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase()
    return `${service}${initials}&background=random&color=fff&size=200`
  }
  
  if (service.includes('robohash.org')) {
    return `${service}${avatarSeed}.png?set=set1&size=200x200`
  }
  
  // Default fallback
  return `${service}${avatarSeed}`
}

/**
 * Generate avatar URL with specific style
 * @param style - Avatar style (avataaars, personas, initials, etc.)
 * @param seed - Seed for consistent generation
 * @returns Avatar URL with specific style
 */
export function generateAvatarWithStyle(style: string, seed: string): string {
  const baseUrl = 'https://api.dicebear.com/7.x'
  return `${baseUrl}/${style}/svg?seed=${seed}&size=200&backgroundColor=random`
}

/**
 * Generate initials-based avatar
 * @param name - Full name to generate initials from
 * @param size - Avatar size (default: 200)
 * @returns Initials-based avatar URL
 */
export function generateInitialsAvatar(name: string, size: number = 200): string {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
  
  return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&size=${size}`
}

/**
 * Get a random avatar service URL
 * @returns Random avatar service URL
 */
export function getRandomAvatarService(): string {
  const randomIndex = Math.floor(Math.random() * AVATAR_SERVICES.length)
  return AVATAR_SERVICES[randomIndex]
}

/**
 * Validate if an avatar URL is accessible
 * @param url - Avatar URL to validate
 * @returns Promise<boolean> - True if accessible, false otherwise
 */
export async function validateAvatarUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Generate a fallback avatar if primary service fails
 * @param seed - Seed for generation
 * @param name - Name for initials
 * @returns Fallback avatar URL
 */
export function generateFallbackAvatar(seed?: string, name?: string): string {
  const fallbackSeed = seed || Math.random().toString(36).substring(2, 15)
  
  if (name) {
    return generateInitialsAvatar(name)
  }
  
  // Use robohash as fallback
  return `https://robohash.org/${fallbackSeed}.png?set=set1&size=200x200`
}
