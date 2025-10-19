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
    try:
        # 获取股本变动信息
        shares_chg = ak.stock_share_change_cninfo(symbol=code)
        if shares_chg.empty:
            print(f"❌ {code} 股本变动数据为空")
            return
        shares_chg = shares_chg[['变动日期','变动原因','总股本']]
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
        merge['变动日期'] = merge['变动日期'].dt.strftime('%Y-%m-%d')
        # 删除多余的日期列
        merge = merge.drop(columns=['日期'])

        # 重命名列为英文键，便于前端处理
        merge = merge.rename(columns={
            '变动日期': 'change_date',
            '变动原因': 'change_reason',
            '总股本': 'total_shares',
            '收盘': 'close_price',
            '总市值(亿)': 'total_market_value'
        })

        # 新增：处理 NaN 值，将其替换为 None 以确保 JSON 有效
        merge = merge.where(pd.notnull(merge), None)

        return merge.to_dict(orient='records')
        
    except Exception as e:
        print(e)
        return None
    


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
        print(f"Fetched {len(data_list)} bonus data items.")
        return data_list
    
    except requests.exceptions.RequestException as e:
        print(f"请求失败: {str(e)}")
    except json.JSONDecodeError:
        print("响应数据格式错误")
    except Exception as e:
        print(f"程序执行失败: {str(e)}")


