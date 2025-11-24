/*
  # Update workout_history category column

  1. Changes
    - Ensure category column exists with proper constraints
    - Add index for better query performance if not exists
    - Update any null values to 'Outro'

  2. Reason
    - Needed to track and filter workouts by muscle group
    - Helps with analytics and progress tracking
    - Ensures data consistency
*/

-- Update any null values to 'Outro'
UPDATE workout_history 
SET category = 'Outro' 
WHERE category IS NULL;

-- Create index if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'workout_history' 
    AND indexname = 'workout_history_category_idx'
  ) THEN
    CREATE INDEX workout_history_category_idx ON workout_history(category);
  END IF;
END $$;