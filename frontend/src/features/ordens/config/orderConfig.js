// Configuración del registro de órdenes.
// Número de mesas del restaurante: se define en frontend/.env (VITE_TABLE_COUNT).
const parsedTables = Number.parseInt(import.meta.env.VITE_TABLE_COUNT, 10);
export const TABLE_COUNT = Number.isInteger(parsedTables) && parsedTables > 0 ? parsedTables : 12;

// Cada cuánto se refresca la disponibilidad de mesas (ms)
export const TABLES_REFRESH_MS = 30_000;

// Tope por platillo en una misma orden (evita errores de digitación)
export const MAX_QTY_PER_DISH = 99;

export const ALL_CATEGORIES = "Todas";
