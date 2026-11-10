import { providerService } from "./provider.service.js";

export const providerController = {
  async create(req, res) {
    try {
      const provider = await providerService.create(req.body);
      res.status(201).json({
        message: "Proveedor creado correctamente",
        providerId: provider.id,
      });
    } catch (err) {
      console.log("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getAll(req, res) {
    try {
      const providers = await providerService.getAll();
      res.json(providers);
    } catch (err) {
      console.log("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const provider = await providerService.getById(Number(req.params.id));
      if (!provider) {
        return res.status(404).json({ error: "Proveedor no encontrado" });
      }
      res.json(provider);
    } catch (err) {
      console.log("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getReportData(req, res) {
    try {
      const { nit } = req.query;
      const providers = await providerService.getReportData(nit);
      res.json(providers);
    } catch (err) {
      console.log("ERROR BACKEND REPORT:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const updated = await providerService.update(Number(req.params.id), req.body);
      if (!updated) {
        return res.status(404).json({ error: "Proveedor no encontrado" });
      }
      res.json({ message: "Proveedor actualizado correctamente", providerId: updated.id });
    } catch (err) {
      console.log("ERROR BACKEND:", err);
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const deleted = await providerService.remove(Number(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: "Proveedor no encontrado" });
      }
      res.json({
        message: "Proveedor eliminado correctamente",
        providerId: deleted.id,
      });
    } catch (err) {
      console.log("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },
};


