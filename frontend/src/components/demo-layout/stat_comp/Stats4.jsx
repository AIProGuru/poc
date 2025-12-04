import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useSelector } from "react-redux";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-xl border border-gray-100">
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-blue-500">
            {entry.name}: {(entry.value / 1000).toFixed(2)}k
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function GroupedBarChart({ data }) {
  const theme = useSelector((state) => state.app.theme);
  return (
    <div className={`p-6  ${theme === 'dark' ? 'bg-[#151619]' :''} rounded-xl flex flex-col justify-center items-center shadow-sm`}>
      <h2 className={`text-xl font-bold mb-6 text-left ${theme === 'dark' ?'text-white' :'text-gray-800'} `} >Assigned View</h2>
      <BarChart
        width={500}
        height={300}
        data={data}
     
        margin={{
          top: 20,
          right: 50,
          left: 10,
          bottom: 10,
        }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="#f0f0f0"
          vertical={false}
        />
        <XAxis 
          dataKey="name"
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={{ stroke: '#e2e8f0' }}
        />
        <YAxis 
          tickFormatter={(value) => `${value / 1000}k`}
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={{ stroke: '#e2e8f0' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{
            paddingTop: "20px"
          }}
        />
        <Bar
          dataKey="value"
          fill="#3B82F6"
          barSize={30}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </div>
  );
}