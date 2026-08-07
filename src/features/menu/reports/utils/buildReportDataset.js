export const buildReportDataset = (data, fields) => {
  return data.map((item) => {
    const row = {};

    fields.forEach((field) => {
      let value = item[field.key];

      // Transformaciones específicas
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

      row[field.label] = value;
    });

    return row;
  });
};