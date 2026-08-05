export function buildReportDataset({
  data,
  selectedFields,
  scope,
  documentNumber,
}) {
  let filteredData = [...data];

  // ✅ Filtro opcional (solo si existe documentNumber en los datos)
  if (scope === "document" && documentNumber) {
    filteredData = filteredData.filter(
      (item) => item.documentNumber === documentNumber
    );
  }

  // ✅ Headers dinámicos
  const headers = selectedFields.map((field) => field.label);

  // ✅ Filas dinámicas con soporte de format
  const rows = filteredData.map((item) =>
    selectedFields.map((field) => {
      const value = item[field.key];

      // 🔥 soporte para format (MUY IMPORTANTE)
      if (field.format) {
        return field.format(value, item);
      }

      // fallback seguro
      if (value === null || value === undefined) {
        return "";
      }

      // boolean bonito
      if (typeof value === "boolean") {
        return value ? "Sí" : "No";
      }

      return value;
    })
  );

  return { headers, rows };
}