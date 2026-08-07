import * as XLSX from "xlsx";

export const generateExcelReport = (dataset, fileName = "menu_report") => {
  const worksheet = XLSX.utils.json_to_sheet(dataset);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};