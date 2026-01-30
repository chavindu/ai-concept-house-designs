-- ============================================================================
-- STANDALONE POSTGRESQL SCHEMA (No Supabase Dependencies)
-- Perfect for Dokploy PostgreSQL deployment
-- ============================================================================

-- ============================================================================
-- 1. USERS TABLE (Replaces Supabase auth.users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
  language_preference VARCHAR(10) DEFAULT 'en' CHECK (language_preference IN ('en', 'si')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================================
-- 2. PROFILES TABLE (Extended user information)
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 10 NOT NULL, -- Free users get 10 lifetime points
  daily_points_claimed DATE, -- Track when user last claimed daily points
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for points lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(id);

-- ============================================================================
-- 3. SESSIONS TABLE (JWT-based authentication)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for session lookups
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- ============================================================================
-- 4. VERIFICATION TOKENS (Email verification)
-- ============================================================================

CREATE TABLE IF NOT EXISTS verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for token lookups
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON verification_tokens(user_id);

-- ============================================================================
-- 5. PASSWORD RESET TOKENS
-- ============================================================================

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for token lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

-- ============================================================================
-- 6. DESIGNS TABLE (AI-generated house designs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  prompt TEXT NOT NULL,
  style TEXT,
  building_type TEXT,
  specifications JSONB, -- Store all form parameters
  image_url TEXT,
  thumbnail_url TEXT,
  description_en TEXT,
  description_si TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  is_watermarked BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
  points_cost INTEGER DEFAULT 1,
  perspective VARCHAR(50) DEFAULT 'front',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_designs_user_id ON designs(user_id);
CREATE INDEX IF NOT EXISTS idx_designs_is_public ON designs(is_public);
CREATE INDEX IF NOT EXISTS idx_designs_status ON designs(status);
CREATE INDEX IF NOT EXISTS idx_designs_created_at ON designs(created_at DESC);

-- ============================================================================
-- 7. POINTS TRANSACTIONS (Track point usage)
-- ============================================================================

CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('earned', 'deduction', 'purchased')),
  description TEXT,
  reference_id UUID, -- Can reference designs, payments, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for transaction history
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON points_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_transactions_type ON points_transactions(type);

-- ============================================================================
-- 8. DESIGN LIKES (Social feature)
-- ============================================================================

CREATE TABLE IF NOT EXISTS design_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, design_id)
);

-- Indexes for likes
CREATE INDEX IF NOT EXISTS idx_design_likes_design_id ON design_likes(design_id);
CREATE INDEX IF NOT EXISTS idx_design_likes_user_id ON design_likes(user_id);

-- ============================================================================
-- 9. ARCHITECTS TABLE (Architect profiles)
-- ============================================================================

CREATE TABLE IF NOT EXISTS architects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  specializations TEXT[] DEFAULT '{}',
  location TEXT,
  experience_years INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0.0,
  hourly_rate INTEGER DEFAULT 0,
  calendly_url TEXT,
  portfolio_images TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for architect search
CREATE INDEX IF NOT EXISTS idx_architects_user_id ON architects(user_id);
CREATE INDEX IF NOT EXISTS idx_architects_is_active ON architects(is_active);
CREATE INDEX IF NOT EXISTS idx_architects_rating ON architects(rating DESC);

-- ============================================================================
-- 10. CONSULTATIONS TABLE (Architect bookings)
-- ============================================================================

CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  architect_id UUID NOT NULL REFERENCES architects(id) ON DELETE CASCADE,
  consultation_date TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 60,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  notes TEXT,
  meeting_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for consultations
CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_architect_id ON consultations(architect_id);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(consultation_date);

-- ============================================================================
-- 11. ARCHITECT REVIEWS TABLE (Ratings & reviews)
-- ============================================================================

CREATE TABLE IF NOT EXISTS architect_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  architect_id UUID NOT NULL REFERENCES architects(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, architect_id, consultation_id)
);

-- Indexes for reviews
CREATE INDEX IF NOT EXISTS idx_architect_reviews_architect_id ON architect_reviews(architect_id);
CREATE INDEX IF NOT EXISTS idx_architect_reviews_rating ON architect_reviews(rating);

-- ============================================================================
-- 12. PAYMENTS TABLE (Point purchases)
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  amount INTEGER NOT NULL, -- Amount in cents/paisa
  points INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_method TEXT DEFAULT 'payhere',
  payhere_payment_id TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- ============================================================================
-- 13. NEXTAUTH TABLES (For NextAuth.js OAuth)
-- ============================================================================

CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type VARCHAR(255),
  scope VARCHAR(255),
  id_token TEXT,
  session_state VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, provider_account_id)
);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get design likes count
CREATE OR REPLACE FUNCTION get_design_likes_count(p_design_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM design_likes
  WHERE design_id = p_design_id;
$$ LANGUAGE SQL STABLE;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_designs_updated_at ON designs;
CREATE TRIGGER update_designs_updated_at
    BEFORE UPDATE ON designs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_architects_updated_at ON architects;
CREATE TRIGGER update_architects_updated_at
    BEFORE UPDATE ON architects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_consultations_updated_at ON consultations;
CREATE TRIGGER update_consultations_updated_at
    BEFORE UPDATE ON consultations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

-- Payment analytics view
CREATE OR REPLACE VIEW payment_analytics AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_payments,
  COUNT(*) FILTER (WHERE status = 'completed') as successful_payments,
  SUM(amount) FILTER (WHERE status = 'completed') as total_revenue,
  SUM(points) FILTER (WHERE status = 'completed') as total_points_sold
FROM payments
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE users IS 'Core user accounts (replaces Supabase auth.users)';
COMMENT ON TABLE profiles IS 'Extended user profiles with points balance';
COMMENT ON TABLE sessions IS 'JWT session management';
COMMENT ON TABLE designs IS 'AI-generated house designs';
COMMENT ON TABLE points_transactions IS 'Complete audit trail of point usage';
COMMENT ON TABLE design_likes IS 'User likes on designs (social feature)';
COMMENT ON TABLE architects IS 'Professional architect profiles';
COMMENT ON TABLE consultations IS 'Architect booking records';
COMMENT ON TABLE architect_reviews IS 'User reviews for architects';
COMMENT ON TABLE payments IS 'Payment transaction records';
COMMENT ON TABLE accounts IS 'NextAuth OAuth provider accounts';

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to designs table
CREATE TRIGGER update_designs_updated_at
  BEFORE UPDATE ON designs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Helper function: Get design likes count
CREATE OR REPLACE FUNCTION get_design_likes_count(design_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*)::INTEGER FROM design_likes WHERE design_id = design_uuid);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA (Optional test data)
-- ============================================================================

-- You can add initial admin user here if needed
-- Example (commented out):
-- INSERT INTO users (email, password_hash, full_name, role, email_verified)
-- VALUES ('admin@archalley.com', '$2a$...', 'Admin User', 'admin', TRUE);

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================
