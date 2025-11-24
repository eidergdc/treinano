/*
  # Update exercise tables and categories

  1. Changes
    - Create exercise_categories table if not exists
    - Add default categories
    - Update exercises table structure
    - Add default exercises
    - Update RLS policies

  2. Security
    - Ensure RLS is enabled
    - Update policies for public and authenticated access
*/

-- Create exercise categories table if not exists
CREATE TABLE IF NOT EXISTS exercise_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon_name text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE exercise_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Exercise categories are publicly viewable" ON exercise_categories;

-- Create new policy
CREATE POLICY "Exercise categories are publicly viewable"
  ON exercise_categories
  FOR SELECT
  TO public
  USING (true);

-- Insert default categories
INSERT INTO exercise_categories (name, description, icon_name) VALUES
  ('Peito', 'Exercícios para desenvolvimento do peitoral', 'chest'),
  ('Costas', 'Exercícios para desenvolvimento das costas', 'back'),
  ('Pernas', 'Exercícios para desenvolvimento das pernas', 'legs'),
  ('Ombros', 'Exercícios para desenvolvimento dos ombros', 'shoulders'),
  ('Bíceps', 'Exercícios para desenvolvimento dos bíceps', 'biceps'),
  ('Tríceps', 'Exercícios para desenvolvimento dos tríceps', 'triceps'),
  ('Abdômen', 'Exercícios para desenvolvimento do abdômen', 'abs'),
  ('Cardio', 'Exercícios cardiovasculares', 'cardio')
ON CONFLICT (name) DO NOTHING;

-- Modify exercises table
DO $$ BEGIN
  -- Add category column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'exercises' AND column_name = 'category'
  ) THEN
    ALTER TABLE exercises ADD COLUMN category text;
  END IF;
END $$;

-- Update exercises table with proper category references
UPDATE exercises SET category = 'Peito' WHERE category IS NULL AND name ILIKE '%supino%';
UPDATE exercises SET category = 'Pernas' WHERE category IS NULL AND name ILIKE '%agachamento%';
UPDATE exercises SET category = 'Costas' WHERE category IS NULL AND name ILIKE '%barra%';

-- Insert default exercises
INSERT INTO exercises (name, description, category, is_custom)
VALUES 
  ('Supino Reto', 'Exercício clássico para desenvolvimento do peitoral', 'Peito', false),
  ('Agachamento', 'Exercício fundamental para desenvolvimento das pernas', 'Pernas', false),
  ('Barra Fixa', 'Exercício completo para desenvolvimento das costas', 'Costas', false)
ON CONFLICT DO NOTHING;

-- Enable RLS on exercises if not already enabled
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Exercises are publicly viewable" ON exercises;
DROP POLICY IF EXISTS "Users can create custom exercises" ON exercises;

-- Create new policies
CREATE POLICY "Exercises are publicly viewable"
  ON exercises
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create custom exercises"
  ON exercises
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_custom = true AND
    created_by = auth.uid()
  );