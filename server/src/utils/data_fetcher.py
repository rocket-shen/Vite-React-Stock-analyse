import requests
import json
import os
import pandas as pd
import logging
from datetime import datetime
from ..config import SYMBOL_DICT_PATH, STOCK_EXCHANGE_PATH, URL_HQ, HEADERS

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
    


