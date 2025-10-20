# Supabase to Azure Migration Guide

This guide documents the complete migration from Supabase to Azure PostgreSQL and Azure Blob Storage for the AI Concept House Designs application.

## Overview

The migration includes:
- **Database**: Supabase PostgreSQL → Azure PostgreSQL
- **Storage**: Vercel Blob → Azure Blob Storage  
- **Authentication**: Supabase Auth → Custom JWT-based authentication with NextAuth.js Google OAuth
- **Email**: Custom email service with verification and password reset

## Prerequisites

1. **Azure PostgreSQL Database** - Set up and configured
2. **Azure Blob Storage Account** - Set up with public access
3. **Google OAuth Credentials** - For Google Sign-In integration via NextAuth.js
4. **Email Service** - SMTP configuration for verification emails

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Azure PostgreSQL Database Configuration
PGHOST=ai-builder-db-server.postgres.database.azure.com
PGUSER=postgres
PGPORT=5432
PGDATABASE=postgres
PGPASSWORD=your_azure_postgres_password

# Azure Blob Storage Configuration
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=vanniaibuilder;AccountKey=your_azure_storage_key;EndpointSuffix=core.windows.net
AZURE_STORAGE_ACCOUNT_NAME=vanniaibuilder
AZURE_STORAGE_ACCOUNT_KEY=your_azure_storage_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_minimum_32_characters

# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here_minimum_32_characters

# Google OAuth Configuration (for NextAuth.js)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Email Configuration
EMAIL_FROM=noreply@architecture.lk
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your_email@gmail.com
EMAIL_SMTP_PASS=your_app_password

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# AI Service Configuration
GEMINI_API_KEY=your_gemini_api_key

# PayHere Payment Configuration
PAYHERE_MERCHANT_ID=your_payhere_merchant_id
PAYHERE_MERCHANT_SECRET=your_payhere_merchant_secret
PAYHERE_SANDBOX_MODE=true

# Development Configuration
NODE_ENV=development
```

## Installation Steps

### 1. Install Dependencies

```bash
# Install new dependencies
pnpm add pg @azure/storage-blob bcrypt jsonwebtoken uuid next-auth @auth/pg-adapter
pnpm add -D @types/pg @types/bcrypt @types/jsonwebtoken @types/uuid

# Remove Supabase dependencies
pnpm remove @supabase/ssr @supabase/supabase-js
```

### 2. Database Setup

Run the Azure PostgreSQL migration script:

```bash
# Connect to your Azure PostgreSQL database and run:
psql -h ai-builder-db-server.postgres.database.azure.com -U postgres -d postgres -f scripts/azure-migration.sql
```

This script creates:
- `users` table (replaces auth.users)
- `sessions` table for JWT refresh tokens
- `verification_tokens` table for email verification
- `password_reset_tokens` table for password reset
- `profiles` table (updated to reference users)
- `designs`, `points_transactions`, `likes`, `architects`, `payments` tables
- NextAuth.js tables: `accounts`, `sessions`, `verification_tokens`
- Indexes and triggers for optimal performance

### 3. Azure Blob Storage Setup

1. Create containers in your Azure Blob Storage:
   - `designs` - for generated design images
   - `thumbnails` - for design thumbnails

2. Set public access level to "Blob" for both containers

### 4. NextAuth.js Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API (or Google Identity API)
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000` (development)
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Client Secret to environment variables

### 5. Run NextAuth Database Migration

```bash
# Run the NextAuth tables migration (fixed version)
psql -h ai-builder-db-server.postgres.database.azure.com -U postgres -d postgres -f scripts/016_add_nextauth_tables_fixed.sql
```

**Note:** The fixed migration script renames NextAuth tables to avoid conflicts with existing JWT-based tables.

## Migration Details

### Authentication System

**Before (Supabase):**
- Supabase Auth with email/password
- Built-in session management

