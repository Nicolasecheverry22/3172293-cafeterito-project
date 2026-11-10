import { inventoryRepository } from "./inventory.repository.js";

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
    const payload = {
      provisionName: requireText(data.provisionName, "nombre"),
      category: requireText(data.category, "categoría"),
      unit: requireText(data.unit, "unidad"),
      stock: requireNumber(data.stock, "stock", { integer: true }),
      price: requireNumber(data.price, "precio", { min: 0.01 }),
      batch: requireText(data.batch, "lote"),
      minStock: requireNumber(data.minStock, "stock mínimo", { integer: true }),
      maxStock: requireNumber(data.maxStock, "stock máximo", { integer: true }),
      status: requireText(data.status, "estado"),
    };
    if (payload.maxStock < payload.minStock) {
      throw httpError(400, "El stock máximo no puede ser inferior al stock mínimo");
    }
    return await inventoryRepository.update(id, payload);
  },
  async remove(id) {
    return await inventoryRepository.remove(id);
  },

  async getReportData(category, status) {
    return await inventoryRepository.getReportData(category, status);
  }
};
