-- Remove entry_details where questions_solved is 0
DELETE FROM entry_details WHERE questions_solved = 0;

-- Remove entries that have no entry_details (orphaned entries)
DELETE FROM entries 
WHERE id NOT IN (
  SELECT DISTINCT entry_id 
  FROM entry_details
);

-- Verify cleanup
SELECT 
  e.date,
  COALESCE(SUM(ed.questions_solved), 0) as total_questions
FROM entries e
LEFT JOIN entry_details ed ON e.id = ed.entry_id
GROUP BY e.id, e.date
ORDER BY e.date;
