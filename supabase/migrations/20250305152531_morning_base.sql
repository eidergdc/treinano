/*
  # Remove predefined exercises safely

  1. Changes
    - Remove exercises that are not custom and not referenced
    - Set default value for is_custom column
  
  2. Safety
    - Only delete exercises that are not referenced by user_exercises
    - Maintain referential integrity
*/

-- First, update any NULL is_custom values to false
UPDATE exercises 
SET is_custom = false 
WHERE is_custom IS NULL;

-- Delete only exercises that are not custom AND not referenced in user_exercises
DELETE FROM exercises 
WHERE is_custom = false 
AND id NOT IN (
  SELECT DISTINCT exercise_id 
  FROM user_exercises
);

-- Set default value for is_custom to true for future exercises
ALTER TABLE exercises 
ALTER COLUMN is_custom SET DEFAULT true;