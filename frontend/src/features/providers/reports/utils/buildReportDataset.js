export function buildReportDataset({
  providers,
  selectedFields,
  scope,
  documentNumber
}) {

  let filteredData = [...providers];

  // ✅ CORREGIDO: usar "nit"
  if (scope === "document" && documentNumber) {
    filteredData = filteredData.filter(
      (item) => item.nit === documentNumber
    );
  }

  const headers = selectedFields.map((field) => field.label);

  const rows = filteredData.map((item) =>
    selectedFields.map((field) => {
      let value = item[field.key];

      if (value === null || value === undefined) return "";

      if (field.key === "is_active") {
        return value ? "Activo" : "Inactivo";
      }

      return value;
    })
  );

  return {
    headers,
    rows
  };
}