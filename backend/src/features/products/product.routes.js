import { Router } from "express";
import { productController } from "./product.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";
import { idParam } from "../../utils/joi.js";
import {
  productSchema, updateProductSchema, productStatusSchema, productReportQuery, productListQuery,
} from "./product.schema.js";

// Montado en app.js bajo /api/products con authenticateToken + loadPermissions.
// GET /api/products/top-selling es público y se registra directamente en app.js.
const router = Router();

router.get("/", requirePermission("list_product"), validate({ query: productListQuery }), productController.getAll);
router.get("/report-data", requirePermission("report_product"), validate({ query: productReportQuery }), productController.getReportData);
router.get("/:id", requirePermission("view_product"), validate({ params: idParam }), productController.getById);
router.post("/", requirePermission("create_product"), validate({ body: productSchema }), productController.create);
router.put("/:id", requirePermission("update_product"), validate({ params: idParam, body: updateProductSchema }), productController.update);
// Sin borrado físico: solo habilitar/inhabilitar (RFADMIN24)
router.patch("/:id/status", requirePermission("disable_product"), validate({ params: idParam, body: productStatusSchema }), productController.updateStatus);

export default router;
