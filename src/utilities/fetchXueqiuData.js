import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

// HTTP 请求头
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
    'Referer': 'https://xueqiu.com/hq'
};

// API 地址
const url = 'https://xueqiu.com/hq';
const urlBalance = 'https://stock.xueqiu.com/v5/stock/finance/cn/balance.json?';
const urlIncome = 'https://stock.xueqiu.com/v5/stock/finance/cn/income.json?';
const urlCash = 'https://stock.xueqiu.com/v5/stock/finance/cn/cash_flow.json?';
const urlBonus = 'https://stock.xueqiu.com/v5/stock/f10/cn/bonus.json?';
const urlHolders = 'https://stock.xueqiu.com/v5/stock/f10/cn/holders.json?';

// 读取字段映射
async function loadMappings() {
    const data = JSON.parse(await fs.readFile('../assets/financial.json', 'utf-8'));
    return {
        balanceMap: data.balance1 || {},
        incomeMap: data.income1 || {},
        cashMap: data.cash1 || {},
        bonusMap: data.bonus || {},
        holdersMap: data.holders || {}
    };
}

// 读取股票字典
async function loadStockDict() {
    const data = JSON.parse(await fs.readFile('../assets/stock_dict.json', 'utf-8'));
    return data;
}

// 主函数：获取财务数据
async function fetchFinancialData(symbol, folderPath) {
    try {
        // 确保目标文件夹存在
        if (!await fs.access(folderPath).then(() => true).catch(() => false)) {
            await fs.mkdir(folderPath, { recursive: true });
        }

        // 加载映射和股票字典
        const { balanceMap, incomeMap, cashMap, bonusMap, holdersMap } = await loadMappings();
        const stockDict = await loadStockDict();

        // 创建 axios 实例
        const instance = axios.create({ headers });
        const res = await instance.get(url);
        const cookies = res.headers['set-cookie'].join('; ');

        const stockName = stockDict[symbol] || '未知证券名称';
        console.log(`正在处理：${symbol} - ${stockName}`);

        const params1 = {
            symbol,
            type: 'all',
            is_detail: 'true',
            count: 30,
            timestamp: Math.floor(Date.now())
        };
        const params2 = { symbol, size: '20', page: '1', extend: 'true' };

        try {
            // 获取并保存资产负债表
            const balanceData = await fetchData(urlBalance, cookies, params1);
            const balanceCsv = convertToCsv(balanceData, balanceMap);
            console.log(`balanceCsv数据: ${balanceCsv}`);
            await fs.writeFile(path.join(folderPath, `${symbol}_${stockName}_资产负债表.csv`), balanceCsv);
            console.log(`${symbol}_${stockName}_资产负债表已保存到：${folderPath}文件夹中`);

            // 获取并保存利润表
            const incomeData = await fetchData(urlIncome, cookies, params1);
            const incomeCsv = convertToCsv(incomeData, incomeMap);
            await fs.writeFile(path.join(folderPath, `${symbol}_${stockName}_利润表.csv`), incomeCsv);
            console.log(`${symbol}_${stockName}_利润表已保存到：${folderPath}文件夹中`);

            // 获取并保存现金流量表
            const cashData = await fetchData(urlCash, cookies, params1);
            const cashCsv = convertToCsv(cashData, cashMap);
            await fs.writeFile(path.join(folderPath, `${symbol}_${stockName}_现金流量表.csv`), cashCsv);
            console.log(`${symbol}_${stockName}_现金流量表已保存到：${folderPath}文件夹中`);

            // 获取并保存分红派息
            const bonusData = await fetchBonus(urlBonus, cookies, params2);
            const bonusCsv = convertToCsv(bonusData, bonusMap);
            await fs.writeFile(path.join(folderPath, `${symbol}_${stockName}_分红派息.csv`), bonusCsv);
            console.log(`${symbol}_${stockName}_分红派息已保存到：${folderPath}文件夹中`);

            // 获取并保存股东户数
            const holdersData = await fetchHolders(urlHolders, cookies, params2);
            const holdersCsv = convertToCsv(holdersData, holdersMap);
            await fs.writeFile(path.join(folderPath, `${symbol}_${stockName}_股东户数.csv`), holdersCsv);
            console.log(`${symbol}_${stockName}_股东户数已保存到：${folderPath}文件夹中`);
        } catch (e) {
            console.error(`获取${symbol}数据失败：${e.message}`);
        }

    } catch (e) {
        console.error(`程序执行失败：${e.message}`);
    }
}

