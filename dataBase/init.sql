-- Activation de l'extension pour générer des UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLES DE RÉFÉRENCE (DICTIONNAIRES)
CREATE TABLE IF NOT EXISTS room_type (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label VARCHAR(255) NOT NULL UNIQUE
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
    max_capacity INTEGER NOT NULL,
    room_type_id UUID REFERENCES room_type(id) ON DELETE CASCADE,
    doors INTEGER DEFAULT 1,
    floor INTEGER DEFAULT 0,
    coordinates JSONB DEFAULT '{"x": 0, "y": 0, "width": 100, "height": 100}'::jsonb,
    color VARCHAR(7) DEFAULT '#3498db'
);

CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    last_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
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

-- 3. INSERTION DES DONNÉES DE RÉFÉRENCE
INSERT INTO room_type (label) VALUES ('Bureau'), ('Salle de cours'), ('Amphithéâtre'), ('Cafétéria'), ('Réunion') ON CONFLICT DO NOTHING;
INSERT INTO equipment_type (label) VALUES ('Tableau blanc'), ('Vidéoprojecteur'), ('Ordinateur Fixe'), ('Serveur') ON CONFLICT DO NOTHING;
INSERT INTO socket_type (label) VALUES ('Réseau (RJ45)'), ('Prise Électrique'), ('HDMI') ON CONFLICT DO NOTHING;

-- 4. INSERTION DES SALLES (MOCK)
INSERT INTO room (name, max_capacity, room_type_id, doors, floor, coordinates, color) VALUES 
('Salle B102', 35, (SELECT id FROM room_type WHERE label = 'Salle de cours'), 2, 1, '{"x": 50, "y": 50, "width": 200, "height": 120}', '#e74c3c'),
('Amphi A', 250, (SELECT id FROM room_type WHERE label = 'Amphithéâtre'), 4, 0, '{"x": 300, "y": 50, "width": 300, "height": 250}', '#2ecc71'),
('Bureau 204', 4, (SELECT id FROM room_type WHERE label = 'Bureau'), 1, 2, '{"x": 50, "y": 200, "width": 80, "height": 80}', '#3498db'),
('Cafétéria', 100, (SELECT id FROM room_type WHERE label = 'Cafétéria'), 3, 0, '{"x": 300, "y": 350, "width": 250, "height": 150}', '#f1c40f')
ON CONFLICT DO NOTHING;

-- 5. INSERTION DU PERSONNEL (MOCK)
INSERT INTO staff (first_name, last_name, room_id) VALUES
('Jean', 'Dupont', (SELECT id FROM room WHERE name = 'Bureau 204')),
('Marie', 'Curie', (SELECT id FROM room WHERE name = 'Bureau 204')),
('Albert', 'Einstein', (SELECT id FROM room WHERE name = 'Salle B102')),
('Charles', 'Darwin', NULL)
ON CONFLICT DO NOTHING;

-- 6. INSERTION DU MATÉRIEL (MOCK)
INSERT INTO equipment (name, serial_number, equipment_type_id, room_id) VALUES
('Vidéoprojecteur Epson', 'EPS-12345', (SELECT id FROM equipment_type WHERE label = 'Vidéoprojecteur'), (SELECT id FROM room WHERE name = 'Salle B102')),
('Vidéoprojecteur Sony', 'SON-98765', (SELECT id FROM equipment_type WHERE label = 'Vidéoprojecteur'), (SELECT id FROM room WHERE name = 'Amphi A')),
('iMac de Jean', 'MAC-888', (SELECT id FROM equipment_type WHERE label = 'Ordinateur Fixe'), (SELECT id FROM room WHERE name = 'Bureau 204')),
('Tableau Interactif', 'TAB-444', (SELECT id FROM equipment_type WHERE label = 'Tableau blanc'), (SELECT id FROM room WHERE name = 'Salle B102'))
ON CONFLICT DO NOTHING;

-- 7. INSERTION DES PRISES (MOCK)
INSERT INTO socket (identifier, socket_type_id, room_id) VALUES
('ETH-01', (SELECT id FROM socket_type WHERE label = 'Réseau (RJ45)'), (SELECT id FROM room WHERE name = 'Bureau 204')),
('ETH-02', (SELECT id FROM socket_type WHERE label = 'Réseau (RJ45)'), (SELECT id FROM room WHERE name = 'Bureau 204')),
('PWR-01', (SELECT id FROM socket_type WHERE label = 'Prise Électrique'), (SELECT id FROM room WHERE name = 'Amphi A')),
('HDMI-01', (SELECT id FROM socket_type WHERE label = 'HDMI'), (SELECT id FROM room WHERE name = 'Amphi A'))
ON CONFLICT DO NOTHING;
