import { createClient } from '@supabase/supabase-js';

// Fallback para desenvolvimento sem .env configurado.
// Em produção, configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no servidor/host.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xoyhfkdvnibolhrturoc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhveWhma2R2bmlib2xocnR1cm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTExNzMsImV4cCI6MjA4NzY4NzE3M30.7-Xr6poap0jzNhO4STMQdnDoBR0-xmBaBKqg1b7Vx1s';

if (import.meta.env.DEV && (import.meta.env.VITE_SUPABASE_URL === undefined)) {
  console.warn('[3DK Print] VITE_SUPABASE_URL não definida — usando valor de fallback. Configure .env para produção.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
