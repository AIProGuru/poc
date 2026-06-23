import React, { useEffect, useMemo } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { samplifyInteger } from "../../../utils/config";
import { setPart1Count } from "../../../redux/reducers/count.reducer";
import { setPart1Loading } from "../../../redux/reducers/app.reducer";
import { useApiEndpoint } from "../../../ApiEndpointContext";
import { buildAccessExtra } from "../../../utils/accessFilters";
import { sanitizeAdvancedFilters } from "../../../utils/advancedFilters";

const Part1 = (props) => {
  const apiUrl = useApiEndpoint();
  const dispatch = useDispatch();
  const data = useSelector((state) => state.count.part1Count);
  const tabIndex = useSelector((state) => state.app.tabIndex);
  const keyword = useSelector((state) => state.app.keyword);
  const selectedTags = useSelector((state) => state.tags.selectedTags);
  const startDate = useSelector((state) => state.app.startDate);
  const endDate = useSelector((state) => state.app.endDate);
  const part1Loading = useSelector((state) => state.app.part1Loading);
  const code = useSelector((state) => state.app.code);
  const remark = useSelector((state) => state.app.remark);
  const procedure = useSelector((state) => state.app.procedure);
  const pos = useSelector((state) => state.app.pos);
  const advancedFilters = useSelector((state) => state.app.advancedFilters);
  const extra = useSelector((state) => state.app.extraFilter);
  const theme = useSelector((state) => state.app.theme);
  const role = useSelector((state) => state.auth.role);
  const accessModules = useSelector((state) => state.auth.modules);
  const accessDenialCategory = useSelector((state) => state.auth.denialCategory);
  const accessPayer = useSelector((state) => state.auth.payer);
  const accessValue = useSelector((state) => state.auth.value);
  const accessFacility = useSelector((state) => state.auth.facility);
  const access = useMemo(
    () => ({
      modules: accessModules,
      denialCategory: accessDenialCategory,
      payer: accessPayer,
      value: accessValue,
      facility: accessFacility,
    }),
    [accessModules, accessDenialCategory, accessPayer, accessValue, accessFacility]
  );

  useEffect(() => {
    if (apiUrl === '') return;
    if (!part1Loading) return;
    const accessExtra = buildAccessExtra(extra, access, role);
    const includeAllCategories = accessExtra?.IncludeAllCategories;
    if (!includeAllCategories && selectedTags.length === 0) return;
    axios.post(`${apiUrl}/part1_all`, {
      tabIndex,
      keyword,
      selectedTags,
      startDate,
      endDate,
      code,
      remark,
      procedure,
      pos,
      extra: accessExtra,
      advancedFilters: sanitizeAdvancedFilters(advancedFilters),
    }).then(res => {
      dispatch(setPart1Count([res.data]));
      dispatch(setPart1Loading(false));
    });
  }, [part1Loading, selectedTags, extra, access, role, keyword, startDate, endDate, code, remark, procedure, pos, advancedFilters, apiUrl, dispatch, tabIndex]);

  return (
    <div className="w-full md:w-[60%]">
      {!part1Loading && data.length === 1 && (
        <div className={`border-[7px] rounded-3xl p-6 mt-5 fade-in ${theme === 'dark' ? 'bg-[#151619] border-[#191A1D] text-white' : 'bg-white border-[#f3f4f6] text-black'}`}>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Total Claims</span>
              <span className={`text-3xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{samplifyInteger(data[0].Count)}</span>
            </div>
            <hr className={`my-5 ${theme === 'dark' ? 'border-[#474747]' : 'border-[#dedede]'}`} />
            <div className="flex justify-between mb-2">
              <span className="text-lg font-regular text-gray-600 dark:text-gray-400">Total Charges</span>
              <span className={`text-lg font-semibold ${theme === 'dark' ? "text-gray-100" : "text-gray-600"}`}>{`$${samplifyInteger(data[0].Charge)}`}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className={`text-lg font-regular text-gray-600 dark:text-gray-400 ${theme === 'dark' ? "text-[#828385]" : "text-gray-600"}`}>Allowed Amt</span>
              <span className={`text-lg font-semibold ${theme === 'dark' ? "text-gray-100" : "text-gray-600"}`}>{`$${samplifyInteger(data[0].AllowedAmt)}`}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className={`text-lg font-regular text-gray-600 dark:text-gray-400 ${theme === 'dark' ? "text-[#828385]" : "text-gray-600"}`}>Adjusted Amt</span>
              <span className={`text-lg font-semibold ${theme === 'dark' ? "text-gray-100" : "text-gray-600"}`}>{`$${samplifyInteger(data[0].DeniedAmt)}`}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-lg font-regular text-gray-600 dark:text-gray-400">Average A/R</span>
              <span className={`text-lg font-semibold ${theme === 'dark' ? "text-gray-100" : "text-gray-600"}`}>{samplifyInteger(data[0].Days)}</span>
            </div>
          </div>
        </div>
      )}
      {part1Loading && (
        <div className={`border-[10px] rounded-3xl p-6 mt-5 ${theme === 'dark' ? 'bg-[#151619] border-[#191A1D] text-white' : 'bg-white border-[#f3f4f6] text-black'}`}>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Total Claims</span>
              <span className={`text-3xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Loading...</span>
            </div>
            <hr className={`my-5 ${theme === 'dark' ? 'border-[#474747]' : 'border-[#dedede]'}`} />
            <div className="flex justify-between mb-2">
              <span className="text-lg text-gray-600 dark:text-gray-400">Total Charges</span>
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">Loading...</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-lg text-gray-600 dark:text-gray-400">Adjusted Amt</span>
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">Loading...</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-lg text-gray-600 dark:text-gray-400">Adjusted Amt</span>
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">Loading...</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-lg text-gray-600 dark:text-gray-400">Average A/R</span>
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">Loading...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Part1;

