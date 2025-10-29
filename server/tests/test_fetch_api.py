from src.utils.data_fetcher import fetch_hq_cookies,fetch_data
from src.utils.data_process import process_financial_data
import requests
from src.config import HEADERS,STOCK_EXCHANGE_PATH,URL_BALANCE,URL_INCOME,URL_CASH
import json
from datetime import datetime

def fetch_data():
    """测试读取股票交易所数据"""
    try:
         
        pamarms = {
                "symbol": 'SH601126',
                "type": "all",
                "is_detail": "true",
                "count": 30,
                "timestamp": int(datetime.now().timestamp() * 1000)
            }
        cookies = fetch_hq_cookies()
        balance_data = fetch_data(URL_BALANCE, cookies, pamarms)
        income_data = fetch_data(URL_INCOME, cookies, pamarms)
        cash_data = fetch_data(URL_CASH, cookies, pamarms)
        data_list = process_financial_data(balance_data, income_data, cash_data)
        print(f"Processed {len(data_list)} financial data entries.")
        print(data_list[0] if data_list else "No data available.")
        
    except Exception as e:
        print(f"Failed to load exchange data: {str(e)}")
        assert False, f"Failed to load exchange data: {str(e)}"

if __name__ == "__main__":
    fetch_data()