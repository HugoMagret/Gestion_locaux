const { z } = require('zod');

const userSchema = z.object({
  login: z.string().min(3, "Le login doit contenir au moins 3 caractères"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  is_admin: z.boolean().optional(),
});

const userUpdateSchema = z.object({
  login: z.string().min(3, "Le login doit contenir au moins 3 caractères"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").or(z.string().length(0).optional()), // allow empty password if not changing
  is_admin: z.boolean().optional(),
});

const roomTypeSchema = z.object({
  label: z.string().min(1, "Le libellé est obligatoire"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur hexadécimale invalide").optional()
});

const equipmentTypeSchema = z.object({
  label: z.string().min(1, "Le libellé est obligatoire")
});

const socketTypeSchema = z.object({
  label: z.string().min(1, "Le libellé est obligatoire")
});

const staffSchema = z.object({
  first_name: z.string().min(1, "Le prénom est obligatoire"),
  last_name: z.string().min(1, "Le nom est obligatoire"),
  email: z.string().email("Email invalide").optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  room_id: z.string().uuid("ID de salle invalide").optional().nullable()
});

const equipmentSchema = z.object({
  name: z.string().min(1, "Le nom est obligatoire"),
  serial_number: z.string().optional().or(z.literal('')),
  equipment_type_id: z.string().uuid("ID de type d'équipement invalide").optional().nullable(),
  room_id: z.string().uuid("ID de salle invalide").optional().nullable()
});

const socketSchema = z.object({
  identifier: z.string().min(1, "L'identifiant est obligatoire"),
  socket_type_id: z.string().uuid("ID de type de prise invalide").optional().nullable(),
  room_id: z.string().uuid("ID de salle invalide").optional().nullable()
});

const roomSchema = z.object({
  name: z.string().min(1, "Le nom est obligatoire"),
  max_capacity: z.number().int().nonnegative().optional().nullable(),
  room_type_id: z.string().uuid("ID de type de salle invalide").optional().nullable(),
  doors: z.number().int().nonnegative().optional().nullable(),
  floor: z.number().int().optional().nullable(),
  coordinates: z.any().optional().nullable() // JSONB
});

module.exports = {
  userSchema,
  userUpdateSchema,
  roomTypeSchema,
  equipmentTypeSchema,
  socketTypeSchema,
  staffSchema,
  equipmentSchema,
  socketSchema,
  roomSchema
};
