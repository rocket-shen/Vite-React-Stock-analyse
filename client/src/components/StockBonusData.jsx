import './FinancialTable.css'; 

function StockBonusData({ bonusData, stockName}) {
    if (!bonusData || !Array.isArray(bonusData) || bonusData.length === 0) {
        return <div>暂无分红数据</div>;
    }

    const columns = [
        {key:'dividend_year', label:'报告期'},
        {key:'plan_explain', label:'方案'},
        {key:'equity_date', label:'股权登记日'},
        {key:'ashare_ex_dividend_date', label:'除权除息日'},
        {key:'dividend_date', label:'派息日'},
    ]

    return (
     <div className="financial-table-container">
      <h2>{stockName} 历史分红派息</h2>
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
            {bonusData.map((row, index) => (
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

export default StockBonusData;
