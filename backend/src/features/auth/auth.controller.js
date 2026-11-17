// Endpoints de autenticación. Los errores se propagan al middleware global.
import { authService } from "./auth.service.js";

export const authController = {
  async login(req, res) {
    const result = await authService.login(req.body);
    res.status(200).json({ message: "Login exitoso", ...result });
  },

  // Requiere token válido (authenticateToken); devuelve uno nuevo de JWT_EXPIRES
  async refresh(req, res) {
    res.json(authService.refresh(req.user));
  },

  async forgotPassword(req, res) {
    res.json(await authService.forgotPassword(req.body));
  },

  async verifyResetToken(req, res) {
    res.json(await authService.verifyResetToken(req.body));
  },

  async resetPassword(req, res) {
    res.json(await authService.resetPassword(req.body));
  },
};
