/*
  # Create exercises and user_exercises tables

  1. New Tables
    - exercises
      - id (uuid, primary key)
      - name (text)
      - description (text)
      - category (text)
      - image_url (text)
      - video_url (text)
      - is_custom (boolean)
      - created_by (uuid)
      - created_at (timestamp)
    
    - user_exercises
      - id (uuid, primary key)
      - user_id (uuid)
      - exercise_id (uuid)
      - current_weight (numeric)
      - starting_weight (numeric)
      - current_sets (integer)
      - current_reps (integer)
      - progress_level (integer)
      - completed_workouts (integer)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access to exercises
    - Add policies for authenticated users to create/update their own exercises
*/

-- Create exercises table if it doesn't exist
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

-- Create user_exercises table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  exercise_id uuid REFERENCES exercises(id) NOT NULL,
  current_weight numeric DEFAULT 0,
  starting_weight numeric DEFAULT 0,
  current_sets integer DEFAULT 3,
  current_reps integer DEFAULT 8,
  progress_level integer DEFAULT 0,
  completed_workouts integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

-- Enable RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercises ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Exercises are publicly viewable" ON exercises;
  DROP POLICY IF EXISTS "Users can create custom exercises" ON exercises;
  DROP POLICY IF EXISTS "Users can view their own exercises" ON user_exercises;
  DROP POLICY IF EXISTS "Users can create their own exercises" ON user_exercises;
  DROP POLICY IF EXISTS "Users can update their own exercises" ON user_exercises;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create policies for exercises
CREATE POLICY "Exercises are publicly viewable"
  ON exercises
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create custom exercises"
  ON exercises
  FOR INSERT
  TO authenticated
  WITH CHECK (is_custom = true AND created_by = auth.uid());

-- Create policies for user_exercises
CREATE POLICY "Users can view their own exercises"
  ON user_exercises
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own exercises"
  ON user_exercises
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own exercises"
  ON user_exercises
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS exercises_category_idx ON exercises(category);
CREATE INDEX IF NOT EXISTS user_exercises_user_id_idx ON user_exercises(user_id);
CREATE INDEX IF NOT EXISTS user_exercises_exercise_id_idx ON user_exercises(exercise_id);

-- Insert default exercises if they don't exist
INSERT INTO exercises (name, description, category) VALUES
('Agachamento', 'Exercício fundamental para desenvolvimento das pernas', 'Pernas'),
('Supino Reto', 'Exercício clássico para desenvolvimento do peitoral', 'Peito'),
('Barra Fixa', 'Exercício para desenvolvimento das costas', 'Costas'),
('Rosca Direta', 'Exercício básico para bíceps', 'Bíceps'),
('Extensão Triceps', 'Exercício para desenvolvimento do tríceps', 'Tríceps'),
('Desenvolvimento', 'Exercício para ombros', 'Ombros'),
('Prancha', 'Exercício para fortalecimento do core', 'Abdômen'),
('Elevação Lateral', 'Exercício para desenvolvimento lateral dos ombros', 'Ombros'),
('Leg Press', 'Exercício para desenvolvimento das pernas', 'Pernas'),
('Remada Baixa', 'Exercício para desenvolvimento das costas', 'Costas')
ON CONFLICT (id) DO NOTHING;