/*
  # Update exercises table defaults

  1. Changes
    - Add cascade delete to user_exercises foreign key
    - Set default value for is_custom column
    - Remove non-custom exercises safely

  2. Security
    - No changes to RLS policies
*/

-- First drop the existing foreign key constraint
ALTER TABLE user_exercises 
DROP CONSTRAINT user_exercises_exercise_id_fkey;

-- Add back the constraint with CASCADE DELETE
ALTER TABLE user_exercises
ADD CONSTRAINT user_exercises_exercise_id_fkey 
FOREIGN KEY (exercise_id) 
REFERENCES exercises(id)
ON DELETE CASCADE;

-- Set default value for is_custom
ALTER TABLE exercises 
ALTER COLUMN is_custom SET DEFAULT true;

-- Now we can safely delete non-custom exercises
DELETE FROM exercises 
WHERE is_custom = false OR is_custom IS NULL;