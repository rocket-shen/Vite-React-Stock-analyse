import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";

function NetProfitVsCashFlowChart({ data, companyName, formatNumber }) {
  return (
    <section>
      <h2><span>{companyName}</span> 净利润VS经营现金流净额</h2>
      <div className="chart-container">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
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
            <Bar dataKey="净利润" fill="#7dcea0" />
            <Bar dataKey="经营现金流净额" fill="#0ead54" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default NetProfitVsCashFlowChart;