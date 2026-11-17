// Endpoints de autenticación. Los errores se propagan al middleware global.
import { authService } from "./auth.service.js";

export const authController = {
  async login(req, res) {
    const result = await authService.login(req.body);
    res.status(200).json({ message: "Login exitoso", ...result });
  },
};
