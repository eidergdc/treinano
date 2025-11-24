/*
  # Initial Schema Setup

  1. Tables:
    - exercise_categories: Categories for exercises
    - exercises: Base exercise definitions
    - user_exercises: User-specific exercise tracking
    - workout_history: Workout session records

  2. Security:
    - RLS enabled on all tables
    - Appropriate policies for data access
    
  3. Default Data:
    - Standard exercise categories
    - Common exercises
*/

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Exercise categories are publicly viewable" ON exercise_categories;
  DROP POLICY IF EXISTS "Exercises are publicly viewable" ON exercises;
  DROP POLICY IF EXISTS "Users can create custom exercises" ON exercises;
  DROP POLICY IF EXISTS "Users can view their own exercises" ON user_exercises;
  DROP POLICY IF EXISTS "Users can insert their own exercises" ON user_exercises;
  DROP POLICY IF EXISTS "Users can update their own exercises" ON user_exercises;
  DROP POLICY IF EXISTS "Users can view their own workout history" ON workout_history;
  DROP POLICY IF EXISTS "Users can insert their own workout history" ON workout_history;
EXCEPTION
  WHEN undefined_object THEN NULL;
  WHEN undefined_table THEN NULL;
END $$;

-- Create exercise categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS exercise_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon_name text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS and set policies for exercise_categories
DO $$ 
BEGIN
  ALTER TABLE exercise_categories ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Exercise categories are publicly viewable"
    ON exercise_categories
    FOR SELECT
    TO public
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

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

-- Enable RLS and set policies for exercises
DO $$ 
BEGIN
  ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
  
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
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create user exercises table
CREATE TABLE IF NOT EXISTS user_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  exercise_id uuid NOT NULL REFERENCES exercises(id),
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

-- Enable RLS and set policies for user_exercises
DO $$ 
BEGIN
  ALTER TABLE user_exercises ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Users can view their own exercises"
    ON user_exercises
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert their own exercises"
    ON user_exercises
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update their own exercises"
    ON user_exercises
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create workout history table
CREATE TABLE IF NOT EXISTS workout_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  duration integer,
  exercises jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS and set policies for workout_history
DO $$ 
BEGIN
  ALTER TABLE workout_history ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Users can view their own workout history"
    ON workout_history
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert their own workout history"
    ON workout_history
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

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