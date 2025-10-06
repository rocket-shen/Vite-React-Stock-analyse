import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ReferenceLine } from "recharts";

function RevenueYOYChart({ data, companyName }) {
  return (
    <section>
      <h2><span>{companyName}</span> 营业收入同比增长 (YOY)</h2>
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
            <Bar dataKey="营业收入同比" fill="#82ca9d" name="营业收入同比增长" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default RevenueYOYChart;