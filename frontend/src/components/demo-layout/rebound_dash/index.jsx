import React, { useEffect, useState, useRef } from "react";
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
import { setTableData, setTheme } from '../../../redux/reducers/app.reducer';
import { setCategoryLabel, setCategoryValue } from '../../../redux/reducers/statistics.reducer';
import { useApiEndpoint } from "../../../ApiEndpointContext";

const ReboundDash = () => {
  const apiUrl = useApiEndpoint();
  const [showInsights, setShowInsights] = useState(false);
  const [selectedNav, setSelectedNav] = useState('home');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const tableScrollRef = useRef(null);

  const scrollTable = (direction) => {
    if (tableScrollRef.current) {
      const scrollAmount = 300;
      tableScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
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
    <div className={`flex ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-black'} relative`}>
      {/* Profile Section - Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <div className="relative">
          <div 
            className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <svg className={`w-4 h-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''} ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          {showProfileMenu && (
            <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
              <div className="py-1">
                <button
                  onClick={() => {
                    dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'));
                    setShowProfileMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                >
                  {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
                <button className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  👤 Profile
                </button>
                <button className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  🚪 Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Left Sidebar with Navigation */}
      <div className={`w-80 p-4 flex flex-col ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900 border-r border-gray-200'
      }`}>
        {/* Logo */}
        <div className="flex items-center mb-8">
          <img src="/helio-logo.svg" alt="HELIO RCM" className="h-8" />
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1">
          <ul className="space-y-1">
            <li>
              <a
                href="#"
                className={`flex items-center px-3 py-2 rounded-xl text-sm ${
                  selectedNav === 'home' 
                    ? (theme === 'dark' ? 'text-white bg-gray-800' : 'text-gray-900 bg-gray-100')
                    : (theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
                }`}
                onClick={() => { changeTab(0); setSelectedNav('home'); }}
              >
                <span className="mr-3">🏠</span>
                Home
              </a>
            </li>
            <li>
              <a
                href="#"
                className={`flex items-center px-3 py-2 rounded-xl text-sm ${
                  selectedNav === 'dashboard' 
                    ? (theme === 'dark' ? 'text-white bg-gray-800' : 'text-gray-900 bg-gray-100')
                    : (theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
                }`}
                onClick={() => setSelectedNav('dashboard')}
              >
                <span className="mr-3">📊</span>
                Dashboard
              </a>
            </li>
            <li>
              <a
                href="#"
                className={`flex items-center px-3 py-2 rounded-xl text-sm ${
                  selectedNav === 'claim-edits' 
                    ? (theme === 'dark' ? 'text-white bg-gray-800' : 'text-gray-900 bg-gray-100')
                    : (theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
                }`}
                onClick={() => setSelectedNav('claim-edits')}
              >
                <span className="mr-3">✏️</span>
                Claim Edits <span className="ml-auto bg-gray-700 text-xs px-2 py-1 rounded">15</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className={`flex items-center px-3 py-2 rounded-xl text-sm ${
                  selectedNav === 'claim-status' 
                    ? (theme === 'dark' ? 'text-white bg-gray-800' : 'text-gray-900 bg-gray-100')
                    : (theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
                }`}
                onClick={() => setSelectedNav('claim-status')}
              >
                <span className="mr-3">📋</span>
                Claim Status <span className="ml-auto bg-gray-700 text-xs px-2 py-1 rounded">10</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className={`flex items-center px-3 py-2 rounded-xl text-sm ${
                  selectedNav === 'denials' 
                    ? (theme === 'dark' ? 'text-white bg-gray-800' : 'text-gray-900 bg-gray-100')
                    : (theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
                }`}
                onClick={() => setSelectedNav('denials')}
              >
                <span className="mr-3">❌</span>
                Denials <span className="ml-auto bg-gray-700 text-xs px-2 py-1 rounded">25</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className={`flex items-center px-3 py-2 rounded-xl text-sm whitespace-nowrap ${
                  selectedNav === 'patient-responsibility' 
                    ? (theme === 'dark' ? 'text-white bg-gray-800' : 'text-gray-900 bg-gray-100')
                    : (theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
                }`}
                onClick={() => { changeTab(2); setSelectedNav('patient-responsibility'); }}
              >
                <span className="mr-3">👤</span>
                Patient Responsibility <span className="ml-auto bg-gray-700 text-xs px-2 py-1 rounded">25</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className={`flex items-center px-3 py-2 rounded-xl text-sm whitespace-nowrap ${
                  selectedNav === 'payment-variance' 
                    ? (theme === 'dark' ? 'text-white bg-gray-800' : 'text-gray-900 bg-gray-100')
                    : (theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
                }`}
                onClick={() => { changeTab(4); setSelectedNav('payment-variance'); }}
              >
                <span className="mr-3">💰</span>
                Payment Variance <span className="ml-auto bg-gray-700 text-xs px-2 py-1 rounded">57</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className={`flex items-center px-3 py-2 rounded-xl text-sm whitespace-nowrap ${
                  selectedNav === 'payment-posting' 
                    ? (theme === 'dark' ? 'text-white bg-gray-800' : 'text-gray-900 bg-gray-100')
                    : (theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
                }`}
                onClick={() => setSelectedNav('payment-posting')}
              >
                <span className="mr-3">📮</span>
                Payment Posting <span className="ml-auto bg-gray-700 text-xs px-2 py-1 rounded">10</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className={`flex items-center px-3 py-2 rounded-xl text-sm ${
                  selectedNav === 'support' 
                    ? (theme === 'dark' ? 'text-white bg-gray-800' : 'text-gray-900 bg-gray-100')
                    : (theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
                }`}
                onClick={() => setSelectedNav('support')}
              >
                <span className="mr-3">👥</span>
                Support
              </a>
            </li>
            <li>
              <a
                href="#"
                className={`flex items-center px-3 py-2 rounded-xl text-sm ${
                  selectedNav === 'settings' 
                    ? (theme === 'dark' ? 'text-white bg-gray-800' : 'text-gray-900 bg-gray-100')
                    : (theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
                }`}
                onClick={() => setSelectedNav('settings')}
              >
                <span className="mr-3">⚙️</span>
                Settings
              </a>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-3 p-6 min-w-0 overflow-hidden">
        <div className="flex flex-row gap-4 sm:justify-normal justify-between items-center">
          <div className={`text-[20px] font-semibold`}>Insights</div>
          <div
            onClick={() => setShowInsights((value) => !value)}
            className="flex justify-center items-center cursor-pointer text-blue-600 font-semibold"
          >
            <span>
              {showInsights ? "Hide" : "Open"}
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
        <div className="flex flex-col min-w-0">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-lg font-semibold">Payment Variance &gt; Underpaid</h2>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button 
                  className="p-1 text-gray-400 hover:text-white"
                  onClick={() => scrollTable('left')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                  </svg>
                </button>
                <button 
                  className="p-1 text-gray-400 hover:text-white"
                  onClick={() => scrollTable('right')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto" ref={tableScrollRef}>
              <DataTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReboundDash;