-- Activation de l'extension pour générer des UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des types de salles
CREATE TABLE IF NOT EXISTS room_type (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label VARCHAR(255) NOT NULL
);

-- Table des types d'équipements
CREATE TABLE IF NOT EXISTS equipment_type (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label VARCHAR(255) NOT NULL
);

-- Table des types de prises
CREATE TABLE IF NOT EXISTS socket_type (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label VARCHAR(255) NOT NULL
);

-- Table des salles
CREATE TABLE IF NOT EXISTS room (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    max_capacity INTEGER NOT NULL,
    room_type_id UUID REFERENCES room_type(id) ON DELETE CASCADE,
    doors INTEGER DEFAULT 1,
    floor INTEGER DEFAULT 0, -- Étage (0 = RDC, 1 = 1er stage, etc.)
    -- Stockage des dimensions et coordonnées pour le dessin Canva
    -- Format : {"x": 10, "y": 10, "width": 200, "height": 150}
    coordinates JSONB DEFAULT '{"x": 0, "y": 0, "width": 100, "height": 100}'::jsonb,
    color VARCHAR(7) DEFAULT '#3498db' -- Couleur d'affichage par défaut (hex)
);

-- Table du personnel
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    last_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    room_id UUID REFERENCES room(id) ON DELETE SET NULL
);

-- Table des équipements
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    serial_number VARCHAR(255),
    equipment_type_id UUID REFERENCES equipment_type(id) ON DELETE CASCADE,
    room_id UUID REFERENCES room(id) ON DELETE SET NULL
);

-- Table des prises
CREATE TABLE IF NOT EXISTS socket (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier VARCHAR(255) NOT NULL,
    socket_type_id UUID REFERENCES socket_type(id) ON DELETE CASCADE,
    room_id UUID REFERENCES room(id) ON DELETE CASCADE
);

-- Insertion de données de test
INSERT INTO room_type (label) VALUES ('Bureau'), ('Salle de cours'), ('Cafétéria'), ('Salle de réunion');
INSERT INTO equipment_type (label) VALUES ('Tableau blanc'), ('Vidéoprojecteur'), ('Ordinateur');
INSERT INTO socket_type (label) VALUES ('Réseau (RJ45)'), ('Prise Électrique');
