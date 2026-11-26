// Configuración principal de Express: middlewares, rutas y manejo de errores.
import express from "express";
import cors from "cors";
import helmet from "helmet";

import userRoutes from "./features/users/user.routes.js";
import authRoutes from "./features/auth/auth.routes.js";
import accessRoutes from "./features/access/access.routes.js";
import groupsRoutes from "./features/groups/groups.routes.js";
import permissionsRoutes from "./features/permissions/permissions.routes.js";
import productRoutes from "./features/products/product.routes.js";
import inventoryRoutes from "./features/inventory/inventory.routes.js";
import providerRoutes from "./features/providers/provider.routes.js";
import orderRoutes from "./features/orders/order.routes.js";
import settingsRoutes from "./features/settings/settings.routes.js";
import invoiceRoutes from "./features/invoices/invoice.routes.js";
import dashboardRoutes from "./features/dashboard/dashboard.routes.js";
import { productController } from "./features/products/product.controller.js";

import { authenticateToken } from "./middlewares/auth.middleware.js";
import { loadPermissions } from "./middlewares/permission.middleware.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";

const app = express();

// No anunciar la tecnología del servidor
app.disable("x-powered-by");

// Cabeceras de seguridad HTTP (H09)
app.use(helmet());

// Orígenes permitidos desde CORS_ORIGIN (lista separada por comas); por defecto Vite (H08)
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins }));

// 3 MB: el payload más grande es imagen (≤ 1.5 MB en base64, ya comprimida en el
// frontend a ≈ 800 px) + miniatura (≤ 50 KB) + campos de texto ≈ 1.6 MB. 5 MB dejaba
// margen de sobra para cuerpos abusivos; 3 MB conserva ~2× de holgura.
app.use(express.json({ limit: "3mb" }));

// ── Rutas públicas ──────────────────────────────────────────────
app.use("/api/auth", authRoutes);
// Productos más vendidos: los muestra el Home antes de iniciar sesión
app.get("/api/products/top-selling", productController.getTopSelling);

// ── Rutas privadas: todas exigen un JWT válido ──────────────────
// loadPermissions carga una sola vez por petición req.auth = { isSuperuser, permissions }
// y cada ruta declara su permiso con requirePermission (ver *.routes.js).
const privateRoute = [authenticateToken, loadPermissions];
app.use("/api/users", privateRoute, userRoutes);
app.use("/api/access", privateRoute, accessRoutes);
app.use("/api/groups", privateRoute, groupsRoutes);
app.use("/api/permissions", privateRoute, permissionsRoutes);
app.use("/api/products", privateRoute, productRoutes);
app.use("/api/inventory", privateRoute, inventoryRoutes);
app.use("/api/providers", privateRoute, providerRoutes);
app.use("/api/orders", privateRoute, orderRoutes);
app.use("/api/settings", privateRoute, settingsRoutes);
app.use("/api/invoices", privateRoute, invoiceRoutes);
// Tablero de turno: sin requirePermission global, las secciones dependen de los permisos
app.use("/api/dashboard", privateRoute, dashboardRoutes);

// ── 404 y errores (siempre al final) ────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
