import requests
import json

def test_financial_data(symbol):
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

        if data["exchangeData"]:
            exchange_data = data["exchangeData"]
            print(f"{data['stockName']} 股票交易所数据:",exchange_data)
           

       

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