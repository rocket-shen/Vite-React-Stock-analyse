import React, { useState } from 'react';

function FileQuery({onQuery}) {
  const [code, setCode] = useState('');
  const handleQuery = () => {
    if(onQuery){
      // 将输入的股票代码转换为大写
      const upperCaseCode = code.trim().toUpperCase();
      if (!upperCaseCode) {
        alert('请输入有效的股票代码');
        return;
      }
      onQuery(upperCaseCode);
    }
  };
  return (
    <div className="file-query">
        <input
          type="text"
          placeholder="输入股票代码：SH600000"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
        />
        <button onClick={handleQuery}>查询</button>
    </div>
  );
}

export default FileQuery;