-- Создаем таблицу assignees если не существует
CREATE TABLE IF NOT EXISTS assignees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включаем RLS
ALTER TABLE assignees ENABLE ROW LEVEL SECURITY;

-- Создаем политики для assignees
CREATE POLICY "public_read_access"
ON assignees FOR SELECT
TO PUBLIC
USING (true);

CREATE POLICY "admin_management_access"
ON assignees FOR ALL
TO authenticated
USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- Создаем индексы
CREATE INDEX IF NOT EXISTS idx_assignees_email ON assignees(email);
CREATE INDEX IF NOT EXISTS idx_assignees_is_active ON assignees(is_active); 