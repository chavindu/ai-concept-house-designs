# Architecture.lk - AI-Powered House Design Platform

A comprehensive web application that allows users to generate concept house designs using AI, with community sharing, architect consultations, and a point-based access system.

## 🚀 Features

### Core Features
- **AI Design Generation**: Google Gemini 2.5 Flash integration for architectural design generation
- **Points System**: Free users get 10 lifetime + 2 daily refresh points
- **Community Gallery**: Public gallery with likes, sharing, and SEO-friendly URLs
- **Architect Consultations**: Booking system with Calendly integration
- **Multi-language Support**: English and Sinhala with i18n
- **Payment Integration**: PayHere for LKR/INR/USD payments
- **Email System**: Microsoft O365 SMTP for notifications

### User Roles
- **Superadmin**: Full system control
- **Admin**: Content moderation and user management
- **User**: Design generation and community participation

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **AI Service**: Google Gemini 2.5 Flash
- **Payments**: PayHere API
- **Email**: Microsoft O365 SMTP
- **Storage**: Vercel Blob (planned)

## 📋 Prerequisites

- Node.js 18+ 
- npm or pnpm
- Supabase account
- Google AI API key
- Microsoft O365 email account
- PayHere merchant account

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-concept-house-designs
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with the following variables:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

   # Google AI Configuration
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here

   # Email Configuration (Microsoft O365 SMTP)
   SMTP_HOST=smtp.office365.com
   SMTP_PORT=587
   SMTP_USER=your_email@yourdomain.com
   SMTP_PASS=your_email_password
   SMTP_FROM=noreply@architecture.lk

   # Admin Configuration
   ADMIN_EMAIL=admin@architecture.lk

   # Site Configuration
   NEXT_PUBLIC_SITE_URL=http://localhost:3000

   # PayHere Configuration
   PAYHERE_MERCHANT_ID=your_payhere_merchant_id
   PAYHERE_MERCHANT_SECRET=your_payhere_merchant_secret
   ```

4. **Set up the database**
   Run the SQL scripts in the `scripts/` directory in order:
   ```bash
   # Execute these in your Supabase SQL editor
   scripts/001_create_user_profiles.sql
   scripts/002_create_designs_table.sql
   scripts/003_create_points_transactions.sql
   scripts/004_create_likes_table.sql
   scripts/005_create_architects_table.sql
   scripts/006_create_payments_table.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

## 🏗️ Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin panel
│   ├── dashboard/         # User dashboard
│   └── ...
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase client configuration
│   ├── ai-service.ts     # AI integration
│   ├── email-service.ts  # Email functionality
│   └── ...
├── scripts/              # Database setup scripts
└── public/               # Static assets
```

## 🎯 Key Features Implementation

### Points System
- Free users: 10 lifetime + 2 daily refresh points
- 1 point per AI generation
- Paid packages: LKR 300→5pts, LKR 500→10pts, LKR 1000→25pts

### AI Integration
- Google Gemini 2.5 Flash for image generation
- Bilingual descriptions (English/Sinhala)
- Watermarking for free user generations
- Rate limiting: 20 generations per hour

### Community Features
- Public gallery with real-time data
- Like and share functionality
- SEO-friendly URLs for designs
- Watermark display for free generations

### Admin Panel
- User management
- Content moderation
- Analytics and reporting
- Architect management

## 🔐 Security Features

- Row Level Security (RLS) in Supabase
- JWT authentication
- Secure payment processing
- GDPR-compliant data handling

## 🌍 Localization

- English/Sinhala language support
- User preference storage
- Email templates in both languages
- UI components with i18n support

## 📊 Analytics

- User activity tracking
- Revenue analytics
- Design generation metrics
- Style usage statistics

## 🚀 Deployment

1. **Deploy to Vercel**
   ```bash
   npm run build
   vercel deploy
   ```

2. **Configure production environment variables**
   - Update all environment variables for production
   - Set up production Supabase project
   - Configure production email settings

3. **Set up PayHere webhook**
   - Configure webhook URL: `https://yourdomain.com/api/payment/webhook`
   - Test payment flow

## 📝 API Endpoints

- `POST /api/generate-design` - Generate AI design
- `POST /api/claim-daily-points` - Claim daily points
- `POST /api/payment/webhook` - PayHere webhook
- `GET /api/admin/*` - Admin endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software developed for BitLab (Pvt) Ltd.

## 📞 Support

For support and questions:
- Email: admin@architecture.lk
- Superadmin: chavindu@bitlab.lk

## 🔄 Recent Updates

- ✅ Fixed points system to match specification (1 point per generation)
- ✅ Implemented daily points refresh system
- ✅ Added Google Gemini AI integration
- ✅ Created email service with Microsoft O365 SMTP
- ✅ Updated database schema to match specification
- ✅ Implemented proper community gallery with real data
- ✅ Added watermarking for free user generations
- ✅ Fixed pricing to match specification (LKR 300/500/1000)
- ✅ Added rate limiting (20 generations per hour)

## 🎯 Next Steps

- [ ] Implement Vercel Blob storage for images
- [ ] Add Calendly integration for architect bookings
- [ ] Complete admin panel functionality
- [ ] Implement multi-currency support with geolocation
- [ ] Add comprehensive analytics dashboard
- [ ] Implement SEO-friendly URLs for designs
- [ ] Add real-time notifications
- [ ] Complete localization system