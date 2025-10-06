import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from "recharts";

function RevenueTrendChart({ data, companyName, formatNumber }) {
  return (
    <section>
      <h2><span>{companyName}</span> 营收趋势分析</h2>
      <div className="chart-container">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 10, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="4 4" />
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
            <Line type="monotone" dataKey="营业收入" stroke="#ff7300" name="营业收入" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default RevenueTrendChart;