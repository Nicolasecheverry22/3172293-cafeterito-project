import * as XLSX from "xlsx";

export function generateExcelReport({
  headers,
  rows,
  fileName = "providers-report.xlsx"
}) {

  const worksheetData = [
    headers,
    ...rows
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  const workbook = XLSX.utils.book_new();

  // ⚠️ Nombre de hoja coherente con el dominio
  XLSX.utils.book_append_sheet(workbook, worksheet, "Proveedores");

  XLSX.writeFile(workbook, fileName);
}