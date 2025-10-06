
from ..config import REPORT_DIR
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
    