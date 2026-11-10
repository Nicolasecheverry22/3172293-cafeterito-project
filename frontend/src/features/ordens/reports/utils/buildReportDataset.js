export const buildOrdersReportDataset = ({ data, selectedFields }) => {
  const headers = selectedFields.map((f) => f.label);

  const rows = data.map((order) => {
    return selectedFields.map((field) => {
      let value;

      switch (field.key) {
        case "total":
          const orderTotal = order.total !== undefined ? order.total : 0;
          value = new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
          }).format(orderTotal);
          break;

        case "status":
          const st = String(order.status || "").toLowerCase();
          if (st === "activa") value = "Activa";
          else if (st === "pagada") value = "Pagada";
          else if (st === "cancelada") value = "Cancelada";
          else value = order.status;
          break;

        default:
          value = order[field.key];
      }

      return value ?? "";
    });
  });

  return { headers, rows };
};