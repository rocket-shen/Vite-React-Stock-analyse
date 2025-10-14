import './ExchangeData.css'; // 假设有对应的 CSS 文件
function ExchangeData({ data }) {
    if (!data || !data.exchangeData || Object.keys(data.exchangeData).length === 0) {
    return <div>请输入股票代码查询交易数据</div>;
  }
  const exchangeData = data.exchangeData;

  const keysOrders = ['现价','涨跌幅','换手','成交额','成交量', '52周最高', '52周最低','今年以来涨跌幅',
    '每股收益', '每股净资产', '股息(TTM)', '股息率(TTM)', '市净率', '滚动市盈率','市盈率(静)','市盈率(动)',
    '流通股', '流通值',  '总股本', '总市值','股权质押比例', '净利润','盈利预测','注册制'];

  // 1. 过滤：只保留 keysOrders 中存在的键
  const filteredEntries = Object.entries(exchangeData).filter(([key, value]) => {
    return keysOrders.includes(key);
  });

  // 2. 排序：按 keysOrders 的顺序排列
  const entries = filteredEntries.sort((a, b) => {
    return keysOrders.indexOf(a[0]) - keysOrders.indexOf(b[0]);
  });
  const companyName = data.stockName || "未知公司";

  // 格式化数值，统一保留小数点后两位
  const formatValue = (value) => {
    if (typeof value !== 'number') return value?.toString() || 'N/A';
    if (value >= 1e8) return (value / 1e8).toFixed(2) + '亿';
    if (value >= 1e6) return (value / 1e6).toFixed(2) + '百万';
    if (value >= 1e4) return (value / 1e4).toFixed(2) + '万';
    return value.toFixed(2); // 小于1万的数值直接保留两位小数
  };

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

  return (
    <div className="exchange-data-container">
      <h2> {companyName} 交易数据</h2>
      <div className="exchange-data-grid">
        {entries.map(([key, value]) => (
          <div key={key}>
            <span>{key}</span>
            <span>{formatLargeNumber(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExchangeData;