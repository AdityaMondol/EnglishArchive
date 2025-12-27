-- Virtual Notebook Application Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Editors table (users who can edit content)
CREATE TABLE IF NOT EXISTS editors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notebooks table
CREATE TABLE IF NOT EXISTS notebooks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pages table
CREATE TABLE IF NOT EXISTS pages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chapters_notebook_id ON chapters(notebook_id);
CREATE INDEX IF NOT EXISTS idx_pages_chapter_id ON pages(chapter_id);
CREATE INDEX IF NOT EXISTS idx_notebooks_published ON notebooks(is_published);
CREATE INDEX IF NOT EXISTS idx_editors_user_id ON editors(user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_notebooks_updated_at ON notebooks;
CREATE TRIGGER update_notebooks_updated_at
    BEFORE UPDATE ON notebooks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chapters_updated_at ON chapters;
CREATE TRIGGER update_chapters_updated_at
    BEFORE UPDATE ON chapters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at
    BEFORE UPDATE ON pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE editors ENABLE ROW LEVEL SECURITY;

-- Notebooks: Public read for published, editors can do everything
CREATE POLICY "Public can view published notebooks" ON notebooks
    FOR SELECT USING (is_published = true);

CREATE POLICY "Editors can do everything on notebooks" ON notebooks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM editors 
            WHERE editors.user_id = auth.uid() 
            AND editors.is_active = true
        )
    );

-- Chapters: Public read, editors can modify
CREATE POLICY "Public can view chapters of published notebooks" ON chapters
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM notebooks 
            WHERE notebooks.id = chapters.notebook_id 
            AND notebooks.is_published = true
        )
    );

CREATE POLICY "Editors can do everything on chapters" ON chapters
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM editors 
            WHERE editors.user_id = auth.uid() 
            AND editors.is_active = true
        )
    );

-- Pages: Public read, editors can modify
CREATE POLICY "Public can view pages of published notebooks" ON pages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chapters
            JOIN notebooks ON notebooks.id = chapters.notebook_id
            WHERE chapters.id = pages.chapter_id 
            AND notebooks.is_published = true
        )
    );

CREATE POLICY "Editors can do everything on pages" ON pages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM editors 
            WHERE editors.user_id = auth.uid() 
            AND editors.is_active = true
        )
    );

-- Editors: Only service role can manage
CREATE POLICY "Editors table is managed by service role" ON editors
    FOR ALL USING (false);

-- Insert some sample data (optional - remove in production)
-- You can add an editor by inserting their user_id after they sign up:
-- INSERT INTO editors (user_id) VALUES ('your-user-uuid-here');
