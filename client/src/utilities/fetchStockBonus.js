import axios from 'axios';

export async function fetchStockBonus(symbol) {
    try {
        const response = await axios.get('http://localhost:3000/api/fetchStockBonus', {
            params: { code: symbol }
        });
        return response.data;
    }catch(e) {
        console.error(`程序执行失败：${e.message}`);
        throw new Error(`无法获务股票市值数据：${e.message}`);
    }
};
