import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import axios from "axios";
import { useSelector } from "react-redux";
import { useApiEndpoint } from "../../../ApiEndpointContext";


const formatNumber = (value) => {
  const formattedValue = Number(value).toLocaleString();
  return formattedValue.length > 10 ? formattedValue.slice(0, 7) + '...' : formattedValue;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-xl border border-gray-100">
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className={`text-sm ${entry.dataKey === 'Charge' ? 'text-[#005DE2]' : 'text-[#F6A521]'}`}>
            {entry.dataKey}: ${formatNumber(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};
const ClaimDistributionChart = () => {
  const [chartWidth, setChartWidth] = useState(500);
  const [isMobile, setIsMobile] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = useApiEndpoint();
  const theme = useSelector((state) => state.app.theme);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      if (width < 768) {
        setChartWidth(Math.min(width - 130, 500));
      } else {
        setChartWidth(500);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (apiUrl === '') return;

    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/stats_part1_combined`);
        const data = response.data.results;

        const chartData = [
          { name: "Deliquent", Count: data.Delinquent.Count, Charge: data.Delinquent.Charge },
          { name: "Recoverable", Count: data.Recoverable.Count, Charge: data.Recoverable.Charge },
          { name: "Non-Recoverable", Count: data.Non_recoverable.Count, Charge: data.Non_recoverable.Charge },
          { name: "Pat Resp", Count: data.Patient_responsibility.Count, Charge: data.Patient_responsibility.Charge },
          { name: "AI", Count: data.AI_automation.Count, Charge: data.AI_automation.Charge },
        ];

        setChartData(chartData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col justify-center items-center w-full ${theme === 'dark' ? 'text-white bg-[#151619]' : 'text-black'}`}>
      <div className='pt-6 flex flex-row justify-between w-full px-5 flex-wrap gap-4'>
        <p className='sm:text-lg text-md font-semibold'>
          Claims Analysis by Category
        </p>
        <div className="flex gap-4">
          <div className="flex items-center">
            <svg width="11" height="6" viewBox="0 0 11 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="2" width="8" height="2" rx="0.3" fill="#F6A521"/>
              <circle cx="3" cy="3" r="3" fill="#F6A521"/>
            </svg>
            <span className='px-2'>Count</span>
          </div>
          <div className="flex items-center">
            <svg width="11" height="6" viewBox="0 0 11 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="2" width="8" height="2" rx="0.3" fill="#005DE2"/>
              <circle cx="3" cy="3" r="3" fill="#005DE2"/>
            </svg>
            <span className='px-2'>Charge</span>
          </div>
        </div>
      </div>
      
      <div className='mt-5 w-full overflow-x-auto px-2 sm:px-5'>
        <svg height="0">
          <defs>
            <pattern id="pattern" patternUnits="userSpaceOnUse" width="4" height="4">
              <rect width="4" height="4" fill="#F6A521"/>
              <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
        </svg>
        
        <BarChart
          width={chartWidth}
          height={300}
          data={chartData}
          margin={{
            top: 20,
            right: isMobile ? 20 : 10,
            left: isMobile ? 5 : 5,
            bottom: 10
          }}
          className={`${theme === 'dark' ? 'text-white bg-[#151619]' : 'text-black'}`}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name"
            tick={{ fill: theme === 'dark' ? '#fff' : '#64748b', fontSize: isMobile ? 10 : 12 }}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis
            tickFormatter={(value) => value >= 1000 ? `$${(value/1000).toFixed(2)}k` : value.toFixed(2)}
            tick={{ fill: theme === 'dark' ? '#fff' : '#64748b', fontSize: isMobile ? 10 : 12 }}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="Count" 
            fill="url(#pattern)" 
            barSize={isMobile ? 15 : 20}
            radius={[4, 4, 0, 0]} 
          />
          <Bar 
            dataKey="Charge" 
            fill="#005DE2" 
            barSize={isMobile ? 15 : 20}
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </div>
    </div>
  );
};

export default ClaimDistributionChart;