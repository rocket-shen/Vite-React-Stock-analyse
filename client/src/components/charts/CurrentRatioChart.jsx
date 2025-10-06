import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";

function CurrentRatioChart({ data, companyName }) {
  return (
    <section>
      <h2><span>{companyName}</span> 流动比率趋势</h2>
      <div className="chart-container">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="报告期"
              tickFormatter={(date) => new Date(date).toLocaleDateString("zh-CN", { year: "numeric", month: "short" })}
              tick={{ fill: "#FFFFFF" }}
            />
            <YAxis tick={{ fill: "#FFFFFF" }} />
            <Tooltip
              formatter={(value) => value}
              labelFormatter={(label) => new Date(label).toLocaleDateString("zh-CN")}
            />
            <Legend />
            <Bar dataKey="流动比率" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default CurrentRatioChart;