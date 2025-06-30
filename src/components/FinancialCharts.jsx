import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from "recharts";

function FinancialCharts({ data }) {
  if (!data || data.length === 0) {
    return;
  }
  const sortedData = [...data].sort(
    (a, b) => new Date(a.报告期) - new Date(b.报告期)
  );
  const companyName = sortedData[0]?.companyName || "未知公司";
  const formatNumber = (num) => {
    if (num >= 1e8 || num <= 1e8) return (num / 1e8).toFixed(2) + "亿";
    if (num >= 1e4 || num <= 1e4) return (num / 1e4).toFixed(2) + "万";
    return num.toFixed(2);
  };

  return (
    <>
      <div className="charts-container">
        <section>
          <h2>{companyName} 总资产报酬率 (ROA)</h2>
          <div className="chart-container">
            <ResponsiveContainer>
              <LineChart
                data={sortedData}
                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="4 4" />
                <XAxis
                  dataKey="报告期"
                  tickFormatter={(data) =>
                    new Date(data).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "short",
                    })
                  }
                  tick={{ fill: "#FFFFFF" }}
                />
                <YAxis unit="%" tick={{ fill: "#FFFFFF" }} />
                <Tooltip
                  formatter={(value) => `${value}%`}
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString("zh-CN")
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ROA"
                  stroke="#82ca9d"
                  name="总资产报酬率"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section>
          <h2>{companyName} 净资产收益率 (ROE)</h2>
          <div className="chart-container">
            <ResponsiveContainer>
              <LineChart
                data={sortedData}
                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="报告期"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "short",
                    })
                  }
                  tick={{ fill: "#FFFFFF" }}
                />
                <YAxis unit="%" tick={{ fill: "#FFFFFF" }} />
                <Tooltip
                  formatter={(value) => `${value}%`}
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString("zh-CN")
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ROE"
                  stroke="#82ca9d"
                  name="净资产收益率"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="charts-container">
        <section>
          <h2>{companyName} 流动比率趋势</h2>
          <div className="chart-container">
            <ResponsiveContainer>
              <BarChart
                data={sortedData}
                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="报告期"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "short",
                    })
                  }
                  tick={{ fill: "#FFFFFF" }}
                />
                <YAxis tick={{ fill: "#FFFFFF" }} />
                <Tooltip
                  formatter={(value) => value}
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString("zh-CN")
                  }
                />
                <Legend />
                <Bar dataKey="流动比率" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section>
          <h2>{companyName} 毛利率</h2>
          <div className="chart-container">
            <ResponsiveContainer>
              <LineChart
                data={sortedData}
                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="4 4" />
                <XAxis
                  dataKey="报告期"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "short",
                    })
                  }
                  tick={{ fill: "#FFFFFF" }}
                />
                <YAxis unit="%" tick={{ fill: "#FFFFFF" }} />
                <Tooltip
                  formatter={(value) => `${value}%`}
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString("zh-CN")
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="毛利率"
                  stroke="#ff7300"
                  name="毛利率"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="charts-container">
        <section>
          <h2>{companyName} 净利润VS经营现金流净额</h2>
          <div className="chart-container">
            <ResponsiveContainer>
              <BarChart
                data={sortedData}
                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="报告期"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "short",
                    })
                  }
                  tick={{ fill: "#FFFFFF" }}
                />
                <YAxis
                  tickFormatter={formatNumber}
                  tick={{ fill: "#FFFFFF" }}
                />
                <Tooltip
                  formatter={formatNumber}
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString("zh-CN")
                  }
                />
                <Legend />
                <Bar dataKey="净利润" fill="#7dcea0" />
                <Bar dataKey="经营现金流净额" fill="#0ead54" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section>
          <h2>{companyName} 资产趋势分析</h2>
          <div className="chart-container">
            <ResponsiveContainer>
              <LineChart
                data={sortedData}
                margin={{ top: 10, right: 10, left: 15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="4 4" />
                <XAxis
                  dataKey="报告期"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "short",
                    })
                  }
                  tick={{ fill: "#FFFFFF" }}
                />
                <YAxis
                  tickFormatter={formatNumber}
                  tick={{ fill: "#FFFFFF" }}
                />
                <Tooltip
                  formatter={formatNumber}
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString("zh-CN")
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="资产合计"
                  stroke="#ec7063"
                  name="资产合计"
                />
                <Line
                  type="monotone"
                  dataKey="流动资产"
                  stroke="#eff444"
                  name="流动资产"
                />
                <Line
                  type="monotone"
                  dataKey="负债合计"
                  stroke="#5dade2"
                  name="负债合计"
                />
                <Line
                  type="monotone"
                  dataKey="流动负债"
                  stroke="#839192"
                  name="流动负债"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
      <div className="charts-container">
        <section>
          <h2>{companyName} 流动资产分析</h2>
          <div className="chart-container">
            <ResponsiveContainer>
              <BarChart
                data={sortedData}
                margin={{ top: 10, right: 10, left: 15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="报告期"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "short",
                    })
                  }
                  tick={{ fill: "#FFFFFF" }}
                />
                <YAxis tickFormatter={formatNumber} tick={{ fill: "#FFFFFF" }} />
                <Tooltip
                  formatter={formatNumber}
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString("zh-CN")
                  }
                />
                <Legend />
                <Bar dataKey="货币资金" stackId="a" fill="#aed6f1" />
                <Bar dataKey="应收票据及账款" stackId="a" fill="#5dade2" />
                <Bar dataKey="存货" stackId="a" fill="#85c1e9" />
                <Bar dataKey="合同资产" stackId="a" fill="#3498db" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section>
          <h2>{companyName} 营收趋势分析</h2>
          <div className="chart-container">
            <ResponsiveContainer>
              <LineChart
                data={sortedData}
                margin={{ top: 10, right: 10, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="4 4" />
                <XAxis
                  dataKey="报告期"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "short",
                    })
                  }
                  tick={{ fill: "#FFFFFF" }}
                />
                <YAxis tickFormatter={formatNumber} tick={{ fill: "#FFFFFF" }} />
                <Tooltip
                  formatter={formatNumber}
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString("zh-CN")
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="营业收入"
                  stroke="#ff7300"
                  name="营业收入"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </>
  );
}
export default FinancialCharts;
