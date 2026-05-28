const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { verifyAdmin } = require('../middleware/auth.middleware');
const { jsPDF } = require('jspdf');

// POST import full floor (Monolithic JSON)
router.post('/import', verifyAdmin, async (req, res) => {
  const floorData = req.body;
  if (!floorData || !floorData.level || !Array.isArray(floorData.rooms) || !Array.isArray(floorData.doors)) {
    return res.status(400).json({ success: false, message: 'Format JSON invalide' });
  }

  try {
    // We use Prisma $transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // 1. Delete existing rooms and doors for this floor
      await tx.room.deleteMany({ where: { floor: floorData.level } });
      await tx.door.deleteMany({ where: { floor: floorData.level } });

      // 2. Insert rooms
      for (const room of floorData.rooms) {
        // Find room type by label or create it if missing
        let roomType = null;
        if (room.room_type_label) {
          roomType = await tx.roomType.findUnique({
            where: { label: room.room_type_label }
          });
          if (!roomType) {
             // Create on the fly with default color
             roomType = await tx.roomType.create({
               data: { 
                 label: room.room_type_label, 
                 color: room.color || '#3498db' 
               }
             });
          }
        }

        await tx.room.create({
          data: {
            name: room.name,
            floor: floorData.level,
            max_capacity: room.max_capacity || null,
            room_type_id: roomType ? roomType.id : null,
            doors: room.doors_count || 1,
            coordinates: room.coordinates
          }
        });
      }

      // 3. Insert doors
      for (const door of floorData.doors) {
        await tx.door.create({
          data: {
            floor: floorData.level,
            coordinates: door.coordinates
          }
        });
      }
    });

    res.status(201).json({ success: true, message: 'Étage importé avec succès (Transaction réussie)' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur lors de l\'import: ' + err.message });
  }
});