**After (NextAuth.js + Custom JWT):**
- NextAuth.js with Google OAuth provider
- Custom JWT-based authentication for email/password
- Hybrid authentication system supporting both methods
- PostgreSQL adapter for NextAuth session management
- JWT access tokens (15 min expiry)
- JWT refresh tokens (7 days expiry)
- HTTP-only cookies for security
- Custom session management in PostgreSQL
- Email verification and password reset functionality

### Database Changes

**Key Changes:**
- `auth.users` → `public.users`
- Added authentication tables (`sessions`, `verification_tokens`, `password_reset_tokens`)
- Added NextAuth.js tables (`accounts`, `sessions`, `verification_tokens`)
- Updated foreign key references
- Removed RLS policies (replaced with application-level auth)

### Storage Changes

**Before (Vercel Blob):**
```typescript
import { put } from '@vercel/blob'
```

**After (Azure Blob):**
```typescript
import { BlobServiceClient } from '@azure/storage-blob'
```

### API Routes

**New Authentication Routes:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `POST /api/auth/google` - Google OAuth callback

**Updated Routes:**
- All existing API routes now use custom authentication
- User ID passed via `x-user-id` header from middleware

## Features

### Authentication Features

1. **Email/Password Registration**
   - Password strength validation
   - Email verification required
   - Automatic profile creation

2. **Google Sign-In with FedCM**
   - Federated Credential Management API
   - Automatic account creation for new Google users
   - Account linking for existing email users

3. **Email Verification**
   - 24-hour token expiry
   - Resend functionality
   - Automatic redirect after verification

4. **Password Reset**
   - 1-hour token expiry
   - Secure token generation
   - Email-based reset flow

5. **Session Management**
   - HTTP-only cookies
   - Automatic token refresh
   - Secure logout with session cleanup

### Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Security**: Separate secrets for access/refresh tokens
- **Cookie Security**: HTTP-only, secure, same-site
- **Token Expiry**: Short-lived access tokens, longer refresh tokens
- **SQL Injection Protection**: Parameterized queries throughout

## Testing

### 1. Database Connection Test

```bash
# Test database connection
curl -X GET http://localhost:3000/api/test-db
```

### 2. Authentication Flow Test

1. Register a new user
2. Verify email
3. Login with credentials
4. Test Google Sign-In
5. Test password reset flow
6. Test logout

### 3. API Authentication Test

```bash
# Test protected endpoint
curl -X GET http://localhost:3000/api/user/profile \
  -H "Cookie: access_token=your_token"
```

## Deployment

### 1. Environment Variables

Set all environment variables in your production environment.

### 2. Database Migration

Run the migration script on your production Azure PostgreSQL database.

### 3. Azure Blob Storage

Ensure containers are created and configured with public access.

### 4. Google OAuth

Update redirect URIs in Google Cloud Console for production domain.

## Rollback Plan

If rollback is needed:

1. **Database**: Restore from Supabase backup
2. **Code**: Revert to previous commit with Supabase dependencies
3. **Environment**: Restore Supabase environment variables

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check Azure PostgreSQL firewall rules
   - Verify connection string format
   - Ensure SSL is properly configured

2. **Authentication Errors**
   - Verify JWT secrets are set
   - Check cookie domain settings
   - Ensure middleware is properly configured

3. **Blob Storage Errors**
   - Verify Azure storage account credentials
   - Check container permissions
   - Ensure containers exist

4. **Google OAuth Errors**
   - Verify client ID and secret
   - Check redirect URI configuration
   - Ensure FedCM is properly enabled

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
DEBUG=auth:*
```

## Support

For issues or questions:
1. Check the application logs
2. Verify environment variables
3. Test database connectivity
4. Review authentication flow

## Migration Checklist

- [ ] Azure PostgreSQL database set up
- [ ] Azure Blob Storage configured
- [ ] Google OAuth credentials obtained
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Database migration script executed
- [ ] Authentication system tested
- [ ] API routes updated and tested
- [ ] Frontend components updated
- [ ] Email service configured
- [ ] Production deployment completed
- [ ] Monitoring and logging set up
