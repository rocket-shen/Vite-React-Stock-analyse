import { useState } from 'react';
import { financialData, stockData } from './utilities/financialData';
import FileQuery from './components/FileQuery';
import FinancialCharts from './components/FinancialCharts';
import MarketValueTable from './components/MarketValueTable';
import StockBonusData from './components/StockBonusData';
import FinancialTable from './components/FinancialTable';
import ExchangeData from './components/ExchangeData';
import QueryHistory from './components/QueryHistory';
import Modal from './components/Modal'; // 新增：导入模态组件
import './App.css'

function App() {
  const [data, setData] = useState([]);
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(false);  // 新增：加载状态
  const [showModal, setShowModal] = useState(false); // 修改：重用状态控制模态显示（原showTable现在控制模态）
  const [showMarketModal, setShowMarketModal] = useState(false); // 新增：市值模态显示状态
  const [showStockBonusModal, setShowStockBonusModal] = useState(false); // 新增：分红模态显示状态
  const [queryHistory, setQueryHistory] = useState(
    JSON.parse(localStorage.getItem('queryHistory')) || []
  );
  const handleQuery = async (code) => {
    setLoading(true);
    try {
      const persedData = await financialData(code); 
      const persedMarketData = await stockData(code);
     
      setData(persedData); 
      setMarketData(persedMarketData);
      const stockName = persedData.stockName || '未知公司';
      // 记录查询时间
      const timestamp = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });

      // 添加到查询历史
      setQueryHistory((prev) => {
        const newHistory = [{ code, name: stockName, time: timestamp }, ...prev];
        localStorage.setItem('queryHistory', JSON.stringify(newHistory));
        return newHistory;
      });

      setShowModal(false); // 查询后默认关闭模态 
      setShowMarketModal(false); // 新增：查询后默认关闭市值模态
      setShowStockBonusModal(false);  // 新增：查询后默认关闭分红模态
    } catch (error) {
      console.error("Error querying parsed sheet:", error);
      alert(`查询失败：${error.message || '网络错误，请稍后重试'}`);
    } finally {
      setLoading(false); // 无论成功或失败，都结束加载状态
    }
  };
 


  return (
    <>
      <div className="App">
        <header className="App-header">
          <h1>A股上市公司财报图表分析</h1>
          <p>This is a simple React application.</p>
        </header>
        <FileQuery onQuery={handleQuery} loading={loading} /> {/* 新增：传递loading状态给FileQuery组件，以便其内部显示加载指示器 */}

        {/* 新增：展示查询历史 */}
        <QueryHistory history={queryHistory} />
        {/* 新增：切换按钮 */}
        {data.reportData && marketData.marketValue && marketData.bonusData &&(
          <div className="toggle-button-container">
            <button 
              onClick={() => setShowModal(!showModal)}
              className="toggle-table-btn"
            >
              {showModal ? '隐藏表格' : '历史财务数据'}
            </button>
            <button 
              onClick={() => setShowMarketModal(!showMarketModal)}
              className="toggle-table-btn"
            >
              {showMarketModal ? '隐藏市值' : '历史股本市值'}
            </button>
            <button 
              onClick={() => setShowStockBonusModal(!showStockBonusModal)}
              className="toggle-table-btn"
            >
              {showStockBonusModal ? '隐藏分红' : '历史分红派息'}
            </button>
          </div>
        )}

        {/* 修改：模态组件渲染FinancialTable */}
        {showModal && (
          <Modal onClose={()=>setShowModal(false)}>
            <FinancialTable reportData={data.reportData} 
            stockName={data.stockName}/>
          </Modal>
        )}
        {showMarketModal && (
          <Modal onClose={()=>setShowMarketModal(false)}>
            <MarketValueTable marketValue={marketData.marketValue} 
            stockName={data.stockName}/>
          </Modal>
        )}
        {showStockBonusModal && (
          <Modal onClose={()=>setShowStockBonusModal(false)}>
            <StockBonusData bonusData={marketData.bonusData} 
            stockName={data.stockName}/>
          </Modal>
        )}
        <ExchangeData data={data} />
        <FinancialCharts data={data} />
      </div>
      <footer className="App-footer">
        <p>&copy; 2025 My React App</p>
      </footer>
    </>
  )
}

export default App
