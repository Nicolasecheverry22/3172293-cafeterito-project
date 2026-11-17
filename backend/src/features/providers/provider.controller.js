import { providerService } from "./provider.service.js";
import { withConstraintErrors } from "../../utils/constraintErrors.js";

const withProviderErrors = withConstraintErrors({
  uq_providers_nit: [409, "Ya existe un proveedor con ese número de documento"],
  fk_inventory_provider: [409, "No se puede eliminar un proveedor con insumos asociados"],
});

// Los errores (httpError o de BD) se propagan al middleware global de errores.
export const providerController = {
  create: withProviderErrors(async (req, res) => {
    const provider = await providerService.create(req.body);
    res.status(201).json({
      message: "Proveedor creado correctamente",
      providerId: provider.id,
    });
  }),

  getAll: withProviderErrors(async (req, res) => {
    res.json(await providerService.getAll());
  }),

  getById: withProviderErrors(async (req, res) => {
    const provider = await providerService.getById(Number(req.params.id));
    if (!provider) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }
    res.json(provider);
  }),

  getReportData: withProviderErrors(async (req, res) => {
    const { nit } = req.query;
    res.json(await providerService.getReportData(nit));
  }),

  update: withProviderErrors(async (req, res) => {
    const updated = await providerService.update(Number(req.params.id), req.body);
    if (!updated) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }
    res.json({ message: "Proveedor actualizado correctamente", providerId: updated.id });
  }),

  remove: withProviderErrors(async (req, res) => {
    const deleted = await providerService.remove(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }
    res.json({ message: "Proveedor eliminado correctamente", providerId: deleted.id });
  }),
};
