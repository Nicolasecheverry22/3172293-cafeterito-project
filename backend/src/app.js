// Configuración principal de Express: middlewares, rutas y manejo de errores.
import express from "express";
import cors from "cors";

import userRoutes from "./features/users/user.routes.js";
import authRoutes from "./features/auth/auth.routes.js";
import accessRoutes from "./features/access/access.routes.js";
import groupsRoutes from "./features/groups/groups.routes.js";
import permissionsRoutes from "./features/permissions/permissions.routes.js";
import productRoutes from "./features/products/product.routes.js";
import inventoryRoutes from "./features/inventory/inventory.routes.js";
import providerRoutes from "./features/providers/provider.routes.js";
import orderRoutes from "./features/orders/order.routes.js";
import { productController } from "./features/products/product.controller.js";

import { authenticateToken } from "./middlewares/auth.middleware.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";

const app = express();

// No anunciar la tecnología del servidor
app.disable("x-powered-by");

// Solo el frontend en desarrollo (Vite) puede consumir la API
app.use(cors({ origin: "http://localhost:5173" }));

app.use(express.json());

// ── Rutas públicas ──────────────────────────────────────────────
app.use("/api/auth", authRoutes);
// Productos más vendidos: los muestra el Home antes de iniciar sesión
app.get("/api/products/top-selling", productController.getTopSelling);

// ── Rutas privadas: todas exigen un JWT válido ──────────────────
app.use("/api/users", authenticateToken, userRoutes);
app.use("/api/access", authenticateToken, accessRoutes);
app.use("/api/groups", authenticateToken, groupsRoutes);
app.use("/api/permissions", authenticateToken, permissionsRoutes);
app.use("/api/products", authenticateToken, productRoutes);
app.use("/api/inventory", authenticateToken, inventoryRoutes);
app.use("/api/providers", authenticateToken, providerRoutes);
app.use("/api/orders", authenticateToken, orderRoutes);

// ── 404 y errores (siempre al final) ────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
