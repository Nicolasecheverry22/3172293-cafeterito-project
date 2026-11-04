// Importamos express
import express from "express";

// importamos el middleware CORS
//Permite controlar que origenees pueden comunicarse con nel backend 
import cors from "cors";

// Importamos las rutas del feature users
// Cada feature expone su propio router independiente 
import userRoutes from "./features/users/user.routes.js";
import authRoutes from "./features/auth/auth.routes.js";

// CReamos la instancia pricpipal de la aplicacion Express
const app = express();

// Midlewarese de CORS 
// Permite solicitudes unicamente desde el frontnd en localhost:5173
// tipico proyecti vite en desarollo 

app.use(cors({ origin: "http://localhost:5173"}))

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
export default app;