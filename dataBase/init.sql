-- Activation de l'extension pour générer des UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des types de salles (Bureau, Salle de cours, Cafétéria, Salle de réunion)
CREATE TABLE IF NOT EXISTS room_type (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label VARCHAR(255) NOT NULL
);

-- Table des types d'équipements (Tableau, Vidéoprojecteur, Ordinateur)
CREATE TABLE IF NOT EXISTS equipment_type (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label VARCHAR(255) NOT NULL
);

-- Table des types de prises (Réseau, Téléphone)
CREATE TABLE IF NOT EXISTS socket_type (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label VARCHAR(255) NOT NULL
);

-- Table des salles
CREATE TABLE IF NOT EXISTS room (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    max_capacity INTEGER NOT NULL,
    room_type_id UUID REFERENCES room_type(id) ON DELETE CASCADE
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

-- Insertion de quelques données de test (optionnel mais utile pour vérifier)
INSERT INTO room_type (label) VALUES ('Bureau'), ('Salle de cours'), ('Cafétéria'), ('Salle de réunion');
INSERT INTO equipment_type (label) VALUES ('Tableau blanc'), ('Vidéoprojecteur'), ('Ordinateur');
INSERT INTO socket_type (label) VALUES ('Réseau (RJ45)'), ('Prise Électrique');
