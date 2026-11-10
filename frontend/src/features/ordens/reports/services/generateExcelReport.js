import * as XLSX from "xlsx";

export function generateExcelReport({
  headers,
  rows,
  fileName = "reporte-ordenes.xlsx"
}) {

  const worksheetData = [
    headers,
    ...rows
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Órdenes");

  XLSX.writeFile(workbook, fileName);
}