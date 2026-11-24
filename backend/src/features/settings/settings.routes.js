import { Router } from "express";
import { settingsController } from "./settings.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";
import { updateSettingsSchema } from "./settings.schema.js";

// Montado en app.js bajo /api/settings con authenticateToken + loadPermissions.
// Leer: cualquier usuario (el mesero necesita el total de mesas). Modificar: change_settings.
const router = Router();

router.get("/", settingsController.get);
router.put(
  "/",
  requirePermission("change_settings"),
  validate({ body: updateSettingsSchema }),
  settingsController.update
);

export default router;
