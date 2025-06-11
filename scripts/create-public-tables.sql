-- Create the profiles table for public sharing
CREATE TABLE IF NOT EXISTS public_profiles (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create the topics table
CREATE TABLE IF NOT EXISTS topics (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  total_questions INTEGER NOT NULL
);

-- Create the public_entries table
CREATE TABLE IF NOT EXISTS public_entries (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER REFERENCES public_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, date)
);

-- Create the public_entry_details table
CREATE TABLE IF NOT EXISTS public_entry_details (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER REFERENCES public_entries(id) ON DELETE CASCADE,
  topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
  questions_solved INTEGER NOT NULL DEFAULT 0,
  UNIQUE(entry_id, topic_id)
);

-- Insert the DSA topics
INSERT INTO topics (name, total_questions)
VALUES 
  ('Sorting', 5),
  ('Arrays', 31),
  ('Linked Lists', 45),
  ('Binary Search', 28),
  ('Hashing', 4),
  ('Recursion', 17),
  ('Greedy Algorithms', 11),
  ('Sliding Window', 11),
  ('Stack/Queues', 23),
  ('Binary Trees', 30),
  ('Binary Search Trees', 14),
  ('Heaps', 10),
  ('Graphs', 36),
  ('Tries', 6),
  ('Dynamic Programming', 47),
  ('Strings (Advanced Algo)', 8),
  ('Maths', 3),
  ('Bit Manipulation', 8)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS but allow public access
ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_entry_details ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all tables
CREATE POLICY public_profiles_select_policy ON public_profiles
  FOR SELECT USING (is_active = true);

CREATE POLICY topics_select_policy ON topics
  FOR SELECT USING (true);

CREATE POLICY public_entries_select_policy ON public_entries
  FOR SELECT USING (true);

CREATE POLICY public_entry_details_select_policy ON public_entry_details
  FOR SELECT USING (true);

-- Allow public insert/update for profiles and entries (no auth required)
CREATE POLICY public_profiles_insert_policy ON public_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY public_profiles_update_policy ON public_profiles
  FOR UPDATE USING (true);

CREATE POLICY public_entries_insert_policy ON public_entries
  FOR INSERT WITH CHECK (true);

CREATE POLICY public_entries_update_policy ON public_entries
  FOR UPDATE USING (true);

CREATE POLICY public_entry_details_insert_policy ON public_entry_details
  FOR INSERT WITH CHECK (true);

CREATE POLICY public_entry_details_update_policy ON public_entry_details
  FOR UPDATE USING (true);

CREATE POLICY public_entry_details_delete_policy ON public_entry_details
  FOR DELETE USING (true);
