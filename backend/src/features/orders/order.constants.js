// Estados de una orden. Deben coincidir con el CHECK chk_orders_status de la BD (0037).
export const ORDER_STATUSES = ["activa", "lista para entrega", "pagada", "cancelada"];

// Estados "abiertos": cuentan para la regla de una orden por mesa (uq_orders_active_table)
export const OPEN_ORDER_STATUSES = ["activa", "lista para entrega"];
