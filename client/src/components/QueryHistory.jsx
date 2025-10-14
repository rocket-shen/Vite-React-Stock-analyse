import React from 'react';
import './QueryHistory.css'; // 可选：添加样式
function QueryHistory({ history }) {
  if (!history || history.length === 0) {
    return <p className="no-history">暂无查询记录</p>;
  }

  return (
    <div className="query-history">
      <h3>查询历史记录</h3>
       <div className="table-container">
        <table className="history-table">
        <thead>
          <tr>
            <th>股票代码</th>
            <th>股票名称</th>
            <th>查询时间</th>
          </tr>
        </thead>
        <tbody>
          {history.map((record, index) => (
            <tr key={index}>
              <td>{record.code}</td>
              <td>{record.name}</td>
              <td>{record.time}</td>
            </tr>
          ))}
        </tbody>
      </table>

       </div>
      
    </div>
  );
}

export default QueryHistory;