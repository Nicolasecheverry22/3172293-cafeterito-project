import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generatePdfReport({
  headers,
  rows,
  fileName = "providers-report.pdf"
}) {

  const doc = new jsPDF();

  // Título
  doc.setFontSize(16);
  doc.text("Reporte de Proveedores", 14, 20);

  autoTable(doc, {
    startY: 30,
    head: [headers],
    body: rows,
    theme: "grid",

    headStyles: {
      fillColor: [33, 150, 243],
      textColor: 255,
      fontSize: 11
    },

    styles: {
      fontSize: 10,
      cellPadding: 3
    },

    margin: {
      left: 14,
      right: 14
    }
  });

  doc.save(fileName);
}