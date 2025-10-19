from pathlib import Path


# 文件位置  src/config.py
# 向上两级就是 server 根
BASE_DIR = Path(__file__).resolve().parent.parent      # server
REPORT_DIR = BASE_DIR / "reports"
ASSETS_DIR = BASE_DIR / "src" / "assets"
STOCK_DICT_PATH = BASE_DIR / "src" / "assets" / "stock_dict.json"
SYMBOL_DICT_PATH = BASE_DIR / "src" / "assets" / "symbol_dict.json"
STOCK_EXCHANGE_PATH = BASE_DIR / "src" / "assets" / "stock_exchange.json"

# 雪球API地址
URL_HQ = "https://xueqiu.com/hq"
URL_BALANCE = "https://stock.xueqiu.com/v5/stock/finance/cn/balance.json"
URL_INCOME = "https://stock.xueqiu.com/v5/stock/finance/cn/income.json"
URL_CASH = "https://stock.xueqiu.com/v5/stock/finance/cn/cash_flow.json"
URL_BONUS = "https://stock.xueqiu.com/v5/stock/f10/cn/bonus.json?"
URL_HOLDERS = "https://stock.xueqiu.com/v5/stock/f10/cn/holders.json"
URL_EXCHANGE = "https://stock.xueqiu.com/v5/stock/quote.json"

# 请求头
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
    "Referer": "https://xueqiu.com/hq",
    "Accept": "application/json",
}

