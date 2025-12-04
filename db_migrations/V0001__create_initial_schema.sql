-- Create event settings table
CREATE TABLE IF NOT EXISTS event_settings (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL DEFAULT '42 БРАТУХ',
    event_slogan TEXT,
    event_date TIMESTAMP,
    event_location TEXT,
    organizer_name VARCHAR(255),
    organizer_contact VARCHAR(255),
    program_data JSONB,
    about_content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    twitch_link VARCHAR(500),
    about TEXT,
    status VARCHAR(50) DEFAULT 'new',
    twitch_user_id VARCHAR(100),
    twitch_display_name VARCHAR(255),
    twitch_avatar_url TEXT,
    twitch_email VARCHAR(255),
    qr_code VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_twitch_user_id ON applications(twitch_user_id);

-- Insert default event settings
INSERT INTO event_settings (event_name, event_slogan, about_content) 
VALUES (
    '42 БРАТУХ',
    'Братская тусовка для единомышленников из мира стриминга',
    '42 БРАТУХ — это ежегодное неформальное мероприятие русскоязычного стрим-сообщества. Здесь нет конкурсов и соревнований, только братская встреча единомышленников.'
);
