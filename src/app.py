from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
from datetime import datetime
import os

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})  # 允许 Vite 开发服务器跨域访问

# 加载 stock_dict.json
def load_stock_dict():
    try:
        # app.py 在 src 目录下，stock_dict.json 在 src/assets
        base_dir = os.path.dirname(__file__)  # 获取 app.py 所在目录 (src)
        stock_dict_path = os.path.join(base_dir, "assets", "stock_dict.json")
        print(f"Attempting to load stock_dict.json from: {stock_dict_path}")
        with open(stock_dict_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        raise Exception(f"无法找到文件: {stock_dict_path}")
    except json.JSONDecodeError:
        raise Exception("stock_dict.json 格式错误")

stock_dict = load_stock_dict()

# API 地址
URL_HQ = "https://xueqiu.com/hq"
URL_BALANCE = "https://stock.xueqiu.com/v5/stock/finance/cn/balance.json"
URL_INCOME = "https://stock.xueqiu.com/v5/stock/finance/cn/income.json"
URL_CASH = "https://stock.xueqiu.com/v5/stock/finance/cn/cash_flow.json"
URL_BONUS = "https://stock.xueqiu.com/v5/stock/finance/cn/bonus.json"
URL_HOLDERS = "https://stock.xueqiu.com/v5/stock/f10/cn/holders.json"

# 请求头
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
    "Referer": "https://xueqiu.com/hq",
    "Accept": "application/json",
}

def fetch_data(url, cookies, params):
    """获取财务数据并处理时间戳和列表字段"""
    try:
        response = requests.get(url, headers={**HEADERS, "Cookie": cookies}, params=params)
        response.raise_for_status()
        data_list = response.json().get("data", {}).get("list", [])

        # 处理时间戳和列表字段
        processed_data = []
        for item in data_list:
            if item.get("report_date"):
                item["report_date"] = datetime.fromtimestamp(item["report_date"] / 1000).strftime("%Y-%m-%d")
            processed_data.append(item)
        return processed_data
    except Exception as e:
        raise Exception(f"获取数据失败: {str(e)}")

# def fetch_bonus(url, cookies, params):
#     """获取分红派息数据"""
#     try:
#         response = requests.get(url, headers={**HEADERS, "Cookie": cookies}, params=params)
#         # print(f"Bonus request URL: {response.url}")
#         # print(f"Bonus response status: {response.status_code}")
#         # print(f"Bonus response content: {response.text[:500]}")  # 打印前 500 字符
#         response.raise_for_status()
#         data_list = response.json().get("data", {}).get("items", [])

#         processed_data = []
#         for item in data_list:
#             for date_field in ["ashare_ex_dividend_date", "dividend_date", "equity_date", "ex_dividend_date"]:
#                 if item.get(date_field):
#                     item[date_field] = datetime.fromtimestamp(item[date_field] / 1000).strftime("%Y-%m-%d")
#                 else:
#                     item[date_field] = None
#             processed_data.append(item)
#         return processed_data
#     except Exception as e:
#         raise Exception(f"获取分红数据失败: {str(e)}")

# def fetch_holders(url, cookies, params):
#     """获取股东户数数据"""
#     try:
#         response = requests.get(url, headers={**HEADERS, "Cookie": cookies}, params=params)
#         print(f"Holders request URL: {response.url}")
#         print(f"Holders response status: {response.status_code}")   # 打印状态码    
#         response.raise_for_status()
#         data_list = response.json().get("data", {}).get("items", [])

#         processed_data = []
#         for item in data_list:
#             if item.get("timestamp"):
#                 item["timestamp"] = datetime.fromtimestamp(item["timestamp"] / 1000).strftime("%Y-%m-%d")
#             else:
#                 item["timestamp"] = None
#             processed_data.append(item)
#         return processed_data
#     except Exception as e:
#         raise Exception(f"获取股东数据失败: {str(e)}")

@app.route("/api/fetchFinancialData", methods=["GET"])
def fetch_financial_data():
    """主接口：获取财务数据"""
    try:
        symbol = request.args.get("symbol")
        print(f"Received symbol: {symbol}")
        if not symbol:
            return jsonify({"error": "股票代码不能为空"}), 400

        # 获取 Cookie
        response = requests.get(URL_HQ, headers=HEADERS)
        print(f"HQ response status: {response.status_code}")
        cookies = "; ".join([f"{c.name}={c.value}" for c in response.cookies])
        # print(f"Cookies: {cookies}")

        stock_name = stock_dict.get(symbol, "未知证券名称")
        print(f"Stock name: {stock_name}")

        params1 = {
            "symbol": symbol,
            "type": "all",
            "is_detail": "true",
            "count": 30,
            "timestamp": int(datetime.now().timestamp() * 1000)
        }
        params2 = {"symbol": symbol, "size": "20", "page": "1", "extend": "true"}

        # 并行抓取数据（这里使用顺序请求，异步可通过 asyncio 优化）
        balance_data = fetch_data(URL_BALANCE, cookies, params1)
        # print(f"Balance data length: {len(balance_data)}")
        income_data = fetch_data(URL_INCOME, cookies, params1)
        # print(f"Income data length: {len(income_data)}")
        cash_data = fetch_data(URL_CASH, cookies, params1)
        # print(f"Cash data length: {len(cash_data)}")
        # bonus_data = fetch_bonus(URL_BONUS, cookies, params2)
        # print(f"Bonus data length: {len(bonus_data)}")
        # holders_data = fetch_holders(URL_HOLDERS, cookies, params2)
        # print(f"Holders data length: {len(holders_data)}")

        return jsonify({
            "stockName": stock_name,
            "balanceData": balance_data,
            "incomeData": income_data,
            "cashData": cash_data,
        })

    except Exception as e:
        return jsonify({"error": f"程序执行失败: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(port=3000, debug=True)