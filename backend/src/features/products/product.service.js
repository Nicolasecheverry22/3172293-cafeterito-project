import { productRepository } from "./product.repository.js";
import { httpError } from "../../utils/httpError.js";

// RFADMIN24: no se puede inhabilitar un platillo que está en una orden abierta.
async function assertCanDisable(id) {
  if (await productRepository.isInOpenOrder(id)) {
    throw httpError(
      409,
      "No se puede inhabilitar el platillo: está incluido en una orden abierta (activa o lista para entrega)"
    );
  }
}

// La entrada llega validada y normalizada por product.schema.js (validate middleware).
export const productService = {
  async create(data) {
    return await productRepository.create(data);
  },
  async getAll() {
    return await productRepository.getAll();
  },
  async getById(id) {
    return await productRepository.getById(id);
  },
  async getReportData(category) {
    return await productRepository.getReportData(category);
  },
  async update(id, data) {
    if (data.isAvailable === false) {
      const current = await productRepository.getById(id);
      if (!current) return undefined;
      if (current.isAvailable) await assertCanDisable(id);
    }
    return await productRepository.update(id, data);
  },
  // Habilitar/inhabilitar (no hay borrado físico)
  async setAvailability(id, isAvailable) {
    const current = await productRepository.getById(id);
    if (!current) return undefined;
    if (!isAvailable && current.isAvailable) await assertCanDisable(id);
    return await productRepository.setAvailability(id, isAvailable);
  },
  async getTopSelling() {
    return await productRepository.getTopSelling();
  },
};
