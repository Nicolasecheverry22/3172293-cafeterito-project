export function buildReportDataset({ providers, selectedFields, scope, documentNumber }) {
  let filteredProviders = [...providers];

  if (scope === "document" && documentNumber) {
    filteredProviders = filteredProviders.filter(
      (provider) => String(provider.nit) === String(documentNumber).trim()
    );
  }

  const headers = selectedFields.map((field) => field.label);

  const rows = filteredProviders.map((provider) =>
    selectedFields.map((field) => {
      const value = provider[field.key];

      if (field.key === "is_active") {
        if (
          value === false || 
          value === "false" || 
          value === 0 || 
          value === "Inactivo" ||
          value === "INACTIVO"
        ) {
          return "Inactivo";
        }
        return "Activo";
      }

      return value ?? "";
    })
  );

  return { headers, rows };
}