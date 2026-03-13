import { useCallback } from "react";
//SheetJS version 0.20.0
const XLSX = require("xlsx");
import toast from "react-hot-toast";

export type TExportExcelProps = {
  fileName: string;
  workSheetName: string[];
  headerName: string[][][];
  data: Object[];
};

export type TExportExcelReturn = {
  handleExportExcel: (props: TExportExcelProps) => void;
};

export function useExportExcel(): Pick<TExportExcelReturn, "handleExportExcel"> {
  const handleExportExcel = useCallback((props: TExportExcelProps) => {
    const { headerName, fileName, workSheetName, data } = props;
    const hasNoExportableData =
      !Array.isArray(data) ||
      data.length === 0 ||
      data.every(item => (Array.isArray(item) ? item.length === 0 : Object.keys(item).length === 0));

    if (hasNoExportableData) {
      toast.error("Nothing to export.");
      return;
    }

    const workBook = XLSX.utils.book_new();

    data.forEach((sheet, index) => {
      const jsonData = XLSX.utils.json_to_sheet(sheet);
      XLSX.utils.sheet_add_aoa(jsonData, headerName[index], { origin: "A1" });
      const max_width = sheet.reduce((w, r) => Math.max(w, r.name?.length ?? 15), 15);

      jsonData["!cols"] = [{ wch: max_width }];

      XLSX.utils.book_append_sheet(workBook, jsonData, workSheetName[index]);
    });

    XLSX.writeFile(workBook, `${fileName}.xlsx`);
  }, []);

  return {
    handleExportExcel,
  };
}
