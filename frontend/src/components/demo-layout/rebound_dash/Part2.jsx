import React, { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setPart2Count } from '../../../redux/reducers/count.reducer';
import { setPart2Loading } from "../../../redux/reducers/app.reducer";
import { useApiEndpoint } from "../../../ApiEndpointContext";
import { samplifyInteger } from "../../../utils/config";

const Part2 = () => {
  const apiUrl = useApiEndpoint();
  const dispatch = useDispatch();
  const data = useSelector((state) => state.count.part2Count);
  const tabIndex = useSelector((state) => state.app.tabIndex);
  const keyword = useSelector((state) => state.app.keyword);
  const selectedTags = useSelector((state) => state.tags.selectedTags);
  const startDate = useSelector((state) => state.app.startDate);
  const endDate = useSelector((state) => state.app.endDate);
  const part2Loading = useSelector((state) => state.app.part2Loading);
  const code = useSelector((state) => state.app.code);
  const remark = useSelector((state) => state.app.remark);
  const procedure = useSelector((state) => state.app.procedure);
  const pos = useSelector((state) => state.app.pos);
  const extra = useSelector((state) => state.app.extraFilter);
  const theme = useSelector((state) => state.app.theme);

  useEffect(() => {
    if (apiUrl === '') return;
    if (!part2Loading) return;
    if (selectedTags.length === 0) return;
    axios.post(`${apiUrl}/part2_all`, {
      tabIndex,
      keyword,
      selectedTags,
      startDate,
      endDate,
      code,
      remark,
      procedure,
      pos,
      extra
    }).then(res => {
      dispatch(setPart2Count(res.data));
      dispatch(setPart2Loading(false));
    });
  }, [part2Loading, selectedTags]);

  const aggregateData = (data) => {
    const aggregated = data.reduce((acc, row) => {
      const category = row.Category || 'Unknown';
      if (!acc[category]) {
        acc[category] = {
          PrimaryCode: row.PrimaryCode,
          Category: row.Category,
          Count: 0,
          Charge: 0,
          DeniedAmt: 0,
          Days: 0,
        };
      }
      acc[category].Count += Number(row.Count) || 0;
      acc[category].Charge += Number(row.Charge) || 0;
      acc[category].DeniedAmt += Number(row.DeniedAmt) || 0;
      acc[category].Days += Number(row.Days) || 0;
      return acc;
    }, {});
  
    return Object.values(aggregated);
  };

  const aggregatedData = aggregateData(data);

  return (
    <div className="w-full mt-5">
      {!part2Loading && (
        <div className={`flex flex-col gap-4 max-h-[285px] w-[100%] fade-in ${theme === 'dark' ? 'bg-[#151619] border-[#191A1D] text-white' : 'bg-white border-[#eef4ff] text-black'} border-[7px] rounded-3xl px-2 py-1 items-center justify-center font-inter mx-auto`}>
          <div className="overflow-y-auto w-full">
            <table className={`min-w-full ${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} rounded-3xl`}>
              <thead className={`${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} sticky top-0`}>
                <tr>
                  <th className={`text-[14px] font-normal ${theme === 'dark' ? 'text-white' : 'text-black'} text-center px-3 py-2 h-[50px] whitespace-nowrap`}>Category</th>
                  <th className={`text-[14px] font-normal ${theme === 'dark' ? 'text-white' : 'text-black'} text-center px-2 py-2 h-[50px] whitespace-nowrap`}>Total Claims</th>
                  <th className={`text-[14px] font-normal ${theme === 'dark' ? 'text-white' : 'text-black'} text-center px-3 py-2 h-[50px] whitespace-nowrap`}>Total Charges</th>
                  <th className={`text-[14px] font-normal ${theme === 'dark' ? 'text-white' : 'text-black'} text-center px-3 py-2 h-[50px] whitespace-nowrap`}>Adjusted Amt</th>
                  <th className={`text-[14px] font-normal ${theme === 'dark' ? 'text-white' : 'text-black'} text-center px-3 py-2 h-[50px] whitespace-nowrap`}>Average AR Days</th>
                </tr>
              </thead>
              <tbody>
                {aggregatedData.map((row, index) => (
                  <tr key={index} className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    {!row.PrimaryCode && <td className={`text-[14px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-center px-2 py-2 h-[50px]`}>-</td>}
                    {row.Category && (
                      <td className={`text-[10px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-center px-3 py-2 h-[50px]`}>
                        <div className={`rounded-lg p-2 m-1 inline-block ${theme === 'dark' ? 'bg-[#131D2E] text-[#005DE2]' : 'bg-[#eef4ff] text-[#005DE2]'} font-semibold`}>{row.Category}</div>
                      </td>
                    )}
                    {!row.Category && <td className={`text-[14px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-center px-3 py-2 h-[50px]`}>-</td>}
                    <td className={`text-[14px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-center px-5 py-2 h-[50px]`}>{samplifyInteger(row.Count)}</td>
                    <td className={`text-[14px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-right px-5 py-2 h-[50px]`}>{`$${samplifyInteger(row.Charge)}`}</td>
                    <td className={`text-[14px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-right px-5 py-2 h-[50px]`}>{`$${samplifyInteger(row.DeniedAmt)}`}</td>
                    <td className={`text-[14px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-right px-5 py-2 h-[50px]`}>{samplifyInteger(row.Days)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {part2Loading && (
        <div className={`flex flex-col gap-4 max-h-[285px] w-full ${theme === 'dark' ? 'bg-[#151619] border-[#191A1D] text-white' : 'bg-white border-[#eef4ff] text-black'} border-[7px] rounded-3xl p-2 items-center justify-center font-inter mx-auto`}>
          <div className="overflow-y-auto w-full h-full">
            <table className={`min-w-full ${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} rounded-3xl`}>
              <thead className={`${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} sticky top-0 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <tr>
                  <th className={`text-[12px] font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'} text-center px-5 py-2 h-[50px]`}>Category</th>
                  <th className={`text-[12px] font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'} text-center px-2 py-2 h-[50px]`}>Total Claims</th>
                  <th className={`text-[12px] font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'} text-center px-3 py-2 h-[50px]`}>Total Charges</th>
                  <th className={`text-[12px] font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'} text-center px-3 py-2 h-[50px]`}>Adjusted Amt</th>
                  <th className={`text-[12px] font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'} text-center px-3 py-2 h-[50px]`}>Average AR Days</th>
                </tr>
              </thead>
              <tbody>
                <tr className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className={`text-[12px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-center px-3 py-2 h-[50px]`}>
                    <div className={`rounded-xl p-2 m-1 inline-block ${theme === 'dark' ? 'bg-[#191A1D] text-white' : 'bg-[#eef4ff] text-[#005DE2]'}`}>Loading...</div>
                  </td>
                  <td className={`text-[12px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-center px-2 py-2 h-[50px]`}>Loading...</td>
                  <td className={`text-[12px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-right px-2 py-2 h-[50px]`}>Loading...</td>
                  <td className={`text-[12px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-right px-2 py-2 h-[50px]`}>Loading...</td>
                  <td className={`text-[12px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-right px-2 py-2 h-[50px]`}>Loading...</td>
                </tr>
                <tr className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className={`text-[12px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-center px-3 py-2 h-[50px]`}>
                    <div className={`rounded-xl p-2 m-1 inline-block ${theme === 'dark' ? 'bg-[#191A1D] text-white' : 'bg-[#eef4ff] text-[#005DE2]'}`}>Loading...</div>
                  </td>
                  <td className={`text-[12px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-center px-2 py-2 h-[50px]`}>Loading...</td>
                  <td className={`text-[12px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-right px-2 py-2 h-[50px]`}>Loading...</td>
                  <td className={`text-[12px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-right px-2 py-2 h-[50px]`}>Loading...</td>
                  <td className={`text-[12px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-right px-2 py-2 h-[50px]`}>Loading...</td>
                </tr>
                <tr className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className={`text-[12px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-center px-3 py-2 h-[50px]`}>
                    <div className={`rounded-xl p-2 m-1 inline-block ${theme === 'dark' ? 'bg-[#191A1D] text-white' : 'bg-[#eef4ff] text-[#005DE2]'}`}>Loading...</div>
                  </td>
                  <td className={`text-[12px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-center px-2 py-2 h-[50px]`}>Loading...</td>
                  <td className={`text-[12px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-right px-2 py-2 h-[50px]`}>Loading...</td>
                  <td className={`text-[12px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-right px-2 py-2 h-[50px]`}>Loading...</td>
                  <td className={`text-[12px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-right px-2 py-2 h-[50px]`}>Loading...</td>
                </tr>
                <tr className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className={`text-[12px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-center px-3 py-2 h-[50px]`}>
                    <div className={`rounded-xl p-2 m-1 inline-block ${theme === 'dark' ? 'bg-[#191A1D] text-white' : 'bg-[#eef4ff] text-[#005DE2]'}`}>Loading...</div>
                  </td>
                  <td className={`text-[12px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-center px-2 py-2 h-[50px]`}>Loading...</td>
                  <td className={`text-[12px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-right px-2 py-2 h-[50px]`}>Loading...</td>
                  <td className={`text-[12px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-right px-2 py-2 h-[50px]`}>Loading...</td>
                  <td className={`text-[12px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'} text-right px-2 py-2 h-[50px]`}>Loading...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Part2;