-- ==============================================================================
-- Outreacio: Manual UPI Payment Submissions Table (Bridge System)
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

CREATE TABLE IF NOT EXISTS payment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT NOT NULL,
    payer_name TEXT,
    plan_id TEXT NOT NULL,
    amount_inr NUMERIC,
    amount_usd NUMERIC,
    utr_reference TEXT NOT NULL,
    screenshot_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optimized query indexes
CREATE INDEX IF NOT EXISTS idx_payment_submissions_status ON payment_submissions(status);
CREATE INDEX IF NOT EXISTS idx_payment_submissions_email ON payment_submissions(user_email);
CREATE INDEX IF NOT EXISTS idx_payment_submissions_created_at ON payment_submissions(created_at DESC);

-- Enable RLS
ALTER TABLE payment_submissions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own submissions
CREATE POLICY "Users can view own payment submissions" 
ON payment_submissions FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id OR auth.email() = user_email);

-- Allow inserting payment submissions (both authenticated and anon with valid email)
CREATE POLICY "Anyone can submit payment proof" 
ON payment_submissions FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Allow service role / admin to manage all payment submissions
CREATE POLICY "Service role full access to payment submissions" 
ON payment_submissions FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);
