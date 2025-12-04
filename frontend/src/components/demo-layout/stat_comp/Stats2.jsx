import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const colors = [
  "#3B82F6", "#60A5FA", "#38BDF8", "#22D3EE", "#A78BFA",
  "#F6A521", "#005DE2", "#34D399", "#10B981", "#059669",
  "#D97706", "#F59E0B", "#FBBF24", "#FCD34D", "#FDE68A",
  "#EF4444", "#F87171", "#FCA5A5", "#FECACA", "#FEE2E2"
];

export default function SingleBarWithList({ data_pie, type = 1 }) {
  const navigate = useNavigate();
  const [activeSegment, setActiveSegment] = useState(null);
  const theme = useSelector((state) => state.app.theme);

  const handleClick = async (label) => {
    try {
      let token;
      if (label === 'Contractual Adj') {
        token = btoa(JSON.stringify({
          tabIndex: 1,
          selectedTags: ['Contractual Adj']
        }));
      } else if (label === 'Patient Resp') {
        token = btoa(JSON.stringify({
          tabIndex: 2,
          selectedTags: ['Patient Resp']
        }));
      } else {
        token = btoa(JSON.stringify({
          tabIndex: 0,
          selectedTags: [label]
        }));
      }

      const path = `${type === 0 ? '/rebound' : '/medevolve'}/${token}`;
      await navigate(path);
      
    } catch (error) {
      console.error("Navigation error:", error);
      // Optionally show user-friendly error message
      // alert("An error occurred. Please try again.");
    }
  };

  const data = [
    ...data_pie.map(item => ({
      name: item.name,
      value: item.value,
      change: parseFloat(item.percentage)
    }))
  ];
  
  const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="p-4 rounded">
      <h2 className="text-xl font-bold mb-2">Recoverable View</h2>
      <h1 className="text-4xl font-bold mb-2">{total.toLocaleString()}</h1>
      
      <div className={` ${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'}  py-4 rounded`}>
        <div className="h-[16px] w-full flex rounded-lg overflow-hidden relative">
          {data.map((item, index) => {
            const width = (item.value / total) * 100;
            return (
              <div
                key={index}
                className="h-full relative group cursor-pointer transition-all duration-200 hover:brightness-90"
                style={{ 
                  width: `${width}%`,
                  backgroundColor: colors[index % colors.length]
                }}
                onMouseEnter={() => setActiveSegment(index)}
                onMouseLeave={() => setActiveSegment(null)}
                onClick={() => handleClick(item.name)}
              >
                {activeSegment === index && (
                  <div className="absolute bottom-full mb-4 left-1/2 transform -translate-x-1/2 z-50">
                    <div className="relative">
                      <div className={`absolute w-3 h-3  ${theme === 'dark' ? 'bg-[#151619]' : ''}s transform rotate-45 left-1/2 -translate-x-1/2 translate-y-[6px] shadow-lg`}></div>
                      <div className={` ${theme === 'dark' ? 'bg-[#151619]' : ''} backdrop-blur-md rounded-lg p-3 shadow-xl border border-gray-100`}>
                        <div className="flex flex-col gap-1 min-w-[150px]">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
                            <p className="font-semibold text-gray-800">{item.name}</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-gray-600 text-sm">Total:</p>
                            <p className="font-bold text-gray-800">{item.value}</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-gray-600 text-sm">Share:</p>
                            <p className="font-medium text-gray-800">{width.toFixed(1)}%</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-gray-600 text-sm">Change:</p>
                            <p className={`font-medium ${item.change > 0 ? "text-green-500" : "text-red-500"}`}>
                              {item.change > 0 ? `+${item.change}%` : `${item.change}%`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 max-h-[230px] overflow-y-scroll">
      {sortedData.map((item, index) => (
          <div 
            key={item.name} 
            className={`flex justify-between items-center p-2 cursor-pointer ${theme === 'dark' ? 'bg-[#151619]' : ''} ${
              index === data.length - 1 ? 'border-b' : ''
            }`}
            onClick={() => handleClick(item.name)}
          >
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
              <span className="ml-2 text-sm font-medium">{item.name}</span>
            </div>
            <div className="text-right">
              <p className="font-bold">{item.value}</p>
              <p className={`text-sm ${item.change > 0 ? "text-green-500" : "text-red-500"}`}>
                {item.change > 0 ? `+${item.change}%` : `${item.change}%`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}