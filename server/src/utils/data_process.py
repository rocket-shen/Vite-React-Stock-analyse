
from src.config import REPORT_DIR
from datetime import datetime
import pandas as pd
import os
import logging


def process_symbol(symbol):
    """
    根据证券代码添加市场前缀 SH 或 SZ
    """
    if symbol.startswith(('600', '601', '603', '605', '688')):
        return 'SH' + symbol
    elif symbol.startswith(('000', '001', '002', '003', '300')):
        return 'SZ' + symbol
    else:
        return symbol  # 或根据需要处理异常情况
    

def fetch_financial_report(smybol):
    file_names = [os.path.join(REPORT_DIR, f"业绩报表_{year}1231.csv") for year in range(2019, 2025)]
    results = []
    for file_name in file_names:
        if os.path.exists(file_name):
            try:
                df = pd.read_csv(file_name, encoding="utf_8_sig", dtype={'股票代码': str})
                if "股票代码" in df.columns:
                    df["股票代码"] = df["股票代码"].astype(str).str.strip()
                    stock_data = df[df["股票代码"] == smybol]
                    if not stock_data.empty:
                        date_part = os.path.basename(file_name).split("_")[1].split(".")[0]
                        stock_data = stock_data.assign(报告期=date_part)
                        results.append(stock_data)
            except Exception as e:
                logging.error(f"读取文件 {file_name} 出错: {str(e)}")
                raise Exception(f"读取文件 {file_name} 出错: {str(e)}")
        else:
            logging.warning(f"文件 {file_name} 不存在")
    if not results:
        raise Exception(f"未找到股票代码 {smybol} 的业绩数据")
    # 合并所有年份的数据
    perf_df = pd.concat(results, ignore_index=True)
    selected_columns = ['报告期', '营业总收入-营业总收入', '净利润-净利润', '每股收益', '每股净资产', '每股经营现金流量', '销售毛利率', '净资产收益率']
    available_columns = [col for col in selected_columns if col in perf_df.columns]
    reports_data = perf_df[available_columns].to_dict(orient='records')

    return reports_data
    
def process_financial_data(balance_data, income_data, cash_data):
    """
    处理原始数据，计算精简指标（ROE、ROA 等），返回 dataList 数组。
    """
    # 1. balanceData 映射
    balance_map = {}
    for item in balance_data:
        report_date = item.get('report_date')
        if report_date:
            balance_map[report_date] = {
                'equity': item.get('total_quity_atsopc', [0])[0] or 0,  # 归属于母公司股东权益合计
                'assets': item.get('total_assets', [0])[0] or 0,  # 资产合计
                'liabilities': item.get('total_liab', [0])[0] or 0,  # 负债合计
                'currentAssets': item.get('total_current_assets', [0])[0] or 0,  # 流动资产
                'currentLiabilities': item.get('total_current_liab', [0])[0] or 0,  # 流动负债
                'currencyFunds': item.get('currency_funds', [0])[0] or 0,  # 货币资金
                'arAndBr': item.get('ar_and_br', [0])[0] or 0,  # 应收账款及票据
                'inventory': item.get('inventory', [0])[0] or 0,  # 存货
                'contractualAssets': item.get('contractual_assets', [0])[0] or 0,  # 合同资产
            }

    # 2. cashData 映射
    cash_map = {}
    for item in cash_data:
        report_date = item.get('report_date')
        if report_date:
            cash_map[report_date] = {
                'netCashFlowOper': item.get('ncf_from_oa', [0])[0] or 0  # 经营现金流净额
            }

    # 3. 计算 dataList
    data_list = []
    for item in income_data:
        report_date = item.get('report_date')
        if not report_date:
            continue

        net_profit_atsopc = item.get('net_profit_atsopc', [0])[0] or 0  # 归母净利润
        net_profit = item.get('net_profit', [0])[0] or 0  # 净利润
        net_profit_yoy = item.get('net_profit', [0, 0])[1] or 0  # 净利润同比
        revenue = item.get('revenue', [0])[0] or 0  # 营业收入
        revenue_yoy = item.get('revenue', [0, 0])[1] or 0  # 营业收入同比
        operating_cost = item.get('operating_cost', [0])[0] or 0  # 营业成本

        # 从 balance_map 和 cash_map 获取对应数据
        balance_item = balance_map.get(report_date, {})
        cash_item = cash_map.get(report_date, {})

        equity = balance_item.get('equity', 0)
        assets = balance_item.get('assets', 0)
        liabilities = balance_item.get('liabilities', 0)
        current_assets = balance_item.get('currentAssets', 0)
        current_liabilities = balance_item.get('currentLiabilities', 0)
        currency_funds = balance_item.get('currencyFunds', 0)
        ar_and_br = balance_item.get('arAndBr', 0)
        inventory = balance_item.get('inventory', 0)
        contractual_assets = balance_item.get('contractualAssets', 0)
        net_cash_flow_oper = cash_item.get('netCashFlowOper', 0)

        # 计算指标
        roe = (net_profit_atsopc / equity * 100) if equity else 0
        roa = (net_profit_atsopc / assets * 100) if assets else 0
        debt_to_asset_ratio = (liabilities / assets * 100) if assets else 0  # 资产负债率
        current_ratio = (current_assets / current_liabilities) if current_liabilities else 0  # 流动比率
        gross_margin = ((revenue - operating_cost) / revenue * 100) if revenue else 0  # 毛利率

        data_entry = {
            '报告期': report_date,
            'ROE': round(roe, 2),
            'ROA': round(roa, 2),
            '资产负债率': round(debt_to_asset_ratio, 2),
            '流动比率': round(current_ratio, 2),
            '流动资产': round(current_assets, 2),
            '货币资金': round(currency_funds, 2),
            '应收账款及票据': round(ar_and_br, 2),
            '存货': round(inventory, 2),
            '合同资产': round(contractual_assets, 2),
            '资产合计': round(assets, 2),
            '流动负债': round(current_liabilities, 2),
            '负债合计': round(liabilities, 2),
            '毛利率': round(gross_margin, 2),
            '净利润': round(net_profit, 2),
            '净利润同比': round(net_profit_yoy * 100, 2) if net_profit_yoy else None,
            '营业收入同比': round(revenue_yoy * 100, 2) if revenue_yoy else None,
            '归母净利润': round(net_profit_atsopc, 2),
            '经营现金流净额': round(net_cash_flow_oper, 2),
            '营业收入': round(revenue, 2),
        }
        data_list.append(data_entry)

    # 4. 按报告期升序排序
    data_list.sort(key=lambda x: datetime.strptime(x['报告期'], '%Y-%m-%d'))
    return data_list