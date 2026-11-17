import { inventoryService } from "./inventory.service.js";

// Los errores (httpError o de BD) se propagan al middleware global de errores.
export const inventoryController = {
  async create(req, res) {
    const item = await inventoryService.create(req.body);
    res.status(201).json({
      message: "Suministro creado correctamente",
      inventoryId: item.id,
    });
  },

  async getAll(req, res) {
    res.json(await inventoryService.getAll());
  },

  async getById(req, res) {
    const item = await inventoryService.getById(Number(req.params.id));
    if (!item) {
      return res.status(404).json({ error: "Suministro no encontrado" });
    }
    res.json(item);
  },

  async getReportData(req, res) {
    const { category, status } = req.query;
    res.json(await inventoryService.getReportData(category, status));
  },

  async update(req, res) {
    const updated = await inventoryService.update(Number(req.params.id), req.body);
    if (!updated) {
      return res.status(404).json({ error: "Suministro no encontrado" });
    }
    res.json({ message: "Suministro actualizado correctamente", inventoryId: updated.id });
  },

  async remove(req, res) {
    const deleted = await inventoryService.remove(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: "Suministro no encontrado" });
    }
    res.json({ message: "Suministro eliminado correctamente", inventoryId: deleted.id });
  },
};
