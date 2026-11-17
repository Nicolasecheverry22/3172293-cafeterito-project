import { inventoryService } from "./inventory.service.js";
import { withConstraintErrors } from "../../utils/constraintErrors.js";

const withInventoryErrors = withConstraintErrors({
  uq_inventory_barcode: [409, "Ya existe un insumo con ese código de barras"],
  uq_inventory_name_batch: [409, "Ese lote ya está registrado para este insumo"],
  fk_inventory_provider: [400, "El proveedor seleccionado no existe"],
});

// Los errores (httpError o de BD) se propagan al middleware global de errores.
export const inventoryController = {
  create: withInventoryErrors(async (req, res) => {
    const item = await inventoryService.create(req.body);
    res.status(201).json({
      message: "Suministro creado correctamente",
      inventoryId: item.id,
    });
  }),

  getAll: withInventoryErrors(async (req, res) => {
    res.json(await inventoryService.getAll());
  }),

  getById: withInventoryErrors(async (req, res) => {
    const item = await inventoryService.getById(Number(req.params.id));
    if (!item) {
      return res.status(404).json({ error: "Suministro no encontrado" });
    }
    res.json(item);
  }),

  getReportData: withInventoryErrors(async (req, res) => {
    const { category, status } = req.query;
    res.json(await inventoryService.getReportData(category, status));
  }),

  update: withInventoryErrors(async (req, res) => {
    const updated = await inventoryService.update(Number(req.params.id), req.body);
    if (!updated) {
      return res.status(404).json({ error: "Suministro no encontrado" });
    }
    res.json({ message: "Suministro actualizado correctamente", inventoryId: updated.id });
  }),

  // PATCH /api/inventory/:id/status  { status }
  updateStatus: withInventoryErrors(async (req, res) => {
    const updated = await inventoryService.setStatus(Number(req.params.id), req.body.status);
    if (!updated) {
      return res.status(404).json({ error: "Suministro no encontrado" });
    }
    res.json({
      message: "Estado del suministro actualizado correctamente",
      inventoryId: updated.id,
      status: updated.status,
    });
  }),
};
