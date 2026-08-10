export const buildOrdersReportDataset = ({ data, selectedFields }) => {
  const headers = selectedFields.map((f) => f.label);

  const rows = data.map((order) => {
    return selectedFields.map((field) => {
      let value;

      switch (field.key) {
        case "total":
          value = order.items.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
          );

          value = new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
          }).format(value);
          break;

        case "status":
          if (order.status === "pending") value = "Pendiente";
          else if (order.status === "completed") value = "Completado";
          else value = order.status;
          break;

        default:
          value = order[field.key];
      }

      return value;
    });
  });

  return { headers, rows };
};