// 获取财务数据
async function fetchData(dataUrl, cookies, params) {
    const res = await axios.get(dataUrl, { headers: { ...headers, Cookie: cookies }, params });
    const dataList = res.data.data.list;

    // 处理时间戳和列表字段
    const processedData = dataList.map(item => {
        if (item.report_date) {
            item.report_date = new Date(item.report_date).toISOString().split('T')[0];
        }
        return Object.fromEntries(
            Object.entries(item).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
        );
    });

    return processedData;
}

// 获取分红派息数据
async function fetchBonus(dataUrl, cookies, params) {
    const res = await axios.get(dataUrl, { headers: { ...headers, Cookie: cookies }, params });
    const dataList = res.data.data.items;

    const processedData = dataList.map(item => {
        if (item.ashare_ex_dividend_date) {
            item.ashare_ex_dividend_date = new Date(item.ashare_ex_dividend_date).toISOString().split('T')[0];
        } else {
            item.ashare_ex_dividend_date = null;
        }
        if (item.dividend_date) {
            item.dividend_date = new Date(item.dividend_date).toISOString().split('T')[0];
        } else {
            item.dividend_date = null;
        }
        if (item.equity_date) {
            item.equity_date = new Date(item.equity_date).toISOString().split('T')[0];
        } else {
            item.equity_date = null;
        }
        if (item.ex_dividend_date) {
            item.ex_dividend_date = new Date(item.ex_dividend_date).toISOString().split('T')[0];
        } else {
            item.ex_dividend_date = null;
        }
        return item;
    });

    return processedData;
}

// 获取股东户数数据
async function fetchHolders(dataUrl, cookies, params) {
    const res = await axios.get(dataUrl, { headers: { ...headers, Cookie: cookies }, params });
    const dataList = res.data.data.items;

    const processedData = dataList.map(item => {
        if (item.timestamp) {
            item.timestamp = new Date(item.timestamp).toISOString().split('T')[0];
        } else {
            item.timestamp = null;
        }
        return item;
    });

    return processedData;
}

// 将数据转换为 CSV 格式
function convertToCsv(data, fieldMap) {
    if (!data || data.length === 0) {
        console.warn('数据为空，返回空字符串');
        return '';
    }

    if (!fieldMap || Object.keys(fieldMap).length === 0) {
        console.warn('fieldMap 为空，返回空字符串');
        return '';
    }

    // 生成表头，使用 fieldMap 的值（中文）作为表头
    const columns = Object.entries(fieldMap).map(([key, header]) => ({
        key: header, // CSV 表头使用中文
        header: header
    }));

    const rows = data.map(item => {
        const row = {};
        Object.entries(fieldMap).forEach(([key, header]) => {
            row[header] = item[key] !== undefined && item[key] !== null ? item[key] : '';
        });
        return row;
    });

    if (rows.length === 0 || columns.length === 0) {
        console.warn('rows 或 columns 为空，返回空字符串');
        return '';
    }

    try {
        return stringify(rows, { header: true, columns });
    } catch (e) {
        console.error('stringify 失败:', e.message);
        return '';
    }
}

// 示例调用
(async () => {
    const symbol = 'SH601928'; // 示例股票代码 (只传入一个)
    const folderPath = '../public/reports'; // 示例文件夹路径)
    await fetchFinancialData(symbol, folderPath);
})();