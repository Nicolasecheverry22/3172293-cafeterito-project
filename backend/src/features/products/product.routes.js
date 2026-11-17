import { Router } from "express";
import { productController } from "./product.controller.js";

// Montado en app.js bajo /api/products con authenticateToken.
// GET /api/products/top-selling es público y se registra directamente en app.js.
const router = Router();

router.get("/", productController.getAll);
router.get("/report-data", productController.getReportData);
router.get("/:id", productController.getById);
router.post("/", productController.create);
router.put("/:id", productController.update);
router.delete("/:id", productController.remove);

export default router;
