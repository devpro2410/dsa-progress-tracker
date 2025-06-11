-- Create the topics table
CREATE TABLE IF NOT EXISTS topics (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  total_questions INTEGER NOT NULL
);

-- Create the entries table (no user_id needed - just one public tracker)
CREATE TABLE IF NOT EXISTS entries (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the entry_details table
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

-- Enable RLS but allow public access
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_details ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all tables
CREATE POLICY topics_public_policy ON topics FOR ALL USING (true);
CREATE POLICY entries_public_policy ON entries FOR ALL USING (true);
CREATE POLICY entry_details_public_policy ON entry_details FOR ALL USING (true);