// PUT /api/floors/:level
// Met à jour le contenu JSON d'un étage sans casser les identifiants existants
router.put('/:level', async (req, res) => {
  const level = parseInt(req.params.level);
  const { rooms, doors } = req.body;

  if (isNaN(level)) {
    return res.status(400).json({ error: "Niveau d'étage invalide" });
  }

  if (!Array.isArray(rooms)) {
    return res.status(400).json({ error: 'Format invalide : rooms doit être un tableau' });
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const r of rooms) {
        let roomTypeId = r.room_type_id;
        if (roomTypeId === '' || roomTypeId === undefined) {
          roomTypeId = null;
        }

        const roomCoordinates = r.coordinates || { x: 0, y: 0, width: 100, height: 100 };
        const doorsCount = r.doors !== undefined ? r.doors : 1;

        if (r.id) {
          await tx.room.update({
            where: { id: r.id },
            data: {
              name: r.name,
              max_capacity: r.max_capacity !== undefined ? r.max_capacity : null,
              room_type_id: roomTypeId,
              doors: doorsCount,
              floor: level,
              coordinates: roomCoordinates
            }
          });
        } else {
          await tx.room.create({
            data: {
              name: r.name,
              max_capacity: r.max_capacity !== undefined ? r.max_capacity : null,
              room_type_id: roomTypeId,
              doors: doorsCount,
              floor: level,
              coordinates: roomCoordinates
            }
          });
        }
      }

      if (Array.isArray(doors)) {
        for (const d of doors) {
          const doorCoordinates = d.coordinates || d;
          const doorFloor = d.floor !== undefined ? d.floor : level;

          if (d.id) {
            await tx.door.update({
              where: { id: d.id },
              data: {
                floor: doorFloor,
                coordinates: doorCoordinates
              }
            });
          } else {
            await tx.door.create({
              data: {
                floor: doorFloor,
                coordinates: doorCoordinates
              }
            });
          }
        }
      }
    });

    res.json({ success: true, message: `Étage ${level} mis à jour avec succès` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/floors/:level/pdf
// Génère un PDF complet pour un étage (plan visuel + rapport détaillé)
router.get('/:level/pdf', async (req, res) => {
  const level = parseInt(req.params.level);
  if (isNaN(level)) {
    return res.status(400).json({ error: "Niveau d'étage invalide" });
  }

  try {
    // 1. Récupération des portes pour cet étage
    const doors = await prisma.door.findMany({
      where: { floor: level }
    });

    // 2. Récupération des salles avec toutes leurs relations
    const rooms = await prisma.room.findMany({
      where: { floor: level },
      include: {
        roomType: true,
        staff: true,
        equipments: {
          include: {
            equipmentType: true
          }
        },
        sockets: {
          include: {
            socketType: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // 3. Initialisation du document PDF avec jsPDF
    const doc = new jsPDF({
      orientation: 'l',
      unit: 'mm',
      format: 'a4'
    });

    const floorName = level === 0 ? 'Rez-de-chaussée (RDC)' : `Étage ${level}`;
    const dateStr = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

    // PAGE 1: PLAN VISUEL
    // Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 297, 30, 'F');

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(`PLAN DE L'ÉTAGE : ${floorName.toUpperCase()}`, 20, 18);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(203, 213, 225);
    doc.text(`Gestion des Locaux - Généré le ${dateStr}`, 20, 24);

    if (rooms.length === 0) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text("Aucune salle définie pour cet étage.", 20, 70);
    } else {
      // Échelle et marges pour centrer le plan SVG
      const scale = 257 / 1800;
      const startX = 20;
      const startY = 45;

      // Dessin des salles
      rooms.forEach(room => {
        let coords = room.coordinates;
        if (typeof coords === 'string') {
          try {
            coords = JSON.parse(coords);
          } catch (e) {
            coords = null;
          }
        }
        if (!coords) return;

        const rx = startX + (coords.x || 0) * scale;
        const ry = startY + (coords.y || 0) * scale;
        const rw = (coords.width || 100) * scale;
        const rh = (coords.height || 100) * scale;

        // Choix de la couleur
        const color = room.roomType?.color || '#3498db';
        let rColor = 52, gColor = 152, bColor = 219;
        if (color && color.startsWith('#')) {
          rColor = parseInt(color.slice(1, 3), 16) || 52;
          gColor = parseInt(color.slice(3, 5), 16) || 152;
          bColor = parseInt(color.slice(5, 7), 16) || 219;
        }

        // Remplissage de la salle
        doc.setFillColor(rColor, gColor, bColor);
        doc.rect(rx, ry, rw, rh, 'F');

        // Bordure de la salle
        doc.setDrawColor(71, 85, 105);
        doc.setLineWidth(0.3);
        doc.rect(rx, ry, rw, rh, 'D');

        // Libellé de la salle au centre
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text(room.name, rx + rw / 2, ry + rh / 2, { align: 'center', baseline: 'middle' });
      });

      // Dessin des portes
      doors.forEach(door => {
        let coords = door.coordinates;
        if (typeof coords === 'string') {
          try {
            coords = JSON.parse(coords);
          } catch (e) {
            coords = null;
          }
        }
        if (!coords) return;

        const dx = startX + (coords.x || 0) * scale;
        const dy = startY + (coords.y || 0) * scale;
        const dw = (coords.width || 10) * scale;
        const dh = (coords.height || 20) * scale;

        // Porte (orange)
        doc.setFillColor(217, 119, 6);
        doc.rect(dx, dy, dw, dh, 'F');

        // Bordure porte
        doc.setDrawColor(180, 83, 9);
        doc.setLineWidth(0.2);
        doc.rect(dx, dy, dw, dh, 'D');
      });
    }

    // PAGE 2 ET SUIVANTES: RAPPORT DÉTAILLÉ
    doc.addPage();

    let yPos = 35;
    const margin = 20;
    const pageHeight = 210;

    const checkPageOverflow = (neededHeight) => {
      if (yPos + neededHeight > pageHeight - margin) {
        doc.addPage();
        drawPageHeader();
        yPos = 35;
      }
    };

    const drawPageHeader = () => {
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 297, 20, 'F');
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(`ÉTAT DÉTAILLÉ DE L'ÉTAGE : ${floorName.toUpperCase()}`, margin, 13);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(203, 213, 225);
      doc.text(`Généré le ${dateStr}`, 297 - margin - 50, 13);
    };

    drawPageHeader();

    if (rooms.length === 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Aucun local enregistré à cet étage.", margin, yPos);
    } else {
      rooms.forEach((room, index) => {
        const staffCount = room.staff ? room.staff.length : 0;
        const equipmentCount = room.equipments ? room.equipments.length : 0;
        const socketCount = room.sockets ? room.sockets.length : 0;

        const staffHeight = staffCount > 0 ? staffCount * 5 : 5;
        const equipmentHeight = equipmentCount > 0 ? equipmentCount * 5 : 5;
        const socketHeight = socketCount > 0 ? Math.ceil(socketCount / 6) * 5 : 0;

        const neededHeight = 12 + 6 + 5 + staffHeight + 5 + equipmentHeight + (socketHeight > 0 ? (5 + socketHeight) : 0) + 12;

        checkPageOverflow(neededHeight);

        // Titre de la salle
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(37, 99, 235); // bleu primaire
        doc.text(`${index + 1}. Salle ${room.name} (${room.roomType?.label || 'Local'})`, margin, yPos);
        yPos += 6;

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        doc.text(`Capacité maximale : ${room.max_capacity !== null ? room.max_capacity : 'N/A'} personnes    |    Accès directs (portes) : ${room.doors || 1}`, margin, yPos);
        yPos += 7;

        // Personnel affecté
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text("Enseignant-Chercheurs affectés :", margin, yPos);
        yPos += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        if (staffCount > 0) {
          room.staff.forEach((person) => {
            let info = "";
            if (person.email) info += ` - Email: ${person.email}`;
            if (person.phone) info += ` - Tél: ${person.phone}`;
            doc.text(`  • ${person.first_name} ${person.last_name}${info}`, margin, yPos);
            yPos += 5;
          });
        } else {
          doc.text("  • Aucun personnel affecté", margin, yPos);
          yPos += 5;
        }

        // Équipements affectés
        yPos += 1;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text("Matériels affectés :", margin, yPos);
        yPos += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        if (equipmentCount > 0) {
          room.equipments.forEach((eq) => {
            const sn = eq.serial_number ? ` (S/N: ${eq.serial_number})` : "";
            const typeLbl = eq.equipmentType?.label ? ` [${eq.equipmentType.label}]` : "";
            doc.text(`  • ${eq.name}${sn}${typeLbl}`, margin, yPos);
            yPos += 5;
          });
        } else {
          doc.text("  • Aucun matériel affecté", margin, yPos);
          yPos += 5;
        }

        // Prises & Connectiques
        if (socketCount > 0) {
          yPos += 1;
          doc.setFont("helvetica", "bold");
          doc.setTextColor(15, 23, 42);
          doc.text("Prises & Connectiques :", margin, yPos);
          yPos += 5;
          doc.setFont("helvetica", "normal");
          doc.setTextColor(71, 85, 105);
          
          const socketLabels = room.sockets.map((s) => `${s.identifier} (${s.socketType?.label || 'Prise'})`);
          for (let i = 0; i < socketLabels.length; i += 5) {
            const lineSlice = socketLabels.slice(i, i + 5).join(', ');
            doc.text(`  ${lineSlice}${i + 5 < socketLabels.length ? ',' : ''}`, margin, yPos);
            yPos += 5;
          }
        }

        // Séparateur entre salles
        yPos += 3;
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(0.2);
        doc.line(margin, yPos, 297 - margin, yPos);
        yPos += 8;
      });
    }

    const pdfBinaryString = doc.output();
    const pdfBuffer = Buffer.from(pdfBinaryString, 'binary');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Etat_Etage_${level === 0 ? 'RDC' : level}.pdf`);
    res.send(pdfBuffer);

  } catch (err) {
    console.error("Erreur lors de la génération du PDF:", err);
    res.status(500).json({ success: false, message: 'Erreur lors de la génération du PDF: ' + err.message });
  }
});


// DELETE /api/floors/:level
// Supprime un étage complet (salles et portes)
// router.delete('/:level', async (req, res) => {
router.delete('/:level', verifyAdmin, async (req, res) => {
  const level = parseInt(req.params.level);
  try {
    // Prisma will handle cascading deletes because of the @relation(onDelete: Cascade/SetNull)
    // But since Room deletes cascade to Sockets/Equipments, and SET NULL for Staff,
    // we just need to delete rooms and doors of that floor.
    await prisma.$transaction(async (tx) => {
      await tx.room.deleteMany({ where: { floor: level } });
      await tx.door.deleteMany({ where: { floor: level } });
    });
    
    res.json({ success: true, message: `Étage ${level} et toutes ses données associées ont été supprimés.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
