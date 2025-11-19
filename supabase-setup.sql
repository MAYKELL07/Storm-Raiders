-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This creates the rooms table with real-time enabled

-- Create rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  host_id TEXT NOT NULL,
  max_players INTEGER NOT NULL DEFAULT 4,
  players JSONB NOT NULL DEFAULT '[]'::jsonb,
  game_state JSONB,
  status TEXT NOT NULL DEFAULT 'lobby',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_update TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read rooms (needed for joining)
CREATE POLICY "Anyone can read rooms"
  ON public.rooms
  FOR SELECT
  USING (true);

-- Allow anyone to insert rooms (needed for creating)
CREATE POLICY "Anyone can create rooms"
  ON public.rooms
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update rooms (needed for game state)
CREATE POLICY "Anyone can update rooms"
  ON public.rooms
  FOR UPDATE
  USING (true);

-- Allow anyone to delete rooms
CREATE POLICY "Anyone can delete rooms"
  ON public.rooms
  FOR DELETE
  USING (true);

-- Create index for faster lookups by room code
CREATE INDEX IF NOT EXISTS idx_rooms_code ON public.rooms(code);

-- Enable real-time for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;

-- Auto-delete rooms older than 24 hours (cleanup function)
CREATE OR REPLACE FUNCTION delete_old_rooms()
RETURNS void AS $$
BEGIN
  DELETE FROM public.rooms
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Optional: Schedule the cleanup (requires pg_cron extension)
-- SELECT cron.schedule('delete-old-rooms', '0 * * * *', 'SELECT delete_old_rooms();');
