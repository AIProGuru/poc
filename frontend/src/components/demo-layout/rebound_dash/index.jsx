import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";
import Part1 from "./Part1";
import Part2 from "./Part2";
import DataTable from "./DataTable";
import { samplifyInteger } from "../../../utils/config";
import { useParams } from "react-router-dom";
import { setCount, setPart1Count, setPart2Count, setRecovery } from "../../../redux/reducers/count.reducer";
import {
  setCurrentPage,
  setEndDate,
  setKeyword,
  setPart1Loading,
  setPart2Loading,
  setStartDate,
  setTabIndex,
  setTableLoading,
  increaseLoading,
  decreaseLoading,
  setTagLoading,
  setCountLoading,
  setStatisticsLoading,
  setPayerLoading,
  setCode,
  setRemark,
  setPOS,
  setProcedure,
  setExtraFilter,
  setRecoveryLoading,
} from "../../../redux/reducers/app.reducer";
import { setSelectedTags, setTags, setAllPayers } from "../../../redux/reducers/tag.reducer";
import { setTableData } from '../../../redux/reducers/app.reducer';
import { setCategoryLabel, setCategoryValue } from '../../../redux/reducers/statistics.reducer';
import { useApiEndpoint } from "../../../ApiEndpointContext";

const ReboundDash = () => {
  const apiUrl = useApiEndpoint();
  const [showInsights, setShowInsights] = useState(false);
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.app.theme);
  const count = useSelector((state) => state.count.count);
  const tags = useSelector((state) => state.tags.allTags);
  let tabIndex = useSelector((state) => state.app.tabIndex);
  const tagLoading = useSelector((state) => state.app.tagLoading);
  const countLoading = useSelector((state) => state.app.countLoading);
  const statisticsLoading = useSelector((state) => state.app.statisticsLoading);
  const payerLoading = useSelector((state) => state.app.payerLoading);
  const recoveryLoading = useSelector((state) => state.app.recoveryLoading);

  console.log('apiUrl', apiUrl);


  let params = useParams();
  let { token } = params;
  useEffect(() => {
    console.log('apiUrl', apiUrl);
    if (apiUrl === '') return;

    if (token) {
      token = JSON.parse(atob(token));
      console.log(token);
      if (token.selectedTags != undefined) {
        dispatch(setSelectedTags(token.selectedTags));
      }
      if (token.keyword != undefined) {
        dispatch(setKeyword(token.keyword));
      }
      if (token.code != undefined) {
        dispatch(setCode(token.code));
      }
      if (token.remark != undefined) {
        dispatch(setRemark(token.remark));
      }
      if (token.pos != undefined) {
        dispatch(setPOS(token.pos));
      }
      if (token.procedure != undefined) {
        dispatch(setProcedure(token.procedure));
      }
      if (token.startDate != undefined) {
        dispatch(setStartDate(token.startDate));
      }
      if (token.endDate != undefined) {
        dispatch(setEndDate(token.endDate));
      }
      if (token.currentPage != undefined) {
        dispatch(setCurrentPage(token.currentPage));
      }
      if (token.extra != undefined) {
        dispatch(setExtraFilter(token.extra));
      }
      if (token.tabIndex != undefined) {
        dispatch(setTabIndex(token.tabIndex));
      }
      dispatch(setTableLoading(true));
      dispatch(setPart1Loading(true));
      dispatch(setPart2Loading(true));
      dispatch(setTableData([]));
      dispatch(setPart1Count([]));
      dispatch(setPart2Count([]));
    }

    if (tagLoading) {
      dispatch(increaseLoading())
      axios.get(`${apiUrl}/get_all_tags`).then((res) => {
        dispatch(setTags(res.data));
        dispatch(setSelectedTags(res.data.filter(row => row !== 'Contractual Adj' && row !== 'Patient Resp' && row !== '')));
        dispatch(decreaseLoading())
        dispatch(setTagLoading(false));
      }).catch(err => {
        dispatch(setTagLoading(false));
      });
    }
    if (countLoading) {
      dispatch(increaseLoading())
      dispatch(setCountLoading(true))
      axios.get(`${apiUrl}/get_counts`).then((res) => {
        dispatch(setCount([
          {
            count: res.data.cnt1,
            amount: res.data.amount1
          },
          {
            count: res.data.cnt2,
            amount: res.data.amount2
          },
          {
            count: res.data.cnt3,
            amount: res.data.amount3
          },
          {
            count: res.data.cnt4,
            amount: res.data.amount4
          },
          {
            count: 0,
            amount: 0
          },
          {
            count: res.data.cnt6,
            amount: 0
          },
          {
            count: res.data.cnt7,
            amount: 0
          }
        ]));
        dispatch(decreaseLoading())
        dispatch(setCountLoading(false));
      }).catch(err => {
        dispatch(setCountLoading(false));
      });
    }
    if (statisticsLoading) {
      dispatch(increaseLoading())
      axios.get(`${apiUrl}/statistics`).then(res => {
        const label = res.data.map((row, index) => row.label)
        const value = res.data.map((row, index) => row.value)
        dispatch(setCategoryLabel(label))
        dispatch(setCategoryValue(value))
        dispatch(decreaseLoading())
        dispatch(setStatisticsLoading(false))
      }).catch(err => {
        dispatch(setStatisticsLoading(false))
      })
    }
    if (payerLoading) {
      dispatch(increaseLoading())
      axios.get(`${apiUrl}/get_all_payers`).then(res => {
        dispatch(setAllPayers(res.data));
        dispatch(decreaseLoading())
        dispatch(setPayerLoading(false))
      }).catch(err => {
        dispatch(setPayerLoading(false))
      })
    }
    if (recoveryLoading) {
      dispatch(increaseLoading())
      axios.get(`${apiUrl}/recovery`).then(res => {
        dispatch(setRecovery(res.data));
        dispatch(decreaseLoading())
        dispatch(setRecoveryLoading(false))
      }).catch(err => {
        dispatch(setRecoveryLoading(false))
      })
    }
  }, [apiUrl])

  const changeTab = (index) => {
    dispatch(setTabIndex(index));
    dispatch(setCurrentPage(1));
    dispatch(setKeyword(''));
    if (index == 0) {
      dispatch(setSelectedTags(tags.filter(row => row !== 'Contractual Adj' && row !== 'Patient Resp' && row !== '')));
    } else if (index == 1) {
      dispatch(setSelectedTags(['Contractual Adj']))
    } else if (index == 2) {
      dispatch(setSelectedTags(['Patient Resp']))
    } else if (index == 3) {
      dispatch(setSelectedTags(['Missing']))
    } else if (index == 4) {
      dispatch(setSelectedTags([]))
    } else if (index == 5) {
      dispatch(setSelectedTags(tags))
    } else if (index == 6) {
      dispatch(setSelectedTags(tags))
    }
    dispatch(setStartDate(null));
    dispatch(setEndDate(null));
    dispatch(setCode(''));
    dispatch(setRemark(''));
    dispatch(setPOS(''));
    dispatch(setProcedure(''));
    dispatch(setKeyword(''));
    dispatch(setExtraFilter({}));
    dispatch(setTableLoading(true));
    dispatch(setPart1Loading(true));
    dispatch(setPart2Loading(true));
  }

  return (
    <div className={`flex flex-col  sm:ml-[0] gap-3 ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-black'}`}>
  <div className="text-sm font-medium text-left text-gray-500 border-gray-200 dark:text-gray-400 dark:border-gray-700 gap-7 overflow-x-auto whitespace-nowrap hide-scrollbar">
    <ul className="inline-flex -mb-px">
      <li className="me-2">
        <a
          href="#"
          className={`inline-block py-4 mr-3 border-b-2 text-md ${tabIndex === 0
            ? "text-[#005DE2] border-b-2 w-[80px] flex justify-center border-[#005DE2] rounded-t-lg active"
            : "text-[#828385] border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
            }`}
          onClick={() => changeTab(0)}
        >
          Recoverable
        </a>
      </li>
      <li className="me-2">
        <a
          href="#"
          className={`inline-block py-4 mr-3 border-b-2 ${tabIndex === 5
            ? "text-[#005DE2] border-b-2 border-[#005DE2] rounded-t-lg active"
            : "text-[#828385] border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
            }`}
          aria-current="page"
          onClick={() => changeTab(5)}
        >
          AI Automation
        </a>
      </li>
      <li className="me-2">
        <a
          href="#"
          className={`inline-block py-4 mr-3 border-b-2 ${tabIndex === 1
            ? "text-[#005DE2] border-b-2 border-[#005DE2] rounded-t-lg active"
            : "text-[#828385] border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
            }`}
          aria-current="page"
          onClick={() => changeTab(1)}
        >
          Non-Recoverable
        </a>
      </li>
      <li className="me-2">
        <a
          href="#"
          className={`inline-block py-4 mr-3 border-b-2 ${tabIndex === 2
            ? "text-[#005DE2] border-b-2 border-[#005DE2] rounded-t-lg active"
            : "text-[#828385] border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
            }`}
          aria-current="page"
          onClick={() => changeTab(2)}
        >
          Patient Responsibility 
        </a>
      </li>
      <li className="me-2">
        <a
          href="#"
          className={`inline-block py-4 mr-3 border-b-2 ${tabIndex === 3
            ? "text-[#005DE2] border-b-2 border-[#005DE2] rounded-t-lg active"
            : "text-[#828385] border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
            }`}
          aria-current="page"
          onClick={() => changeTab(3)}
        >
          Delinquent
        </a>
      </li>
      <li className="me-2">
        <a
          href="#"
          className={`inline-block py-4 mr-3 border-b-2 ${tabIndex === 4
            ? "text-[#005DE2] border-b-2 border-[#005DE2] rounded-t-lg active"
            : "text-[#828385] border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
            }`}
          aria-current="page"
          onClick={() => changeTab(4)}
        >
          Underpaid
        </a>
      </li>
      <li className="me-2">
        <a
          href="#"
          className={`inline-block py-4 mr-3 border-b-2 ${tabIndex === 6
            ? "text-[#005DE2] border-b-2 border-[#005DE2] rounded-t-lg active"
            : "text-[#828385] border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
            }`}
          aria-current="page"
          onClick={() => changeTab(6)}
        >
          All 
        </a>
      </li>
    </ul>
  </div>
  <div className="flex flex-row gap-4 sm:justify-normal justify-between items-center">
    <div className={`text-[20px]  font-semibold`}>Insights</div>
    <div
      onClick={() => setShowInsights((value) => !value)}
      className="flex justify-center items-center cursor-pointer text-blue-600 font-semibold"
    >
      <span>
        {showInsights ? "Hide" : "Open"}
      </span>
      <span className="ml-auto">
        {showInsights}
      </span>
    </div>
  </div>
  {
    showInsights && (
      <div className="flex flex-col md:flex-row sm:justify-between sm:gap-5 justify-evenly">
        <Part1 className="flex-1" />
        <Part2 className="flex-1" />
      </div>
    )
  }
  <div className="flex flex-col">
    <DataTable />
  </div>
</div>
  );
};

export default ReboundDash;
