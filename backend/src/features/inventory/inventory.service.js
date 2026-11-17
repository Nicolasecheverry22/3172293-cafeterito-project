import { inventoryRepository } from "./inventory.repository.js";

// La entrada llega validada y normalizada por inventory.schema.js (validate middleware).
export const inventoryService = {
  async create(data) {
    return await inventoryRepository.create(data);
  },
  async getAll() {
    return await inventoryRepository.getAll();
  },
  async getById(id) {
    return await inventoryRepository.getById(id);
  },
  async update(id, data) {
    return await inventoryRepository.update(id, data);
  },
  async remove(id) {
    return await inventoryRepository.remove(id);
  },
  async getReportData(category, status) {
    return await inventoryRepository.getReportData(category, status);
  },
};
