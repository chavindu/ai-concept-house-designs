-- Update existing users who don't have avatar URLs
-- This script generates random avatars for existing users

-- Update users without avatar URLs
UPDATE public.profiles 
SET avatar_url = 'https://ui-avatars.com/api/?name=' || 
    COALESCE(
        REGEXP_REPLACE(full_name, '\s+', '', 'g'), 
        SUBSTRING(email, 1, 2)
    ) || 
    '&background=random&color=fff&size=200'
WHERE avatar_url IS NULL OR avatar_url = '';

-- Update users with empty full_name to use email initials
UPDATE public.profiles 
SET avatar_url = 'https://ui-avatars.com/api/?name=' || 
    SUBSTRING(email, 1, 2) || 
    '&background=random&color=fff&size=200'
WHERE (avatar_url IS NULL OR avatar_url = '') 
    AND (full_name IS NULL OR full_name = '');

-- Verify the updates
SELECT 
    id,
    email,
    full_name,
    avatar_url,
    created_at
FROM public.profiles 
ORDER BY created_at DESC
LIMIT 10;
