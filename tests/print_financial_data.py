import requests
import json

def print_financial_data(symbol):
    """
    调用 Flask 应用的 /api/fetchFinancialData 端点并打印部分财务数据
    参数:
        symbol (str): 股票代码
    """
    try:
        # 构造 API 请求的 URL
        api_url = f"http://localhost:3000/api/fetchFinancialData?symbol={symbol}"
        print(f"请求 URL: {api_url}")

        # 发送 GET 请求
        response = requests.get(api_url, timeout=10)
        response.raise_for_status()  # 检查请求是否成功

        # 解析 JSON 响应
        data = response.json()

        # 检查是否返回错误
        if "error" in data:
            print(f"错误: {data['error']}")
            return

        # 打印股票名称
        print(f"股票名称: {data['stockName']}")

        # 打印资产负债表数据的最新一条记录（如果存在）
        if data["balanceData"]:
            latest_balance = data["balanceData"][0]
            print("\n最新资产负债表数据:")
            print(f"报告日期: {latest_balance.get('report_date', 'N/A')}")
            print(f"总资产: {latest_balance.get('total_assets', 'N/A')}")
            print(f"总负债: {latest_balance.get('total_liab', 'N/A')}")

        # 打印利润表数据的最新一条记录（如果存在）
        if data["incomeData"]:
            latest_income = data["incomeData"][0]
            print("\n最新利润表数据:")
            print(f"报告日期: {latest_income.get('report_date', 'N/A')}")
            print(f"营业收入: {latest_income.get('revenue', 'N/A')}")
            print(f"净利润: {latest_income.get('net_profit', 'N/A')}")

        # 打印现金流量表数据的最新一条记录（如果存在）
        if data["cashData"]:
            latest_cash = data["cashData"][0]
            print("\n最新现金流量表数据:")
            print(f"报告日期: {latest_cash.get('report_date', 'N/A')}")
            print(f"经营活动现金流: {latest_cash.get('ncf_from_oa', 'N/A')}")
            print(f"投资活动现金流: {latest_cash.get('ncf_from_ia', 'N/A')}")

    except requests.exceptions.RequestException as e:
        print(f"请求失败: {str(e)}")
    except json.JSONDecodeError:
        print("响应数据格式错误")
    except Exception as e:
        print(f"程序执行失败: {str(e)}")

if __name__ == "__main__":
    # 示例：获取贵州茅台（SH600519）的财务数据
    stock_symbol = "SH601098"
    print_financial_data(stock_symbol)