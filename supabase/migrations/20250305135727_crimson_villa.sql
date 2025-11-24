/*
  # Create Exercise System Tables

  1. New Tables
    - exercise_categories: Stores exercise categories
    - exercises: Stores exercise definitions
  
  2. Security
    - Enable RLS on both tables
    - Public read access for categories and exercises
    - Authenticated users can create custom exercises
  
  3. Default Data
    - Insert default categories
    - Insert default exercises
*/

-- Create exercise categories table
CREATE TABLE IF NOT EXISTS exercise_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon_name text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE exercise_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Exercise categories are publicly viewable" ON exercise_categories;

-- Create new policy for categories
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

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  image_url text,
  video_url text,
  is_custom boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on exercises
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if exist
DROP POLICY IF EXISTS "Exercises are publicly viewable" ON exercises;
DROP POLICY IF EXISTS "Users can create custom exercises" ON exercises;

-- Create exercise policies
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

-- Insert default exercises
INSERT INTO exercises (name, description, category, is_custom) VALUES
  ('Supino Reto', 'Exercício clássico para desenvolvimento do peitoral', 'Peito', false),
  ('Agachamento', 'Exercício fundamental para desenvolvimento das pernas', 'Pernas', false),
  ('Barra Fixa', 'Exercício completo para desenvolvimento das costas', 'Costas', false),
  ('Desenvolvimento', 'Exercício básico para ombros', 'Ombros', false),
  ('Rosca Direta', 'Exercício isolado para bíceps', 'Bíceps', false),
  ('Extensão Testa', 'Exercício isolado para tríceps', 'Tríceps', false),
  ('Prancha', 'Exercício isométrico para abdômen', 'Abdômen', false),
  ('Esteira', 'Exercício aeróbico', 'Cardio', false)
ON CONFLICT DO NOTHING;