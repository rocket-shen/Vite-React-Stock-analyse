import React from 'react';
import './FinancialTable.css'; // 假设有对应的 CSS 文件

function FinancialTable({ reportData, stockName }) {
  if (!reportData || !Array.isArray(reportData) || reportData.length === 0) {
    return <div>暂无报告数据</div>;
  }

  // 定义表格列：基于提供的示例数据结构
  const columns = [
    { key: '报告期', label: '报告期' },
    { key: '营业总收入-营业总收入', label: '营业总收入 (元)', format: (value) => formatLargeNumber(value) },
    { key: '净利润-净利润', label: '净利润 (元)', format: (value) => formatLargeNumber(value) },
    { key: '每股收益', label: '每股收益 (元)', format: (value) => value ? value.toFixed(2) : 'N/A' },
    { key: '每股净资产', label: '每股净资产 (元)', format: (value) => value ? value.toFixed(2) : 'N/A' },
    { key: '每股经营现金流量', label: '每股经营现金流量 (元)', format: (value) => value ? value.toFixed(2) : 'N/A' },
    { key: '销售毛利率', label: '销售毛利率 (%)', format: (value) => value ? value.toFixed(2) : 'N/A' },
    { key: '净资产收益率', label: '净资产收益率 (%)', format: (value) => value ? value.toFixed(2) : 'N/A' },
  ];

const formatLargeNumber = (num) => {
  const absNum = Math.abs(num);
  let formatted;
  if (absNum >= 1e8) {
    formatted = (absNum / 1e8).toFixed(2) + "亿";
  } else if (absNum >= 1e6) {
    formatted = (absNum / 1e6).toFixed(2) + "百万";
  } else if (absNum >= 1e4) {
    formatted = (absNum / 1e4).toFixed(2) + "万";
  } else {
    formatted = absNum.toFixed(2);
  }
  return num < 0 ? "-" + formatted : formatted;
};

  // 格式化报告期：从 YYYYMMDD 转换为 YYYY年MM月
  const formatReportDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    return `${year}年${month}月`;
  };

  return (
    <div className="financial-table-container">
      <h2>{stockName} 业绩报告数据</h2>
      <div className="table-scroll">
        <table className="financial-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, index) => (
              <tr key={index}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.key === '报告期'
                      ? formatReportDate(row[col.key])
                      : col.format
                      ? col.format(row[col.key])
                      : row[col.key] || 'N/A'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FinancialTable;