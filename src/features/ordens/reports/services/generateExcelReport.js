import * as XLSX from "xlsx";

export const generateExcelReport = ({
  headers,
  rows,
  fileName = "reporte",
}) => {
  if (!rows || rows.length === 0) {
    console.error("No hay datos para Excel");
    return;
  }

  // 🔴 Convertimos a formato objeto (xlsx lo necesita)
  const dataset = rows.map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });

  const worksheet = XLSX.utils.json_to_sheet(dataset);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

  XLSX.writeFile(workbook, fileName);
};