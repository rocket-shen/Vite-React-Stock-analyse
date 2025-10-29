import './FinancialTable.css'; 

function MarketCapTable({ marketCapData, stockName }) {
    if (!marketCapData || !Array.isArray(marketCapData) || marketCapData.length === 0) {
    return <div>暂无市值数据</div>;
    }

    marketCapData.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));

    const columns = [
        {key:'date_type', label:'日期类型'},
        {key:'event_date', label:'事件日期'},
        {key:'close_price', label:'股价'},
        {key:'share_capital_billion', label:'总股本（亿）'},
        {key:'market_cap_billion', label:'总市值(亿)'},
        {key:'flowed_shares_billion', label:'流通股本(亿)'},
        {key:'change_reason', label:'变动原因'},
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
            {marketCapData.map((row, index) => (
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

export default MarketCapTable;