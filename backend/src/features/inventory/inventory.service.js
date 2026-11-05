import { inventoryRepository } from "./inventory.repository.js";

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
  async remove(id) {
    return await inventoryRepository.remove(id);
  },
};
