import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xoyhfkdvnibolhrturoc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhveWhma2R2bmlib2xocnR1cm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTExNzMsImV4cCI6MjA4NzY4NzE3M30.7-Xr6poap0jzNhO4STMQdnDoBR0-xmBaBKqg1b7Vx1s';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Using fallback values.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
