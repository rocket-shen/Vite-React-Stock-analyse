import { parseSheets } from "./csvReader";

export const financialData = async (code) => {
  try {
    const { companyName, balanceSheet, incomeSheet, cashFlowSheet } = await parseSheets(code);

    if (!balanceSheet || !incomeSheet || !cashFlowSheet) {
      throw new Error("Missing required financial sheets");
    }

    // 按“报告期”对齐数据并计算指标
    const results = balanceSheet.map((balance) => {
      const 报告期 = balance["报告期"];

      // 查找同一报告期的 incomeSheet 和 cashFlowSheet 数据
      const income = incomeSheet.find((item) => item["报告期"] === 报告期);
      const cashFlow = cashFlowSheet.find((item) => item["报告期"] === 报告期);

      if (!income || !cashFlow) {
        return {
          companyName,
          报告期,
        };
      }

      // 计算 ROE 和 ROA
      const 归母净利润 = parseFloat(income["归属于母公司股东的净利润"]) || 0;
      const 净利润 = parseFloat(income["净利润"]) || 0;
      const 营业收入 = parseFloat(income["其中：营业收入"]) || 0;
      const 营业成本 = parseFloat(income["其中：营业成本"]) || 0;

      const 母公司股东权益 = parseFloat(balance["归属于母公司股东权益合计"]) || 0;
      const 货币资金 = parseFloat(balance["货币资金"]) || 0;
      const 应收票据及账款 = parseFloat(balance["应收票据及应收账款"]) || 0;
      const 存货 = parseFloat(balance["存货"]) || 0;
      const 合同资产 = parseFloat(balance["合同资产"]) || 0;

      const 资产合计 = parseFloat(balance["资产合计"]) || 0;
      const 流动资产 = parseFloat(balance["流动资产合计"]) || 0;
      const 流动负债 = parseFloat(balance["流动负债合计"]) || 0;
      const 负债合计 = parseFloat(balance["负债合计"]) || 0;
      const 经营现金流净额 =
        parseFloat(cashFlow["经营活动产生的现金流量净额"]) || 0;


      const 资产负债率 = 资产合计 !== 0 ? (负债合计 / 资产合计) * 100 : null; 
      const 流动比率 = 流动负债 !== 0 ? 流动资产 / 流动负债 : null; 
      const ROE = 母公司股东权益 !== 0 ? (归母净利润 / 母公司股东权益) * 100 : null; 
      const ROA = 资产合计 !== 0 ? (净利润 / 资产合计) * 100 : null; 
      const 毛利率 = 营业收入 !== 0 ? ((营业收入 - 营业成本) / 营业收入) * 100 : null;

      return {
        companyName,
        报告期,
        货币资金,
        存货,
        应收票据及账款,
        合同资产,
        ROE: ROE ? ROE.toFixed(2) : null, 
        ROA: ROA ? ROA.toFixed(2) : null,
        毛利率: 毛利率 ? 毛利率.toFixed(2) : null,
        流动比率: 流动比率 ? 流动比率.toFixed(2) : null,
        资产负债率: 资产负债率 ? 资产负债率.toFixed(2) : null,
        经营现金流净额,
        净利润,
        营业收入,
        资产合计,
        流动资产,
        流动负债,
        负债合计,
      };
    });

    return results;
  } catch (error) {
    console.error("Error calculating financial metrics:", error);
    throw error;
  }
};
