import requests
import json
import akshare as ak
import os
import pandas as pd
import logging
from datetime import datetime
from src.config import SYMBOL_DICT_PATH, STOCK_EXCHANGE_PATH, URL_HQ, HEADERS

def load_stock_dict():
    """返回已加载的字典，不再每次读磁盘。"""
    with SYMBOL_DICT_PATH.open(encoding="utf-8-sig") as f:
        return json.load(f)
    return STOCK_DICT

def fetch_hq_cookies():
    """从雪球HQ页面获取Cookies"""
    response = requests.get(URL_HQ, headers=HEADERS)
    print(f"HQ response status: {response.status_code}")
    return "; ".join([f"{c.name}={c.value}" for c in response.cookies])

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
    
def fetch_exchange_data(url, cookies, params):
    """获取股票交易所数据"""
    try:
        response = requests.get(url, headers={**HEADERS, "Cookie": cookies}, params=params)
        response.raise_for_status()
        data = response.json().get('data', {}).get('quote', {})
        with open(STOCK_EXCHANGE_PATH, 'r', encoding='utf-8') as f:
            exchange_json = json.load(f)
        if "issue_date" in data:
            data["issue_date"] = datetime.fromtimestamp(data["issue_date"] / 1000).strftime('%Y-%m-%d')
        exchange_data = {exchange_json[k]: v for k, v in data.items() if k in exchange_json}
        return exchange_data
    except Exception as e:
        raise Exception(f"获取交易所数据失败: {str(e)}")
    
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

    


def fetch_bonus_data(url, cookies, params):
    """获取财务数据并处理时间戳和列表字段"""
    try:
        response = requests.get(url, headers={**HEADERS, "Cookie": cookies}, params=params)
        response.raise_for_status()
        data_list = response.json().get("data", {}).get("items", [])

        for item in data_list:
            for field in ['ashare_ex_dividend_date', 'ex_dividend_date', 'equity_date', 'dividend_date']:
                if item.get(field) is not None:
                    timestamp_ms = item[field]
                    timestamp_s = timestamp_ms / 1000.0
                    dt = datetime.fromtimestamp(timestamp_s)
                    item[field] = dt.strftime('%Y%m%d')
        return data_list
    
    except requests.exceptions.RequestException as e:
        print(f"请求失败: {str(e)}")
    except json.JSONDecodeError:
        print("响应数据格式错误")
    except Exception as e:
        print(f"程序执行失败: {str(e)}")


