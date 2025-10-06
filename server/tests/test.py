from ..src.config import REPORT_DIR,ASSETS_DIR
import pandas as pd
import os
import json 


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

if __name__ == "__main__":
    process_stock_dict(2024)
