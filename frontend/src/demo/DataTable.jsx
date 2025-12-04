import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import axios from "axios";

import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Table from "@mui/material/Table";
import { samplifyDouble, samplifyString } from "../utils/config";

import { setKeyword, setTableData, setTotalPage, setCurrentPage, setPageSize, setAppTitle, setPart1Loading, setPart2Loading, setTableLoading, setExtraFilter } from "../redux/reducers/app.reducer";
import { useApiEndpoint } from "../ApiEndpointContext";
import { toast } from "react-toastify";
import { SERVER_URL } from "../utils/config";

const DataTable = (props) => {
  const apiUrl = useApiEndpoint();
  const location = useLocation();
  const navigate = useNavigate();
  const pageSizes = [50, 100, 250, 500, 5000];
  const dispatch = useDispatch();
  const role = useSelector((state) => state.auth.role);
  const startDate = useSelector((state) => state.app.startDate)
  const endDate = useSelector((state) => state.app.endDate)
  const selectedTags = useSelector((state) => state.tags.selectedTags)
  const tableData = useSelector((state) => state.app.tableData)
  const totalPage = useSelector((state) => state.app.totalPage)
  const currentPage = useSelector((state) => state.app.currentPage)
  const pageSize = useSelector((state) => state.app.pageSize)
  const tabIndex = useSelector((state) => state.app.tabIndex)
  const tableLoading = useSelector((state) => state.app.tableLoading)
  const type = useSelector((state) => state.app.type)
  const [checkValues, setCheckValues] = useState([])
  const [all, setAll] = useState(false)
  const [downloading, setDownloading] = useState(false);
  const keyword = useSelector((state) => state.app.keyword)
  const inputKeywordRef = useRef();
  const code = useSelector((state) => state.app.code)
  const remark = useSelector((state) => state.app.remark)
  const procedure = useSelector((state) => state.app.procedure)
  const pos = useSelector((state) => state.app.pos)
  const extra = useSelector((state) => state.app.extraFilter);
  const [order, _setOrder] = useState("ClaimNo");
  const theme = useSelector((state) => state.app.theme);

  const showDetail = (claimNo) => {
    dispatch(setAppTitle("Triage/Action"))
    const token = {
      claimNo
    }
    console.log(location.pathname)
    navigate(`${type === 0 ? '/rebound' : (type == 1 ? '/medevolve' : "/demo")}/detail/${btoa(JSON.stringify(token))}`);
  }

  useEffect(() => {
    inputKeywordRef.current.value = keyword;
  }, [keyword])

  const setOrder = (ord) => {
    const ordName = order[order.length - 1] == '-' ? order.substring(0, order.length - 1) : order;
    console.log(ordName, ord);
    if (ordName == ord) {
      if (order[order.length - 1] == '-') {
        _setOrder(ord);
        console.log(1);
      } else {
        _setOrder(ord + '-');
        console.log(2);
      }
    } else {
      _setOrder(ord);
      console.log(3);
    }
    // dispatch(setTableLoading(true));
  }

  useEffect(() => {
    axios.get(`${SERVER_URL}/api/v1/demo/data`).then(res => {
      console.log(res)
      dispatch(setTableData(res.data));
      dispatch(setTableLoading(false))
    })
  }, [tableLoading])


  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const totalPages = isMobile ? 3 : 4;

  return (
    <div className={`flex flex-col rounded-lg ${theme === 'dark' ? "bg-[#151619] text-white" : "bg-white text-black"} gap-6`}>
      <div className="flex flex-col md:flex-row justify-between items-center mt-3">
        <span className={`text-[20px] font-semibold ${theme === 'dark' ? "bg-[#151619] text-white" : "bg-white text-[#072F40]"}`}>
          Stratification details
        </span>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mt-4 md:mt-0">
          <div className={`flex flex-col md:flex-row items-center gap-3 w-full md:w-auto mx-auto ${theme === 'dark' ? "bg-[#151619] text-white" : "bg-white text-black"}`}>
            <label htmlFor="simple-search" className={`sr-only ${theme === 'dark' ? "bg-[#151619] text-white" : "bg-white text-black"}`}>
              Search
            </label>
            <div className="relative w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.98913 15.2496C11.6327 15.2496 14.5864 12.2959 14.5864 8.6524C14.5864 5.00885 11.6327 2.05518 7.98913 2.05518C4.34558 2.05518 1.39191 5.00885 1.39191 8.6524C1.39191 12.2959 4.34558 15.2496 7.98913 15.2496Z" stroke="#9598B0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15.2808 15.9441L13.8919 14.5552" stroke="#9598B0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <input
                placeholder="Search"
                defaultValue={keyword}
                ref={inputKeywordRef}
                onKeyDown={(e) => e.keyCode == 13 && filterByKeyword()}
                className={`text-sm rounded-lg block w-full py-2.5 px-24 pl-10 text-gray-700 ${theme === 'dark' ? "bg-[#151619] text-white border border-gray-600" : "text-black bg-white border border-gray-300"}`}
              />
            </div>
          </div>
          <div className="flex flex-row justify-end md:flex-row gap-4  w-full md:w-auto mt-0 md:mt-0">
            <div className="flex justify-center items-center">
              <button className="w-[40px] rounded-lg flex justify-center items-center h-[40px] p-3 bg-blue-600">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.0837 5.84717C13.5837 6.06245 14.6045 7.34717 14.6045 10.1597V10.2499C14.6045 13.3541 13.3614 14.5972 10.2573 14.5972H5.73644C2.63228 14.5972 1.38922 13.3541 1.38922 10.2499V10.1597C1.38922 7.368 2.39617 6.08328 4.8545 5.85411" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 1.05566V10.0001" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10.3267 8.45142L8.00028 10.7778L5.67389 8.45142" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {downloading && <div className="spinner-3"></div>}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className={`flex flex-col rounded-3xl ${theme === 'dark' ? 'bg-[#151619] border-[#191A1D] text-white' : 'bg-white border-[#eef4ff] text-black'} border-[7px] p-2`}>
        <TableContainer sx={{
          maxHeight: 500,
          backgroundColor: theme === 'dark' ? '#151619' : 'white',
          color: theme === 'dark' ? 'white' : 'black',

        }}>
          <Table aria-label="sticky table" stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell style={{ minWidth: "50px", background: theme === 'dark' ? '#151619' : '#ffffff', borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }} className="h-[50px]">
                  <input type='checkbox' className=" custom-checkbox form-control border-2 border-gra rounded-sm" checked={all} onClick={() => {
                    setAll(value => !value);
                  }} />
                </TableCell>
                <TableCell style={{ minWidth: "200px", background: theme === 'dark' ? '#151619' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#151619', borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }} onClick={() => setOrder("ClaimNo")} className="cursor-pointer">
                  <div className={`flex items-center gap-2 `}>Claim ID
                    {
                      order == 'ClaimNo' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                        <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                      </svg>
                        : (order == 'ClaimNo-' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                          <path fill-rule="evenodd" d="M8 2a.75.75 0 0 1 .75.75v8.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V2.75A.75.75 0 0 1 8 2Z" clip-rule="evenodd" />
                        </svg>
                          : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="#999999" class="size-4">
                            <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                          </svg>)
                    }
                  </div>
                </TableCell>
                <TableCell style={{ minWidth: "150px", background: theme === 'dark' ? '#151619' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#151619', borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }} onClick={() => setOrder("ProvNPI")} className="cursor-pointer">
                  <div className="flex items-center gap-2">Provider NPI
                    {
                      order == 'ProvNPI' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                        <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                      </svg>
                        : (order == 'ProvNPI-' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                          <path fill-rule="evenodd" d="M8 2a.75.75 0 0 1 .75.75v8.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V2.75A.75.75 0 0 1 8 2Z" clip-rule="evenodd" />
                        </svg>
                          : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="#999999" class="size-4">
                            <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                          </svg>)
                    }
                  </div>
                </TableCell>
                <TableCell style={{ minWidth: "200px", background: theme === 'dark' ? '#151619' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#151619', borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }} onClick={() => setOrder("PayerName")} className="cursor-pointer">
                  <div className="flex items-center gap-2">Payer Name
                    {
                      order == 'PayerName' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                        <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                      </svg>
                        : (order == 'PayerName-' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                          <path fill-rule="evenodd" d="M8 2a.75.75 0 0 1 .75.75v8.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V2.75A.75.75 0 0 1 8 2Z" clip-rule="evenodd" />
                        </svg>
                          : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="#999999" class="size-4">
                            <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                          </svg>)
                    }
                  </div>
                </TableCell>
                <TableCell style={{ minWidth: "150px", background: theme === 'dark' ? '#151619' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#151619', borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }} onClick={() => setOrder("PayerID")} className="cursor-pointer">
                  <div className="flex items-center gap-2">Payer ID
                    {
                      order == 'PayerID' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                        <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                      </svg>
                        : (order == 'PayerID-' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                          <path fill-rule="evenodd" d="M8 2a.75.75 0 0 1 .75.75v8.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V2.75A.75.75 0 0 1 8 2Z" clip-rule="evenodd" />
                        </svg>
                          : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="#999999" class="size-4">
                            <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                          </svg>)
                    }
                  </div>
                </TableCell>
                <TableCell style={{ minWidth: "250px", background: theme === 'dark' ? '#151619' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#151619', borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }}>
                  Patient Name
                </TableCell>
                <TableCell style={{ minWidth: "200px", background: theme === 'dark' ? '#151619' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#151619', borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }} onClick={() => setOrder("ServiceDate")} className="cursor-pointer">
                  <div className="flex items-center gap-2">Service Date
                    {
                      order == 'ServiceDate' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                        <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                      </svg>
                        : (order == 'ServiceDate-' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                          <path fill-rule="evenodd" d="M8 2a.75.75 0 0 1 .75.75v8.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V2.75A.75.75 0 0 1 8 2Z" clip-rule="evenodd" />
                        </svg>
                          : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="#999999" class="size-4">
                            <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                          </svg>)
                    }
                  </div>
                </TableCell>
                <TableCell style={{ minWidth: "200px", background: theme === 'dark' ? '#151619' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#151619', borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }} onClick={() => setOrder("Amount")} className="cursor-pointer">
                  <div className="flex items-center gap-2">Charges
                    {
                      order == 'Amount' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                        <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                      </svg>
                        : (order == 'Amount-' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                          <path fill-rule="evenodd" d="M8 2a.75.75 0 0 1 .75.75v8.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V2.75A.75.75 0 0 1 8 2Z" clip-rule="evenodd" />
                        </svg>
                          : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="#999999" class="size-4">
                            <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                          </svg>)
                    }
                  </div>
                </TableCell>
                <TableCell style={{ minWidth: "200px", background: theme === 'dark' ? '#151619' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#151619', borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }} onClick={() => setOrder("AllowedAmt")} className="cursor-pointer">
                  <div className="flex items-center gap-2">Allowed Amt
                    {
                      order == 'AllowedAmt' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                        <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                      </svg>
                        : (order == 'AllowedAmt-' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                          <path fill-rule="evenodd" d="M8 2a.75.75 0 0 1 .75.75v8.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V2.75A.75.75 0 0 1 8 2Z" clip-rule="evenodd" />
                        </svg>
                          : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="#999999" class="size-4">
                            <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                          </svg>)
                    }
                  </div>
                </TableCell>
                <TableCell style={{ minWidth: "200px", background: theme === 'dark' ? '#151619' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#151619', borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }} onClick={() => setOrder("PrimaryCode")} className="cursor-pointer">
                  <div className="flex items-center gap-2">Denial Code
                    {
                      order == 'PrimaryCode' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                        <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                      </svg>
                        : (order == 'PrimaryCode-' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                          <path fill-rule="evenodd" d="M8 2a.75.75 0 0 1 .75.75v8.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V2.75A.75.75 0 0 1 8 2Z" clip-rule="evenodd" />
                        </svg>
                          : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="#999999" class="size-4">
                            <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                          </svg>)
                    }
                  </div>
                </TableCell>
                <TableCell style={{ minWidth: "200px", background: theme === 'dark' ? '#151619' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#151619', borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }} onClick={() => setOrder("PrimaryProcedure")} className="cursor-pointer">
                  <div className="flex items-center gap-2">Primary Service
                    {
                      order == 'PrimaryProcedure' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                        <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                      </svg>
                        : (order == 'PrimaryProcedure-' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                          <path fill-rule="evenodd" d="M8 2a.75.75 0 0 1 .75.75v8.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V2.75A.75.75 0 0 1 8 2Z" clip-rule="evenodd" />
                        </svg>
                          : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="#999999" class="size-4">
                            <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                          </svg>)
                    }
                  </div>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody className="relative">
              {tableLoading && <TableRow className="flex justify-center items-center h-[100px]"><TableCell colSpan={12}><div className="flex justify-center items-center">Loading data...</div></TableCell></TableRow>}
              {!tableLoading && tableData.length === 0 && <TableRow className="flex justify-center items-center h-[100px]"><TableCell colSpan={12}><div className="flex justify-center items-center">No record</div></TableCell></TableRow>}
              {
                !tableLoading && tableData.length !== 0 && tableData.map((row, index) => <TableRow key={index} sx={{ maxHeight: "100px" }}>
                  <TableCell style={{ borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }}>
                    <input
                      key={index}
                      type="checkbox"
                      className="form-control border-2 rounded-sm custom-checkbox"
                      checked={checkValues[index]}
                      onChange={() => {
                        let data = checkValues;
                        data[index] = !data[index];
                        setCheckValues([...data]);
                      }}
                    />
                  </TableCell>

                  <TableCell onClick={() => showDetail(row.LIMS_CLINIC_ID)} className="h-[50px]" style={{ minWidth: "200px", color: theme === 'dark' ? '#ffffff' : '#151619', borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }}>
                    {row.LIMS_CLINIC_ID}
                  </TableCell>
                  <TableCell onClick={() => showDetail(row.LIMS_CLINIC_ID)} style={{ minWidth: "200px", color: theme === 'dark' ? '#ffffff' : '#151619', borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }}>
                    {row.NPI_NUMBER}
                  </TableCell>
                  <TableCell onClick={() => showDetail(row.LIMS_CLINIC_ID)} style={{ minWidth: "200px", color: theme === 'dark' ? '#ffffff' : '#151619', borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }}>
                    {row.PAYORNAME}
                  </TableCell>
                  <TableCell onClick={() => showDetail(row.LIMS_CLINIC_ID)} style={{ minWidth: "200px", color: theme === 'dark' ? '#ffffff' : '#151619', borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }}>
                    {row.D_PAYOR_ID}
                  </TableCell>
                  <TableCell onClick={() => showDetail(row.LIMS_CLINIC_ID)} style={{ minWidth: "200px", color: theme === 'dark' ? '#ffffff' : '#151619', borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }}>
                    {`${row.PATIENT_FIRST_NAME} ${row.PATIENT_LAST_NAME}`}
                  </TableCell>
                  <TableCell onClick={() => showDetail(row.LIMS_CLINIC_ID)} style={{ minWidth: "200px", color: theme === 'dark' ? '#ffffff' : '#151619', borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }}>
                    {new Date(row.LIMS_DATE_OF_SERVICE).toISOString().substring(0, 10)}
                  </TableCell>
                  <TableCell
                    className="text-wrap"
                    onClick={() => showDetail(row.LIMS_CLINIC_ID)}
                    style={{ minWidth: "200px", color: theme === 'dark' ? '#ffffff' : '#151619', borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }}  >
                    {`$${samplifyDouble(row.BILLPRICE)}`}
                  </TableCell>
                  <TableCell onClick={() => showDetail(row.LIMS_CLINIC_ID)} style={{ minWidth: "200px", color: theme === 'dark' ? '#ffffff' : '#151619', borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }}>
                    {`$${samplifyDouble(row.ALLOWEDAMOUNT)}`}
                  </TableCell>
                  <TableCell onClick={() => showDetail(row.LIMS_CLINIC_ID)} style={{ minWidth: "200px", color: theme === 'dark' ? '#ffffff' : '#151619', borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }}>
                    {row.ALLDENIALCODES.split(',').length > 0 && <span className={`  rounded-lg p-2 ${theme === 'dark' ? 'bg-[#131D2E] text-[#005DE2]' : 'bg-[#eef4ff] text-[#005DE2]'}`}>{samplifyString(row.ALLDENIALCODES.split(',')[0])}</span>}
                  </TableCell>
                  <TableCell onClick={() => showDetail(row.LIMS_CLINIC_ID)} style={{ minWidth: "200px", color: theme === 'dark' ? '#ffffff' : '#151619', borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }}>
                    {row.ALLPROCCODES.split('; ').length > 0 && <span className={`  rounded-lg p-2 ${theme === 'dark' ? 'bg-[#131D2E] text-[#005DE2]' : 'bg-[#eef4ff] text-[#005DE2]'}`}>{samplifyString(row.ALLPROCCODES.split('; ')[0])}</span>}
                  </TableCell>
                </TableRow>)
              }
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div >
  );
};

export default DataTable;
