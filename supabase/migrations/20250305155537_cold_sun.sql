/*
  # Create Storage Buckets

  1. New Buckets
    - `avatars` for user profile images
    - `exercises` for exercise images
    - `public` for general public files

  2. Security
    - Enable public access for exercise images
    - Restrict avatar uploads to authenticated users
    - Allow public read access to all buckets
*/

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Create exercises bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('exercises', 'exercises', true);

-- Create public bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true);

-- Set up security policies for avatars bucket
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Allow authenticated users to upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- Set up security policies for exercises bucket
CREATE POLICY "Allow public read access for exercises"
ON storage.objects FOR SELECT
USING (bucket_id = 'exercises');

CREATE POLICY "Allow authenticated users to upload exercise images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'exercises'
  AND auth.role() = 'authenticated'
);

-- Set up security policies for public bucket
CREATE POLICY "Allow public read access for public bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'public');

CREATE POLICY "Allow authenticated users to upload to public bucket"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'public'
  AND auth.role() = 'authenticated'
);