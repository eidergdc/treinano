/*
  # Fix Profiles Table and User Profile Creation

  1. Changes
    - Drop existing profiles table if it exists
    - Create new profiles table with proper columns
    - Add RLS policies for profile access
    - Create trigger for automatic profile creation
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Drop existing policies to avoid conflicts
*/

-- Drop existing table and policies
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text,
  avatar_url text,
  level integer DEFAULT 1,
  experience integer DEFAULT 0,
  total_workouts integer DEFAULT 0,
  total_exercises integer DEFAULT 0,
  total_weight_lifted numeric DEFAULT 0,
  streak_days integer DEFAULT 0,
  last_workout_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
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

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    avatar_url,
    level,
    experience,
    total_workouts,
    total_exercises,
    total_weight_lifted,
    streak_days,
    created_at
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    1,
    0,
    0,
    0,
    0,
    0,
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user profile creation
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

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS trigger AS $$
BEGIN
  -- Update total workouts and last workout date
  UPDATE public.profiles
  SET 
    total_workouts = total_workouts + 1,
    last_workout_date = NEW.start_time,
    -- Update streak
    streak_days = CASE 
      WHEN last_workout_date IS NULL OR 
           last_workout_date::date = CURRENT_DATE - interval '1 day' THEN streak_days + 1
      WHEN last_workout_date::date = CURRENT_DATE THEN streak_days
      ELSE 1
    END,
    updated_at = now()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for workout history
DROP TRIGGER IF EXISTS on_workout_completed ON public.workout_history;
CREATE TRIGGER on_workout_completed
  AFTER INSERT ON public.workout_history
  FOR EACH ROW EXECUTE FUNCTION update_user_stats();