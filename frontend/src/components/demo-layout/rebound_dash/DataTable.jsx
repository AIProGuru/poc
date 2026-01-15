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
import { setTableData, setTotalPage, setCurrentPage, setPageSize, setAppTitle, setPart1Loading, setPart2Loading, setTableLoading, setExtraFilter } from "../../../redux/reducers/app.reducer";
import { useApiEndpoint } from "../../../ApiEndpointContext";
import { toast } from "react-toastify";
import DataTableTags from "./DataTableTags";

const DataTable = (props) => {
  const apiUrl = useApiEndpoint();
  const requestRef = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();
  const pageSizes = [50, 100, 250, 500, 5000];
  const dispatch = useDispatch();
  const tableScrollRef = useRef(null);
  const role = useSelector((state) => state.auth.role);
  const startDate = useSelector((state) => state.app.startDate)
  const endDate = useSelector((state) => state.app.endDate)
  const selectedTags = useSelector((state) => state.tags.selectedTags)
  const tableData = useSelector((state) => state.app.tableData)
  const totalPage = useSelector((state) => state.app.totalPage)
  const currentPage = useSelector((state) => state.app.currentPage)
  const pageSize = useSelector((state) => state.app.pageSize)
  const keyword = useSelector((state) => state.app.keyword)
  const tabIndex = useSelector((state) => state.app.tabIndex)
  const tableLoading = useSelector((state) => state.app.tableLoading)
  const type = useSelector((state) => state.app.type)
  const [checkValues, setCheckValues] = useState([])
  const [all, setAll] = useState(false)
  const [downloading, setDownloading] = useState(false);
  const code = useSelector((state) => state.app.code)
  const remark = useSelector((state) => state.app.remark)
  const procedure = useSelector((state) => state.app.procedure)
  const pos = useSelector((state) => state.app.pos)
  const extra = useSelector((state) => state.app.extraFilter);
  const appTitle = useSelector((state) => state.app.title);
  const [order, _setOrder] = useState("ClaimNo");
  const theme = useSelector((state) => state.app.theme);
  const isDarkMode = theme === 'dark';
  const tableBackground = isDarkMode ? '#0B0F19' : '#ffffff';
  const formatDateSafe = (value) => {
    if (!value) return '';
    const dateObj = new Date(value);
    return Number.isNaN(dateObj.getTime()) ? '' : dateObj.toISOString().substring(0, 10);
  };
  const formatCurrency = (value) => `$${samplifyDouble(Number(value) || 0)}`;
  // Mirror the facility value used in the Claim (837) detail view.
  const getFacility = (row) => {
    const claimData =
      (row.Claim && row.Claim.Data) ||
      row.ClaimData ||
      row.claimData ||
      (row.claim && row.claim.Data) ||
      {};
    return (
      row.Facility ||
      row.FacilityName ||
      claimData.Facility ||
      claimData.FacilityName ||
      claimData.BillProvName ||
      row.BillProvName ||
      row.ProviderName ||
      claimData.BillProv ||
      row.BillProv ||
      ''
    );
  };
  const headerCellStyle = {
    background: tableBackground,
    color: isDarkMode ? '#A5AACB' : '#1A1D2B',
    borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : '#E4E7EF'}`,
    fontWeight: 600,
    fontSize: '0.82rem',
  };
  const bodyCellStyle = {
    color: isDarkMode ? '#F4F6FF' : '#1A1D2B',
    borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : '#E4E7EF'}`,
    fontSize: '0.9rem',
  };

  const showDetail = (claimNo) => {
    const token = {
      claimNo,
      appTitle,
    }
    console.log(location.pathname)
    navigate(`${type === 0 ? '/rebound' : '/pilotcustomer'}/detail/${btoa(JSON.stringify(token))}`);
  }

  useEffect(() => {
    setCheckValues([...(Array(pageSize).fill(false))]);
  }, [pageSize])

  useEffect(() => {
    setCheckValues([...(Array(pageSize).fill(all))]);
  }, [all])

  useEffect(() => {

    if (apiUrl === '') return;
    if (!tableLoading) return;
    const includeAllCategories = extra?.IncludeAllCategories;
    if (!includeAllCategories && selectedTags.length === 0) return;
    if (requestInFlightRef.current) return;
    requestInFlightRef.current = true;
    const requestId = ++requestRef.current;
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
      if (requestRef.current !== requestId) return;
      requestInFlightRef.current = false;
      dispatch(setTableData(res.data.data));
      dispatch(setTotalPage(res.data.maxPage));
      dispatch(setTableLoading(false))
    }).catch(() => {
      if (requestRef.current !== requestId) return;
      requestInFlightRef.current = false;
      dispatch(setTableLoading(false));
    });
  }, [tableLoading, selectedTags, order, extra, code, remark, procedure, pos, currentPage, pageSize, keyword, startDate, endDate])

  const setOrder = (ord) => {
    const ordName = order[order.length - 1] === '-' ? order.substring(0, order.length - 1) : order;
    console.log(ordName, ord);
    if (ordName === ord) {
      if (order[order.length - 1] === '-') {
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

  const renderSortIcon = (columnKey) => {
    if (order === columnKey) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="size-4"
        >
          <path
            fillRule="evenodd"
            d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z"
            clipRule="evenodd"
          />
        </svg>
      );
    }

    if (order === `${columnKey}-`) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="size-4"
        >
          <path
            fillRule="evenodd"
            d="M8 2a.75.75 0 0 1 .75.75v8.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V2.75A.75.75 0 0 1 8 2Z"
            clipRule="evenodd"
          />
        </svg>
      );
    }

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="#999999"
        className="size-4"
      >
        <path
          fillRule="evenodd"
          d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z"
          clipRule="evenodd"
        />
      </svg>
    );
  };


  const downloadToCSV = () => {
    if (downloading) return;
    setDownloading(true);
    toast.success('Downloading...');

    // Define the CSV headers based on the table headers
    const tableHeaders = [
      'Priority', 'Facility Name', 'Provider Tax ID', 'Claim ID', 'Payer ID', 'Payer Name', 'Payer Seq', 'Patient Name', 'Service Date', 'Place of Service', 'Charges', 'Allowed Amt', 'Balance', 'Category', 'CARC', 'RARC', 'Primary Dx', 'Primary Service'
    ];
    let csv_data = [tableHeaders.join(',')];

    // Process each row of data
    tableData.forEach((row, index) => {
      const remark = row.Remark ? [...new Set(row.Remark.split('*'))].join('*') : '';
      const charges = Number(row.Amount) || 0;
      const allowed = Number(row.AllowedAmt) || 0;
      const balance = charges - allowed;
      let value = [
        row.Priority || '',
        getFacility(row),
        row.ProvTaxID || row.ProviderTaxID || '',
        row.ClaimNo || row.ClaimID || '',
        row.PayerID || '',
        row.PayerName || '',
        row.PayerSeq === 'P' ? "Primary" : (row.PayerSeq === 'S' ? 'Secondary' : (row.PayerSeq || '')),
        row.PatientName || row.Patient || '',
        formatDateSafe(row.ServiceDate),
        row.PlaceOfService || '',
        charges ? `$${charges}` : '$0',
        `$${allowed}`,
        `$${balance}`,
        row.Category || '',
        `${row.PrimaryGroup || ''} ${row.PrimaryCode || ''}`.trim(),
        remark,
        row.PrimaryDX ? row.PrimaryDX.split("::")[0] : '',
        row.PrimaryProcedure || ''
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
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const requestInFlightRef = useRef(false);

  const scrollTable = (direction) => {
    if (tableScrollRef.current) {
      const scrollAmount = 300;
      tableScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = totalPage || (isMobile ? 3 : 4);
  const tableMaxHeight = Math.max(320, viewportHeight - (isMobile ? 240 : 360));

  return (
    <div className={`rounded-[32px] border ${isDarkMode ? 'bg-[#0B0F19] border-[#1F2231] text-white' : 'bg-white border-[#E4E7EF] text-[#0f172a]'} shadow-[0_25px_60px_rgba(0,0,0,0.35)] p-6 flex flex-col h-full`}>
      <div className="relative pb-4 pt-2">
        <button
          className={`p-1 absolute left-0 top-6 -translate-x-1/2 z-10 ${isDarkMode ? 'text-white/70 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
          onClick={() => scrollTable('left')}
          aria-label="Scroll table left"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          className={`p-1 absolute right-0 top-6 translate-x-1/2 z-10 ${isDarkMode ? 'text-white/70 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
          onClick={() => scrollTable('right')}
          aria-label="Scroll table right"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="pl-9 pr-5">
          <TableContainer
            ref={tableScrollRef}
            sx={{
              maxHeight: tableMaxHeight,
              backgroundColor: tableBackground,
              color: theme === 'dark' ? 'white' : 'black',
              borderRadius: '24px',
              overflowX: 'scroll',
              overflowY: 'auto',
              scrollbarGutter: 'stable',
              scrollbarWidth: 'thin',
              scrollbarColor: theme === 'dark' ? '#2E323D transparent' : '#c8d3e6 transparent',
              '&::-webkit-scrollbar': {
                height: '6px',
                width: '6px'
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent'
              },
              '&::-webkit-scrollbar-thumb': {
                borderRadius: '999px',
                backgroundColor: theme === 'dark' ? '#2E323D' : '#c8d3e6'
              }
            }}
          >
        <Table
          aria-label="sticky table"
          stickyHeader
          size="small"
          sx={{
            '& .MuiTableCell-root': {
              padding: '10px 12px'
            },
            '& .MuiTableCell-head': {
              textTransform: 'uppercase',
              letterSpacing: '.08em',
              fontSize: '0.75rem',
              backgroundColor: tableBackground,
              color: isDarkMode ? '#A5AACB' : '#4B5563',
              position: 'sticky',
              top: 0,
              zIndex: 2
            },
            '& .MuiTableCell-body': {
              color: isDarkMode ? '#F4F6FF' : '#0F172A'
            }
          }}
                >
            <TableHead>
              <TableRow>
                <TableCell style={{ ...headerCellStyle, minWidth: "120px" }} onClick={() => setOrder("Priority")} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    Priority
                    {renderSortIcon('Priority')}
                  </div>
                </TableCell>
                <TableCell style={{ ...headerCellStyle, minWidth: "170px" }} onClick={() => setOrder("BillProvName")} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    Facility Name
                    {renderSortIcon('BillProvName')}
                  </div>
                </TableCell>
                <TableCell style={{ ...headerCellStyle, minWidth: "160px" }} onClick={() => setOrder("ProvTaxID")} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    Provider Tax ID
                    {renderSortIcon('ProvTaxID')}
                  </div>
                </TableCell>
                <TableCell style={{ ...headerCellStyle, minWidth: "170px" }} onClick={() => setOrder("ClaimNo")} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    Claim ID
                    {renderSortIcon('ClaimNo')}
                  </div>
                </TableCell>
                <TableCell style={{ ...headerCellStyle, minWidth: "130px" }} onClick={() => setOrder("PayerID")} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    Payer ID
                    {renderSortIcon('PayerID')}
                  </div>
                </TableCell>
                <TableCell style={{ ...headerCellStyle, minWidth: "170px" }} onClick={() => setOrder("PayerName")} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    Payer Name
                    {renderSortIcon('PayerName')}
                  </div>
                </TableCell>
                <TableCell style={{ ...headerCellStyle, minWidth: "120px" }}>
                  Payer Seq
                </TableCell>
                <TableCell style={{ ...headerCellStyle, minWidth: "170px" }} onClick={() => setOrder("PatientName")} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    Patient Name
                    {renderSortIcon('PatientName')}
                  </div>
                </TableCell>
                <TableCell style={{ ...headerCellStyle, minWidth: "140px" }} onClick={() => setOrder("ServiceDate")} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    Service Date
                    {renderSortIcon('ServiceDate')}
                  </div>
                </TableCell>
                <TableCell style={{ ...headerCellStyle, minWidth: "150px" }} onClick={() => setOrder("PlaceOfService")} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    Place of Service
                    {renderSortIcon('PlaceOfService')}
                  </div>
                </TableCell>
                <TableCell style={{ ...headerCellStyle, minWidth: "140px" }} onClick={() => setOrder("Amount")} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    Charges
                    {renderSortIcon('Amount')}
                  </div>
                </TableCell>
                <TableCell style={{ ...headerCellStyle, minWidth: "140px" }} onClick={() => setOrder("AllowedAmt")} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    Allowed Amt
                    {renderSortIcon('AllowedAmt')}
                  </div>
                </TableCell>
                <TableCell style={{ ...headerCellStyle, minWidth: "140px" }}>
                  Balance
                </TableCell>
                <TableCell style={{ ...headerCellStyle, minWidth: "150px" }} onClick={() => setOrder("Category")} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    Category
                    {renderSortIcon('Category')}
                  </div>
                </TableCell>
                <TableCell style={{ ...headerCellStyle, minWidth: "150px" }} onClick={() => setOrder("PrimaryCode")} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    CARC
                    {renderSortIcon('PrimaryCode')}
                  </div>
                </TableCell>
                <TableCell style={{ ...headerCellStyle, minWidth: "150px" }}>
                  RARC
                </TableCell>
                <TableCell style={{ ...headerCellStyle, minWidth: "160px" }} onClick={() => setOrder("PrimaryDX")} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    Primary Dx
                    {renderSortIcon('PrimaryDX')}
                  </div>
                </TableCell>
                <TableCell style={{ ...headerCellStyle, minWidth: "150px" }} onClick={() => setOrder("PrimaryProcedure")} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    Primary Service
                    {renderSortIcon('PrimaryProcedure')}
                  </div>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody className="relative">
              {tableLoading && <TableRow className="flex justify-center items-center h-[100px]"><TableCell colSpan={12}><div className="flex justify-center items-center">Loading data...</div></TableCell></TableRow>}
              {!tableLoading && tableData.length === 0 && <TableRow className="flex justify-center items-center h-[100px]"><TableCell colSpan={12}><div className="flex justify-center items-center">No record</div></TableCell></TableRow>}
              {
                !tableLoading && tableData.length !== 0 && tableData.map((row, index) => <TableRow
                  key={index}
                  className="transition-colors"
                  sx={{
                    maxHeight: "100px",
                    '&:hover': {
                      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F3F4FF'
                    }
                  }}
                >
                  <TableCell onClick={() => showDetail(row.ClaimNo)} className="h-[50px]" style={{ ...bodyCellStyle, minWidth: "120px" }}>
                    {row.Priority || ''}
                  </TableCell>
                  <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ ...bodyCellStyle, minWidth: "170px" }}>
                    {getFacility(row)}
                  </TableCell>
                  <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ ...bodyCellStyle, minWidth: "160px" }}>
                    {row.ProvTaxID || row.ProviderTaxID || ''}
                  </TableCell>
                  <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ ...bodyCellStyle, minWidth: "170px" }}>
                    {row.ClaimNo}
                  </TableCell>
                  <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ ...bodyCellStyle, minWidth: "130px" }}>
                    {row.PayerID}
                  </TableCell>
                  <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ ...bodyCellStyle, minWidth: "170px" }}>
                    {row.PayerName}
                  </TableCell>
                  <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ ...bodyCellStyle, minWidth: "120px" }}>
                    {row.PayerSeq === 'P' ? "Primary" : (row.PayerSeq === 'S' ? 'Secondary' : (row.PayerSeq || ''))}
                  </TableCell>
                  <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ ...bodyCellStyle, minWidth: "170px" }}>
                    {row.PatientName || row.Patient || ''}
                  </TableCell>
                  <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ ...bodyCellStyle, minWidth: "140px" }}>
                    {formatDateSafe(row.ServiceDate)}
                  </TableCell>
                  <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ ...bodyCellStyle, minWidth: "150px" }}>
                    {row.PlaceOfService}
                  </TableCell>
                  <TableCell
                    className="text-wrap"
                    onClick={() => showDetail(row.ClaimNo)}
                    style={{ ...bodyCellStyle, minWidth: "140px" }}  >
                    {formatCurrency(row.Amount)}
                  </TableCell>
                  <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ ...bodyCellStyle, minWidth: "140px" }}>
                    {formatCurrency(row.AllowedAmt)}
                  </TableCell>
                  <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ ...bodyCellStyle, minWidth: "140px" }}>
                    {formatCurrency((Number(row.Amount) || 0) - (Number(row.AllowedAmt) || 0))}
                  </TableCell>
                  <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ ...bodyCellStyle, minWidth: "150px" }}>
                    {(() => {
                      const category = (row.Category || '').trim() || 'DELINQUENT';
                      return category;
                    })()}
                  </TableCell>
                  <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ ...bodyCellStyle, minWidth: "150px" }}>
                    {(() => {
                      const group = ((row.PrimaryGroup ?? '') || '').trim();
                      const code = ((row.PrimaryCode ?? '') || '').trim();
                      const denialCode = [group, code].filter(Boolean).join(' ');
                      return denialCode || '';
                    })()}
                  </TableCell>
                  <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ ...bodyCellStyle, minWidth: "150px" }}>
                    {(() => {
                      const remarkText = (row.Remark || '').split('*')[0] || '';
                      return remarkText ? samplifyString(remarkText) : '';
                    })()}
                  </TableCell>
                  <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ ...bodyCellStyle, minWidth: "160px" }}>
                    {(() => {
                      const primaryDx = (row.PrimaryDX || '').split("::")[0];
                      return primaryDx;
                    })()}
                  </TableCell>
                  <TableCell onClick={() => showDetail(row.ClaimNo)} style={{ ...bodyCellStyle, minWidth: "150px" }}>
                    {row.PrimaryProcedure || ''}
                  </TableCell>
                </TableRow>)
              }
            </TableBody>
        </Table>
          </TableContainer>
        </div>
      </div>
        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
                      <path d="M3.22385 7.99988L7.36193 12.1379L8.30473 11.1951L5.10947 7.99988L8.30473 4.80462L7.36193 3.86182L3.22385 7.99988ZM6.99046 7.99988L11.1285 12.1379L12.0713 11.1951L8.87606 7.99988L12.0713 4.80462L11.1285 3.86182L6.99046 7.99988Z" fill="#9598B0" />
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
                      <path d="M7.21908 7.99953L10.5189 11.2994L9.57608 12.2422L5.33341 7.99953L9.57608 3.75694L10.5189 4.69973L7.21908 7.99953Z" fill="#9598B0" />
                    </svg>
                  </a>
                </li>

                {/* Display page numbers with ellipsis */}
                {(() => {
                  const pages = [];
                  const maxButtons = 5;
                  if (!totalPage || totalPage <= maxButtons) {
                    for (let pageNum = 1; pageNum <= (totalPage || 1); pageNum += 1) {
                      pages.push(pageNum);
                    }
                  } else {
                    if (currentPage <= 3) {
                      pages.push(1, 2, 3, 4, 5);
                    } else if (currentPage >= totalPage - 2) {
                      pages.push(totalPage - 4, totalPage - 3, totalPage - 2, totalPage - 1, totalPage);
                    } else {
                      pages.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
                    }
                  }
                  return (
                    <>
                      {pages[0] > 1 && (
                        <>
                          <li>
                            <a
                              href="#"
                              className={`flex items-center justify-center px-3 h-8 leading-tight ${currentPage === 1
                                  ? ` font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'} `
                                  : "text-gray-500 hover:text-gray-700"
                                } `}
                              onClick={() => {
                                dispatch(setCurrentPage(1));
                                dispatch(setTableLoading(true));
                              }}
                            >
                              1
                            </a>
                          </li>
                          {pages[0] > 2 && (
                            <li>
                              <span className="px-3 h-8 leading-tight text-gray-500">...</span>
                            </li>
                          )}
                        </>
                      )}
                      {pages.map((pageNum) => (
                        <li key={pageNum}>
                          <a
                            href="#"
                            className={`flex items-center justify-center px-3 h-8 leading-tight ${currentPage === pageNum
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
                      ))}
                      {pages[pages.length - 1] < totalPage && (
                        <>
                          {pages[pages.length - 1] < totalPage - 1 && (
                            <li>
                              <span className="px-3 h-8 leading-tight text-gray-500">...</span>
                            </li>
                          )}
                          <li>
                            <a
                              href="#"
                              className={`flex items-center justify-center px-3 h-8 leading-tight ${currentPage === totalPage
                                  ? ` font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'} `
                                  : "text-gray-500 hover:text-gray-700"
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
                    </>
                  );
                })()}

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
                      <path d="M8.78093 8.00047L5.48112 4.70062L6.42392 3.75781L10.6666 8.00047L6.42392 12.2431L5.48112 11.3003L8.78093 8.00047Z" fill="#9598B0" />
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
                      <path d="M12.7761 7.99988L8.63807 3.86182L7.69527 4.80462L10.8905 7.99988L7.69527 11.1951L8.63807 12.1379L12.7761 7.99988ZM9.00953 7.99988L4.87148 3.86182L3.92867 4.80462L7.12393 7.99988L3.92867 11.1951L4.87148 12.1379L9.00953 7.99988Z" fill="#9598B0" />
                    </svg>
                  </a>
                </li>
              </ul>
            </nav>
          </div>



        </div>
    </div>
  );
};

export default DataTable;
