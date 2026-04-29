-- Fichier de données de test (Seed) pour Gestion Locaux

-- 1. DONNÉES DE RÉFÉRENCE
INSERT INTO room_type (label) VALUES ('Bureau'), ('Salle de cours'), ('Amphithéâtre'), ('Cafétéria'), ('Réunion'), ('Labo Info'), ('Bibliothèque'), ('Stockage'), ('Sanitaires'), ('Local Technique') ON CONFLICT DO NOTHING;
INSERT INTO equipment_type (label) VALUES ('Tableau blanc'), ('Vidéoprojecteur'), ('Ordinateur Fixe'), ('Serveur'), ('Imprimante 3D'), ('Scanner') ON CONFLICT DO NOTHING;
INSERT INTO socket_type (label) VALUES ('Réseau (RJ45)'), ('Prise Électrique'), ('HDMI'), ('Fibre') ON CONFLICT DO NOTHING;

-- 2. SALLES (ÉTAGES 0, 1, 2, 3, 4)
INSERT INTO room (name, max_capacity, room_type_id, doors, floor, coordinates, color) VALUES 
-- RDC (Floor 0)
('Amphi A', 250, (SELECT id FROM room_type WHERE label = 'Amphithéâtre'), 4, 0, '{"x": 300, "y": 50, "width": 300, "height": 250}', '#2ecc71'),
('Cafétéria', 120, (SELECT id FROM room_type WHERE label = 'Cafétéria'), 3, 0, '{"x": 300, "y": 350, "width": 250, "height": 150}', '#f1c40f'),
('Accueil', 10, (SELECT id FROM room_type WHERE label = 'Bureau'), 2, 0, '{"x": 50, "y": 50, "width": 100, "height": 80}', '#95a5a6'),
-- 1er Étage (Floor 1)
('Salle B102', 35, (SELECT id FROM room_type WHERE label = 'Salle de cours'), 2, 1, '{"x": 50, "y": 50, "width": 150, "height": 100}', '#e74c3c'),
('Labo Info 1', 20, (SELECT id FROM room_type WHERE label = 'Labo Info'), 1, 1, '{"x": 250, "y": 50, "width": 150, "height": 100}', '#8e44ad'),
('Bibliothèque', 80, (SELECT id FROM room_type WHERE label = 'Bibliothèque'), 2, 1, '{"x": 450, "y": 50, "width": 200, "height": 300}', '#d35400'),
-- 2ème Étage (Floor 2)
('Bureau 201', 2, (SELECT id FROM room_type WHERE label = 'Bureau'), 1, 2, '{"x": 50, "y": 50, "width": 80, "height": 80}', '#3498db'),
('Bureau 204', 4, (SELECT id FROM room_type WHERE label = 'Bureau'), 1, 2, '{"x": 150, "y": 50, "width": 80, "height": 120}', '#3498db'),
('Salle Réunion', 15, (SELECT id FROM room_type WHERE label = 'Réunion'), 1, 2, '{"x": 250, "y": 50, "width": 120, "height": 80}', '#1abc9c'),
('Admin Central', 10, (SELECT id FROM room_type WHERE label = 'Bureau'), 1, 2, '{"x": 400, "y": 50, "width": 150, "height": 150}', '#2c3e50'),
-- 3ème Étage (Floor 3)
('Salle 301', 30, (SELECT id FROM room_type WHERE label = 'Salle de cours'), 1, 3, '{"x": 50, "y": 50, "width": 120, "height": 100}', '#e67e22'),
('Salle 302', 30, (SELECT id FROM room_type WHERE label = 'Salle de cours'), 1, 3, '{"x": 200, "y": 50, "width": 120, "height": 100}', '#e67e22'),
('Local Serveur', 2, (SELECT id FROM room_type WHERE label = 'Local Technique'), 1, 3, '{"x": 350, "y": 50, "width": 80, "height": 80}', '#7f8c8d'),
-- 4ème Étage (Floor 4)
('Labo Réseau', 15, (SELECT id FROM room_type WHERE label = 'Labo Info'), 1, 4, '{"x": 50, "y": 50, "width": 200, "height": 150}', '#16a085'),
('Bureau 401', 2, (SELECT id FROM room_type WHERE label = 'Bureau'), 1, 4, '{"x": 300, "y": 50, "width": 100, "height": 100}', '#3498db'),
('Dépôt Matériel', 0, (SELECT id FROM room_type WHERE label = 'Stockage'), 1, 4, '{"x": 450, "y": 50, "width": 150, "height": 200}', '#95a5a6')
ON CONFLICT DO NOTHING;

