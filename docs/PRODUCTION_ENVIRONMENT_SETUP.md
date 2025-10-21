# Production Environment Setup Guide

## Authentication Issues Fixed

This guide addresses the authentication and points display issues in production that work fine on localhost.

## Root Causes Identified

1. **Cookie Security Settings**: Cookies were set to `secure: true` in production, but if your production environment doesn't use HTTPS, cookies won't work.
2. **Missing Domain Configuration**: Cookies weren't configured with the proper domain for production.
3. **NEXTAUTH_URL Configuration**: Production needs the correct domain URL.
4. **Google OAuth Redirect URIs**: Production domain needs to be added to Google Cloud Console.

## Required Environment Variables for Production

Add these variables to your production environment (Azure App Service, Vercel, etc.):

```bash
# Production Authentication Configuration
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_nextauth_secret_here_minimum_32_characters

# Cookie Domain (optional - only if you have subdomains)
# IMPORTANT: Use domain only, not full URL (e.g., ".bitlab.lk" not "https://aibuilder.bitlab.lk")
COOKIE_DOMAIN=.bitlab.lk

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_minimum_32_characters

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Database Configuration
PGHOST=ai-builder-db-server.postgres.database.azure.com
PGUSER=postgres
PGPORT=5432
PGDATABASE=postgres
PGPASSWORD=your_azure_postgres_password

# Azure Blob Storage Configuration
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=vanniaibuilder;AccountKey=your_azure_storage_key;EndpointSuffix=core.windows.net
AZURE_STORAGE_ACCOUNT_NAME=vanniaibuilder
AZURE_STORAGE_ACCOUNT_KEY=your_azure_storage_key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Email Configuration
EMAIL_FROM=noreply@yourdomain.com
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your_email@gmail.com
EMAIL_SMTP_PASS=your_app_password

# AI Service Configuration
GEMINI_API_KEY=your_gemini_api_key

# PayHere Payment Configuration
PAYHERE_MERCHANT_ID=your_payhere_merchant_id
PAYHERE_MERCHANT_SECRET=your_payhere_merchant_secret
PAYHERE_SANDBOX_MODE=false
```

## Google OAuth Configuration Updates

### 1. Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Update **Authorized JavaScript origins**:
   - `https://yourdomain.com`
   - `http://localhost:3000` (keep for development)
5. Update **Authorized redirect URIs**:
   - `https://yourdomain.com/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (keep for development)

### 2. Save Changes

Click **Save** in Google Cloud Console after updating the URIs.

## Cookie Configuration Changes Made

The following changes have been implemented to fix cookie issues:

### 1. Dynamic Secure Flag
```typescript
secure: process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_URL?.startsWith('https')
```
This ensures cookies are only marked as secure when:
- Running in production AND
- Using HTTPS

### 2. Domain Configuration
```typescript
domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined
```
This allows setting a specific domain for cookies in production.

## Testing the Fix

### 1. Deploy Changes
Deploy the updated code to your production environment.

### 2. Set Environment Variables
Ensure all production environment variables are set correctly.

### 3. Test Authentication
1. Visit your production site
2. Try logging in with Google OAuth
3. Check if the user session persists after page refresh
4. Verify points are displayed in the header

### 4. Debug Cookie Issues
If cookies still don't work, check:

1. **Browser Developer Tools**:
   - Go to Application/Storage tab
   - Check if cookies are being set
   - Look for any cookie-related errors in Console

2. **Network Tab**:
   - Check if authentication requests return proper cookies
   - Verify cookie headers in responses

3. **Production Logs**:
   - Check server logs for authentication errors
   - Look for JWT token verification failures

## Common Issues and Solutions

### Issue 1: "Authentication required" error persists
**Solution**: Check if `NEXTAUTH_URL` matches your production domain exactly.

### Issue 2: Points not displaying
**Solution**: Verify the `/api/user/profile` endpoint is accessible and returns user data.

### Issue 3: Google OAuth redirect error
**Solution**: Ensure Google Cloud Console has the correct production redirect URI.

### Issue 4: Cookies not persisting
**Solution**: 
- Check if your production environment uses HTTPS
- Verify `COOKIE_DOMAIN` is set correctly
- Ensure `NEXTAUTH_URL` starts with `https://`

## Environment-Specific Notes

### Azure App Service
- Ensure `NEXTAUTH_URL` is set to your Azure App Service URL
- If using custom domain, update `NEXTAUTH_URL` to match
- Check Azure App Service configuration for environment variables

### Vercel
- Set environment variables in Vercel dashboard
- Ensure `NEXTAUTH_URL` matches your Vercel domain
- Check Vercel function logs for authentication errors

### Other Hosting Providers
- Follow the same pattern for environment variables
- Ensure HTTPS is properly configured
- Check hosting provider documentation for cookie domain settings

## Monitoring

After deployment, monitor:
1. Authentication success rates
2. Session persistence
3. Points display functionality
4. Error logs for authentication failures

## Rollback Plan

If issues persist:
1. Revert cookie configuration changes
2. Check environment variables
3. Verify Google OAuth configuration
4. Test with a fresh browser session (clear cookies)

## Support

If you continue to experience issues:
1. Check browser console for errors
2. Review server logs
3. Test with different browsers
4. Verify all environment variables are set correctly
