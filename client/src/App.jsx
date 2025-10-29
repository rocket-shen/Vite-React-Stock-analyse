import { useState } from 'react';
import { financialData, stockBonus, fetchMarket } from './utilities/financialData';
import FileQuery from './components/FileQuery';
import FinancialCharts from './components/FinancialCharts';
import StockBonusData from './components/StockBonusData';
import FinancialTable from './components/FinancialTable';
import MarketCapTable from './components/MarketCapTable';
import ExchangeData from './components/ExchangeData';
import QueryHistory from './components/QueryHistory';
import Modal from './components/Modal'; // 新增：导入模态组件
import './App.css'

function App() {
  const [financial, setFinancialData] = useState([]);
  const [bonus, setBonusData] = useState(null);
  const [marketCap, setMarketCap] = useState([]);
  const [loading, setLoading] = useState(false);  // 新增：加载状态
  const [showModal, setShowModal] = useState(false); // 修改：重用状态控制模态显示（原showTable现在控制模态）
  const [showStockBonusModal, setShowStockBonusModal] = useState(false); // 新增：分红模态显示状态
  const [showMarketCapModal, setShowMarketCapModal] = useState(false); 
  const [queryHistory, setQueryHistory] = useState(
    JSON.parse(localStorage.getItem('queryHistory')) || []
  );
  const handleQuery = async (code) => {
    setLoading(true);
    try {
      const persedFinancialData = await financialData(code); 
      const persedBonusData = await stockBonus(code);
      const persedMarketCap = await fetchMarket(code);
      console.log("✅ Fetched marketCap:", persedMarketCap);
     
      setFinancialData(persedFinancialData); 
      setBonusData(persedBonusData);
      setMarketCap(persedMarketCap);

      const stockName = persedFinancialData.stockName || '未知公司';
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
      setShowStockBonusModal(false);  // 新增：查询后默认关闭分红模态
      setShowMarketCapModal(false);  // 新增：查询后默认关闭市值模态
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
        {financial.reportData &&(
          <div className="toggle-button-container">
            <button 
              onClick={() => setShowModal(!showModal)}
              className="toggle-table-btn"
            >
              {showModal ? '隐藏表格' : '历史财务数据'}
            </button>
            {bonus && bonus.bonusData && (
              <button 
              onClick={() => setShowStockBonusModal(!showStockBonusModal)}
              className="toggle-table-btn"
            >
              {showStockBonusModal ? '隐藏分红' : '历史分红派息'}
            </button>)}
            {Array.isArray(marketCap) && marketCap.length > 0 && (
            <button 
              onClick={() => setShowMarketCapModal(!showMarketCapModal)}
              className="toggle-table-btn"
            >
              {showMarketCapModal ? '隐藏市值' : '历史市值'}
            </button>)}
          </div>
        )}

        {/* 修改：模态组件渲染FinancialTable */}
        {showModal && (
          <Modal onClose={()=>setShowModal(false)}>
            <FinancialTable reportData={financial.reportData} 
            stockName={financial.stockName}/>
          </Modal>
        )}
        {showStockBonusModal && (
          <Modal onClose={()=>setShowStockBonusModal(false)}>
            <StockBonusData bonusData={bonus.bonusData} 
            stockName={financial.stockName}/>
          </Modal>
        )}
        {showMarketCapModal && (
          <Modal onClose={()=>setShowMarketCapModal(false)}>
            <MarketCapTable marketCapData={marketCap} 
            stockName={financial.stockName} title="历史市值数据"/>
          </Modal>
        )}
        <ExchangeData data={financial} />
        <FinancialCharts data={financial} />
      </div>
      <footer className="App-footer">
        <p>&copy; 2025 My React App</p>
      </footer>
    </>
  )
}

export default App
