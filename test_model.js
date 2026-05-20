const { Room } = require('./front/src/app/models/room.model');
const { Staff } = require('./front/src/app/models/staff.model');
const { Equipment } = require('./front/src/app/models/equipment.model');
const { Socket } = require('./front/src/app/models/socket.model');

// Simulate the data returned by the API
const roomData = {
  id: "735cde58-2713-40c8-a4fc-cde9310da9e3",
  name: "Salle Réunion",
  max_capacity: 15,
  room_type_id: "15f06dcb-1a27-4f16-bec1-1795380883a2",
  doors: 1,
  floor: 2,
  coordinates: { x: 250, y: 50, width: 120, height: 80 },
  color: "#1abc9c",
  room_type_label: "Réunion",
  staff: null,
  equipments: [
    {
      id: "c2288119-6fde-488f-80c2-a9e01a7a4f85",
      name: "Vidéoprojecteur Mobile",
      serial_number: "MOB-01",
      equipment_type_id: "5bd61549-9301-43ed-8927-3deeda7b4a02",
      equipment_type_label: "Vidéoprojecteur"
    }
  ],
  sockets: null
};

try {
  console.log("Attempting to parse room data...");
  const room = new Room(roomData);
  console.log("Successfully parsed room data:", room);
} catch (err) {
  console.error("Error during parsing:", err);
}
