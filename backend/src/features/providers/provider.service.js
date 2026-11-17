import { providerRepository } from "./provider.repository.js";

// La entrada llega validada y normalizada por provider.schema.js (validate middleware).
export const providerService = {
  async create(data) {
    return await providerRepository.create(data);
  },
  // Listado con filtros opcionales y paginación opcional (ver utils/listQuery.js)
  async list(query) {
    return await providerRepository.list(query);
  },
  async getById(id) {
    return await providerRepository.getById(id);
  },
  async update(id, data) {
    return await providerRepository.update(id, data);
  },
  // Habilitar/inhabilitar (no hay borrado físico, RFADMIN17)
  async setStatus(id, isActive) {
    return await providerRepository.setStatus(id, isActive);
  },
  async getReportData(nit) {
    return await providerRepository.getReportData(nit);
  },
};
