import AssetTrendChart from "./charts/AssetTrendChart";
import CurrentAssetsChart from "./charts/CurrentAssetsChart";
import CurrentRatioChart from "./charts/CurrentRatioChart";
import GrossMarginChart from "./charts/GrossMarginChart";
import NetProfitVsCashFlowChart from "./charts/NetProfitVsCashFlowChart";
import NetProfitYOYChart from "./charts/NetProfitYOYChart";
import RevenueYOYChart from "./charts/RevenueYOYChart";
import RevenueTrendChart from "./charts/RevenueTrendChart";
import ROEChart from "./charts/ROEChart";
import ROAChart from "./charts/ROAChart";

import './FinancialCharts.css'

function FinancialCharts({ data }) {
  if (!data || !data.dataList || data.dataList.length === 0) {
    return;
  };
  const sortedData = data.dataList;
  const companyName = data.stockName || "未知公司";
  const formatNumber = (num) => {
    if (num >= 1e8 || num <= 1e8) return (num / 1e8).toFixed(2) + "亿";
    if (num >= 1e4 || num <= 1e4) return (num / 1e4).toFixed(2) + "万";
    return num.toFixed(2);
  };

  return (
     <div className="charts-container">
      <ROAChart data={sortedData} companyName={companyName} />
      <ROEChart data={sortedData} companyName={companyName} />
      <RevenueYOYChart data={sortedData} companyName={companyName} />
      <NetProfitYOYChart data={sortedData} companyName={companyName} />
      <RevenueTrendChart data={sortedData} companyName={companyName} formatNumber={formatNumber} />
      <GrossMarginChart data={sortedData} companyName={companyName} />
      <NetProfitVsCashFlowChart data={sortedData} companyName={companyName} formatNumber={formatNumber} />
      <AssetTrendChart data={sortedData} companyName={companyName} formatNumber={formatNumber} />
      <CurrentRatioChart data={sortedData} companyName={companyName} />
      <CurrentAssetsChart data={sortedData} companyName={companyName} formatNumber={formatNumber} />
    </div>
  );
}
export default FinancialCharts;
