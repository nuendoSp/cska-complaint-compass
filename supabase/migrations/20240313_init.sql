-- Создание перечислений
CREATE OR REPLACE FUNCTION create_complaint_enums()
RETURNS void AS $$
BEGIN
    -- Создаем тип для статусов жалоб, если он еще не существует
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'complaint_status') THEN
        CREATE TYPE complaint_status AS ENUM ('new', 'processing', 'resolved', 'rejected');
    END IF;

    -- Создаем тип для категорий жалоб, если он еще не существует
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'complaint_category') THEN
        CREATE TYPE complaint_category AS ENUM ('Facilities', 'Staff', 'Equipment', 'Cleanliness', 'Services', 'Safety', 'Other');
    END IF;

    -- Создаем тип для приоритетов, если он еще не существует
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'complaint_priority') THEN
        CREATE TYPE complaint_priority AS ENUM ('low', 'medium', 'high');
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Создание таблицы complaints
CREATE OR REPLACE FUNCTION create_complaints_table()
RETURNS void AS $$
BEGIN
    CREATE TABLE IF NOT EXISTS complaints (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category complaint_category NOT NULL,
        status complaint_status NOT NULL DEFAULT 'new',
        priority complaint_priority NOT NULL DEFAULT 'medium',
        location TEXT NOT NULL,
        author TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        priority_id UUID REFERENCES priorities(id),
        assignee_id UUID REFERENCES assignees(id),
        response JSONB,
        attachments JSONB[]
    );

    -- Создаем индексы
    CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
    CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
    CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at);
END;
$$ LANGUAGE plpgsql;

-- Создание таблицы priorities
CREATE OR REPLACE FUNCTION create_priorities_table()
RETURNS void AS $$
BEGIN
    CREATE TABLE IF NOT EXISTS priorities (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        level complaint_priority NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
END;
$$ LANGUAGE plpgsql;

-- Создание таблицы assignees
CREATE OR REPLACE FUNCTION create_assignees_table()
RETURNS void AS $$
BEGIN
    CREATE TABLE IF NOT EXISTS assignees (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        email TEXT,
        department TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
END;
$$ LANGUAGE plpgsql;

-- Создание таблицы response_templates
CREATE OR REPLACE FUNCTION create_response_templates_table()
RETURNS void AS $$
BEGIN
    CREATE TABLE IF NOT EXISTS response_templates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category complaint_category,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
END;
$$ LANGUAGE plpgsql;

-- Создание таблицы change_history
CREATE OR REPLACE FUNCTION create_change_history_table()
RETURNS void AS $$
BEGIN
    CREATE TABLE IF NOT EXISTS change_history (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        complaint_id UUID REFERENCES complaints(id),
        field_name TEXT NOT NULL,
        old_value TEXT,
        new_value TEXT,
        changed_by TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Создаем индекс для быстрого поиска по complaint_id
    CREATE INDEX IF NOT EXISTS idx_change_history_complaint_id ON change_history(complaint_id);
END;
$$ LANGUAGE plpgsql; 