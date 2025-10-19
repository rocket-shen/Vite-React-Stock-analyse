import './FinancialTable.css'; 

function MarketValueTable({ marketValue, stockName }) {
    if (!marketValue || !Array.isArray(marketValue) || marketValue.length === 0) {
    return <div>暂无市值数据</div>;
    }

    marketValue.sort((a, b) => new Date(b.change_date) - new Date(a.change_date));

    const columns = [
        {key:'change_date', label:'变动日期'},
        {key:'close_price', label:'收盘', format: (value) => value ? value.toFixed(2) : 'N/A' },
        {key:'change_reason', label:'变动原因'},
        {key:'total_shares', label:'总股本', format: (value) => value ? value.toFixed(2) : 'N/A' },
        {key:'total_market_value', label:'总市值(亿)', format: (value) => value ? value.toFixed(2) : 'N/A' },
    ]

  return (
     <div className="financial-table-container">
      <h2>{stockName} 历史股本变动及市值</h2>
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
            {marketValue.map((row, index) => (
              <tr key={index}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.format
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
};

export default MarketValueTable;