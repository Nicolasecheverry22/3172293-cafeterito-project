import { dashboardService } from "./dashboard.service.js";

export const dashboardController = {
  // GET /api/dashboard — solo las secciones que el usuario puede ver (ver dashboard.service.js)
  async get(req, res) {
    res.set("Cache-Control", "no-store");
    res.json(await dashboardService.getDashboard(req.user.id, req.auth));
  },
};
