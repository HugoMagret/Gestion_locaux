-- Activation de l'extension pour générer des UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLES DE RÉFÉRENCE
CREATE TABLE IF NOT EXISTS room_type (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label VARCHAR(255) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#3498db'
);

CREATE TABLE IF NOT EXISTS equipment_type (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS socket_type (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label VARCHAR(255) NOT NULL UNIQUE
);

-- 2. TABLES PRINCIPALES
CREATE TABLE IF NOT EXISTS room (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    max_capacity INTEGER,
    room_type_id UUID REFERENCES room_type(id) ON DELETE CASCADE,
    doors INTEGER DEFAULT 1,
    floor INTEGER DEFAULT 0,
    coordinates JSONB DEFAULT '{"x": 0, "y": 0, "width": 100, "height": 100}'::jsonb
);

CREATE TABLE IF NOT EXISTS door (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    floor INTEGER DEFAULT 0,
    coordinates JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    last_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    room_id UUID REFERENCES room(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    serial_number VARCHAR(255),
    equipment_type_id UUID REFERENCES equipment_type(id) ON DELETE CASCADE,
    room_id UUID REFERENCES room(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS socket (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier VARCHAR(255) NOT NULL,
    socket_type_id UUID REFERENCES socket_type(id) ON DELETE CASCADE,
    room_id UUID REFERENCES room(id) ON DELETE CASCADE
);

-- 3. TABLES TERMINÉES

-- 8. GESTION DES UTILISATEURS
CREATE TABLE IF NOT EXISTS "user" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    login VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    last_connection TIMESTAMP
);

INSERT INTO "user" (login, password, is_admin) 
VALUES ('admin', '9d2d2475c8872c45e135d4ac5491d748:858ad4464fb7902080dbc218c88f8cca98828b888a7c050afd994505d5a8bd309ef74d8f4cd2c6a9d319402a3b3ae35a1c628ed9c2b0abe9c6e7a0f539e003ed', true) 
ON CONFLICT DO NOTHING;
