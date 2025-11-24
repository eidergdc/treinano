/*
  # Initial Schema Setup

  1. New Tables
    - profiles
      - id (uuid, primary key) - References auth.users
      - username (text)
      - level (integer)
      - experience (integer)
      - total_workouts (integer)
      - total_exercises (integer)
      - total_weight_lifted (numeric)
      - streak_days (integer)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - exercises
      - id (uuid, primary key)
      - name (text)
      - description (text)
      - category (text)
      - image_url (text)
      - video_url (text)
      - is_custom (boolean)
      - created_by (uuid) - References auth.users
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - user_exercises
      - id (uuid, primary key)
      - user_id (uuid) - References auth.users
      - exercise_id (uuid) - References exercises
      - current_weight (numeric)
      - starting_weight (numeric)
      - current_reps (integer)
      - current_sets (integer)
      - progress_level (integer)
      - completed_workouts (integer)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - workout_history
      - id (uuid, primary key)
      - user_id (uuid) - References auth.users
      - start_time (timestamptz)
      - end_time (timestamptz)
      - duration (integer)
      - exercises (jsonb)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text,
  level integer DEFAULT 1,
  experience integer DEFAULT 0,
  total_workouts integer DEFAULT 0,
  total_exercises integer DEFAULT 0,
  total_weight_lifted numeric DEFAULT 0,
  streak_days integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  image_url text,
  video_url text,
  is_custom boolean DEFAULT false,
  created_by uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_exercises table
CREATE TABLE IF NOT EXISTS public.user_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  exercise_id uuid REFERENCES exercises ON DELETE CASCADE NOT NULL,
  current_weight numeric DEFAULT 0,
  starting_weight numeric DEFAULT 0,
  current_reps integer DEFAULT 8,
  current_sets integer DEFAULT 3,
  progress_level integer DEFAULT 0,
  completed_workouts integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workout_history table
CREATE TABLE IF NOT EXISTS public.workout_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  duration integer,
  exercises jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Profiles policies
  DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  
  -- Exercises policies
  DROP POLICY IF EXISTS "Exercises are viewable by all authenticated users" ON public.exercises;
  DROP POLICY IF EXISTS "Users can create custom exercises" ON public.exercises;
  DROP POLICY IF EXISTS "Users can update own custom exercises" ON public.exercises;
  
  -- User Exercises policies
  DROP POLICY IF EXISTS "Users can view own exercises" ON public.user_exercises;
  DROP POLICY IF EXISTS "Users can create own exercises" ON public.user_exercises;
  DROP POLICY IF EXISTS "Users can update own exercises" ON public.user_exercises;
  DROP POLICY IF EXISTS "Users can delete own exercises" ON public.user_exercises;
  
  -- Workout History policies
  DROP POLICY IF EXISTS "Users can view own workout history" ON public.workout_history;
  DROP POLICY IF EXISTS "Users can create own workout history" ON public.workout_history;
  DROP POLICY IF EXISTS "Users can update own workout history" ON public.workout_history;
END $$;

-- Create policies
-- Profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Exercises
CREATE POLICY "Exercises are viewable by all authenticated users"
  ON public.exercises
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create custom exercises"
  ON public.exercises
  FOR INSERT
  TO authenticated
  WITH CHECK (is_custom = true AND created_by = auth.uid());

CREATE POLICY "Users can update own custom exercises"
  ON public.exercises
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() AND is_custom = true);

-- User Exercises
CREATE POLICY "Users can view own exercises"
  ON public.user_exercises
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own exercises"
  ON public.user_exercises
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercises"
  ON public.user_exercises
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercises"
  ON public.user_exercises
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Workout History
CREATE POLICY "Users can view own workout history"
  ON public.workout_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workout history"
  ON public.workout_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout history"
  ON public.workout_history
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, created_at)
  VALUES (new.id, new.raw_user_meta_data->>'name', now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_exercises_updated_at ON public.exercises;
CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_exercises_updated_at ON public.user_exercises;
CREATE TRIGGER update_user_exercises_updated_at
  BEFORE UPDATE ON public.user_exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();