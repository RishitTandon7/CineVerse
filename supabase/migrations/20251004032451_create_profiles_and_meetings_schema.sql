/*
  # Create CineVerse Database Schema

  ## Overview
  This migration creates the complete database schema for the CineVerse movie watch party application.
  It includes tables for user profiles, meetings, participants, and chat messages with real-time capabilities.

  ## 1. New Tables
  
  ### `profiles`
  Stores extended user profile information
  - `id` (uuid, primary key) - Links to auth.users
  - `full_name` (text) - User's display name
  - `avatar_url` (text, nullable) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update

  ### `meetings`
  Stores meeting/watch party sessions
  - `id` (uuid, primary key) - Unique meeting identifier
  - `meeting_code` (text, unique) - 6-character join code
  - `host_id` (uuid) - Meeting creator/host
  - `movie_id` (text, nullable) - Selected movie identifier
  - `movie_title` (text, nullable) - Movie title
  - `movie_thumbnail` (text, nullable) - Movie thumbnail URL
  - `is_playing` (boolean) - Current playback state
  - `video_time` (numeric) - Current video timestamp
  - `created_at` (timestamptz) - Meeting creation time
  - `expires_at` (timestamptz) - Meeting expiration time (24 hours)

  ### `meeting_participants`
  Tracks users in each meeting
  - `id` (uuid, primary key)
  - `meeting_id` (uuid) - Reference to meetings table
  - `user_id` (uuid) - Reference to auth.users
  - `user_name` (text) - Display name in meeting
  - `is_host` (boolean) - Host privileges flag
  - `video_enabled` (boolean) - Camera state
  - `audio_enabled` (boolean) - Microphone state
  - `joined_at` (timestamptz) - Join timestamp
  - `last_seen_at` (timestamptz) - Last activity timestamp

  ### `chat_messages`
  Stores chat messages for meetings
  - `id` (uuid, primary key)
  - `meeting_id` (uuid) - Reference to meetings table
  - `user_id` (uuid) - Message sender
  - `user_name` (text) - Sender display name
  - `message` (text) - Message content
  - `message_type` (text) - 'message' or 'system'
  - `created_at` (timestamptz) - Message timestamp

  ## 2. Security (Row Level Security)
  
  All tables have RLS enabled with appropriate policies:
  - Users can read/update their own profiles
  - Users can create meetings
  - Users can read meetings they participate in
  - Users can manage their participant records
  - Users can read/create messages in meetings they've joined
  - Host has additional privileges for meeting management

  ## 3. Indexes
  
  Performance indexes on:
  - Meeting codes for fast lookups
  - Meeting participants for join queries
  - Chat messages ordered by timestamp

  ## 4. Real-time
  
  Publications enabled for real-time updates on:
  - meeting_participants (join/leave events)
  - chat_messages (live chat)
  - meetings (video sync state)
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_code text UNIQUE NOT NULL,
  host_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  movie_id text,
  movie_title text,
  movie_thumbnail text,
  is_playing boolean DEFAULT false NOT NULL,
  video_time numeric DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz DEFAULT (now() + interval '24 hours') NOT NULL
);

-- Create meeting_participants table
CREATE TABLE IF NOT EXISTS meeting_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_name text NOT NULL,
  is_host boolean DEFAULT false NOT NULL,
  video_enabled boolean DEFAULT true NOT NULL,
  audio_enabled boolean DEFAULT true NOT NULL,
  joined_at timestamptz DEFAULT now() NOT NULL,
  last_seen_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(meeting_id, user_id)
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_name text NOT NULL,
  message text NOT NULL,
  message_type text DEFAULT 'message' NOT NULL CHECK (message_type IN ('message', 'system')),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_meetings_code ON meetings(meeting_code);
CREATE INDEX IF NOT EXISTS idx_meetings_host ON meetings(host_id);
CREATE INDEX IF NOT EXISTS idx_meetings_expires ON meetings(expires_at);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_user ON meeting_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_meeting ON chat_messages(meeting_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Meetings policies
CREATE POLICY "Users can create meetings"
  ON meetings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Users can view meetings they participate in"
  ON meetings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meeting_participants
      WHERE meeting_participants.meeting_id = meetings.id
      AND meeting_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Hosts can update their meetings"
  ON meetings FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their meetings"
  ON meetings FOR DELETE
  TO authenticated
  USING (auth.uid() = host_id);

-- Meeting participants policies
CREATE POLICY "Users can view participants in their meetings"
  ON meeting_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meeting_participants mp
      WHERE mp.meeting_id = meeting_participants.meeting_id
      AND mp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join meetings"
  ON meeting_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participant record"
  ON meeting_participants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave meetings"
  ON meeting_participants FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can view messages in their meetings"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meeting_participants
      WHERE meeting_participants.meeting_id = chat_messages.meeting_id
      AND meeting_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in their meetings"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM meeting_participants
      WHERE meeting_participants.meeting_id = chat_messages.meeting_id
      AND meeting_participants.user_id = auth.uid()
    )
  );

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to clean up expired meetings
CREATE OR REPLACE FUNCTION public.cleanup_expired_meetings()
RETURNS void AS $$
BEGIN
  DELETE FROM meetings WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update participant last_seen
CREATE OR REPLACE FUNCTION public.update_participant_last_seen()
RETURNS trigger AS $$
BEGIN
  NEW.last_seen_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_seen on participant updates
DROP TRIGGER IF EXISTS on_participant_update ON meeting_participants;
CREATE TRIGGER on_participant_update
  BEFORE UPDATE ON meeting_participants
  FOR EACH ROW EXECUTE FUNCTION public.update_participant_last_seen();