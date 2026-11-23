// Utilidades de imagen compartidas (usuarios, inventario, proveedores y menú).
// Las imágenes se guardan en la BD como data URL base64: antes de enviarlas se
// validan, se redimensionan con canvas y se exportan a WebP (o JPEG si el
// navegador no soporta WebP), y se genera una miniatura de 96×96 para los listados.
import { z } from "zod";

// Alineado con el backend (utils/joi.js → imageDataUri): sin SVG (riesgo de XSS).
export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const IMAGE_ACCEPT = IMAGE_TYPES.join(",");
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB (RFADMIN02)

export const IMAGE_TYPE_ERROR = "Formato no permitido. Usa una imagen PNG, JPG/JPEG o WEBP.";
export const IMAGE_SIZE_ERROR = "La imagen supera el tamaño máximo de 2 MB.";
export const IMAGE_HINT = "PNG, JPG o WEBP · máx. 2 MB";

const MAIN_SIDE = 800;
const THUMB_SIDE = 96;
const QUALITY = 0.8;

// Devuelve el mensaje de error en español o null si el archivo es válido.
export function validateImageFile(file) {
  if (!(file instanceof File)) return "Selecciona un archivo de imagen.";
  if (!IMAGE_TYPES.includes(file.type)) return IMAGE_TYPE_ERROR;
  if (file.size > MAX_IMAGE_BYTES) return IMAGE_SIZE_ERROR;
  return null;
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen. El archivo puede estar dañado."));
    };
    img.src = url;
  });
}

// Exporta a WebP; si el navegador no lo soporta (devuelve PNG), usa JPEG.
function exportCanvas(canvas, quality) {
  const webp = canvas.toDataURL("image/webp", quality);
  if (webp.startsWith("data:image/webp")) return webp;
  return canvas.toDataURL("image/jpeg", quality);
}

function drawToCanvas(img, { width, height, sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight }) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  // Fondo blanco: si se termina exportando a JPEG, la transparencia no queda negra
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
  return canvas;
}

/**
 * Valida y convierte una imagen a data URL comprimida.
 * El lado mayor queda ≤ maxSide (no se agranda si ya es menor), manteniendo la proporción.
 * Lanza Error con mensaje en español si el archivo no cumple.
 */
export async function imageToDataUrl(file, { maxSide = MAIN_SIDE, quality = QUALITY } = {}) {
  const error = validateImageFile(file);
  if (error) throw new Error(error);

  const img = await loadImage(file);
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));
  return exportCanvas(drawToCanvas(img, { width, height }), quality);
}

// Miniatura cuadrada de 96×96 recortada al centro (listados y avatar del navbar).
export async function createThumbnail(file, { side = THUMB_SIDE, quality = QUALITY } = {}) {
  const error = validateImageFile(file);
  if (error) throw new Error(error);

  const img = await loadImage(file);
  const crop = Math.min(img.naturalWidth, img.naturalHeight);
  return exportCanvas(
    drawToCanvas(img, {
      width: side,
      height: side,
      sx: (img.naturalWidth - crop) / 2,
      sy: (img.naturalHeight - crop) / 2,
      sw: crop,
      sh: crop,
    }),
    quality
  );
}

// Imagen (≈ 800 px) + miniatura listas para el payload: { image, thumb }.
export async function processImage(file) {
  const [image, thumb] = await Promise.all([imageToDataUrl(file), createThumbnail(file)]);
  return { image, thumb };
}

// Iniciales para el placeholder: "Ana María López" → "AM"; "Pollo" → "PO".
export function getInitials(name, fallback = "?") {
  const words = String(name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return fallback;
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

// Primer File de un valor de FileInput ([File] | []), o null.
export const firstFile = (files) =>
  Array.isArray(files) && files[0] instanceof File ? files[0] : null;

/**
 * Campos del payload para la API según el estado del formulario:
 * - Archivo nuevo           → { [key]: image, [key + "Thumb"]: thumb }
 * - Se quitó la imagen      → { removeImage: true }
 * - Sin cambios             → {}  (el backend conserva la actual)
 */
export async function buildImagePayload(key, files, { removed = false } = {}) {
  const file = firstFile(files);
  if (file) {
    const { image, thumb } = await processImage(file);
    return { [key]: image, [`${key}Thumb`]: thumb };
  }
  return removed ? { removeImage: true } : {};
}

// Campo Zod para el valor de FileInput (arreglo con 0 o 1 File), alineado con Joi.
export const imageFilesField = ({ required = false } = {}) =>
  z
    .array(z.any())
    .max(1, "Solo se permite una imagen")
    .optional()
    .superRefine((files = [], ctx) => {
      if (files.length === 0) {
        if (required) ctx.addIssue({ code: "custom", message: "La imagen es obligatoria" });
        return;
      }
      const error = validateImageFile(files[0]);
      if (error) ctx.addIssue({ code: "custom", message: error });
    });
