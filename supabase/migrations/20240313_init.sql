-- Создаем перечисления
CREATE OR REPLACE FUNCTION create_complaint_enums()
RETURNS void AS $$
BEGIN
    -- Создаем тип для статусов жалоб, если он еще не существует
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'complaint_status') THEN
        CREATE TYPE complaint_status AS ENUM ('new', 'in_progress', 'resolved', 'closed');
    END IF;

    -- Создаем тип для категорий жалоб, если он еще не существует
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'complaint_category') THEN
        CREATE TYPE complaint_category AS ENUM (
            'service_quality',
            'facility_issues',
            'staff_behavior',
            'equipment_problems',
            'safety_concerns',
            'other'
        );
    END IF;

    -- Создаем тип для приоритетов, если он еще не существует
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level') THEN
        CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Создаем таблицу complaints
CREATE OR REPLACE FUNCTION create_complaints_table()
RETURNS void AS $$
BEGIN
    CREATE TABLE IF NOT EXISTS complaints (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category complaint_category NOT NULL,
        status complaint_status DEFAULT 'new',
        priority priority_level DEFAULT 'medium',
        location_id UUID REFERENCES locations(id),
        assignee_id UUID REFERENCES assignees(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        resolved_at TIMESTAMP WITH TIME ZONE,
        closed_at TIMESTAMP WITH TIME ZONE,
        author_name TEXT,
        author_contact TEXT,
        attachments TEXT[]
    );

    -- Создаем индексы
    CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
    CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
    CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(priority);
    CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at);
END;
$$ LANGUAGE plpgsql;

-- Создаем таблицу priorities
CREATE OR REPLACE FUNCTION create_priorities_table()
RETURNS void AS $$
BEGIN
    CREATE TABLE IF NOT EXISTS priorities (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        level priority_level NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- Создаем таблицу assignees
CREATE OR REPLACE FUNCTION create_assignees_table()
RETURNS void AS $$
BEGIN
    CREATE TABLE IF NOT EXISTS assignees (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- Создаем таблицу response_templates
CREATE OR REPLACE FUNCTION create_response_templates_table()
RETURNS void AS $$
BEGIN
    CREATE TABLE IF NOT EXISTS response_templates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category complaint_category,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- Создаем таблицу change_history
CREATE OR REPLACE FUNCTION create_change_history_table()
RETURNS void AS $$
BEGIN
    CREATE TABLE IF NOT EXISTS change_history (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        complaint_id UUID REFERENCES complaints(id),
        field_name TEXT NOT NULL,
        old_value TEXT,
        new_value TEXT,
        changed_by UUID REFERENCES assignees(id),
        changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Создаем индексы
    CREATE INDEX IF NOT EXISTS idx_change_history_complaint_id ON change_history(complaint_id);
    CREATE INDEX IF NOT EXISTS idx_change_history_changed_at ON change_history(changed_at);
END;
$$ LANGUAGE plpgsql;

-- Создаем таблицу content_management
CREATE OR REPLACE FUNCTION create_content_management_table()
RETURNS void AS $$
BEGIN
    CREATE TABLE IF NOT EXISTS content_management (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        component_name TEXT NOT NULL,
        content_key TEXT NOT NULL,
        content_value TEXT NOT NULL,
        requires_approval BOOLEAN DEFAULT false,
        is_approved BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(component_name, content_key)
    );

    -- Создаем индексы
    CREATE INDEX IF NOT EXISTS idx_content_management_component ON content_management(component_name);
    CREATE INDEX IF NOT EXISTS idx_content_management_key ON content_management(content_key);
END;
$$ LANGUAGE plpgsql; 