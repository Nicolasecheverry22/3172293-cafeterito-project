import { productRepository } from "./product.repository.js";

const httpError = (statusCode, message) =>
  Object.assign(new Error(message), { statusCode });

const requireText = (value, field) => {
  if (typeof value !== "string" || value.trim() === "") {
    throw httpError(400, `El campo ${field} es obligatorio`);
  }
  return value.trim();
};

const requireNumber = (value, field, { min = 0, integer = false } = {}) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || (integer && !Number.isInteger(n))) {
    throw httpError(400, `El campo ${field} no es válido`);
  }
  return n;
};

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
  async update(id, data) {
    const payload = {
      productName: requireText(data.productName, "nombre"),
      category: requireText(data.category, "categoría"),
      price: requireNumber(data.price, "precio", { min: 0.01 }),
      description: typeof data.description === "string" ? data.description.trim() : null,
      isAvailable: Boolean(data.isAvailable),
    };
    return await productRepository.update(id, payload);
  },
  async remove(id) {
    return await productRepository.remove(id);
  },
};
