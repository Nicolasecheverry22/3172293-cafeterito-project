// Importamos express
import express from "express";

// importamos el middleware CORS
//Permite controlar que origenees pueden comunicarse con nel backend 
import cors from "cors";

// Importamos las rutas del feature users
// Cada feature expone su propio router independiente 
import userRoutes from "./features/users/user.routes.js";
import authRoutes from "./features/auth/auth.routes.js";
import accessRoutes from "./features/access/access.routes.js";
import groupsRoutes from "./features/groups/groups.routes.js";
import permissionsRoutes from "./features/permissions/permissions.routes.js";
import productRoutes from "./features/products/product.routes.js";
import inventoryRoutes from "./features/inventory/inventory.routes.js";
import providerRoutes from "./features/providers/provider.routes.js";
import orderRoutes from "./features/orders/order.routes.js";

// CReamos la instancia pricpipal de la aplicacion Express
const app = express();

// Midlewarese de CORS
// Permite solicitudes unicamente desde el frontnd en localhost:5173
// tipico proyecti vite en desarollo

app.use(cors({ origin: "http://localhost:5173"}))

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/permissions", permissionsRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/orders", orderRoutes);
export default app;

