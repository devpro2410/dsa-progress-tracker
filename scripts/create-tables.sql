-- Disable email confirmation (add this before creating tables)
-- Note: This should be configured in Supabase Dashboard under Authentication > Settings
-- Set "Enable email confirmations" to OFF

-- Create the topics table
CREATE TABLE IF NOT EXISTS topics (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  total_questions INTEGER NOT NULL
);

-- Create the entries table
CREATE TABLE IF NOT EXISTS entries (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the entry_details table for storing questions solved per topic
CREATE TABLE IF NOT EXISTS entry_details (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER REFERENCES entries(id) ON DELETE CASCADE,
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

-- Create RLS policies
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_details ENABLE ROW LEVEL SECURITY;

-- Topics are readable by everyone
CREATE POLICY topics_select_policy ON topics
  FOR SELECT USING (true);

-- Entries are only accessible by their owner
CREATE POLICY entries_select_policy ON entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY entries_insert_policy ON entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY entries_update_policy ON entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY entries_delete_policy ON entries
  FOR DELETE USING (auth.uid() = user_id);

-- Entry details are accessible through their parent entry
CREATE POLICY entry_details_select_policy ON entry_details
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM entries 
      WHERE entries.id = entry_details.entry_id 
      AND entries.user_id = auth.uid()
    )
  );

CREATE POLICY entry_details_insert_policy ON entry_details
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM entries 
      WHERE entries.id = entry_details.entry_id 
      AND entries.user_id = auth.uid()
    )
  );

CREATE POLICY entry_details_update_policy ON entry_details
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM entries 
      WHERE entries.id = entry_details.entry_id 
      AND entries.user_id = auth.uid()
    )
  );

CREATE POLICY entry_details_delete_policy ON entry_details
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM entries 
      WHERE entries.id = entry_details.entry_id 
      AND entries.user_id = auth.uid()
    )
  );
