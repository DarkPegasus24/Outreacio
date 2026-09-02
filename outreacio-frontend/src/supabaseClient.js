import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://opdalaovthzlimipqokj.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wZGFsYW92dGh6bGltaXBxb2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNjAyMzQsImV4cCI6MjEwMzgzNjIzNH0.CWCIEjMguexZaa7vEnV4b3KRffd-iqZW_VfVgYlbcwg';

export const supabase = createClient(supabaseUrl, supabaseKey);
