-- Включаем RLS (Row Level Security)
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

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
ALTER DATABASE postgres SET "app.settings.cors_origins" TO '["https://nuendoSp.github.io", "http://localhost:5173"]';

-- Создание бакета для файлов
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint_files', 'complaint_files', true)
ON CONFLICT (id) DO NOTHING;

-- Политики для storage
CREATE POLICY "Публичный доступ к файлам"
ON storage.objects FOR SELECT
USING (bucket_id = 'complaint_files');

CREATE POLICY "Аутентифицированные пользователи могут загружать файлы"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'complaint_files' 
    AND (auth.jwt() ->> 'role' IN ('admin', 'assignee', 'authenticated'))
);

CREATE POLICY "Админы могут управлять всеми файлами"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'complaint_files' 
    AND auth.jwt() ->> 'role' = 'admin'
);

CREATE POLICY "Исполнители могут управлять файлами в своих жалобах"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'complaint_files' 
    AND auth.jwt() ->> 'role' = 'assignee'
    AND EXISTS (
        SELECT 1 FROM complaints 
        WHERE assignee_id::text = auth.uid()::text
        AND attachments @> ARRAY[storage.objects.name]
    )
); 