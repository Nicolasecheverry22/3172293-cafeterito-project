import { inventoryRepository } from "./inventory.repository.js";
import { providerRepository } from "../providers/provider.repository.js";
import { httpError } from "../../utils/httpError.js";

// RFADMIN18: no se puede asignar un proveedor inactivo a un insumo.
// En una edición solo se valida si el proveedor CAMBIA, para no bloquear la edición
// de un insumo cuyo proveedor fue inhabilitado después de asignarlo.
async function assertProviderAssignable(providerId, currentProviderId = null) {
  if (providerId == null || providerId === currentProviderId) return;
  const provider = await providerRepository.getById(providerId);
  if (!provider) throw httpError(400, "El proveedor seleccionado no existe");
  if (!provider.is_active) {
    throw httpError(400, "No se puede asignar un proveedor inactivo al insumo");
  }
}

// La entrada llega validada y normalizada por inventory.schema.js (validate middleware).
export const inventoryService = {
  async create(data) {
    await assertProviderAssignable(data.providerId);
    return await inventoryRepository.create(data);
  },
  async getAll() {
    return await inventoryRepository.getAll();
  },
  async getById(id) {
    return await inventoryRepository.getById(id);
  },
  async update(id, data) {
    const current = await inventoryRepository.getById(id);
    if (!current) return undefined;
    await assertProviderAssignable(data.providerId, current.providerId);
    return await inventoryRepository.update(id, data);
  },
  // Cambio de estado (no hay borrado físico)
  async setStatus(id, status) {
    return await inventoryRepository.setStatus(id, status);
  },
  async getReportData(category, status) {
    return await inventoryRepository.getReportData(category, status);
  },
};
