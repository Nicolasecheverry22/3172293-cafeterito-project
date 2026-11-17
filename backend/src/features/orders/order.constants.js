// Estados de una orden. Deben coincidir con el CHECK chk_orders_status de la BD (0037).
export const ORDER_STATUSES = ["activa", "lista para entrega", "pagada", "cancelada"];

// Estados "abiertos": cuentan para la regla de una orden por mesa (uq_orders_active_table)
export const OPEN_ORDER_STATUSES = ["activa", "lista para entrega"];

// Estados finales: la orden ya no se puede modificar ni anular (RFADMIN28/29)
export const FINAL_ORDER_STATUSES = ["pagada", "cancelada"];

// Matriz de transiciones permitidas (estado actual → estados destino).
// Mantener el mismo estado siempre está permitido mientras la orden esté abierta.
export const ORDER_TRANSITIONS = {
  activa: ["activa", "lista para entrega", "pagada", "cancelada"],
  "lista para entrega": ["lista para entrega", "activa", "pagada", "cancelada"],
  pagada: [],
  cancelada: [],
};
