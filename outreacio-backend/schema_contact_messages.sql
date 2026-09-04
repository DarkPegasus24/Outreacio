

-- ==============================================================================
-- Outreacio: Contact Messages Table
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optimized query indexes
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit a contact message
CREATE POLICY "Anyone can submit contact message" 
ON contact_messages FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Allow service role / admin to manage all contact messages
CREATE POLICY "Service role full access to contact messages" 
ON contact_messages FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);
