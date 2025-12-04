import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import axios from "axios";

import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Table from "@mui/material/Table";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { samplifyDouble, samplifyString } from "../../../utils/config";

import DataTableFilter from "./DataTableFilter";
import { setKeyword, setTableData, setTotalPage, setCurrentPage, setPageSize, setAppTitle, setPart1Loading, setPart2Loading, setTableLoading, setExtraFilter } from "../../../redux/reducers/app.reducer";
import { useApiEndpoint } from "../../../ApiEndpointContext";
import { toast } from "react-toastify";
import DataTableTags from "./DataTableTags";

const DataTable = (props) => {
  const apiUrl = useApiEndpoint();
  const location = useLocation();
  const navigate = useNavigate();
  const pageSizes = [50, 100, 250, 500 ,5000];
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
    navigate(`${type === 0 ? '/rebound' : '/medevolve'}/detail/${btoa(JSON.stringify(token))}`);
  }

  useEffect(() => {
    setCheckValues([...(Array(pageSize).fill(false))]);
  }, [pageSize])

  useEffect(() => {
    setCheckValues([...(Array(pageSize).fill(all))]);
  }, [all])

  const filterByKeyword = () => {
    dispatch(setExtraFilter({}))
    dispatch(setPart1Loading(true))
    dispatch(setPart2Loading(true))
    dispatch(setTableLoading(true))
    dispatch(setKeyword(inputKeywordRef.current.value))
    dispatch(setCurrentPage(1))
  }

  useEffect(() => {
    inputKeywordRef.current.value = keyword;
  }, [keyword])

  useEffect(() => {

    if (apiUrl === '') return;
    if (tableLoading == false) return;
    if (selectedTags.length == 0) return;
    axios.post(`${apiUrl}/data_all`, {
      currentPage: currentPage,
      perPage: pageSize,
      selectedTags,
      keyword: keyword,
      tabIndex: tabIndex,
      startDate: startDate ? startDate.toISOString().substr(0, 10) : null,
      endDate: endDate ? endDate.toISOString().substr(0, 10) : null,
      code: code,
      remark: remark,
      procedure: procedure,
      pos: pos,
      extra: extra,
      sort: order
    }).then(res => {
      dispatch(setTableData(res.data.data));
      dispatch(setTotalPage(res.data.maxPage));
      dispatch(setTableLoading(false))
    })
  }, [tableLoading, selectedTags, order])

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
    dispatch(setTableLoading(true));
  }


  const downloadToCSV = () => {
    if (downloading) return;
    setDownloading(true);
    toast.success('Downloading...');
  
    // Define the CSV headers based on the table headers
    const tableHeaders = [
      'Claim ID', 'Provider Tax ID', 'Provider NPI', 'Payer Name', 'Payer ID', 'PayerSeq', 'Patient Name', 'Load Date', 'Service Date', 'Place Of Service', 'Charges', 'Allowed Amt', 'Category', 'Denial Code', 'Primary Diagnosis', 'Primary Service', 'Remark Code', 'Action Date', 'Last Action'
    ];
    let csv_data = [tableHeaders.join(',')];
  
    // Process each row of data
    tableData.forEach((row, index) => {
      let remark = row.Remark ? [...new Set(row.Remark.split('*'))].join('*') : '';
      let value = [
        row.ClaimNo || '',
        row.ProvTaxID || '',
        row.ProvNPI || '',
        row.PayerName || '',
        row.PayerID || '',
        row.PayerSeq === 'P' ? "Primary" : (row.PayerSeq === 'S' ? 'Secondary' : ''),
        row.PayerName || '-', // Assuming Patient Name is the same as Payer Name
        row.LoadDate ? new Date(row.LoadDate).toLocaleDateString('en-US') : '',
        row.ServiceDate ? new Date(row.ServiceDate).toLocaleDateString('en-US') : '',
        row.PlaceOfService || '',
        row.Amount ? `$${row.Amount}` : '',
        row.AllowedAmt !== null ? `$${row.Amount}` : '$0',
        row.Category || '',
        `${row.PrimaryGroup || ''} ${row.PrimaryCode || ''}`,
        row.PrimaryDX ? row.PrimaryDX.split("::")[0] : '',
        row.PrimaryProcedure || '',
        remark,
        row.ActionDate ? new Date(row.ActionDate).toLocaleDateString('en-US') : '',
        row.ActionTaken === 'resubmit'? 'Resubmitted to Payer' : '' // Assuming row.ActionTaken is the Last Action
      ];
  
      csv_data.push(value.join(','));
    });
  
    // Join all rows with newline character
    csv_data = csv_data.join('\n');
  
    // Create a Blob from the CSV data
    const CSVFile = new Blob([csv_data], { type: "text/csv" });
  
    // Create a temporary link to download the CSV file
    let temp_link = document.createElement('a');
    temp_link.download = "claims_download.csv";
    let url = window.URL.createObjectURL(CSVFile);
    temp_link.href = url;
    temp_link.style.display = 'none';
    document.body.appendChild(temp_link);
  
    // Trigger the download
    temp_link.click();
    document.body.removeChild(temp_link);
  
    setDownloading(false);
    // toast.success('Downloading complete');
  }

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = isMobile ? 3 : 4;

  return (
    <div className={`flex flex-col rounded-lg ${theme === 'dark' ?"bg-[#151619] text-white" :"bg-white text-black"} gap-6`}>
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
      <div className="flex justify-between items-center">
        <DataTableFilter selectedTags={selectedTags} order={order} />
      </div>
      <div className="flex justify-center items-center">
        <button className="w-[40px] rounded-lg flex justify-center items-center h-[40px] p-3 bg-blue-600" onClick={downloadToCSV}>
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
                <TableCell style={{ minWidth: "50px", background: theme === 'dark' ? '#151619' : '#ffffff'  ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`}} className="h-[50px]">
                  <input type='checkbox'  className=" custom-checkbox form-control border-2 border-gra rounded-sm" checked={all} onClick={() => {
                    setAll(value => !value);
                  }} />
                </TableCell>
                <TableCell style={{ minWidth: "200px", background: theme === 'dark' ? '#151619' : '#ffffff',color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`}} onClick={() => setOrder("ClaimNo")} className="cursor-pointer">
                  <div className={`flex items-center gap-2 ` }>Claim ID
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
                <TableCell style={{ minWidth: "200px", background: theme === 'dark' ? '#151619' : '#ffffff',color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }} onClick={() => setOrder("ProvTaxID")} className="cursor-pointer">
                  <div className="flex items-center gap-2">Provider Tax ID
                    {
                      order == 'ProvTaxID' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                        <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                      </svg>
                        : (order == 'ProvTaxID-' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                          <path fill-rule="evenodd" d="M8 2a.75.75 0 0 1 .75.75v8.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V2.75A.75.75 0 0 1 8 2Z" clip-rule="evenodd" />
                        </svg>
                          : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="#999999" class="size-4">
                            <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                          </svg>)
                    }
                  </div>
                </TableCell>
                <TableCell style={{ minWidth: "150px", background: theme === 'dark' ? '#151619' : '#ffffff',color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }} onClick={() => setOrder("ProvNPI")} className="cursor-pointer">
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
                <TableCell style={{ minWidth: "200px", background: theme === 'dark' ? '#151619' : '#ffffff',color : theme === 'dark'? '#ffffff' : '#151619',borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }} onClick={() => setOrder("PayerName")} className="cursor-pointer">
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
                <TableCell style={{ minWidth: "150px", background: theme === 'dark' ? '#151619' : '#ffffff',color : theme === 'dark'? '#ffffff' : '#151619',borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }} onClick={() => setOrder("PayerID")} className="cursor-pointer">
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
                <TableCell style={{ minWidth: "200px", background: theme === 'dark' ? '#151619' : '#ffffff',color : theme === 'dark'? '#ffffff' : '#151619',borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`  }}>
                  PayerSeq
                </TableCell>
                <TableCell style={{ minWidth: "250px", background: theme === 'dark' ? '#151619' : '#ffffff',color : theme === 'dark'? '#ffffff' : '#151619',borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }}>
                  Patient Name
                </TableCell>
                <TableCell style={{ minWidth: "200px",background: theme === 'dark' ? '#151619' : '#ffffff',color : theme === 'dark'? '#ffffff' : '#151619',borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`  }} onClick={() => setOrder("LoadDate")} className="cursor-pointer">
                  <div className="flex items-center gap-2">Load Date
                    {
                      order == 'LoadDate' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                        <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                      </svg>
                        : (order == 'LoadDate-' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                          <path fill-rule="evenodd" d="M8 2a.75.75 0 0 1 .75.75v8.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V2.75A.75.75 0 0 1 8 2Z" clip-rule="evenodd" />
                        </svg>
                          : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="#999999" class="size-4">
                            <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                          </svg>)
                    }
                  </div>
                </TableCell>
                <TableCell style={{ minWidth: "200px",background: theme === 'dark' ? '#151619' : '#ffffff',color : theme === 'dark'? '#ffffff' : '#151619'  ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`}} onClick={() => setOrder("ServiceDate")} className="cursor-pointer">
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
                <TableCell style={{ minWidth: "200px",background: theme === 'dark' ? '#151619' : '#ffffff',color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`}}>
                  Place of Service
                </TableCell>
                <TableCell style={{ minWidth: "200px", background: theme === 'dark' ? '#151619' : '#ffffff',color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`}} onClick={() => setOrder("Amount")} className="cursor-pointer">
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
                <TableCell style={{ minWidth: "200px", background: theme === 'dark' ? '#151619' : '#ffffff',color : theme === 'dark'? '#ffffff' : '#151619',borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`  }} onClick={() => setOrder("AllowedAmt")} className="cursor-pointer">
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
                <TableCell style={{ minWidth: "250px", background: theme === 'dark' ? '#151619' : '#ffffff',color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }} onClick={() => setOrder("Category")} className="cursor-pointer">
                  <div className="flex items-center gap-2">Category
                    {
                      order == 'Category' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                        <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                      </svg>
                        : (order == 'Category-' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                          <path fill-rule="evenodd" d="M8 2a.75.75 0 0 1 .75.75v8.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V2.75A.75.75 0 0 1 8 2Z" clip-rule="evenodd" />
                        </svg>
                          : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="#999999" class="size-4">
                            <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                          </svg>)
                    }
                  </div>
                </TableCell>
                <TableCell style={{ minWidth: "200px", background: theme === 'dark' ? '#151619' : '#ffffff',color : theme === 'dark'? '#ffffff' : '#151619',borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }} onClick={() => setOrder("PrimaryCode")} className="cursor-pointer">
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
                <TableCell style={{ minWidth: "200px", background: theme === 'dark' ? '#151619' : '#ffffff',color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }}>
                  Remark Code
                </TableCell>
                <TableCell style={{ minWidth: "200px",background: theme === 'dark' ? '#151619' : '#ffffff',color : theme === 'dark'? '#ffffff' : '#151619'  ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`}} onClick={() => setOrder("PrimaryDX")} className="cursor-pointer">
                  <div className="flex items-center gap-2">Primary Diagnosis
                    {
                      order == 'PrimaryDX' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                        <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                      </svg>
                        : (order == 'PrimaryDX-' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                          <path fill-rule="evenodd" d="M8 2a.75.75 0 0 1 .75.75v8.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V2.75A.75.75 0 0 1 8 2Z" clip-rule="evenodd" />
                        </svg>
                          : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="#999999" class="size-4">
                            <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                          </svg>)
                    }
                  </div>
                </TableCell>
                <TableCell style={{ minWidth: "200px", background: theme === 'dark' ? '#151619' : '#ffffff',color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`}} onClick={() => setOrder("PrimaryProcedure")} className="cursor-pointer">
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
                <TableCell style={{ minWidth: "200px", background: theme === 'dark' ? '#151619' : '#ffffff',color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }} onClick={() => setOrder("ActionDate")} className="cursor-pointer">
                  <div className="flex items-center gap-2">Action Date
                    {
                      order == 'ActionDate' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                        <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                      </svg>
                        : (order == 'ActionDate-' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                          <path fill-rule="evenodd" d="M8 2a.75.75 0 0 1 .75.75v8.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V2.75A.75.75 0 0 1 8 2Z" clip-rule="evenodd" />
                        </svg>
                          : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="#999999" class="size-4">
                            <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                          </svg>)
                    }
                  </div>
                </TableCell>
                <TableCell style={{ minWidth: "200px", background: theme === 'dark' ? '#151619' : '#ffffff',color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}` }} onClick={() => setOrder("ActionTaken")} className="cursor-pointer">
                  <div className="flex items-center gap-2">Last Action
                    {
                      order == 'ActionTaken' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                        <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd" />
                      </svg>
                        : (order == 'ActionTaken-' ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
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
        !tableLoading && tableData.length !== 0 && tableData.map((row, index) => <TableRow key={index} sx={{ maxHeight: "100px"  }}>
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

          <TableCell onClick={() => showDetail(row.ClaimNo)} className="h-[50px]" style={{ minWidth: "200px",color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`}}>
            {row.ClaimNo}
          </TableCell>
          <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ minWidth: "200px",color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`}}>
            {row.ProvTaxID}
          </TableCell>
          <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ minWidth: "200px",color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`}}>
            {row.ProvNPI}
          </TableCell>
          <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ minWidth: "200px",color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`}}>
            {row.PayerName}
          </TableCell>
          <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ minWidth: "200px",color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`}}>
            {row.PayerID}
          </TableCell>
          <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ minWidth: "200px",color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`}}>
            {row.PayerSeq === 'P' ? "Primary" : (row.PayerSeq === 'S' ? 'Secondary' : '')}
          </TableCell>
          <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ minWidth: "200px",color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`}}>
            {"-"}
          </TableCell>
          <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ minWidth: "200px",color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`}}>
            {new Date(row.LoadDate).toISOString().substring(0, 10)}
          </TableCell>
          <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ minWidth: "200px",color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`}}>
            {new Date(row.ServiceDate).toISOString().substring(0, 10)}
          </TableCell>
          <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ minWidth: "200px",color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`}}>
            {row.PlaceOfService}
          </TableCell>
          <TableCell
            className="text-wrap"
            onClick={() => showDetail(row.ClaimNo)}
            style={{ minWidth: "200px",color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`}}  >
            {`$${samplifyDouble(row.Amount)}`}
          </TableCell>
          <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ minWidth: "200px",color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`}}>
            {`$${samplifyDouble(row.AllowedAmt)}`}
          </TableCell>
          <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ minWidth: "200px",color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`}}>
            <span className={`  rounded-lg p-2 ${theme === 'dark' ? 'bg-[#131D2E] text-[#005DE2]' : 'bg-[#eef4ff] text-[#005DE2]'}`}>{row.Category}</span>
          </TableCell>
          <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ minWidth: "200px",color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`}}>
            {row.PrimaryCode !== '' && <span className={`  rounded-lg p-2 ${theme === 'dark' ? 'bg-[#131D2E] text-[#005DE2]' : 'bg-[#eef4ff] text-[#005DE2]'}`}>{`${row.PrimaryGroup} ${row.PrimaryCode}`}</span>}
          </TableCell>
          <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ minWidth: "200px",color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`}}>
            {row.Remark.split('*').length > 0 && <span className={`  rounded-lg p-2 ${theme === 'dark' ? 'bg-[#131D2E] text-[#005DE2]' : 'bg-[#eef4ff] text-[#005DE2]'}`}>{samplifyString(row.Remark.split('*')[0])}</span>}
          </TableCell>
          <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ minWidth: "200px",color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`}}>
            <span className={`  rounded-lg p-2 ${theme === 'dark' ? 'bg-[#131D2E] text-[#005DE2]' : 'bg-[#eef4ff] text-[#005DE2]'}`} key={index}>{row.PrimaryDX.split("::")[0]}</span>
          </TableCell>
          <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ minWidth: "200px",color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`}}>
            <span className={`  rounded-lg p-2 ${theme === 'dark' ? 'bg-[#131D2E] text-[#005DE2]' : 'bg-[#eef4ff] text-[#005DE2]'}`} key={index}>{row.PrimaryProcedure}</span>
          </TableCell>
          <TableCell style={{ minWidth: "200px",color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`}}>
  <span className={`  rounded-lg p-2 ${theme === 'dark' ? 'bg-[#131D2E] text-[#005DE2]' : 'bg-[#eef4ff] text-[#005DE2]'}`} key={index}>
    {row.ActionDate ? samplifyString(row.ActionDate.replace(/ \d{2}:\d{2}:\d{2} GMT$/, '')) : ''}
  </span>
</TableCell>
          <TableCell style={{ minWidth: "200px",color : theme === 'dark'? '#ffffff' : '#151619' ,borderBottom: `1px solid ${theme === 'dark' ? '#191A1D' : '#eef4ff'}`}}>
            <span className={`  rounded-lg p-2 ${theme === 'dark' ? 'bg-[#131D2E] text-[#005DE2]' : 'bg-[#eef4ff] text-[#005DE2]'}`} key={index}>{samplifyString(row.ActionTaken == 'resubmit' ? 'Resubmitted to Payer' : '')}</span>
          </TableCell>
        </TableRow>)
      }
    </TableBody>
  </Table>
</TableContainer>
<div className="sticky bottom-0 flex mt-2 justify-between">
<div className=" hidden sm:block items-center gap-2 justify-start  pl-3">
        <label
          htmlFor="pageSize"
          className={`text-nowrap text-sm font-medium text-gray-900 dark:text-white ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
        >
          Rows per page:
        </label>
        <select
          id="pageSize"
          className={` border-none text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-3  ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-gray-50 text-black'}`}
          value={pageSize}
          onChange={(e) => {
            dispatch(setPageSize(parseInt(e.target.value)))
            dispatch(setCurrentPage(1))
            dispatch(setTableLoading(true));
          }}
        >
          {pageSizes.map((row, index) => (
            <option key={index} value={row}>
              {row}
            </option>
          ))}
        </select>

      </div>


      <div className="flex items-center gap-4 mt-3 md:mt-0">
  <nav aria-label="Page navigation example" className="flex">
    <ul className="inline-flex -space-x-px text-sm">
      {/* Double Left (<<) - First Page */}
      <li>
        <a
          href="#"
          className="flex items-center justify-center px-2 h-8 leading-tight text-gray-500 rounded-s-lg  hover:text-gray-700 "
          onClick={() => {
            dispatch(setCurrentPage(1));
            dispatch(setTableLoading(true));
          }}
        >
          {/* Double Left SVG Icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.22385 7.99988L7.36193 12.1379L8.30473 11.1951L5.10947 7.99988L8.30473 4.80462L7.36193 3.86182L3.22385 7.99988ZM6.99046 7.99988L11.1285 12.1379L12.0713 11.1951L8.87606 7.99988L12.0713 4.80462L11.1285 3.86182L6.99046 7.99988Z" fill="#9598B0"/>
          </svg>
        </a>
      </li>

      {/* Single Left (<) - Previous Page */}
      <li>
        <a
          href="#"
          className="flex items-center justify-center px-2 h-8 leading-tight text-gray-500  hover:text-gray-700 "
          onClick={() => {
            if (currentPage > 1) {
              dispatch(setCurrentPage(currentPage - 1));
              dispatch(setTableLoading(true));
            }
          }}
        >
          {/* Single Left SVG Icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.21908 7.99953L10.5189 11.2994L9.57608 12.2422L5.33341 7.99953L9.57608 3.75694L10.5189 4.69973L7.21908 7.99953Z" fill="#9598B0"/>
          </svg>
        </a>
      </li>

      {/* Display page numbers: 1, 2, 3, 4 */}
      {[...Array(totalPages)].map((_, i) => {
        const pageNum = i + 1;
        return (
          <li key={pageNum}>
            <a
              href="#"
              className={`flex items-center justify-center px-3 h-8 leading-tight ${
                currentPage === pageNum
                  ? ` font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'} `
                  : "text-gray-500 hover:text-gray-700"
              } `}
              onClick={() => {
                dispatch(setCurrentPage(pageNum));
                dispatch(setTableLoading(true));
              }}
            >
              {pageNum}
            </a>
          </li>
        );
      })}

      {/* Ellipsis and Last Page Number */}
      {totalPage > 5 && (
        <>
          <li>
            <span className="px-3 h-8 leading-tight text-gray-500">...</span>
          </li>
          <li>
            <a
              href="#"
              className={`flex items-center justify-center px-3 h-8 leading-tight ${
                currentPage === totalPage
                  ? ` font-semibold ${theme === 'dark' ?'text-white':'text-black' } `
                  : "text-gray-500  hover:text-gray-700"
              } `}
              onClick={() => {
                dispatch(setCurrentPage(totalPage));
                dispatch(setTableLoading(true));
              }}
            >
              {totalPage}
            </a>
          </li>
        </>
      )}

      {/* Single Right (>) - Next Page */}
      <li>
        <a
          href="#"
          className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500  hover:text-gray-700 "
          onClick={() => {
            if (currentPage + 1 <= totalPage) {
              dispatch(setCurrentPage(currentPage + 1));
              dispatch(setTableLoading(true));
            }
          }}
        >
          {/* Single Right SVG Icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.78093 8.00047L5.48112 4.70062L6.42392 3.75781L10.6666 8.00047L6.42392 12.2431L5.48112 11.3003L8.78093 8.00047Z" fill="#9598B0"/>
          </svg>
        </a>
      </li>

      {/* Double Right (>>) - Last Page */}
      <li>
        <a
          href="#"
          className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 rounded-e-lg  hover:text-gray-700 "
          onClick={() => {
            dispatch(setCurrentPage(totalPage));
            dispatch(setTableLoading(true));
          }}
        >
          {/* Double Right SVG Icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.7761 7.99988L8.63807 3.86182L7.69527 4.80462L10.8905 7.99988L7.69527 11.1951L8.63807 12.1379L12.7761 7.99988ZM9.00953 7.99988L4.87148 3.86182L3.92867 4.80462L7.12393 7.99988L3.92867 11.1951L4.87148 12.1379L9.00953 7.99988Z" fill="#9598B0"/>
          </svg>
        </a>
      </li>
    </ul>
  </nav>
</div>



</div>
      </div>
    
    </div >
  );
};

export default DataTable;
