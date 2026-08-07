-- DropSlotUniqueConstraint
-- Permite reutilizar horarios de reservas completadas o canceladas.
-- La validación de solapamiento sigue en la capa de aplicación.

DROP INDEX IF EXISTS "reservas_cancha_id_fecha_inicio_fecha_fin_key";
