import { Router } from "express";
import { productController } from "./product.controller.js";

const router = Router();

router.get("/", productController.getAll);
router.get("/top-selling", productController.getTopSelling); 
router.get("/report-data", productController.getReportData);
router.get("/:id", productController.getById);
router.post("/", productController.create);
router.put("/:id", productController.update);
router.delete("/:id", productController.remove);

export default router;