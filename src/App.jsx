import { useState } from 'react'
import { financialData } from './utilities/financialData'
import FileQuery from './components/FileQuery'
import FinancialCharts from './components/FinancialCharts'
import './App.css'

function App() {
  const [data, setData] = useState([])
  const handleQuery = async (code) => {
    try {
      const parsedData = await financialData(code); 
      setData(parsedData); 
    } catch (error) {
      console.error("Error querying parsed sheet:", error);
      alert(`查询失败：${error.message || '网络错误，请稍后重试'}`);
    }
  };

  return (
    <>
      <div className="App">
        <header className="App-header">
          <h1>A股上市公司财报图表分析</h1>
          <p>This is a simple React application.</p>
        </header>
        <FileQuery onQuery={handleQuery}/>
        <FinancialCharts data={data} />
      </div>
      <footer className="App-footer">
        <p>&copy; 2025 My React App</p>
      </footer>
    </>
  )
}

export default App
