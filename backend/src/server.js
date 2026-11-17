// Debe ser la primera importación: carga .env antes que cualquier otro módulo.
import "dotenv/config";
import app from "./app.js";

// Variables obligatorias. DB_PASSWORD puede estar vacía (autenticación local "trust"),
// pero debe estar definida.
const REQUIRED_NON_EMPTY = ["JWT_SECRET", "DB_HOST", "DB_PORT", "DB_USER", "DB_NAME"];
const REQUIRED_DEFINED = ["DB_PASSWORD"];

const missing = [
  ...REQUIRED_NON_EMPTY.filter((key) => !process.env[key]),
  ...REQUIRED_DEFINED.filter((key) => process.env[key] === undefined),
];

if (missing.length > 0) {
  console.error(
    `No se puede iniciar el servidor. Faltan variables de entorno: ${missing.join(", ")}.\n` +
      "Copia backend/.env.example a backend/.env y completa los valores."
  );
  process.exit(1);
}

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
