-- Создание перечислений
CREATE TYPE complaint_status AS ENUM ('new', 'in_progress', 'resolved', 'closed');
CREATE TYPE complaint_category AS ENUM (
    'service_quality',
    'facility_issues',
    'staff_behavior',
    'equipment_problems',
    'safety_concerns',
    'other'
);
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');

-- Создание таблицы locations
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы complaints
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category complaint_category NOT NULL,
    status complaint_status DEFAULT 'new',
    priority priority_level DEFAULT 'medium',
    location_id UUID REFERENCES locations(id),
    assignee_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    author_name TEXT,
    author_contact TEXT,
    attachments TEXT[]
);

-- Создание таблицы priorities
CREATE TABLE IF NOT EXISTS priorities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    level priority_level NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы assignees
CREATE TABLE IF NOT EXISTS assignees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы response_templates
CREATE TABLE IF NOT EXISTS response_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category complaint_category,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы change_history
CREATE TABLE IF NOT EXISTS change_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(id),
    changed_by UUID,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT
);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at);
CREATE INDEX IF NOT EXISTS idx_change_history_complaint_id ON change_history(complaint_id);
CREATE INDEX IF NOT EXISTS idx_change_history_changed_at ON change_history(changed_at); 