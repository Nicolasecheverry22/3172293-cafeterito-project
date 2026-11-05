import { providerRepository } from "./provider.repository.js";

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
  async remove(id) {
    return await providerRepository.remove(id);
  },
};
