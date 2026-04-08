CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS Users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('student', 'authority')) DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status VARCHAR(50) CHECK (status IN ('Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed')) DEFAULT 'Submitted',
    department VARCHAR(100),
    support_count INT DEFAULT 1,
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Complaint_Images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES Complaints(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Status_Logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES Complaints(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    note TEXT,
    updated_by UUID REFERENCES Users(id) ON DELETE SET NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_complaints_location ON Complaints (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON Complaints (category);
