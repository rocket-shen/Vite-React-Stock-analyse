import { useState } from 'react'
import { financialData } from './utilities/financialData'
import FileQuery from './components/FileQuery'
import FinancialCharts from './components/FinancialCharts'
import FinancialTable from './components/FinancialTable';
import ExchangeData from './components/ExchangeData';
import QueryHistory from './components/QueryHistory';
import Modal from './components/Modal'; // 新增：导入模态组件（需自行创建或使用现成库如react-modal）
import './App.css'

function App() {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false); // 修改：重用状态控制模态显示（原showTable现在控制模态）
  const [queryHistory, setQueryHistory] = useState(
    JSON.parse(localStorage.getItem('queryHistory')) || []
  );
  const handleQuery = async (code) => {
    try {
      const parsedData = await financialData(code); 
      setData(parsedData); 
      const stockName = parsedData.stockName || '未知公司';
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

      setShowModal(false); // 查询后默认关闭模态 原setShowTable(false)隐藏表格
    } catch (error) {
      console.error("Error querying parsed sheet:", error);
      alert(`查询失败：${error.message || '网络错误，请稍后重试'}`);
    }
  };
  // 修改：toggle函数现在控制模态（原toggleTable）
  const toggleModal = () => {
    setShowModal(!showModal);
  };
  // 新增：关闭模态的函数
  const closeModal = () => {
    setShowModal(false);
  };


  return (
    <>
      <div className="App">
        <header className="App-header">
          <h1>A股上市公司财报图表分析</h1>
          <p>This is a simple React application.</p>
        </header>
        <FileQuery onQuery={handleQuery}/>
        {/* 新增：展示查询历史 */}
        <QueryHistory history={queryHistory} />
        {/* 新增：切换按钮 */}
        {data.dataList && data.dataList.length > 0 && (
          <div className="toggle-button-container">
            <button 
              onClick={toggleModal}
              className="toggle-table-btn"
            >
              {showModal ? '隐藏表格' : '历史财务数据摘要'}
            </button>
          </div>
        )}

        {/* 修改：模态组件渲染FinancialTable */}
        {showModal && (
          <Modal onClose={closeModal}>
            <FinancialTable data={data} />
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
