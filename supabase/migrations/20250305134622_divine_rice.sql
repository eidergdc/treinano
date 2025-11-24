/*
  # Create exercise categories table

  1. New Tables
    - `exercise_categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `icon_name` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `exercise_categories` table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS exercise_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon_name text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE exercise_categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
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
  ('Antebraço', 'Exercícios para desenvolvimento do antebraço', 'forearms'),
  ('Abdômen', 'Exercícios para desenvolvimento do abdômen', 'abs'),
  ('Glúteos', 'Exercícios para desenvolvimento dos glúteos', 'glutes'),
  ('Panturrilha', 'Exercícios para desenvolvimento das panturrilhas', 'calves'),
  ('Cardio', 'Exercícios cardiovasculares', 'cardio'),
  ('Outro', 'Outros tipos de exercícios', 'other');