// El controlador no implementa lógica de negocio: delega en el service.
// Los errores (httpError o de BD) se propagan al middleware global de errores.
import { userService } from "./user.service.js";
import { httpError } from "../../utils/httpError.js";

// Mensaje específico para correo/documento repetidos (unique_violation)
const translateUserError = (err) =>
  err.code === "23505"
    ? httpError(409, "Ya existe un usuario con ese correo o número de documento")
    : err;

export const userController = {
  async create(req, res) {
    try {
      const user = await userService.createUser(req.body);
      // Solo se retorna el id: no se expone información sensible
      res.status(201).json({ message: "Usuario creado correctamente", userId: user.id });
    } catch (err) {
      throw translateUserError(err);
    }
  },

  async getAll(req, res) {
    res.json(await userService.getAll());
  },

  async getById(req, res) {
    const user = await userService.getById(Number(req.params.id));
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(user);
  },

  async getReportData(req, res) {
    const { document } = req.query;
    res.json(await userService.getReportData(document));
  },

  async update(req, res) {
    try {
      const updated = await userService.updateUser(Number(req.params.id), req.body);
      if (!updated) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      res.json({ message: "Usuario actualizado correctamente", userId: updated.id });
    } catch (err) {
      throw translateUserError(err);
    }
  },

  // PATCH /api/users/:id/status  { isActive }
  async updateStatus(req, res) {
    const updated = await userService.setStatus(Number(req.params.id), req.body.isActive, req.user.id);
    if (!updated) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json({
      message: updated.is_active ? "Usuario habilitado correctamente" : "Usuario deshabilitado correctamente",
      userId: updated.id,
      isActive: updated.is_active,
    });
  },

  // Permisos del usuario (directos + heredados de grupos)
  async getPermissions(req, res) {
    res.json(await userService.getPermissions(Number(req.params.id)));
  },

  // Reemplaza los permisos directos del usuario
  async updatePermissions(req, res) {
    const { permissionIds } = req.body;
    await userService.updatePermissions(Number(req.params.id), permissionIds);
    res.json({ message: "Permisos actualizados correctamente" });
  },
};