-- 3. PERSONNEL
INSERT INTO staff (first_name, last_name, room_id) VALUES
('Jean', 'Dupont', (SELECT id FROM room WHERE name = 'Bureau 204')),
('Marie', 'Curie', (SELECT id FROM room WHERE name = 'Bureau 201')),
('Albert', 'Einstein', (SELECT id FROM room WHERE name = 'Salle B102')),
('Charles', 'Darwin', (SELECT id FROM room WHERE name = 'Labo Info 1')),
('Ada', 'Lovelace', (SELECT id FROM room WHERE name = 'Labo Info 1')),
('Alan', 'Turing', (SELECT id FROM room WHERE name = 'Labo Info 1')),
('Nikola', 'Tesla', (SELECT id FROM room WHERE name = 'Admin Central')),
('Pierre', 'Bourdieu', (SELECT id FROM room WHERE name = 'Bibliothèque')),
('Simone', 'de Beauvoir', (SELECT id FROM room WHERE name = 'Bibliothèque')),
('Thomas', 'Pesquet', (SELECT id FROM room WHERE name = 'Amphi A')),
('Alice', 'Martin', (SELECT id FROM room WHERE name = 'Accueil')),
('Bob', 'Laroche', (SELECT id FROM room WHERE name = 'Accueil')),
('Lucie', 'Vidal', (SELECT id FROM room WHERE name = 'Admin Central')),
('Grace', 'Hopper', (SELECT id FROM room WHERE name = 'Labo Info 1')),
('Linus', 'Torvalds', (SELECT id FROM room WHERE name = 'Local Serveur')),
('Margaret', 'Hamilton', (SELECT id FROM room WHERE name = 'Salle 301')),
('Steve', 'Wozniak', (SELECT id FROM room WHERE name = 'Salle 302')),
('Tim', 'Berners-Lee', (SELECT id FROM room WHERE name = 'Labo Réseau')),
('Guido', 'van Rossum', (SELECT id FROM room WHERE name = 'Bureau 401')),
('Hedy', 'Lamarr', (SELECT id FROM room WHERE name = 'Labo Réseau')),
('Victor', 'Hugo', NULL),
('Emile', 'Zola', NULL)
ON CONFLICT DO NOTHING;

