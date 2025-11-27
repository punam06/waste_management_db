-- PostgreSQL Version of Waste Management Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS wasteManagement;

-- Switch to database (in psql: \c wasteManagement)

-- Area Table
CREATE TABLE IF NOT EXISTS Area (
    area_id SERIAL PRIMARY KEY,
    area_name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Citizen Table
CREATE TABLE IF NOT EXISTS Citizen (
    citizen_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bins Table
CREATE TABLE IF NOT EXISTS Bins (
    bin_id SERIAL PRIMARY KEY,
    area_id INT NOT NULL,
    bin_type VARCHAR(100),
    fill_level INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (area_id) REFERENCES Area(area_id) ON DELETE CASCADE
);

-- Waste Table
CREATE TABLE IF NOT EXISTS Waste (
    waste_id SERIAL PRIMARY KEY,
    area_id INT NOT NULL,
    category VARCHAR(100),
    quantity DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (area_id) REFERENCES Area(area_id) ON DELETE CASCADE
);

-- Recycling Center Table
CREATE TABLE IF NOT EXISTS Recycling_Center (
    center_id SERIAL PRIMARY KEY,
    center_name VARCHAR(255),
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bill Table
CREATE TABLE IF NOT EXISTS Bill (
    bill_id SERIAL PRIMARY KEY,
    citizen_id INT NOT NULL,
    amount DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (citizen_id) REFERENCES Citizen(citizen_id) ON DELETE CASCADE
);

-- Payment Table
CREATE TABLE IF NOT EXISTS Payment (
    payment_id SERIAL PRIMARY KEY,
    bill_id INT NOT NULL,
    amount DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES Bill(bill_id) ON DELETE CASCADE
);

-- Crew Table
CREATE TABLE IF NOT EXISTS Crew (
    crew_id SERIAL PRIMARY KEY,
    crew_name VARCHAR(255),
    role VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Collection Schedule Table
CREATE TABLE IF NOT EXISTS Collection_Schedule (
    schedule_id SERIAL PRIMARY KEY,
    area_id INT NOT NULL,
    schedule_day VARCHAR(20),
    schedule_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (area_id) REFERENCES Area(area_id) ON DELETE CASCADE
);

-- Has Schedule Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS Has_Schedule (
    has_schedule_id SERIAL PRIMARY KEY,
    area_id INT NOT NULL,
    schedule_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (area_id) REFERENCES Area(area_id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES Collection_Schedule(schedule_id) ON DELETE CASCADE,
    UNIQUE(area_id, schedule_id)
);

-- Assigned Table (Crew Assignment)
CREATE TABLE IF NOT EXISTS Assigned (
    assigned_id SERIAL PRIMARY KEY,
    crew_id INT NOT NULL,
    area_id INT NOT NULL,
    schedule_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (crew_id) REFERENCES Crew(crew_id) ON DELETE CASCADE,
    FOREIGN KEY (area_id) REFERENCES Area(area_id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES Collection_Schedule(schedule_id) ON DELETE CASCADE
);

-- Create Indexes
CREATE INDEX idx_area_id ON Bins(area_id);
CREATE INDEX idx_citizen_id ON Bill(citizen_id);
CREATE INDEX idx_bill_id ON Payment(bill_id);
CREATE INDEX idx_waste_area ON Waste(area_id);
CREATE INDEX idx_schedule_area ON Collection_Schedule(area_id);
