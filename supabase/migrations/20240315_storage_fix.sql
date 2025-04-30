-- Отключаем RLS для storage.buckets временно
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;

-- Удаляем существующие политики для storage.objects
DROP POLICY IF EXISTS "public_file_access" ON storage.objects;
DROP POLICY IF EXISTS "public_file_upload" ON storage.objects;
DROP POLICY IF EXISTS "public_file_update" ON storage.objects;
DROP POLICY IF EXISTS "public_file_delete" ON storage.objects;

-- Создаем новые политики для storage.objects
CREATE POLICY "public_file_access"
ON storage.objects FOR SELECT
TO PUBLIC
USING (bucket_id = 'complaint_files');

CREATE POLICY "public_file_upload"
ON storage.objects FOR INSERT
TO PUBLIC
WITH CHECK (bucket_id = 'complaint_files');

CREATE POLICY "public_file_update"
ON storage.objects FOR UPDATE
TO PUBLIC
USING (bucket_id = 'complaint_files');

CREATE POLICY "public_file_delete"
ON storage.objects FOR DELETE
TO PUBLIC
USING (bucket_id = 'complaint_files');

-- Создаем бакет если не существует
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint_files', 'complaint_files', true)
ON CONFLICT (id) DO UPDATE 
SET public = true;

-- Включаем RLS обратно
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY; 