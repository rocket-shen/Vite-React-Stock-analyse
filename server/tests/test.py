from src.config import REPORT_DIR,ASSETS_DIR
import pandas as pd
import numpy as np
import os
import json 
import akshare as ak
from datetime import timedelta
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

def fetch_market_value(code):
# -----------------------------
# 1. 获取股本变动数据
# -----------------------------
    try:
        shares_raw = ak.stock_share_change_cninfo(symbol=code)
        if shares_raw.empty:
            shares_df = pd.DataFrame(columns=['变动日期', '总股本_股', '变动原因', '已流通股份'])
        else:
            cols_needed = ['变动日期', '总股本', '变动原因', '已流通股份']
            shares_df = shares_raw[cols_needed].copy()
            shares_df['变动日期'] = pd.to_datetime(shares_df['变动日期'])
            shares_df['总股本_股'] = shares_df['总股本'] * 10000
            shares_df = shares_df.sort_values('变动日期').reset_index(drop=True)
    except Exception as e:
        print(f"获取股本变动数据失败: {e}")
        shares_df = pd.DataFrame(columns=['变动日期', '总股本_股'])

    # --- 分红除息日 ---
    dividend_dates = []
    try:
        fhps = ak.stock_fhps_detail_em(symbol=code)
        if '除权除息日' in fhps.columns:
            fhps['除权除息日'] = pd.to_datetime(fhps['除权除息日'], errors='coerce')
            dividend_dates = fhps['除权除息日'].dropna().tolist()
    except Exception:
        pass
    # -----------------------------
    # 3. 构建所有关键日期列表（去重 + 排序）
    # -----------------------------
    # 添加股本变动日
    change_dates = shares_df['变动日期'].tolist() if not shares_df.empty else []
    # 合并两类日期
    all_key_dates = sorted(set(dividend_dates + change_dates))
    if not all_key_dates:
        return []
    # -----------------------------
    # 4. 获取完整历史股价（用于查找每个关键日期的收盘价）
    # -----------------------------
    # 获取尽可能长的历史行情
    try:
        hist = ak.stock_zh_a_hist(
            symbol=code,
            period="daily",
            start_date="19900101",
            end_date="20251231",  # 当前支持到未来
            adjust=""
        )
        hist['日期'] = pd.to_datetime(hist['日期'])
        price_series = hist.set_index('日期')['收盘'].sort_index()
        
    except Exception:
        price_series = pd.Series(dtype='float64')
    # -----------------------------
    # 5. 对每个关键日期，确定总股本和股价
    # -----------------------------
    results = []
    for event_date in all_key_dates:
        # 股本信息回溯
        if not shares_df.empty:
            valid = shares_df[shares_df['变动日期'] <= event_date]
            if not valid.empty:
                latest = valid.iloc[-1]
                total_shares = float(latest['总股本_股'])
                change_reason = latest['变动原因']
                flowed_shares = latest['已流通股份']
            else: 
                total_shares = None
                change_reason = None
                flowed_shares = None
        else:
            total_shares = None
            change_reason = None
            flowed_shares = None

        # 股价匹配
        if not price_series.empty:
            future = price_series[price_series.index >= event_date]
            if not future.empty:
                price = float(future.iloc[0])
            else:
                past = price_series[price_series.index <= event_date]
                price = float(past.iloc[-1]) if not past.empty else None
        else:
            price = None

        # 计算市值
        market_cap = price * total_shares if price and total_shares else None
        market_cap_b = market_cap / 1e8 if market_cap else None
        shares_b = total_shares / 1e8 if total_shares else None
        flowed_shares_b = flowed_shares / 1e4 if flowed_shares else None

        # 判断日期类型
        date_type = []
        if event_date in change_dates:
            date_type.append("股本变动")
        if event_date in dividend_dates:
            date_type.append("分红除息")
        date_type = " & ".join(date_type) if date_type else "未知"


        results.append({
            "date_type": date_type,
            "event_date": event_date.strftime("%Y-%m-%d"),
            "close_price": round(price, 2) if price else None,  
            "share_capital_billion": round(shares_b, 4) if shares_b else None,
            "market_cap_billion": round(market_cap_b, 2) if market_cap_b else None,
            "flowed_shares_billion": round(flowed_shares_b, 4) if flowed_shares_b else None,
            "change_reason": change_reason or ""
        })

    return sorted(results, key=lambda x: x["event_date"])

def test_stock_fhps_detail_ths(code):
    stock_fhps_detail_ths_df = ak.stock_fhps_detail_ths(symbol="603444")
    print(stock_fhps_detail_ths_df)

def test_stock_share_change_cninfo(code):
    df = ak.stock_share_change_cninfo(symbol=code)
    print("股本变动数据 shape:", df.shape)
    print("列名:", df.columns.tolist())
    print("前5行:")
    print(df[['总股本','已流通股份']].head())

def test_stock_zh_a_hist(code):
    hist = ak.stock_zh_a_hist(
        symbol=code,
        period="daily",
        start_date="20210101",
        end_date="20251029",  # 当前支持到未来
        adjust=""
    )
    hist['日期'] = pd.to_datetime(hist['日期'])
    price_series = hist.set_index('日期')['收盘'].sort_index()
    print(f"获取历史股价数据，记录数: {len(price_series)}")
    print(f"最新日期: {price_series.index[-1]}")
    print(f"price_series sample:\n{price_series.head(10)}")

if __name__ == "__main__":
    code = "600210"
    data = test_stock_zh_a_hist(code)