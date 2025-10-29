import { fetchXueqiu } from "./fetchXueqiu.js";
import { fetchStockBonus } from "./fetchStockBonus.js";
import { fetchMarketCap } from "./fetchMarketCap.js";

// 这段代码是一个典型的“数据获取 + 标准化封装”的前端模式，职责清晰，易于维护和测试。

export const financialData = async (code) => {  
    try {
    const data = await fetchXueqiu(code);
    return {
      symbol: code,
      stockName: data.stockName,
      dataList: data.dataList || [],
      reportData: data.reportData || [],
      exchangeData: data.exchangeData || {}
    };
  } catch (error) {
    console.error(`Financial data error for ${code}:`, error);
    return { symbol: code, stockName: '未知', dataList: [], reportData: [], exchangeData: {} };  // 空数据
  }
};

export const stockBonus = async (code) => {  
    try {
    const data = await fetchStockBonus(code);
    return {
      bonusData: data.bonusData || {}
    };
  } catch (error) {
    console.error(`Stock data error for ${code}:`, error);
    return { bonusData: {} };  // 空数据
  }
};

export const fetchMarket = async (code) => {  
  try {
    const res = await fetchMarketCap(code);
    return res.success ? (res.data || []) : [];
  } catch (error) {
    console.error("Fetch market cap failed:", error);
    return [];
  }
};