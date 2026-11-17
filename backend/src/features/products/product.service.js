import { productRepository } from "./product.repository.js";

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
    return await productRepository.update(id, data);
  },
  async remove(id) {
    return await productRepository.remove(id);
  },
  async getTopSelling() {
    return await productRepository.getTopSelling();
  },
};
