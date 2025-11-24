/*
  # Create Storage Buckets and Policies

  1. New Buckets
    - `avatars` for user profile images
    - `exercises` for exercise images
    - `public` for general public files

  2. Security
    - Enable public read access for all buckets
    - Restrict uploads to authenticated users
    - Set appropriate file size limits and allowed MIME types
*/

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
);

-- Create exercises bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exercises',
  'exercises',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
);

-- Create public bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public',
  'public',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
);

-- Set up security policies for avatars bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Set up security policies for exercises bucket
CREATE POLICY "Public Access for exercises"
ON storage.objects FOR SELECT
USING (bucket_id = 'exercises');

CREATE POLICY "Authenticated users can upload exercise images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'exercises'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own exercise images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'exercises'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own exercise images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'exercises'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Set up security policies for public bucket
CREATE POLICY "Public Access for public bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'public');

CREATE POLICY "Authenticated users can upload to public bucket"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'public'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own public files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'public'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own public files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'public'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);