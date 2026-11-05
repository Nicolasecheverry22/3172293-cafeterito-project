import { Router } from "express";
import { providerController } from "./provider.controller.js";

const router = Router();

router.get("/", providerController.getAll);
router.get("/:id", providerController.getById);
router.post("/", providerController.create);
router.put("/:id", providerController.update);
router.delete("/:id", providerController.remove);

export default router;
