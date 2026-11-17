import { Router } from "express";
import { productController } from "./product.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { idParam } from "../../utils/joi.js";
import { productSchema, productStatusSchema, productReportQuery, productListQuery } from "./product.schema.js";

// Montado en app.js bajo /api/products con authenticateToken.
// GET /api/products/top-selling es público y se registra directamente en app.js.
const router = Router();

router.get("/", validate({ query: productListQuery }), productController.getAll);
router.get("/report-data", validate({ query: productReportQuery }), productController.getReportData);
router.get("/:id", validate({ params: idParam }), productController.getById);
router.post("/", validate({ body: productSchema }), productController.create);
router.put("/:id", validate({ params: idParam, body: productSchema }), productController.update);
// Sin borrado físico: solo habilitar/inhabilitar (RFADMIN24)
router.patch("/:id/status", validate({ params: idParam, body: productStatusSchema }), productController.updateStatus);

export default router;
