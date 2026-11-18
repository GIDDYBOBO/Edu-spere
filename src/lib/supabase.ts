import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key'
);

let supabaseInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.warn('Failed to initialize live Supabase client, falling back to local simulation mode.', err);
    supabaseInstance = null;
  }
}

export const supabase = supabaseInstance;

export interface SupabaseConfigInfo {
  isConfigured: boolean;
  url: string | null;
  statusMessage: string;
}

export function getSupabaseStatus(): SupabaseConfigInfo {
  if (isSupabaseConfigured) {
    return {
      isConfigured: true,
      url: supabaseUrl,
      statusMessage: 'Connected to Live Supabase Backend (PostgreSQL + RLS)',
    };
  }

  return {
    isConfigured: false,
    url: null,
    statusMessage: 'EduSphere Demonstration Mode (Local Storage Engine Active)',
  };
}
