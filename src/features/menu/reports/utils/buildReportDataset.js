export const buildReportDataset = ({ data, selectedFields }) => {
  if (!Array.isArray(selectedFields) || selectedFields.length === 0) {
    throw new Error("Debes seleccionar al menos un campo");
  }

  const headers = selectedFields.map((f) => f.label);

  const rows = data.map((item) => {
    return selectedFields.map((field) => {
      let value = item[field.key];

      if (field.key === "isAvailable") {
        value = value ? "Disponible" : "No disponible";
      }

      if (field.key === "price") {
        value = new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 0,
        }).format(value);
      }

      return value;
    });
  });

  return { headers, rows };
};