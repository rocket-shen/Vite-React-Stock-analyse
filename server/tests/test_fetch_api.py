from src.utils.data_fetcher import fetch_hq_cookies,fetch_data
from src.utils.data_process import process_financial_data
import requests
from src.config import URL_BALANCE,URL_INCOME,URL_CASH
import json
from datetime import datetime

def fetch_financial_data():
    """测试读取财务数据"""
    try:
        params = {
                "symbol": 'SH601126',
                "type": "all",
                "is_detail": "true",
                "count": 30,
                "timestamp": int(datetime.now().timestamp() * 1000)
            }
        cookies = fetch_hq_cookies()
        balance_data = fetch_data(URL_BALANCE, cookies, params)
        income_data = fetch_data(URL_INCOME, cookies, params)
        cash_data = fetch_data(URL_CASH, cookies, params)
        data_list = process_financial_data(balance_data, income_data, cash_data)
        print(f"Processed {len(data_list)} financial data entries.")
        print(data_list[0] if data_list else "No data available.")
        
    except Exception as e:
        print(f"Failed to load exchange data: {str(e)}")
        assert False, f"Failed to load exchange data: {str(e)}"

if __name__ == "__main__":
    fetch_financial_data()