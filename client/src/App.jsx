import { useState } from 'react'
import { financialData } from './utilities/financialData'
import FileQuery from './components/FileQuery'
import FinancialCharts from './components/FinancialCharts'
import FinancialTable from './components/FinancialTable';
import ExchangeData from './components/ExchangeData';
import './App.css'

function App() {
  const [data, setData] = useState([]);
  const [showTable, setShowTable] = useState(false); // 新增：控制表格显示状态
  const handleQuery = async (code) => {
    try {
      const parsedData = await financialData(code); 
      setData(parsedData); 
      setShowTable(false); // 查询后默认隐藏表格
    } catch (error) {
      console.error("Error querying parsed sheet:", error);
      alert(`查询失败：${error.message || '网络错误，请稍后重试'}`);
    }
  };
  const toggleTable = () => {
    setShowTable(!showTable);
  };


  return (
    <>
      <div className="App">
        <header className="App-header">
          <h1>A股上市公司财报图表分析</h1>
          <p>This is a simple React application.</p>
        </header>
        <FileQuery onQuery={handleQuery}/>
        {/* 新增：切换按钮 */}
        {data.dataList && data.dataList.length > 0 && (
          <div className="toggle-button-container">
            <button 
              onClick={toggleTable}
              className="toggle-table-btn"
            >
              {showTable ? '隐藏表格' : '近5年财务数据摘要'}
            </button>
          </div>
        )}

        {/* 条件渲染表格 */}
        {showTable && <FinancialTable data={data} />}
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
