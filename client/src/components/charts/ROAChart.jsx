import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from "recharts";

function ROAChart({ data, companyName }) {
  return (
    <section>
      <h2><span>{companyName}</span> 总资产报酬率 (ROA)</h2>
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
            <Line type="monotone" dataKey="ROA" stroke="#82ca9d" name="总资产报酬率" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default ROAChart;