import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList } from "recharts";
import { useSelector } from "react-redux";

const formatCurrency = (value) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else {
    return `$${(value / 1000).toFixed(0)}K`;
  }
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-xl border border-gray-100">
        <p className="font-semibold text-gray-800">{payload[0].payload.name}</p>
        <p className="text-blue-500 font-bold mt-1">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function HorizontalBarChart({data}) {
  const theme = useSelector((state) => state.app.theme);
  const [chartWidth, setChartWidth] = useState(500);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      if (width < 768) {
        setChartWidth(Math.min(width - 40, 500));
      } else {
        setChartWidth(500);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const transformedData = data.map(item => ({
    name: item.name,
    value: item.TotalCharge,
    label: formatCurrency(item.TotalCharge)
  }));

  return (
    <div className="py-6 px-3 rounded-xl shadow-sm">
      <div className="flex flex-col justify-center items-center w-full">
        <h2 className={`text-xl font-bold mb-6 text-left ${theme === 'dark' ?'text-white' :'text-gray-800'} `}>
          AI Automation Recovery Report
        </h2>
        <div className="w-full overflow-x-auto flex justify-center">
          <BarChart
            width={chartWidth}
            height={300}
            data={transformedData}
            layout="vertical"
            margin={{
              top: 20,
              right: isMobile ? 50 : 50,
              left: isMobile ? -5 : -60,
              bottom: 20
            }}
            className={`${theme === 'dark' ? 'bg-[#151619]' :''}`}
          >
            <XAxis
              type="number"
              domain={[0, 1000000]}
              tickFormatter={formatCurrency}
              stroke="#94a3b8"
              tick={{ fill: '#64748b', fontSize: isMobile ? 10 : 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={isMobile ? 100 : 150}
              stroke="#94a3b8"
              tick={{ fill: '#64748b', fontSize: isMobile ? 11 : 13 }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
            </defs>
            <Bar
              dataKey="value"
              fill="url(#barGradient)"
              radius={[4, 4, 4, 4]}
              barSize={isMobile ? 20 : 24}
            >
              <LabelList 
                dataKey="label" 
                position="right" 
                fill="#64748b"
                fontSize={isMobile ? 9 : 10}
                fontWeight="600"
                offset={5}
              />
            </Bar>
          </BarChart>
        </div>
      </div>
    </div>
  );
}