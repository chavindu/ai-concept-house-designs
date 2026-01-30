import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database/client'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('API: Gallery designs request received')
    
    // Get all public designs with user information
    const designsResult = await query(
      `SELECT 
         d.id,
         d.title,
         d.prompt,
         d.style,
         d.image_url,
         d.thumbnail_url,
         d.created_at,
         d.user_id,
         d.status,
         u.full_name as user_name,
         u.avatar_url as user_avatar
       FROM designs d
       LEFT JOIN users u ON d.user_id = u.id
       WHERE d.is_public = true AND d.status = 'completed'
       ORDER BY d.created_at DESC`
    )

    console.log('API: Found public designs:', designsResult.rows.length)

    // Transform the data to match the expected format
    const designs = designsResult.rows.map(design => ({
      id: design.id,
      title: design.title,
      prompt: design.prompt,
      style: design.style,
      image_url: design.image_url,
      thumbnail_url: design.thumbnail_url,
      created_at: design.created_at,
      user_id: design.user_id,
      profiles: {
        full_name: design.user_name,
        avatar_url: design.user_avatar
      }
    }))

    return NextResponse.json({
      designs
    })
  } catch (error: any) {
    console.error('Error fetching gallery designs:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch designs' }, { status: 500 })
  }
}
