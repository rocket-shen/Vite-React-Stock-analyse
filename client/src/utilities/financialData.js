import { fetchFinancialData } from "./fetchXueqiu.js";

export const financialData = async (code) => {  
    const data = await fetchFinancialData(code);
// 1. balanceData 映射
    const balanceMap = {};
    data.balanceData.forEach(item => {
        balanceMap[item.report_date] = {
            equity: item.total_quity_atsopc[0] || 0, // 归属于母公司股东权益合计
            assets: item.total_assets[0] || 0, // 资产合计
            liabilities: item.total_liab[0] || 0, // 负债合计
            currentAssets: item.total_current_assets[0] || 0, // 流动资产
            currentLiabilities: item.total_current_liab[0] || 0, // 流动负债
            currencyFunds: item.currency_funds[0] || 0, // 货币资金
            arAndBr: item.ar_and_br[0] || 0, // 应收账款及票据
            inventory: item.inventory[0] || 0, // 存货
            contractualAssets: item.contractual_assets[0] || 0, // 合同资产
        };
    });

    // 2. cashData 映射
    const cashMap = {};
    data.cashData.forEach(item => {
        cashMap[item.report_date] = {
            netCashFlowOper: item.ncf_from_oa[0] || 0 // 经营现金流净额
        };
    });

    // 3. 计算 ROA & ROE
    const dataList = data.incomeData.map(item => {
        const netProfitAtsopc = item.net_profit_atsopc[0] || 0; //归母净利润
        const netProfit = item.net_profit[0] || 0; //净利润
        const netProfitYoy = item.net_profit[1] || 0; //净利润同比
        const revenue = item.revenue[0] || 0; // 营业收入
        const revenueYoy = item.revenue[1] || 0; // 营业收入同比
        const operatingCost = item.operating_cost[0] || 0; // 营业成本

        const { equity = 0, assets = 0, liabilities = 0, currentAssets = 0, currentLiabilities = 0,
            currencyFunds = 0, arAndBr = 0, inventory = 0, contractualAssets = 0 } = balanceMap[item.report_date] || {};
        const { netCashFlowOper = 0 } = cashMap[item.report_date] || {}; //解构赋值 从 cashMap[item.report_date] || {} 返回的对象中提取 netCashFlowOper 属性

        const roe = equity ? (netProfitAtsopc / equity) * 100 : 0;
        const roa = assets ? (netProfitAtsopc / assets) * 100 : 0;
        const debtToAssetRatio = assets ? (liabilities / assets) * 100 : 0; // 资产负债率
        const currentRatio = currentLiabilities ? (currentAssets / currentLiabilities) : 0; // 流动比率
        const grossMargin = revenue ? ((revenue - operatingCost) / revenue) * 100 : 0; // 毛利率

        return {
            '报告期': item.report_date,
            ROE: Number(roe.toFixed(2)),
            ROA: Number(roa.toFixed(2)),
            资产负债率: Number(debtToAssetRatio.toFixed(2)),
            流动比率: Number(currentRatio.toFixed(2)),
            流动资产: Number(currentAssets.toFixed(2)),
            货币资金: Number(currencyFunds.toFixed(2)),
            应收账款及票据: Number(arAndBr.toFixed(2)),
            存货: Number(inventory.toFixed(2)),
            合同资产: Number(contractualAssets.toFixed(2)),
            资产合计: Number(assets.toFixed(2)),
            流动负债: Number(currentLiabilities.toFixed(2)),
            负债合计: Number(liabilities.toFixed(2)),
            毛利率: Number(grossMargin.toFixed(2)),
            净利润: Number(netProfit.toFixed(2)), // 净利润
            净利润同比: netProfitYoy ? Number((netProfitYoy * 100).toFixed(2)) : null, // 净利润同比
            营业收入同比: revenueYoy ? Number((revenueYoy * 100).toFixed(2)) : null, // 营业收入同比
            归母净利润: Number(netProfitAtsopc.toFixed(2)), //
            经营现金流净额: Number(netCashFlowOper.toFixed(2)),
            营业收入: Number(revenue.toFixed(2)),// 营业收入
        };
    });

    // 3. 升序
    dataList.sort((a, b) => new Date(a['报告期']) - new Date(b['报告期']));
    // 4. 返回 stockName 和 dataList
    return {
        Symbol:code,
        stockName: data.stockName,
        dataList,
        reportData: data.reportData || [],
        exchangeData: data.exchangeData || {}
    };
};

