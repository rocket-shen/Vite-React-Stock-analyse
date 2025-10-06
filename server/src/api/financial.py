from flask import request, jsonify
from datetime import datetime
from ..utils.data_fetcher import load_stock_dict, fetch_data, fetch_hq_cookies, fetch_exchange_data
from ..utils.data_process import process_symbol, fetch_financial_report
from ..config import URL_BALANCE, URL_INCOME, URL_CASH, URL_EXCHANGE

def register_routes(app):
    """注册API路由"""
    @app.route("/api/fetchFinancialData", methods=["GET"])
    def fetch_financial_data():
        """主接口：获取财务数据"""
        try:
            symbol = request.args.get("symbol").strip()
            print(f"Received symbol: {symbol}")
            if not symbol:
                return jsonify({"error": "股票代码不能为空"}), 400
            
            sotck_code = process_symbol(symbol)

            # 获取股票字典和Cookies
            stock_dict = load_stock_dict()
            cookies = fetch_hq_cookies()
            stock_name = stock_dict.get(symbol, "未知证券名称")
            print(f"Stock name: {stock_name}")

            # 请求参数
            params1 = {
                "symbol": sotck_code,
                "type": "all",
                "is_detail": "true",
                "count": 30,
                "timestamp": int(datetime.now().timestamp() * 1000)
            }

            pamarms = {
            "symbol": sotck_code,
            "extend": "detail"
            }

            # 并行抓取数据
            balance_data = fetch_data(URL_BALANCE, cookies, params1)
            income_data = fetch_data(URL_INCOME, cookies, params1)
            cash_data = fetch_data(URL_CASH, cookies, params1)
            exchange_data = fetch_exchange_data(URL_EXCHANGE, cookies, pamarms)
            print(f"Exchange data fetched with {len(exchange_data)} items.")

            rep_data = fetch_financial_report(symbol)

            return jsonify({
                "stockName": stock_name,
                "balanceData": balance_data,
                "incomeData": income_data,
                "cashData": cash_data,
                "reportData": rep_data,
                "exchangeData": exchange_data
            })

        except Exception as e:
            return jsonify({"error": f"程序执行失败: {str(e)}"}), 500