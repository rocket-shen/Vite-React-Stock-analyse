import axios from 'axios';

export async function fetchFinancialData(symbol) {
    try {
        const response = await axios.get('http://localhost:3000/api/fetchFinancialData', {
            params: { symbol }
        });
        return response.data;
    } catch (e) {
        console.error(`程序执行失败：${e.message}`);
        throw new Error(`无法获取财务数据：${e.message}`);
    }
}