import React, { useState } from 'react';

function FileQuery({onQuery}) {
  const [code, setCode] = useState('');
  const handleQuery = () => {
    if(onQuery){
      onQuery(code);
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