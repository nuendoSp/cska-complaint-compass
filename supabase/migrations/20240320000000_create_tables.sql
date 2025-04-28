-- Создание перечислений
DO $$ BEGIN
    CREATE TYPE complaint_status AS ENUM ('new', 'processing', 'resolved', 'rejected', 'in_progress', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE complaint_category AS ENUM ('facilities', 'staff', 'equipment', 'cleanliness', 'services', 'safety', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Создание таблицы complaints
CREATE TABLE IF NOT EXISTS complaints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category complaint_category NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    locationId TEXT,
    locationName TEXT,
    status complaint_status DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    priority_id UUID,
    assignee_id UUID,
    attachments JSONB DEFAULT '[]'::jsonb,
    contact_email TEXT,
    contact_phone TEXT,
    response JSONB
);

-- Создание таблицы priorities
CREATE TABLE IF NOT EXISTS priorities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы assignees
CREATE TABLE IF NOT EXISTS assignees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы response_templates
CREATE TABLE IF NOT EXISTS response_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы change_history
CREATE TABLE IF NOT EXISTS change_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    complaint_id UUID REFERENCES complaints(id),
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы content_management
CREATE TABLE IF NOT EXISTS content_management (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание RLS политик
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_management ENABLE ROW LEVEL SECURITY;

-- Политики для complaints
DROP POLICY IF EXISTS "Публичный доступ на чтение жалоб" ON complaints;
CREATE POLICY "Публичный доступ на чтение жалоб" ON complaints
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Публичный доступ на создание жалоб" ON complaints;
CREATE POLICY "Публичный доступ на создание жалоб" ON complaints
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Только админы могут обновлять жалобы" ON complaints;
CREATE POLICY "Только админы могут обновлять жалобы" ON complaints
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Только админы могут удалять жалобы" ON complaints;
CREATE POLICY "Только админы могут удалять жалобы" ON complaints
    FOR DELETE USING (auth.role() = 'authenticated');

-- Политики для остальных таблиц
DROP POLICY IF EXISTS "Публичный доступ на чтение приоритетов" ON priorities;
CREATE POLICY "Публичный доступ на чтение приоритетов" ON priorities
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Публичный доступ на чтение исполнителей" ON assignees;
CREATE POLICY "Публичный доступ на чтение исполнителей" ON assignees
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Публичный доступ на чтение шаблонов" ON response_templates;
CREATE POLICY "Публичный доступ на чтение шаблонов" ON response_templates
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Только админы могут управлять историей" ON change_history;
CREATE POLICY "Только админы могут управлять историей" ON change_history
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Публичный доступ на чтение контента" ON content_management;
CREATE POLICY "Публичный доступ на чтение контента" ON content_management
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Только админы могут управлять контентом" ON content_management;
CREATE POLICY "Только админы могут управлять контентом" ON content_management
    FOR ALL USING (auth.role() = 'authenticated'); 