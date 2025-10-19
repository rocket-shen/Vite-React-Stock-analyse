import requests
import datetime
import json
from src.config import URL_BONUS, HEADERS
from src.utils.data_fetcher import fetch_hq_cookies

def test_financial_data(symbol):
    """
    调用 Flask 应用的 /api/fetchFinancialData 端点并打印部分财务数据
    参数:
        symbol (str): 股票代码
    """
    try:
        # 构造 API 请求的 URL
        cookies = fetch_hq_cookies()
        params = {
            'symbol': symbol,
            'size': 30,
            'page': 1,
            'extend': 'true'
        }
        response = requests.get(URL_BONUS, headers={**HEADERS, "Cookie": cookies}, params=params)
        response.raise_for_status()
        data_list = response.json().get("data", {}).get("items", [])
        for item in data_list:
            for field in ['ashare_ex_dividend_date', 'ex_dividend_date', 'equity_date', 'dividend_date']:
                if item.get(field) is not None:
                    timestamp_ms = item[field]
                    timestamp_s = timestamp_ms / 1000.0
                    dt = datetime.datetime.fromtimestamp(timestamp_s)
                    item[field] = dt.strftime('%Y%m%d')
        print(data_list)

    except requests.exceptions.RequestException as e:
        print(f"请求失败: {str(e)}")
    except json.JSONDecodeError:
        print("响应数据格式错误")
    except Exception as e:
        print(f"程序执行失败: {str(e)}")

if __name__ == "__main__":
    # 示例：获取贵州茅台（SH600519）的财务数据
    stock_symbol = "SH601928"
    test_financial_data(stock_symbol)