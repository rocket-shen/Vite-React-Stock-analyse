import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from "recharts";

function GrossMarginChart({ data, companyName }) {
  return (
    <section>
      <h2><span>{companyName}</span> 毛利率</h2>
      <div className="chart-container">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="4 4" />
            <XAxis
              dataKey="报告期"
              tickFormatter={(date) => new Date(date).toLocaleDateString("zh-CN", { year: "numeric", month: "short" })}
              tick={{ fill: "#FFFFFF" }}
            />
            <YAxis unit="%" tick={{ fill: "#FFFFFF" }} />
            <Tooltip
              formatter={(value) => `${value}%`}
              labelFormatter={(label) => new Date(label).toLocaleDateString("zh-CN")}
            />
            <Legend />
            <Line type="monotone" dataKey="毛利率" stroke="#ff7300" name="毛利率" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default GrossMarginChart;