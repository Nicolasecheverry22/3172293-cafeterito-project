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

// INVOICE_TAX_RATE (opcional, por defecto 0): impuesto de los comprobantes de venta como
// fracción decimal entre 0 y 1, p. ej. INVOICE_TAX_RATE=0.08 para el impuesto al consumo del 8 %.
const taxRate = process.env.INVOICE_TAX_RATE;
if (taxRate && !(/^\d+(\.\d+)?$/.test(taxRate) && Number(taxRate) < 1)) {
  console.error(
    `INVOICE_TAX_RATE="${taxRate}" no es válida: usa una fracción entre 0 y 1 (p. ej. 0.08 para el 8 %).`
  );
  process.exit(1);
}

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
