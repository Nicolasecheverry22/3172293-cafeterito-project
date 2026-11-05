// selectService.js
import documentTypes from "@/data/selects/documentTypes.json";

// El JSON usa { id, label } pero el componente Select lee { value, label }.
// Sin este mapeo se guardaba el texto completo ("Permiso por Protección Temporal")
// en user_document_types (VARCHAR(20)) en vez del código ("PPT").
export const DOCUMENT_TYPE_OPTIONS = documentTypes.map(({ id, label }) => ({
    value: id,
    label,
}));

// Etiqueta legible a partir del código guardado en BD (acepta también registros viejos con el texto)
export const getDocumentTypeLabel = (code) =>
    DOCUMENT_TYPE_OPTIONS.find((d) => d.value === code || d.label === code)?.label ?? code ?? "";

export async function getDocumentTypes() {
    return DOCUMENT_TYPE_OPTIONS;
}

export async function getCategoryTypes() {
    const res = await fetch("/src/data/selects/categoryTypes.json")
    return res.json();
}

export async function getRoles() {
  const res = await fetch("/src/data/selects/roles.json");
  return res.json();
}

