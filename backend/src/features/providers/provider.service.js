import { providerRepository } from "./provider.repository.js";

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
    const payload = {
      nit: requireText(data.nit, "NIT"),
      providerName: requireText(data.providerName, "nombre"),
      providerEmail: requireText(data.providerEmail, "correo"),
      providerPhone: requireText(data.providerPhone, "teléfono"),
      providerAddress: requireText(data.providerAddress, "dirección"),
      productService: requireText(data.productService, "productos/servicios"),
      isActive: Boolean(data.isActive),
    };
    return await providerRepository.update(id, payload);
  },
  async remove(id) {
    return await providerRepository.remove(id);
  },
};
