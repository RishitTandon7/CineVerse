import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          full_name: string;
          avatar_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string;
          avatar_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      materials: {
        Row: {
          id: string;
          title: string;
          description: string;
          subject: string;
          file_type: string;
          file_url: string;
          file_size: number | null;
          uploader_id: string;
          upload_date: string | null;
          downloads: number | null;
        };
      };
    };
  };
};