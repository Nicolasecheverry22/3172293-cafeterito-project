import { providerService } from "./provider.service.js";

// Los errores (httpError o de BD) se propagan al middleware global de errores.
export const providerController = {
  async create(req, res) {
    const provider = await providerService.create(req.body);
    res.status(201).json({
      message: "Proveedor creado correctamente",
      providerId: provider.id,
    });
  },

  async getAll(req, res) {
    res.json(await providerService.getAll());
  },

  async getById(req, res) {
    const provider = await providerService.getById(Number(req.params.id));
    if (!provider) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }
    res.json(provider);
  },

  async getReportData(req, res) {
    const { nit } = req.query;
    res.json(await providerService.getReportData(nit));
  },

  async update(req, res) {
    const updated = await providerService.update(Number(req.params.id), req.body);
    if (!updated) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }
    res.json({ message: "Proveedor actualizado correctamente", providerId: updated.id });
  },

  async remove(req, res) {
    const deleted = await providerService.remove(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }
    res.json({ message: "Proveedor eliminado correctamente", providerId: deleted.id });
  },
};
