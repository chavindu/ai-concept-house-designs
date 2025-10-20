# NextAuth.js Integration - Environment Variables Guide

## Required Environment Variables

Add these variables to your `.env.local` file:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here_minimum_32_characters

# Google OAuth Configuration (already in your migration guide)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Database Configuration (already configured)
PGHOST=ai-builder-db-server.postgres.database.azure.com
PGUSER=postgres
PGPORT=5432
PGDATABASE=postgres
PGPASSWORD=your_azure_postgres_password

# Other existing variables...
JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_minimum_32_characters
```

## Google OAuth Setup Instructions

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or select a project**
3. **Enable Google+ API** (or Google Identity API)
4. **Create OAuth 2.0 credentials**:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000` (development)
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. **Copy the Client ID and Client Secret** to your environment variables

## Database Migration

**Note:** Since we're using JWT strategy for NextAuth (which is more appropriate for your hybrid authentication setup), the database migration is optional. The NextAuth tables are not required for JWT-based sessions.

If you want to use database sessions in the future, you can run:

```bash
# Connect to your Azure PostgreSQL database and run:
psql -h ai-builder-db-server.postgres.database.azure.com -U postgres -d postgres -f scripts/016_add_nextauth_tables_fixed.sql
```

**Current Setup:** JWT-based sessions (no database tables required)

## Testing the Integration

1. **Start the development server**:
   ```bash
   pnpm dev
   ```

2. **Navigate to the login page**: http://localhost:3000/auth/login

3. **Test Google Sign-In**:
   - Click "Sign in with Google"
   - Complete the Google OAuth flow
   - Verify you're redirected to the dashboard

4. **Test session persistence**:
   - Refresh the page
   - Verify you remain logged in
   - Check browser cookies for NextAuth session

5. **Test logout**:
   - Click logout
   - Verify you're redirected to home page
   - Verify session is cleared

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI"**: Check your Google OAuth configuration
2. **"Configuration error"**: Verify NEXTAUTH_SECRET is set
3. **Database connection issues**: Check PostgreSQL connection settings
4. **Session not persisting**: Verify NEXTAUTH_URL matches your domain

### Debug Mode:

Add to your `.env.local` for debugging:
```bash
NEXTAUTH_DEBUG=true
```

## Features Implemented

✅ **Google OAuth Integration**: Complete NextAuth.js setup with Google provider
✅ **Database Integration**: PostgreSQL adapter with proper table structure
✅ **Session Management**: JWT-based sessions with NextAuth
✅ **User Management**: Automatic user creation and profile sync
✅ **Error Handling**: Custom error pages and proper error handling
✅ **Hybrid Authentication**: Supports both NextAuth and existing JWT auth
✅ **TypeScript Support**: Full TypeScript integration
✅ **Security**: Proper CSRF protection and secure session handling

## Next Steps

1. **Test thoroughly** in development environment
2. **Configure production environment** variables
3. **Update Google OAuth** redirect URIs for production domain
4. **Monitor logs** for any authentication issues
5. **Consider adding more OAuth providers** (GitHub, Facebook, etc.)
