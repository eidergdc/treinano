/*
  # Remove default exercises and update schema

  1. Changes
    - Remove all non-custom exercises
    - Set default value for is_custom to true
    - Add cascade delete for user_exercises

  2. Security
    - No changes to RLS policies
*/

-- First remove foreign key constraint to allow deletion
ALTER TABLE user_exercises 
DROP CONSTRAINT user_exercises_exercise_id_fkey;

-- Add back the constraint with CASCADE DELETE
ALTER TABLE user_exercises
ADD CONSTRAINT user_exercises_exercise_id_fkey 
FOREIGN KEY (exercise_id) 
REFERENCES exercises(id)
ON DELETE CASCADE;

-- Remove non-custom exercises
DELETE FROM exercises 
WHERE is_custom = false OR is_custom IS NULL;

-- Set default value for is_custom
ALTER TABLE exercises 
ALTER COLUMN is_custom SET DEFAULT true;