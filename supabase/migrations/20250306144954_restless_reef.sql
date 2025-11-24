/*
  # Add category column to workout_history table

  1. Changes
    - Add category column to workout_history table to track which muscle group was trained
    - Set default value for existing rows
    - Make it required for future rows
    - Add index for better query performance

  2. Reason
    - Needed to track and filter workouts by muscle group
    - Helps with analytics and progress tracking
    - Default value ensures data consistency for existing records
*/

-- First add the column as nullable
ALTER TABLE workout_history 
ADD COLUMN category text;

-- Update existing rows with a default category
UPDATE workout_history 
SET category = 'Outro'
WHERE category IS NULL;

-- Now make the column required
ALTER TABLE workout_history 
ALTER COLUMN category SET NOT NULL;

-- Add index for better performance when querying by category
CREATE INDEX workout_history_category_idx ON workout_history(category);