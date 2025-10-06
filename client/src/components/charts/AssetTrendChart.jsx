import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from "recharts";

function AssetTrendChart({ data, companyName, formatNumber }) {
  return (
    <section>
      <h2><span>{companyName}</span> 资产趋势分析</h2>
      <div className="chart-container">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 10, left: 15, bottom: 5 }}>
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
            <Line type="monotone" dataKey="资产合计" stroke="#ec7063" name="资产合计" />
            <Line type="monotone" dataKey="流动资产" stroke="#eff444" name="流动资产" />
            <Line type="monotone" dataKey="负债合计" stroke="#5dade2" name="负债合计" />
            <Line type="monotone" dataKey="流动负债" stroke="#839192" name="流动负债" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default AssetTrendChart;