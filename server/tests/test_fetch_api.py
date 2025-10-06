from ..src.utils.data_fetcher import fetch_financial_report,fetch_hq_cookies
import requests
from ..src.config import HEADERS,STOCK_EXCHANGE_PATH
import json
from datetime import datetime

def test_fetch_reports():
    """测试 fetch_financial_report 函数"""
    try:
        stock_code = "600519"  # 贵州茅台
        data = fetch_financial_report(stock_code)
        print(f"First record: {data[0]}")
    except Exception as e:
        print(f"Test failed: {str(e)}")
        assert False, f"Test failed: {str(e)}"

def fetch_exchange_data():
    """测试读取股票交易所数据"""
    try:
        url = 'https://stock.xueqiu.com/v5/stock/quote.json'
        pamarms = {
            "symbol": "SH600887",
            "extend": "detail"
        }
        cookies = fetch_hq_cookies()
        response = requests.get(url, headers={**HEADERS, "Cookie": cookies}, params=pamarms)
        data = response.json()['data']['quote']
        with open(STOCK_EXCHANGE_PATH, 'r', encoding='utf-8') as f:
            exchange_data = json.load(f)
        if "issue_date" in data:
            data["issue_date"] = datetime.fromtimestamp(data["issue_date"] / 1000).strftime('%Y-%m-%d')
            print(f'exchange data:{data}')
        exchange_dict = {exchange_data[k]: v for k, v in data.items() if k in exchange_data}
        exchange_list = [k for k in exchange_dict.keys()]
        print(f"交易所数据 keys: {exchange_list}")
        print(f"交易所数据数量: {len(exchange_list)}")
    except Exception as e:
        print(f"Failed to load exchange data: {str(e)}")
        assert False, f"Failed to load exchange data: {str(e)}"

if __name__ == "__main__":
    fetch_exchange_data()