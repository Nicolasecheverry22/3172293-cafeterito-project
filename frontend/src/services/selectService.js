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

// Tipos de documento válidos para PROVEEDORES (RFADMIN14): incluye NIT y Cédula de
// Extranjería; excluye Tarjeta de Identidad. Deben coincidir con el backend
// (PROVIDER_DOCUMENT_TYPES en provider.schema.js).
export const PROVIDER_DOCUMENT_TYPE_OPTIONS = [
    { value: "NIT", label: "NIT" },
    { value: "CC", label: "Cédula de Ciudadanía" },
    { value: "CE", label: "Cédula de Extranjería" },
    { value: "PEP", label: "Permiso Especial de Permanencia" },
    { value: "PPT", label: "Permiso por Protección Temporal" },
];

export async function getProviderDocumentTypes() {
    return PROVIDER_DOCUMENT_TYPE_OPTIONS;
}

export async function getCategoryTypes() {
    const res = await fetch("/src/data/selects/categoryTypes.json")
    return res.json();
}

export async function getRoles() {
  const res = await fetch("/src/data/selects/roles.json");
  return res.json();
}

