import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePdfReport = (dataset, fileName = "menu_report") => {
  const doc = new jsPDF();

  const headers = Object.keys(dataset[0] || {});
  const rows = dataset.map((row) => Object.values(row));

  autoTable(doc, {
    head: [headers],
    body: rows,
  });

  doc.save(`${fileName}.pdf`);
};