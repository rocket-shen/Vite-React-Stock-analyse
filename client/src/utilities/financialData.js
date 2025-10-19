import { fetchXueqiu } from "./fetchXueqiu.js";
import { fetchStockData } from "./fetchStockData.js";

// 这段代码是一个典型的“数据获取 + 标准化封装”的前端模式，职责清晰，易于维护和测试。

export const financialData = async (code) => {  
    const data = await fetchXueqiu(code);

    return {
        symbol:code,
        stockName: data.stockName,
        dataList: data.dataList || [],
        reportData: data.reportData || [],
        exchangeData: data.exchangeData || {}
    };
};

export const stockData = async (code) => {  
    const data = await fetchStockData(code);
    return {
        marketValue: data.marketValue || {},
        bonusData: data.bonusData || {}
    };   
};
