-- Fix Google OAuth: Make password_hash nullable
-- Google users don't have passwords, only email/password users do

ALTER TABLE users 
ALTER COLUMN password_hash DROP NOT NULL;

-- Verify the change
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'password_hash';
