import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ReferenceLine } from "recharts";

function NetProfitYOYChart({ data, companyName }) {
  return (
    <section>
      <h2><span>{companyName}</span> 净利润同比增长 (YOY)</h2>
      <div className="chart-container">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
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
            <ReferenceLine y={0} stroke="#FFFFFF" />
            <Bar dataKey="净利润同比" fill="#8884d8" name="净利润同比增长" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default NetProfitYOYChart;