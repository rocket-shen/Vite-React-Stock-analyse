import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";

function CurrentAssetsChart({ data, companyName, formatNumber }) {
  return (
    <section>
      <h2><span>{companyName}</span> 流动资产分析</h2>
      <div className="chart-container">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="报告期"
              tickFormatter={(date) => new Date(date).toLocaleDateString("zh-CN", { year: "numeric", month: "short" })}
              tick={{ fill: "#FFFFFF" }}
            />
            <YAxis tickFormatter={formatNumber} tick={{ fill: "#FFFFFF" }} />
            <Tooltip
              formatter={formatNumber}
              labelFormatter={(label) => new Date(label).toLocaleDateString("zh-CN")}
            />
            <Legend />
            <Bar dataKey="货币资金" stackId="a" fill="#aed6f1" />
            <Bar dataKey="应收账款及票据" stackId="a" fill="#5dade2" />
            <Bar dataKey="存货" stackId="a" fill="#85c1e9" />
            <Bar dataKey="合同资产" stackId="a" fill="#3498db" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default CurrentAssetsChart;