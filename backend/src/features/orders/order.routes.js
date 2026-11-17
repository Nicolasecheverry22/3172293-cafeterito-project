import { Router } from "express";
import { orderController } from "./order.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { idParam } from "../../utils/joi.js";
import { createOrderSchema, updateOrderSchema, orderReportQuery } from "./order.schema.js";

// Montado en app.js bajo /api/orders con authenticateToken.
const router = Router();

router.get("/", orderController.getAll);
router.get("/report-data", validate({ query: orderReportQuery }), orderController.getReportData);
router.get("/:id", validate({ params: idParam }), orderController.getById);
router.post("/", validate({ body: createOrderSchema }), orderController.create);
router.put("/:id", validate({ params: idParam, body: updateOrderSchema }), orderController.update);
router.delete("/:id", validate({ params: idParam }), orderController.remove);

export default router;
