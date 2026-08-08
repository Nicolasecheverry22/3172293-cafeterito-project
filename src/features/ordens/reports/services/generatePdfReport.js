import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePdfReport = ({
  headers,
  rows,
  fileName = "reporte",
}) => {
  if (!rows || rows.length === 0) {
    console.error("No hay datos para PDF");
    return;
  }

  const doc = new jsPDF();

  autoTable(doc, {
    head: [headers],
    body: rows,
  });

  doc.save(fileName);
};