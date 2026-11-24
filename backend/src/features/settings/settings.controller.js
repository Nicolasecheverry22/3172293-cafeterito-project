import { settingsService } from "./settings.service.js";

// Los errores (httpError o de BD) los atiende el middleware global (Express 5).
export const settingsController = {
  async get(req, res) {
    res.json(await settingsService.get());
  },

  async update(req, res) {
    const settings = await settingsService.update(req.body, req.user.id);
    res.json({ message: "Configuración actualizada", settings });
  },
};
