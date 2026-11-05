import { productRepository } from "./product.repository.js";

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
  async remove(id) {
    return await productRepository.remove(id);
  },
};
