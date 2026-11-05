import { Router } from "express";
import { inventoryController } from "./inventory.controller.js";

const router = Router();

router.get("/", inventoryController.getAll);
router.get("/:id", inventoryController.getById);
router.post("/", inventoryController.create);
router.delete("/:id", inventoryController.remove);

export default router;
