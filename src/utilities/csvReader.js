import Papa from "papaparse";

export const readCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().replace(/^"|"$/g, ""),
      transform: (value) => {
        return value === null || value === undefined || value === ""
          ? 0
          : value;
      },
      complete: (results) => resolve(results.data),
      error: (error) => reject(error),
    });
  });
};

export const loadCsvFiles = async () => {
  try {
    const response = await fetch("/reports/file-list.json");
    if (!response.ok) {
      throw new Error(`Failed to load file list: ${response.status} ${response.statusText}`);
    }
    const fileList = await response.json();
    console.log("Loaded file list:", fileList);
    if (!Array.isArray(fileList)) {
      throw new Error("file-list.json is not a valid array");
    }
    return fileList;
  } catch (error) {
    console.error("Error loading file list:", error);
    throw error;
  }
};

export const findCsvfiles = async (code) => {
  try{
    const availableFiles = await loadCsvFiles(); // 等待文件列表加载完成
    const prefix = code.toUpperCase();
    const matchedFiles = availableFiles.filter(
      (file) => file.startsWith(prefix) && 
      (file.includes("_资产负债表")|| 
      file.includes("_利润表") || 
      file.includes("_现金流量表")|| 
      file.includes("_分红派息")|| 
      file.includes("_股东户数"))
  );
  console.log("Matched files:", matchedFiles);
  const companyName = matchedFiles[0]?.split("_")[1] || "未知公司";
  const balanceSheetFile = matchedFiles.find((f) => f.includes("_资产负债表"));
  const incomeSheetFile = matchedFiles.find((f) => f.includes("_利润表"));
  const cashFlowSheetFile = matchedFiles.find((f) => f.includes("_现金流量表"));
  const dividendsSheetFile = matchedFiles.find((f) => f.includes("_分红派息"));
  const shareholderSheetFile = matchedFiles.find((f) => f.includes("_股东户数"));
  return {
    companyName,
    balanceSheetFile: balanceSheetFile ? `/reports/${balanceSheetFile}` : null,
    incomeSheetFile: incomeSheetFile ? `/reports/${incomeSheetFile}` : null,
    cashFlowSheetFile: cashFlowSheetFile ? `/reports/${cashFlowSheetFile}` : null,
    dividendsSheetFile: dividendsSheetFile ? `/reports/${dividendsSheetFile}` : null,
    shareholderSheetFile: shareholderSheetFile ? `/reports/${shareholderSheetFile}` : null,
  };
  }catch (error) {
    console.error("Error finding CSV files:", error);
    throw error;
  }
}

export const parseSheets = async (code) => {
  try {
    const { companyName, balanceSheetFile, incomeSheetFile, cashFlowSheetFile } = await findCsvfiles(code);
    if (!balanceSheetFile && !incomeSheetFile && !cashFlowSheetFile) {
      throw new Error(`No sheet file found for code: ${code}`);
    }

    const fetchFile = async (file) => {
      if (!file) return null;
      const response = await fetch(file);
      if (!response.ok) {
        throw new Error(`Failed to load file: ${file} - ${response.statusText}`);
      }
      return response.text();
    };

    const [balanceContent, incomeContent, cashFlowContent] = await Promise.all([
      fetchFile(balanceSheetFile),
      fetchFile(incomeSheetFile),
      fetchFile(cashFlowSheetFile),
    ]);

    const parsedBalance = balanceContent ? await readCSV(balanceContent) : null;
    const parsedIncome = incomeContent ? await readCSV(incomeContent) : null;
    const parsedCashFlow = cashFlowContent ? await readCSV(cashFlowContent) : null;

    return {
      companyName,
      balanceSheet: parsedBalance,
      incomeSheet: parsedIncome,
      cashFlowSheet: parsedCashFlow,
    };
  } catch (error) {
    console.error("Error loading and parsing sheet files:", error);
    throw error;
  }
};
