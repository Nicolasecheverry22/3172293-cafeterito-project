import { providerRepository } from "./provider.repository.js";

// La entrada llega validada y normalizada por provider.schema.js (validate middleware).
export const providerService = {
  async create(data) {
    return await providerRepository.create(data);
  },
  async getAll() {
    return await providerRepository.getAll();
  },
  async getById(id) {
    return await providerRepository.getById(id);
  },
  async update(id, data) {
    return await providerRepository.update(id, data);
  },
  async remove(id) {
    return await providerRepository.remove(id);
  },
  async getReportData(nit) {
    return await providerRepository.getReportData(nit);
  },
};
