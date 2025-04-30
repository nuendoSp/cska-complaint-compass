-- Включаем RLS (Row Level Security)
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Включаем RLS для таблиц
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы complaints
CREATE POLICY "Публичный доступ на чтение жалоб"
ON complaints FOR SELECT
USING (true);

CREATE POLICY "Болельщики могут создавать жалобы"
ON complaints FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Админы могут обновлять все жалобы"
ON complaints FOR UPDATE
TO authenticated
USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Исполнители могут обновлять назначенные им жалобы"
ON complaints FOR UPDATE
TO authenticated
USING (
    auth.role() = 'authenticated' 
    AND auth.jwt() ->> 'role' = 'assignee'
    AND assignee_id::text = auth.uid()::text
);

-- Политики для таблицы priorities
CREATE POLICY "Публичный доступ на чтение приоритетов"
ON priorities FOR SELECT
USING (true);

CREATE POLICY "Только админы могут управлять приоритетами"
ON priorities FOR ALL
TO authenticated
USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- Политики для таблицы assignees
CREATE POLICY "Публичный доступ на чтение исполнителей"
ON assignees FOR SELECT
USING (true);

CREATE POLICY "Только админы могут управлять исполнителями"
ON assignees FOR ALL
TO authenticated
USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- Политики для таблицы locations
CREATE POLICY "Публичный доступ на чтение локаций"
ON locations FOR SELECT
USING (true);

CREATE POLICY "Только админы могут управлять локациями"
ON locations FOR ALL
TO authenticated
USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- Настройка CORS
ALTER DATABASE postgres SET "app.settings.cors_origins" TO '["https://nuendoSp.github.io", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175"]';

-- Создание бакета для файлов
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint_files', 'complaint_files', true)
ON CONFLICT (id) DO NOTHING;

-- Политики для бакетов
CREATE POLICY "Публичный доступ к бакетам"
ON storage.buckets FOR SELECT
TO PUBLIC
USING (true);

CREATE POLICY "Разрешить создание бакетов"
ON storage.buckets FOR INSERT
TO PUBLIC
WITH CHECK (true);

-- Политики для объектов хранилища
CREATE POLICY "Публичный доступ к файлам"
ON storage.objects FOR SELECT
TO PUBLIC
USING (true);

CREATE POLICY "Разрешить загрузку файлов"
ON storage.objects FOR INSERT
TO PUBLIC
WITH CHECK (true);

CREATE POLICY "Разрешить обновление файлов"
ON storage.objects FOR UPDATE
TO PUBLIC
USING (true);

CREATE POLICY "Разрешить удаление файлов"
ON storage.objects FOR DELETE
TO PUBLIC
USING (true);

-- Создание таблицы assignees если не существует
CREATE TABLE IF NOT EXISTS assignees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'assignee',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Политики для таблицы assignees
CREATE POLICY "Публичный доступ на чтение исполнителей"
ON assignees FOR SELECT
TO PUBLIC
USING (true);

CREATE POLICY "Только админы могут управлять исполнителями"
ON assignees FOR ALL
TO authenticated
USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin'); 