-- 4. MATÉRIEL
INSERT INTO equipment (name, serial_number, equipment_type_id, room_id) VALUES
('Vidéoprojecteur Epson A', 'EPS-A-001', (SELECT id FROM equipment_type WHERE label = 'Vidéoprojecteur'), (SELECT id FROM room WHERE name = 'Salle B102')),
('Vidéoprojecteur Sony B', 'SON-B-002', (SELECT id FROM equipment_type WHERE label = 'Vidéoprojecteur'), (SELECT id FROM room WHERE name = 'Amphi A')),
('iMac Pro 1', 'MAC-P1', (SELECT id FROM equipment_type WHERE label = 'Ordinateur Fixe'), (SELECT id FROM room WHERE name = 'Bureau 201')),
('Dell XPS Lab', 'DELL-L1', (SELECT id FROM equipment_type WHERE label = 'Ordinateur Fixe'), (SELECT id FROM room WHERE name = 'Labo Info 1')),
('Dell XPS Lab 2', 'DELL-L2', (SELECT id FROM equipment_type WHERE label = 'Ordinateur Fixe'), (SELECT id FROM room WHERE name = 'Labo Info 1')),
('Imprimante 3D Creality', '3D-C1', (SELECT id FROM equipment_type WHERE label = 'Imprimante 3D'), (SELECT id FROM room WHERE name = 'Labo Info 1')),
('Scanner HQ', 'SCN-09', (SELECT id FROM equipment_type WHERE label = 'Scanner'), (SELECT id FROM room WHERE name = 'Bibliothèque')),
('Serveur Data', 'SRV-88', (SELECT id FROM equipment_type WHERE label = 'Serveur'), (SELECT id FROM room WHERE name = 'Admin Central')),
('Tableau Interactif', 'TAB-444', (SELECT id FROM equipment_type WHERE label = 'Tableau blanc'), (SELECT id FROM room WHERE name = 'Salle B102')),
('Vidéoprojecteur Mobile', 'MOB-01', (SELECT id FROM equipment_type WHERE label = 'Vidéoprojecteur'), (SELECT id FROM room WHERE name = 'Salle Réunion')),
('Switch Core', 'SW-CORE-01', (SELECT id FROM equipment_type WHERE label = 'Serveur'), (SELECT id FROM room WHERE name = 'Local Serveur')),
('Routeur Bordure', 'RT-EDGE-01', (SELECT id FROM equipment_type WHERE label = 'Serveur'), (SELECT id FROM room WHERE name = 'Local Serveur')),
('Routeur Cisco Lab', 'CIS-L4', (SELECT id FROM equipment_type WHERE label = 'Serveur'), (SELECT id FROM room WHERE name = 'Labo Réseau')),
('PC Dell 301-A', 'DELL-301A', (SELECT id FROM equipment_type WHERE label = 'Ordinateur Fixe'), (SELECT id FROM room WHERE name = 'Salle 301')),
('PC Dell 301-B', 'DELL-301B', (SELECT id FROM equipment_type WHERE label = 'Ordinateur Fixe'), (SELECT id FROM room WHERE name = 'Salle 301')),
('Imprimante 3D Spare', '3D-S2', (SELECT id FROM equipment_type WHERE label = 'Imprimante 3D'), (SELECT id FROM room WHERE name = 'Dépôt Matériel'))
ON CONFLICT DO NOTHING;

-- 5. PRISES
INSERT INTO socket (identifier, socket_type_id, room_id) VALUES
('ETH-1A', (SELECT id FROM socket_type WHERE label = 'Réseau (RJ45)'), (SELECT id FROM room WHERE name = 'Bureau 204')),
('ETH-1B', (SELECT id FROM socket_type WHERE label = 'Réseau (RJ45)'), (SELECT id FROM room WHERE name = 'Bureau 204')),
('FIBRE-01', (SELECT id FROM socket_type WHERE label = 'Fibre'), (SELECT id FROM room WHERE name = 'Admin Central')),
('PWR-A1', (SELECT id FROM socket_type WHERE label = 'Prise Électrique'), (SELECT id FROM room WHERE name = 'Amphi A')),
('PWR-A2', (SELECT id FROM socket_type WHERE label = 'Prise Électrique'), (SELECT id FROM room WHERE name = 'Amphi A')),
('HDMI-01', (SELECT id FROM socket_type WHERE label = 'HDMI'), (SELECT id FROM room WHERE name = 'Amphi A')),
('PWR-B1', (SELECT id FROM socket_type WHERE label = 'Prise Électrique'), (SELECT id FROM room WHERE name = 'Bibliothèque')),
('PWR-B2', (SELECT id FROM socket_type WHERE label = 'Prise Électrique'), (SELECT id FROM room WHERE name = 'Bibliothèque')),
('ETH-L1', (SELECT id FROM socket_type WHERE label = 'Réseau (RJ45)'), (SELECT id FROM room WHERE name = 'Labo Info 1')),
('ETH-L2', (SELECT id FROM socket_type WHERE label = 'Réseau (RJ45)'), (SELECT id FROM room WHERE name = 'Labo Info 1')),
('ETH-NET-1', (SELECT id FROM socket_type WHERE label = 'Réseau (RJ45)'), (SELECT id FROM room WHERE name = 'Labo Réseau')),
('ETH-NET-2', (SELECT id FROM socket_type WHERE label = 'Réseau (RJ45)'), (SELECT id FROM room WHERE name = 'Labo Réseau')),
('FIBRE-BACK', (SELECT id FROM socket_type WHERE label = 'Fibre'), (SELECT id FROM room WHERE name = 'Local Serveur'))
ON CONFLICT DO NOTHING;

