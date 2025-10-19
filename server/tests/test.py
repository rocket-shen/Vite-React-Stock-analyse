from src.config import REPORT_DIR,ASSETS_DIR
import pandas as pd
import os
import json 
import akshare as ak
from datetime import date


def process_stock_dict(year):
    # 正确拼接路径
    file_path = os.path.join(REPORT_DIR, f'业绩报表_{year}1231.csv')
    save_path = os.path.join(ASSETS_DIR, 'symbol_dict.json')
    
    # 确保路径存在（可选调试）
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"文件未找到: {file_path}")

    df = pd.read_csv(file_path, encoding='utf_8_sig', dtype={'股票代码': str})

    # 提取所需的两列，去除可能的空值
    selected_columns = df[['股票代码', '股票简称']].dropna()

    data = dict(zip(selected_columns['股票代码'], selected_columns['股票简称']))
    with open(save_path, 'w', encoding='utf_8_sig') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

def market_overview():
    
    # stock_market_sh = ak.stock_sse_summary() # 获取上交所市场概况数据
    stock_info = ak.stock_share_change_cninfo(symbol="601126")
    print(stock_info.columns.tolist())

def sotck_market_value(code):
    try:
        # 获取股本变动信息
        shares_chg = ak.stock_share_change_cninfo(symbol=code)
        if shares_chg.empty:
            print(f"❌ {code} 股本变动数据为空")
            return
        shares_chg = shares_chg[['变动日期','变动原因','流通受限股份','总股本']]
        shares_chg['变动日期'] = pd.to_datetime(shares_chg['变动日期'])
        shares_chg = shares_chg.drop_duplicates('变动日期').sort_values('变动日期')
        shares_chg['总股本'] = shares_chg['总股本'] / 10000  # 单位转换为亿股

        # 数据清洗
        start_str = shares_chg['变动日期'].min().strftime("%Y%m%d")
        end_str = shares_chg['变动日期'].max().strftime("%Y%m%d")
        price = ak.stock_zh_a_hist(symbol=code, start_date=start_str, end_date=end_str, adjust="")
        if price.empty:
            print(f"❌ {code} 历史价格数据为空")
            return
        
        price['日期'] = pd.to_datetime(price['日期'])
        price = price[['日期', '收盘']]

        # merge 并算总市值
        merge = pd.merge(shares_chg, price, left_on='变动日期', right_on='日期', how='inner')
        merge['总市值(亿)'] = merge['总股本'] * merge['收盘']

        print('>>> 股本变动日当天的总市值 <<<')
        print(merge[['变动日期','变动原因','总股本', '收盘', '总市值(亿)']])
        
    except Exception as e:
        print(e)
        return None

if __name__ == "__main__":
    code = "600210"
    sotck_market_value(code)