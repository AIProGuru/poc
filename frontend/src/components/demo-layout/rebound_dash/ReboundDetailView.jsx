import React, { useEffect, useState, useRef } from "react";
import axios from 'axios';
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from 'react-toastify';

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';

import Description from "./Description";
import DetailSection from "./DetailSection";
import Recommendation from "./Recommendation";
import { samplifyDouble, samplifyString, samplifyInteger, SERVER_URL } from "../../../utils/config";
import { useApiEndpoint } from "../../../ApiEndpointContext";
import { useDispatch, useSelector } from "react-redux";
import { setAppTitle } from "../../../redux/reducers/app.reducer";
import { IconButton } from "@mui/material";
import "./dashboard.css"


const ReboundDetailView = () => {
  const apiUrl = useApiEndpoint();
  const dispatch = useDispatch();
  const location = useLocation();
  const [showAppealModal, setShowAppealModal] = useState(false);
  
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const theme = useSelector((state) => state.app.theme);
  const navigate = useNavigate();
  const username = useSelector((state) => state.auth.username);
  const [detailShowStatus, setDetailShowStatus] = useState(4);
  const [currentClaim, setCurrentClaim] = useState(null);
  const [appeal, setAppeal] = useState([])
  const [actionDate, setActionDate] = useState(null)
  const [appealLetter, setAppealLetter] = useState('')
  const [status, setStatus] = useState(true)
  const [showComment, setShowComment] = useState(false)
  const [renderIndex, setRenderIndex] = useState(0)
  const [claimNo, setClaimNo] = useState('')
  const [thumb, setThumb] = useState(0);
  const [generatingAppeal, setGeneratingAppeal] = useState(false);
  const type = useSelector((state) => state.app.type)
  const claimStatus = useRef(null);
  const [originalComment, setOriginalComment] = useState({
    Additional: "",
    CPT: "",
    Description: "",
    Recommendation: "",
    Root: "",
    Steps: "",
    Evidence1: "",
    Evidence2: "",
  });
  const [comment, setComment] = useState({
    Additional: "",
    CPT: "",
    Description: "",
    Recommendation: "",
    Root: "",
    Steps: "",
    Evidence1: "",
    Evidence2: "",
  })
  const [document, setDocument] = useState({
    Category: "",
    DenialCode: "",
    Comments: "",
    Evidence1: "",
    Evidence2: "",
    Resubmittion: "",
  })
  const [remit_collapse_state,SetRemit_state]=useState(true)

  let { token } = useParams()
  useEffect(() => {
    if (apiUrl === '') return;
    if (token) {
      dispatch(setAppTitle("Triage/Action"))
      token = JSON.parse(atob(token))
      console.log(token)
      if (token.tabIndex) {
        setDetailShowStatus(token.tabIndex);
      }
      if (token.claimNo) {
        setClaimNo(token.claimNo);
      }
    }
  }, [apiUrl, token])

  const chunkArray = (array, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize);
      if (chunk.some(item => item.trim() !== '')) { // Check if the chunk has any non-empty items
        chunks.push(chunk);
      }
    }
    return chunks;
  };

  useEffect(() => {
    if (showAppealModal == false) return;
    setGeneratingAppeal(true)
    axios.post(`${SERVER_URL}/v2/generate_appeal`, {
      action: appeal[1],
      evidence: appeal[3],
      recommendation: appeal[5],
      rationale: appeal[2],
      root_cause: appeal[4],
      claim_number: currentClaim.Claim.Data.ClaimNo,
      procedure: currentClaim.Claim.ServiceLine.map((row, index) => row.Code),
      diagnosis: currentClaim.Claim.Diagnosis.map((row, index) => row.Code),
      denial_code: currentClaim.Remit[0].ServiceLine.map((row, index) => row.Codes.map((r, ind) => `${r.AdjustmentGroup} ${r.AdjustmentReason}`)),
      remark: currentClaim.Claim.Data.Remark,
    }).then(res => {
      setAppealLetter(res.data)
      setGeneratingAppeal(false)
    })
  }, [showAppealModal])


  const showDetail = (claimNo) => {
    const token = {
      claimNo
    }
    console.log(location.pathname)
    navigate(`${type === 0 ? '/rebound' : '/medevolve'}/detail/${btoa(JSON.stringify(token))}`);
  }


  const submitDocument = () => {
    axios.post(`${apiUrl}/add_document`, { ...document, ClaimNo: currentClaim.ClaimNo }).then(res => {
      toast.success("Saved successfully!")
    })
  }

  
  const [notes , setNotes] = useState('')

  const expandAll = () => {
    setStatus(false);
    setRenderIndex(renderIndex + 10);
  }
  const collapseAll = () => {
    setStatus(true);
    setRenderIndex(renderIndex + 10);
  }

  const onSubmitClaim = () => {
    if (!claimStatus.current || claimStatus.current.value === 'none') {
      toast.info('Please select a claim status.');
      return;
    };
    toast.info('Saving this claim...');
    setActionDate(new Date(Date.now()).toLocaleDateString());
    axios.post(`${apiUrl}/save_action`, {
      claimno: currentClaim.Claim.Data.ClaimNo,
      aaction_date: new Date(Date.now()).toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      }),
      action: appeal[1],
      claim_status: claimStatus.current.value,
      thumb: thumb,
      notes: notes, // Use notes state here
      username: username
    }).then(res => {
      toast.success("Saved!");
    }).catch(err => {
      toast.error('Error occurred while submitting.');
    });
  };
  

  const makeWordBold = (text, word) => {
    // Create a regular expression to match the word, ignoring case
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
    const regex = new RegExp(`(${escapedWord})`, 'gi'); // 'g' for global match, 'i' for case-insensitive

    // Replace the word in the text with the bold version
    const boldedText = text.replace(regex, '<b>$1</b>');

    return boldedText;
  }

  const formatDate = (dateString) => {
    const date = new Date(Date.parse(dateString));
    return date.toLocaleDateString();
  };
  
  const TableWrapper = ({ children }) => (
    <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-200">
      <div className="inline-block min-w-full align-middle">
        {children}
      </div>
    </div>
  );

  const onDetailShowStatusChange = (value) => {
    setDetailShowStatus(value);
    switch (value) {
      case 0:
        dispatch(setAppTitle("Claim"));
        break;
      case 1:
        dispatch(setAppTitle("Remit"));
        break;
      case 2:
        dispatch(setAppTitle("Related Encounters"));
        break;
      case 3:
        dispatch(setAppTitle("Documentation"));
        break;
      case 4:
        dispatch(setAppTitle("Triage/Action"));
        break;
    }
  }



  const updateComment = () => {
    axios.post(`${apiUrl}/save_comment`, {
      comment,
      ClaimNo: currentClaim.ClaimNo
    }).then(res => {
      toast.success("Saved successfully!")
    }).catch(err => {
      toast.error("Error occured!")
    })
  }


  useEffect(() => {
    if (apiUrl === '') return;
    if (claimNo === '') return;
    setCurrentClaim(null);
    setDetailShowStatus(4);
    // dispatch(setAppTitle("Claim"))
    axios.get(`${apiUrl}/get_claim?id=${claimNo}&username=${username}`).then(res => {
      console.log("@@@@@@@@@@@@@@", res.data)
      setCurrentClaim(res.data);
      setOriginalComment(res.data.Comment);
      setDocument(res.data.Document);
      setAppeal([...res.data.Appeal]);
      setThumb(res.data.rate);
    })
  }, [claimNo, apiUrl])

  const [openNotesHistoryModal, setOpenNotesHistoryModal] = useState(false)

  const handleOpenNotesHistory = () => {
    setOpenNotesHistoryModal(true)

  };

  

  const handleCloseNotesHistoryModal = () => {
    setOpenNotesHistoryModal(false)
  }

  const openHistoryDetail = (id) => {
    console.log("detail")
  }

  const notesHistoryData = [
    { id: 1, date: '2023-10-10', notes: 'First note', writer: 'John Doe' },
    { id: 2, date: '2023-10-12', notes: 'Second note', writer: 'Jane Smith' },
    // Add more data as needed
  ];

  return (
    <>
      {currentClaim && <div className="flex flex-col gap-4">

        <div>
       <p className=" text-[32px] font-semibold">Claim ID: {currentClaim.Claim.Data.ClaimNo}</p>
        </div>

        <div className={`flex sm:flex-row flex-col    rounded-xl p-2 gap-2 items-center font-inter w-full ${theme === 'dark' ? 'bg-[#191a1d]' : 'bg-[#EFF4FE]'} `}>
  {/* Service Date */}
  <div className={` h-full w-full rounded-xl flex flex-row sm:items-start items-center sm:flex-col sm:justify-center justify-between p-3 ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-700'} `}>
    <div className="text-[12px] text-[#828385]">Service Date(s)</div>
    <div className={`text-[16px] ${theme==='dark'?'text-gray-300':'text-[#151618]'}  mt-0 sm:mt-5`}>
      {(() => {
        const date = new Date(Date.parse(currentClaim.Claim.Data.ServiceDate));
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${month}/${day}/${year}`;
      })()}
    </div>
  </div>

  {/* Charges */}
  <div className={` h-full w-full rounded-xl flex flex-row sm:items-start items-center sm:flex-col sm:justify-center justify-between p-3 ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-700'} `}>
    <div className={`text-[12px] ${theme==='dark'?'text-gray-300':'text-[#828385]'} text-[#828385]`}>Charges</div>
    <div className={`text-[16px] ${theme==='dark'?'text-gray-300':'text-[#151618]'}  mt-0 sm:mt-5`}>{`$${samplifyDouble(currentClaim.Claim.Data.Amount)}`}</div>
  </div>

  {/* Allowed Amount */}
  <div className={` h-full w-full rounded-xl flex flex-row sm:items-start items-center sm:flex-col sm:justify-center justify-between p-3 ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-700'} `}>
    <div className={`text-[12px] ${theme==='dark'?'text-gray-300':'text-[#828385]'} text-[#828385]`}>Allowed Amt</div>
    <div className={`text-[16px] ${theme==='dark'?'text-gray-300':'text-[#151618]'}  mt-0 sm:mt-5`}>
      {`$${currentClaim.Remit.length === 0
        ? currentClaim.Claim.Data.Amount
        : currentClaim.Remit[0].ServiceLine
            .map((rr) => Number(rr.AllowedAmount))
            .reduce((partialSum, a) => partialSum + a, 0)}`}
    </div>
  </div>

  {/* Paid Amount */}
  <div className={` h-full w-full rounded-xl flex flex-row sm:items-start items-center sm:flex-col sm:justify-center justify-between p-3 ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-700'} `}>
    <div className={`text-[12px] ${theme==='dark'?'text-gray-300':'text-[#828385]'} text-[#828385]`}>Paid Amt</div>
    <div className={`text-[16px] ${theme==='dark'?'text-gray-300':'text-[#151618]'}  mt-0 sm:mt-5`}>{`$${samplifyDouble(currentClaim.Claim.Data.PaidAmount)}`}</div>
  </div>

  {/* Patient Responsibility */}
  <div className={` h-full w-full rounded-xl flex flex-row sm:items-start items-center sm:flex-col sm:justify-center justify-between p-3 ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-700'} `}>
    <div className={`text-[12px] ${theme==='dark'?'text-gray-300':'text-[#828385]'} text-[#828385]`}>Patient Resp</div>
    <div className={`text-[16px] ${theme==='dark'?'text-gray-300':'text-[#151618]'}  mt-0 sm:mt-5`}>{`$${samplifyDouble(currentClaim.Claim.Data.PatientResp)}`}</div>
  </div>

  {/* Contractual Adjustment */}
  <div className={` h-full w-full rounded-xl flex flex-row sm:items-start items-center sm:flex-col sm:justify-center justify-between p-3 ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-700'} `}>
    <div className={`text-[12px] ${theme==='dark'?'text-gray-300':'text-[#828385]'} text-[#828385]`}>Contractual Adj</div>
    <div className={`text-[16px] ${theme==='dark'?'text-gray-300':'text-[#151618]'}  mt-0 sm:mt-5`}>
      {`$${samplifyDouble(
        currentClaim.Remit.length === 0
          ? 0
          : currentClaim.Remit[0].ServiceLine
              .map((rr) => Number(rr.ChargedAmount) - Number(rr.AllowedAmount))
              .reduce((partialSum, a) => partialSum + a, 0)
      )}`}
    </div>
  </div>

  {/* Denied Amount */}
  <div className={` h-full w-full rounded-xl flex flex-row sm:items-start items-center sm:flex-col sm:justify-center justify-between p-2 ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-700'} `}>
    <div className={`text-[12px] ${theme==='dark'?'text-gray-300':'text-[#828385]'} text-[#828385]`}>Denied Amt</div>
    <div className={`text-[16px] ${theme==='dark'?'text-gray-300':'text-[#151618]'}  mt-0 sm:mt-5`}>{`$${samplifyDouble(currentClaim.Claim.Data.DeniedAmount)}`}</div>
  </div>
</div>
<div className="text-[12px] h-[90px] font-medium  text-center text-[#005DE2]  flex justify-between items-center overflow-x-auto overflow-y-auto whitespace-nowrap">
  <ul className="flex flex-nowrap -mb-px">
  <li className="me-2">
      <a
        href="#"
        className={`inline-block mt-2 p-2 border-b-2 ${detailShowStatus === 4
          ? "text-[#005DE2] border-b-2 border-[#005DE2] rounded-t-lg active"
          : "text-[#828385] border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
          }`}
        aria-current="page"
        onClick={() => onDetailShowStatusChange(4)}
      >
        Triage/Action
      </a>
    </li>
    <li className="me-2">
      <a
        href="#"
        className={`inline-block p-2 mt-2 border-b-2 ${detailShowStatus === 0
          ? "text-[#005DE2] border-b-2 border-[#005DE2] rounded-t-lg active"
          : "text-[#828385] border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
          }`}
        onClick={() => onDetailShowStatusChange(0)}
      >
        Claim
      </a>
    </li>
    <li className="me-2">
      <a
        href="#"
        className={`inline-block p-2 mt-2 border-b-2 ${detailShowStatus === 1
          ? "text-[#005DE2] border-b-2 border-[#005DE2] rounded-t-lg active"
          : "text-[#828385] border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
          }`}
        aria-current="page"
        onClick={() => onDetailShowStatusChange(1)}
      >
        Remit
      </a>
    </li>
    <li className="me-2">
      <a
        href="#"
        className={`inline-block p-2 mt-2 border-b-2 ${detailShowStatus === 2
          ? "text-[#005DE2] border-b-2 border-[#005DE2] rounded-t-lg active"
          : "text-[#828385] border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
          }`}
        aria-current="page"
        onClick={() => onDetailShowStatusChange(2)}
      >
        Related Encounters
      </a>
    </li>
    {/* <li className="me-2">
      <a
        href="#"
        className={`inline-block p-4 border-b-2 ${detailShowStatus === 3
          ? "text-[#0D364D] border-b-2 border-[#0D364D] rounded-t-lg active"
          : "text-[#828385] border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
          }`}
        aria-current="page"
        onClick={() => onDetailShowStatusChange(3)}
      >
        Documentation
      </a>
    </li> */}

  </ul>
  {/* <div className="flex gap-2">
    <div className="select-none border border-[#F2F7FF] bg-[#F2F7FF] rounded-lg text-[#0D364D] text-[14px] font-semibold px-[16px] py-[10px] cursor-pointer" onClick={expandAll}>Expand All</div>
    <div className="select-none border border-[#CACBCB] bg-white rounded-lg text-[#0D364D] text-[14px] font-semibold px-[16px] py-[10px] cursor-pointer" onClick={collapseAll}>Collapse All</div>
  </div> */}
</div>

        
        {detailShowStatus == 0 && (
  <div className="flex flex-col bg-[#EFF4FE] p-3 gap-3 rounded-xl">
    {/* Visit Section */}
    <DetailSection title={"Visit"} status={status} key={renderIndex} showArrow={true}>
  <div className="overflow-hidden rounded-xl"> {/* Changed overflow-x-auto to overflow-hidden */}
    <table className="min-w-full divide-y divide-gray-200">
      <thead>
        <tr className="bg-gray-50">
          <th className="first:rounded-tl-xl px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Date</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Charges</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auth Code</th>
          <th className="last:rounded-tr-xl px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Place of Service</th>
        </tr>
      </thead>
          <tbody className="bg-white ">
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(currentClaim.Claim.Data.ServiceDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{currentClaim.Claim.Data.Category}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${currentClaim.Claim.Data.Amount}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{currentClaim.Claim.Data.PriorAuthorization ?currentClaim.Claim.Data.PriorAuthorization:"N/A"}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{samplifyString(currentClaim.Claim.Data.PlaceOfService)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DetailSection>

    {/* Payer Section */}
    <DetailSection title={"Payer"} status={status} key={renderIndex + 1} showArrow={true}>
      <div className="overflow-x-auto rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payer Sequence</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PayerID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
            </tr>
          </thead>
          <tbody className="bg-white ">
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{currentClaim.Claim.Data.PayerName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{currentClaim.Claim.Data.PatientID}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {currentClaim.Claim.Data.PayerSeq === 'P' ? 'Primary' : (currentClaim.Claim.Data.PayerSeq === 'S' ? 'Secondary' : '')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{currentClaim.Claim.Data.PayerID}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{currentClaim.Claim.Data.PayerAddress}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DetailSection>

    {/* Provider Section */}
    <DetailSection title={"Provider"} status={status} key={renderIndex + 2} showArrow={true}>
      <div className="overflow-x-auto rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billing Provider NPI</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fed Tax ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billing Taxonomy</th>
            </tr>
          </thead>
          <tbody className="bg-white ">
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{currentClaim.Claim.Data.ProvNPI}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{currentClaim.Claim.Data.ProvTaxID}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{currentClaim.Claim.Data.BillProvName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{currentClaim.Claim.Data.BIllProvAddress}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{samplifyString(currentClaim.Claim.Data.BillTaxonomy)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DetailSection>

    {/* Diagnosis Section */}
    <DetailSection 
      title={"Diagnosis"} 
      subtitle={`(${currentClaim.Claim.Diagnosis.map(row => row.Code).join(", ")})`} 
      styleName={"text-[#828385] text-[14px]"} 
      status={status} 
      key={renderIndex + 3} 
      showArrow={true}
    >
      <div className="overflow-x-auto rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            </tr>
          </thead>
          <tbody className="bg-white ">
            {currentClaim.Claim.Diagnosis.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.Code}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{row.Description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DetailSection>

    {/* Service Lines Section */}
    <DetailSection 
      title={"Service Lines"} 
      subtitle={`${currentClaim.Claim.ServiceLine.length}`} 
      styleName={"px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-sm"} 
      status={status} 
      key={renderIndex + 4} 
      showArrow={true}
    >
      <div className="overflow-x-auto rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Line #", "CPT", "Modifier", "Description", "Service Date", "Charges", "Units", "Rendering Provider NPI", "Rendering Taxonomy"].map(header => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white ">
            {currentClaim.Claim.ServiceLine.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.Code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.Modifier}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <Description description={row.Description} width={80} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(row.ServiceDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${row.Charges}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.Units}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{samplifyString(row.RendProvNPI)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{samplifyString(row.RendTaxonomy)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DetailSection>
  </div>
)}




{detailShowStatus == 1 && (
  <div className="flex flex-col  p-4 gap-4 rounded-xl">
    {currentClaim.Remit.length === 0 ? (
      <div className="rounded-xl bg-white  text-center text-gray-500">
        No data available
      </div>
    ) : (
      currentClaim.Remit.map((row, index) => (
       <>
      <div className="flex flex-row gap-x-5">
      <h1 className="font-bold">{(() => {
  const date = new Date(Date.parse(row.CheckDate));
  const options = { year: 'numeric', month: 'short', day: '2-digit' };
  return date.toLocaleDateString('en-US', options);
})()}</h1>
                  <h1 className="text-blue-600 font-semibold cursor-pointer" onClick={
                    () => {
                      SetRemit_state(!remit_collapse_state)
                    } 
                  }>{!remit_collapse_state?'Hide':'Show'}</h1>
      </div>
    
       <div className="flex flex-col bg-[#EFF4FE] rounded-xl gap-2 p-2">
            {/* Check Information */}
            <DetailSection title="Check Information" showArrow={true} isCollapse={remit_collapse_state}>
              <TableWrapper>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="first:rounded-tl-xl px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check #
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payer ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payer Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Provider Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Provider Address
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        TaxID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        NPI
                      </th>
                      <th scope="col" className="last:rounded-tr-xl px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PLB Adjustment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {formatDate(row.CheckDate)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{row.CheckNumber}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{row.CheckAmount}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{row.PayerID}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{row.PayerName}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{row.ProviderName}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{row.ProviderAddress}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">-</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{row.NPI}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">-</td>
                    </tr>
                  </tbody>
                </table>
              </TableWrapper>
            </DetailSection>

            {/* Claim Information */}
            <DetailSection title="Claim Information" showArrow={true} isCollapse={remit_collapse_state}>
              <TableWrapper>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="first:rounded-tl-xl px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Dates</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processing Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim Frequency</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payer Claim #</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Charges</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allowed</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adjustment Amt</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Resp</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductible</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Co-Insurance</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Co-Pay</th>
                      <th scope="col" className="last:rounded-tr-xl px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Other Insurance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(row.ServiceDate)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.ProcessingStatus}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{currentClaim.Claim.Data.Frequency || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.PayerClaimNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.ClaimID}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${samplifyDouble(row.ChargeAmount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${samplifyDouble(row.ServiceLine.map(rr => Number(rr.AllowedAmount)).reduce((sum, a) => sum + a, 0))}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${samplifyDouble(row.ServiceLine.map(rr => Number(rr.ChargedAmount) - Number(rr.AllowedAmount)).reduce((sum, a) => sum + a, 0))}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${samplifyDouble(row.PaidAmount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${samplifyDouble(row.PatientResp)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                    </tr>
                  </tbody>
                </table>
              </TableWrapper>
            </DetailSection>

            {/* Service Line Detail */}
            <DetailSection title="Service Line Detail" showArrow={true} isCollapse={remit_collapse_state}>
              <TableWrapper>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="first:rounded-tl-xl px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Line #</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Procedure Code</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modifiers</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Charge</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allowed Amt</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adjustment Amt</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductible</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Co-Insurance</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Co-Pay</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group Code</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason Code</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason Description</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remark</th>
                      <th scope="col" className="last:rounded-tr-xl px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
  {row.ServiceLine.map((rowr, index) => 
    rowr.Codes.map((adjustment, ind) => (
      <tr key={`${index}-${ind}`} className="hover:bg-gray-50 transition-all duration-200 ease-in-out">
        {ind === 0 && (
          <>
            <td rowSpan={rowr.Codes.length} className="px-6 py-4">
              <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2.5 py-1 rounded-full">
                {index + 1}
              </span>
            </td>
            <td rowSpan={rowr.Codes.length} className="px-6 py-4">
              <div className="text-sm text-gray-600 font-medium">
                {formatDate(row.ServiceDate)}
              </div>
            </td>
            <td rowSpan={rowr.Codes.length} className="px-6 py-4">
              <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700">
                {rowr.ProcedureCode}
              </span>
            </td>
            <td rowSpan={rowr.Codes.length} className="px-6 py-4">
              <Description description={rowr.Description} width={80} />
            </td>
            <td rowSpan={rowr.Codes.length} className="px-6 py-4">
              <div className="flex flex-wrap gap-1">
                {rowr.Modifiers?.length > 0 ? 
                  [
                    rowr.Modifiers[0].ProcedureModifier1,
                    rowr.Modifiers[0].ProcedureModifier2,
                    rowr.Modifiers[0].ProcedureModifier3,
                    rowr.Modifiers[0].ProcedureModifier4
                  ].filter(Boolean).map((modifier, idx) => (
                    <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                      {modifier}
                    </span>
                  )) : '-'}
              </div>
            </td>
            <td rowSpan={rowr.Codes.length} className="px-6 py-4">
              <div className="text-sm font-medium text-gray-900">
                {samplifyInteger(rowr.UnitsPaid)}
              </div>
            </td>
            <td rowSpan={rowr.Codes.length} className="px-6 py-4">
              <div className="text-sm font-semibold text-green-600">
                ${samplifyDouble(rowr.ChargedAmount)}
              </div>
            </td>
            <td rowSpan={rowr.Codes.length} className="px-6 py-4">
              <div className="text-sm font-semibold text-blue-600">
                ${samplifyDouble(rowr.AllowedAmount)}
              </div>
            </td>
            <td rowSpan={rowr.Codes.length} className="px-6 py-4">
              <div className="text-sm font-semibold text-red-600">
                ${samplifyDouble(rowr.ChargedAmount - rowr.AllowedAmount)}
              </div>
            </td>
            <td rowSpan={rowr.Codes.length} className="px-6 py-4">
              <div className="text-sm text-gray-500">-</div>
            </td>
            <td rowSpan={rowr.Codes.length} className="px-6 py-4">
              <div className="text-sm text-gray-500">-</div>
            </td>
            <td rowSpan={rowr.Codes.length} className="px-6 py-4">
              <div className="text-sm text-gray-500">-</div>
            </td>
            <td rowSpan={rowr.Codes.length} className="px-6 py-4">
              <div className="text-sm font-semibold text-emerald-600">
                ${samplifyDouble(rowr.PaidAmount)}
              </div>
            </td>
          </>
        )}
        <td className="px-6 py-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
            {adjustment.AdjustmentGroup}
          </span>
        </td>
        <td className="px-6 py-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-yellow-50 text-yellow-800">
            {adjustment.AdjustmentReason}
          </span>
        </td>
        <td className="px-6 py-4">
          <Description description={adjustment.Description} width={80} />
        </td>
        {ind === 0 && (
          <td rowSpan={rowr.Codes.length} className="px-6 py-4">
            <div className="flex flex-wrap gap-1">
              {rowr.RemarkCodes ? 
                rowr.RemarkCodes.split(',').map((r, idx) => (
                  <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                    {r.split(':')[1]}
                  </span>
                )) : '-'}
            </div>
          </td>
        )}
        <td className="px-6 py-4">
          <div className="text-sm font-semibold text-gray-900">
            ${samplifyDouble(adjustment.AdjustmentAmount)}
          </div>
        </td>
      </tr>
    ))
  )}
</tbody>
                </table>
              </TableWrapper>
            </DetailSection>

            
</div>
</>      )))}
      </div>
      )}


        

{detailShowStatus == 2 && (
  <div className="flex flex-col bg-[#EFF4FE] p-2 gap-4 rounded-xl">
    <DetailSection 
      title="Related Encounter" 
      status={status} 
      key={renderIndex + 9} 
      showArrow={true}
      className="bg-white rounded-xl shadow-sm"
    >
      <TableWrapper>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="first:rounded-tl-xl px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim No</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payer ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payer Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payer Sequence</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim Frequency</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
              <th scope="col" className="last:rounded-tr-xl px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentClaim.RelatedEncounters.map((row, index) => (
              <tr 
                key={index}
                onClick={() => showDetail(row.ClaimNo)} 
                className="hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{row.ClaimNo}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{formatDate(row.ServiceDate)}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{formatDate(row.TransactionDate)}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{samplifyString(row.TransactionType)}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{samplifyString(row.PayerID)}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{samplifyString(row.PayerName)}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {row.PayerSeq == 'P' ? 'Primary' : (row.PayerSeq == 'S' ? 'Secondary' : '-')}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{row.Frequency}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{samplifyString("")}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{samplifyString("")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>
    </DetailSection>
  </div>
)}



        
        {detailShowStatus == 4 && <>

          <div
  className="flex my-10   sm:flex-row flex-col gap-4 justify-evenly"
  >
  {/* First Row */}
  <div className="flex flex-col w-full sm:w-[49.5%]">
  <h1 className="mb-5 font-semibold ">General Information</h1>
<div
    className={`sm:w-full w-full h-auto  rounded-xl p-2 ${theme === 'dark' ? 'bg-[#191a1d]' : 'bg-[#EFF4FE]'} `}
    style={{ display: 'flex', flexDirection: 'column' }}

  >   <div className='flex sm:flex-row flex-col w-full gap-x-2  justify-evenly'>
  <div className={` p-6 flex flex-col w-full rounded-xl ${theme === 'dark' ? 'bg-[#151619]' :'bg-white'}`}>
    <div>
      <h2 className="text-[14px] text-gray-400">Root Cause</h2>
      <p className="text-[14px] mt-3">
        {appeal[4]}
      </p>
    </div>
  </div>

  <div className={` p-6 sm:mt-0 mt-2 flex flex-col w-full rounded-xl ${theme === 'dark' ? 'bg-[#151619]' :'bg-white'}`}>
    <div>
      <h2 className="text-[14px] text-gray-400">Rationale</h2>
      <p className="text-[14px] mt-3">
        {appeal[2].split('\n').map((i, key) => <div key={key}>{i}</div>)}
      </p>
    </div>
  </div>
 
</div>

<div className='flex flex-row mt-2 w-full gap-x-2 justify-evenly'>
      <div className={`${theme === 'dark' ? 'bg-[#151619]' :'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
        <div>
          <h2 className="text-[14px] text-gray-400">Evidence</h2>
          <p className="text-[14px] mt-3">
            {appeal.length == 0 ? "Loading..." : (<> {currentClaim.Claim.Data.PrimaryCode === '109' ? <> 
              <div className="overflow-x-auto p-2 rounded-lg">
  <Table aria-label="sticky table" stickyHeader size="small" className="min-w-full">
    <TableHead>
      <TableRow className="bg-gray-50">
        <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
          Claim ID
        </TableCell>
        <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
          Service Date
        </TableCell>
        <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
          Primary Payer
        </TableCell>
        <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
          Secondary Payer
        </TableCell>
        <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
          Payment Status
        </TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {chunkArray(appeal[3].split(','), 5).map((chunk, rowIndex) => (
        <tr 
          key={rowIndex}
          className={`
            ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            hover:bg-gray-100 transition-colors
          `}
        >
          {chunk.map((data, index) => (
            <td 
              key={index} 
              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-b"
            >
              {data}
            </td>
          ))}
        </tr>
      ))}
    </TableBody>
  </Table>
</div>
            </> :<Recommendation data={appeal[3]} flag={currentClaim.Claim.Data.Automation} />} </>)}
          </p>
        </div>
      </div>
    </div>

    <div className='flex flex-row mt-2 w-full gap-x-2 justify-evenly'>
      <div className={`${theme === 'dark' ? 'bg-[#151619]' :'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
        <div>
          <h2 className="text-[14px] text-gray-400">Prediction Score</h2>
          <p className="text-[14px] mt-3">98%</p>
        </div>
      </div>
      <div className={`${theme === 'dark' ? 'bg-[#151619]' :'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
        <div>
          <h2 className="text-[14px] text-gray-400">Procedure Code</h2>
          <p className="text-[14px] mt-3">
            {currentClaim.Claim.ServiceLine.map((row, index) => row.Code).join(", ")}
          </p>
        </div>
      </div>
    </div>

    <div className='flex flex-row mt-2 w-full gap-x-2 justify-evenly'>
      <div className={`${theme === 'dark' ? 'bg-[#151619]' :'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
        <div>
          <h2 className="text-[14px] text-gray-400">Diagnosis Code</h2>
          <p className="text-[14px] mt-3">
            {currentClaim.Claim.Diagnosis.map((row, index) => row.Code).join(", ")}
          </p>
        </div>
      </div>
      <div className={`${theme === 'dark' ? 'bg-[#151619]' :'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
        <div>
          <h2 className="text-[14px] text-gray-400">Reason Code</h2>
          <p className="text-[14px] mt-3">
            {`${currentClaim.Claim.Data.PrimaryGroup} ${currentClaim.Claim.Data.PrimaryCode}`}
          </p>
        </div>
      </div>
    </div>

    <div className='flex flex-row mt-2 w-full gap-x-2 justify-evenly'>
      <div className={`${theme === 'dark' ? 'bg-[#151619]' :'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
        <div>
          <h2 className="text-[14px] text-gray-400">Payer ID</h2>
          <p className="text-[14px] mt-3">
            {currentClaim.Claim.Data.PayerID}
          </p>
        </div>
      </div>
      <div className={`${theme === 'dark' ? 'bg-[#151619]' :'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
        <div>
          <h2 className="text-[14px] text-gray-400">Claim State</h2>
          <p className="text-[14px] mt-3">
            {currentClaim.Claim.Data.Category == 'Contractual Adj' ? 'Non-Recoverable' : (
              currentClaim.Claim.Data.Category == '' ? 'Delinquent' : (
                currentClaim.Claim.Data.Category == 'Patient Resp' ? 'Patient Resp' : 'Recoverable'
              )
            )}
          </p>
        </div>
      </div>
    </div>

    <div className='flex flex-row mt-2 w-full gap-x-2 justify-evenly'>
      <div className={`${theme === 'dark' ? 'bg-[#151619]' :'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
        <div>
          <h2 className="text-[14px] text-gray-400">Category</h2>
          <p className="text-[14px] mt-3">
            {currentClaim.Claim.Data.Category}
          </p>
        </div>
      </div>
      <div className={`${theme === 'dark' ? 'bg-[#151619]' :'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
        <div>
          <h2 className="text-[14px] text-gray-400">Remark Code</h2>
          <p className="text-[14px] mt-3">
            {currentClaim.Claim.Data.Remark.join(", ")}
          </p>
        </div>
      </div>
    </div>

 

    



<div className='flex flex-row mt-2 w-full gap-x-2 justify-evenly'>
<div className={`${theme === 'dark' ? 'bg-[#151619]' :'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
        <div>
          <h2 className="text-[14px] text-gray-400">Action Date</h2>
          <p className="text-[14px] mt-3">
            {actionDate || (currentClaim.Action.length > 0 && currentClaim.Action[0].action_date)}
          </p>
        </div>
      </div>
      <div className={`${theme === 'dark' ? 'bg-[#151619]' :'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
        <div>
          <h2 className="text-[14px] text-gray-400">Charges</h2>
          <p className="text-[14px] mt-3">
          ${currentClaim.Claim.Data.Amount}
          </p>
        </div>
      </div>
    </div>


    <div className='flex flex-row mt-2 w-full gap-x-2 justify-evenly'>
<div className={`${theme === 'dark' ? 'bg-[#151619]' :'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
        <div>
          <h2 className="text-[14px] text-gray-400">Original Allowed Amt</h2>
          <p className="text-[14px] mt-3">
          ${samplifyDouble(
                    currentClaim.Action.length === 0
                      ? currentClaim.Remit
                        .flatMap((item) => item.ServiceLine.map((it) => Number(it.AllowedAmount)))
                        .reduce((partialSum, a) => partialSum + a, 0)
                      : currentClaim.Remit
                        .filter((item) => Date.parse(item.CheckDate) < Date.parse(currentClaim.Action[0].action_date))
                        .flatMap((item) => item.ServiceLine.map((it) => Number(it.AllowedAmount)))
                        .reduce((partialSum, a) => partialSum + a, 0)
                  )}
          </p>
        </div>
      </div>
      <div className={`${theme === 'dark' ? 'bg-[#151619]' :'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
        <div>
          <h2 className="text-[14px] text-gray-400">Overturned Allowed Amt</h2>
          <p className="text-[14px] mt-3">
          ${samplifyDouble(
                    currentClaim.Action.length === 0
                      ? 0
                      : currentClaim.Remit
                        .filter((item) => Date.parse(item.CheckDate) >= Date.parse(currentClaim.Action[0].action_date))
                        .flatMap((item) => item.ServiceLine.map((it) => Number(it.AllowedAmount)))
                        .reduce((partialSum, a) => partialSum + a, 0)
                  )}
          </p>
        </div>
      </div>
    </div>
    
  </div>
</div>


{/* row Two */}
 <div
 className="flex flex-col w-full sm:w-[49.5%]"
 >
  <h1 className="mb-5 font-semibold   ">Action</h1>
 <div
    className={`sm:w-full w-full  sm:max-h-[750px] md:max-h-[710px] h-auto rounded-xl p-2 ${theme === 'dark' ? 'bg-[#191a1d]' : 'bg-[#EFF4FE]'}`}
    style={{ display: 'flex', flexDirection: 'column' }}
  >
    <div className={`${theme === 'dark' ? 'bg-[#151619]' :'bg-white'} p-6  w-full rounded-lg`}>
      <h2 className="text-[14px] text-gray-400">Recommendation</h2>
      <p className="text-[14px] mt-3">{appeal[5]}</p>
      <div className="flex flex-row mt-3 justify-evenly gap-x-3"> 
        <div className={`cursor-pointer flex gap-2 rounded-lg text-white w-full p-2 border-[1px] border-[#44BFAB] ${thumb == 1 ? 'bg-[#F5FCFB]' : 'bg-[#F5FCFB] '}`} onClick={() => setThumb(1)}>
          <div className="flex flex-row w-full justify-center gap-x-2 items-center">
            <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.22998 18.3505L11.33 20.7505C11.73 21.1505 12.63 21.3505 13.23 21.3505H17.03C18.23 21.3505 19.53 20.4505 19.83 19.2505L22.23 11.9505C22.73 10.5505 21.83 9.35046 20.33 9.35046H16.33C15.73 9.35046 15.23 8.85046 15.33 8.15046L15.83 4.95046C16.03 4.05046 15.43 3.05046 14.53 2.75046C13.73 2.45046 12.73 2.85046 12.33 3.45046L8.22998 9.55046" stroke="#44BFAB" stroke-width="1.2" stroke-miterlimit="10"/>
              <path d="M3.12988 18.3504V8.55039C3.12988 7.15039 3.72988 6.65039 5.12988 6.65039H6.12988C7.52988 6.65039 8.12988 7.15039 8.12988 8.55039V18.3504C8.12988 19.7504 7.52988 20.2504 6.12988 20.2504H5.12988C3.72988 20.2504 3.12988 19.7504 3.12988 18.3504Z" stroke="#44BFAB" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span className="text-[#44BFAB] text-[14px]">Yes</span>
          </div>
        </div>

        <div className={`cursor-pointer flex gap-2 rounded-lg text-white w-full p-2 border-[1px] border-[#F12622] ${thumb == 1 ? 'bg-[#FEF4F4]' : 'bg-[#FEF4F4] '}`} onClick={() => setThumb(1)}>
          <div className="flex flex-row w-full justify-center gap-x-2 items-center">
            <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.27 5.65039L14.17 3.25039C13.77 2.85039 12.87 2.65039 12.27 2.65039H8.46998C7.26998 2.65039 5.96998 3.55039 5.66998 4.75039L3.26998 12.0504C2.76998 13.4504 3.66998 14.6504 5.16998 14.6504H9.16998C9.76998 14.6504 10.27 15.1504 10.17 15.8504L9.66998 19.0504C9.46998 19.9504 10.07 20.9504 10.97 21.2504C11.77 21.5504 12.77 21.1504 13.17 20.5504L17.27 14.4504" stroke="#F12622" stroke-width="1.2" stroke-miterlimit="10"/>
              <path d="M22.3699 5.65V15.45C22.3699 16.85 21.7699 17.35 20.3699 17.35H19.3699C17.9699 17.35 17.3699 16.85 17.3699 15.45V5.65C17.3699 4.25 17.9699 3.75 19.3699 3.75H20.3699C21.7699 3.75 22.3699 4.25 22.3699 5.65Z" stroke="#F12622" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span className="text-[#F12622] text-[14px]">No</span>
          </div>
        </div>
      </div>
      <div className="w-[70%] text-[12px] mt-2 text-gray-400">
        <h1> Please let us know if this recommendation was useful in addressing the claim. </h1>
      </div>
    </div>

    <div className={`${theme === 'dark' ? 'bg-[#151619]' :'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
      <h2 className="text-[14px] mb-2 text-gray-400">Add Action</h2>
      <div className="relative mt-3">
        <label 
          htmlFor="action-dropdown" 
          className={`${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-700'}  absolute -top-2.5 left-2  px-1 text-[12px] `}
        >
          Action
        </label>
        <select
          id="action-dropdown"
          className={`w-full p-3 border border-gray-300 rounded-lg text-[14px]   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-700'}  `}
          ref={claimStatus}
          defaultValue={currentClaim.Action.length > 0 ? currentClaim.Action[0].claim_status : ''}
        >
          <option value={"none"} disabled selected hidden>
            Select an action
          </option>
          <option value={"resubmit"}>Resubmitted to payer</option>
          <option value={"appeal"}>Appealed to payer</option>
          <option value={"contact"}>Contacted to patient</option>
        </select>
      </div>
    </div>

    <div className={`${theme === 'dark' ? 'bg-[#151619]' :'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
      <div className='flex justify-between items-center'>
        <h2 className="text-[14px] mb-2 text-gray-400">Notes</h2>
        <button className='text-[14px] text-blue-500' onClick={handleOpenNotesHistory}>View Notes</button>
      </div>
      <div className="relative mt-5">
        <div className={`${theme === 'dark' ? 'bg-[#151619]' :'bg-white'} absolute -top-2.5 left-2  px-1 text-[12px] text-gray-400`}>
          Leave Note
        </div>
        <textarea
          className={`w-full p-3 border ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-700'}  border-gray-300 rounded-lg text-[14px]   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          rows="4"
          placeholder="Enter your notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>
      </div>
    </div>
    <div className="flex px-1 py-3 mt-3">
      <div className='flex flex-row justify-between items-center w-full'>
        <button className='bg-[#202123] text-white text-[14px] px-4 py-3 rounded-lg'    onClick={() => setShowAppealModal(true)}>Generate Appeal Letter</button>
        <button className='bg-[#005DE2] text-white text-[14px] px-4 py-3 rounded-lg'    onClick={onSubmitClaim}>Save Changes</button>
      </div>
    </div>
  </div>

 
  <div className="comment flex flex-col w-full h-full gap-4  mt-8">
          <div className="flex flex-row justify-items-start items-start gap-2">
          <h1 className="font-bold ">
            Your Comments
          </h1>
          <button className="text-blue-600"   onClick={() => {
                  setComment(originalComment);
                  setShowComment(!showComment);
                }}>
            {showComment ? "Hide" : "Show"}
          </button>
          </div>
         
          {showComment && (
          <div className={`${theme === 'dark' ? 'bg-[#191a1d]' : 'bg-[#EFF4FE]'} rounded-xl p-2`}>
  <div className={`flex flex-col w-full gap-4  p-6 rounded-xl shadow-sm ${theme === 'dark' ? 'bg-[#151619]' :'bg-white'} `}>
       <h1 className="mb-4 text-gray-400">Comments</h1>
    <div className="space-y-4">
      {/* Additional Info */}
      <div className="relative">
        <label 
          htmlFor="additional-info" 
          className={`absolute -top-2.5 left-2 ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-700'}  px-1 text-[12px] `}
        >
          Additional Info
        </label>
        <input 
          id="additional-info"
          type="text"
          className={`w-full p-3 border border-gray-300 rounded-lg text-[14px] ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-700'}  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          value={comment.Additional}
          onChange={(e) => setComment({ ...comment, Additional: e.target.value })}
        />
      </div>

      {/* CPT Code */}
      <div className="relative">
        <label 
          htmlFor="cpt-code" 
          className={`absolute -top-2.5 left-2 ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-700'}  px-1 text-[12px] `}
        >
          CPT Code Mismatch
        </label>
        <input 
          id="cpt-code"
          type="text"
          className={`w-full p-3 border border-gray-300 rounded-lg text-[14px] ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-700'}  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          value={comment.CPT}
          onChange={(e) => setComment({ ...comment, CPT: e.target.value })}
        />
      </div>

      {/* Description */}
      <div className="relative">
        <label 
          htmlFor="description" 
          className={`absolute -top-2.5 left-2 ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-700'}  px-1 text-[12px] `}
        >
          Description Mismatch
        </label>
        <input 
          id="description"
          type="text"
          className={`w-full p-3 border border-gray-300 rounded-lg text-[14px] ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-700'}  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          value={comment.Description}
          onChange={(e) => setComment({ ...comment, Description: e.target.value })}
        />
      </div>

      {/* Recommendation */}
      <div className="relative">
        <label 
          htmlFor="recommendation" 
          className={`absolute -top-2.5 left-2 ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-700'}  px-1 text-[12px] `}
        >
          Corrected Recommendation
        </label>
        <select
          id="recommendation"
          className={`w-full p-3 border border-gray-300 rounded-lg text-[14px] ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-700'}  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          value={comment.Recommendation}
          onChange={(e) => setComment({ ...comment, Recommendation: e.target.value })}
        >
          <option value="" disabled selected hidden>Select option</option>
          <option value="Appeal">Appeal</option>
          <option value="Resubmit">Resubmit</option>
          <option value="Write-off">Write-off</option>
        </select>
      </div>

      {/* Root Cause */}
      <div className="relative">
        <label 
          htmlFor="root-cause" 
          className={`absolute -top-2.5 left-2 ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-700'}  px-1 text-[12px] `}
        >
          Updated Root Cause
        </label>
        <input 
          id="root-cause"
          type="text"
          className={`w-full p-3 border border-gray-300 rounded-lg text-[14px] ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-700'}  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          value={comment.Root}
          onChange={(e) => setComment({ ...comment, Root: e.target.value })}
        />
      </div>

      {/* Steps */}
      <div className="relative">
        <label 
          htmlFor="steps" 
          className={`absolute -top-2.5 left-2 ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-700'}  px-1 text-[12px] `}
        >
          Steps to Solve
        </label>
        <textarea 
          id="steps"
          className={`w-full min-h-[120px] p-3 border border-gray-300 rounded-lg text-[14px] ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono resize-y`}
          placeholder="# Steps to resolve the issue
1. First step
2. Second step"
          value={comment.Steps}
          onChange={(e) => setComment({ ...comment, Steps: e.target.value })}
        />
      </div>

      {/* Evidence 1 */}
      <div className="relative">
        <label 
          htmlFor="evidence1" 
          className={`absolute -top-2.5 left-2 ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-700'}  px-1 text-[12px] `}
        >
          Evidence #1
        </label>
        <input 
          id="evidence1"
          type="text"
          className={`w-full p-3 border border-gray-300 rounded-lg text-[14px] ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-700'}  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          value={comment.Evidence1}
          onChange={(e) => setComment({ ...comment, Evidence1: e.target.value })}
        />
      </div>

      {/* Evidence 2 */}
      <div className="relative">
        <label 
          htmlFor="evidence2" 
          className={`absolute -top-2.5 left-2 ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-700'}  px-1 text-[12px] `}
        >
          Evidence #2
        </label>
        <input 
          id="evidence2"
          type="text"
          className={`w-full p-3 border border-gray-300 rounded-lg text-[14px] ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-700'}  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          value={comment.Evidence2}
          onChange={(e) => setComment({ ...comment, Evidence2: e.target.value })}
        />
      </div>
    </div>

  
  </div>
    {/* Action Buttons */}
    <div className="flex justify-end mb-3 gap-3 mt-6">
      <button
        className="px-6 py-3 text-sm font-medium text-blue-600 bg-[#DCE8FC] rounded-lg  transition-colors duration-200"
        onClick={() => {setShowComment(false)
          scrollToTop()
        }

        }
      >
        Cancel
      </button>
      <button
        className="px-6 py-3 text-sm font-medium text-white bg-[#005DE2] rounded-lg transition-colors duration-200"
        onClick={() => {
          setOriginalComment(comment);
          updateComment();
        }}
      >
        Save Changes
      </button>
    </div>
          </div>
)}

  </div>

 </div>



  
</div>

    <div className="flex w-full">
  
              <Modal
                open={openNotesHistoryModal}
                onClose={() => setOpenNotesHistoryModal(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >
                <Box className="absolute bg-white border-none w-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-10 font-inter">
                  <div className="flex flex-col gap-4">
                    <table className="border-collapse border-gray-200">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-200 px-4 py-2 text-left text-gray-500 font-semibold">No</th>
                          <th className="border border-gray-200 px-4 py-2 text-left text-gray-500 font-semibold">ClaimNo</th>
                          <th className="border border-gray-200 px-4 py-2 text-left text-gray-500 font-semibold">Date</th>
                          <th className="border border-gray-200 px-4 py-2 text-left text-gray-500 font-semibold">Action</th>
                          <th className="border border-gray-200 px-4 py-2 text-left text-gray-500 font-semibold">Notes</th>
                          <th className="border border-gray-200 px-4 py-2 text-left text-gray-500 font-semibold">User</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentClaim.Action.map((note, index) => (
                          <tr key={index} className="hover:bg-gray-100">
                            <td className="border border-gray-200 px-4 py-2 text-left text-gray-700">{index + 1}</td>
                            <td className="border border-gray-200 px-4 py-2 text-left text-gray-700">{note.ClaimNo}</td>
                            <td className="border border-gray-200 px-4 py-2 text-left text-gray-700">{note.action_date}</td>
                            <td className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                              {note.claim_status === 'resubmit' ? 'Resubmitted to Payer' :
                                note.claim_status === 'appeal' ? 'Appealed to Payer' :
                                  note.claim_status === 'contact' ? 'Contacted to Patient' : ''
                              }
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-left text-gray-700">
                              <Description description={note.notes} width={80} />
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-left text-gray-700">{note.user}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Box>
              </Modal>
            </div>

            {/* Delete from below */}



{/* <div className="rounded-lg flex flex-col">
            <div className="flex w-full">
              <div className="flex w-1/2">
                <div className="w-1/4 bg-[#E4F1FF] rounded-tl-lg py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-t-[#CACBCB] border-t-[1px] border-l-[#CACBCB] border-l-[1px]  font-inter font-medium text-[16px]">Prediction Score</div>
                <div className="w-3/4 py-[16px] pl-[12px] border-[#CACBCB] border-t-[1px] border-b-[1px] bg-white font-inter font-medium text-[14px]">98%</div>
              </div>
              <div className="flex w-1/2">
                <div className="w-1/4 bg-[#E4F1FF] py-[15px] pl-[12px] border-t-[#CACBCB] border-t-[1px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-l-[#C6DCFC] border-l-[1px] font-inter font-medium text-[16px]">Payer ID</div>
                <div className="w-3/4 rounded-tr-lg py-[16px] pl-[12px] border-[#CACBCB] border-t-[1px] border-r-[1px] border-b-[1px] bg-white font-inter font-medium text-[14px] ">{currentClaim.Claim.Data.PayerID}</div>
              </div>
            </div>
            <div className="flex w-full">
              <div className="flex w-1/2">
                <div className="w-1/4 bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-l-[#CACBCB] border-l-[1px] font-inter font-medium text-[16px]">Procedure Code</div>
                <div className="w-3/4 py-[16px] pl-[12px] border-[#CACBCB] border-b-[1px] bg-white font-inter font-medium text-[14px] ">{currentClaim.Claim.ServiceLine.map((row, index) => row.Code).join(", ")}</div>
              </div>
              <div className="flex w-1/2">
                <div className="w-1/4 bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-l-[#C6DCFC] border-l-[1px] font-inter font-medium text-[16px]">Claim State</div>
                <div className="w-3/4 py-[16px] pl-[12px] border-[#CACBCB] border-r-[1px] border-b-[1px] bg-white font-inter font-medium text-[14px] ">{currentClaim.Claim.Data.Category == 'Contractual Adj' ? 'Non-Recoverable' : (
                  currentClaim.Claim.Data.Category == '' ? 'Delinquent' : (
                    currentClaim.Claim.Data.Category == 'Patient Resp' ? 'Patient Resp' : 'Recoverable'
                  )
                )}</div>
              </div>
            </div>
            <div className="flex w-full">
              <div className="flex w-1/2">
                <div className="w-1/4 bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-l-[#CACBCB] border-l-[1px] font-inter font-medium text-[16px]">Diagnosis Code</div>
                <div className="w-3/4 py-[16px] pl-[12px] border-[#CACBCB] border-b-[1px] bg-white font-inter font-medium text-[14px] ">{currentClaim.Claim.Diagnosis.map((row, index) => row.Code).join(", ")}</div>
              </div>
              <div className="flex w-1/2">
                <div className="w-1/4 bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-l-[#C6DCFC] border-l-[1px] font-inter font-medium text-[16px]">Category</div>
                <div className="w-3/4 py-[16px] pl-[12px] border-[#CACBCB] border-r-[1px] border-b-[1px] bg-white font-inter font-medium text-[14px] ">{currentClaim.Claim.Data.Category}</div>
              </div>
            </div>
            <div className="flex w-full">
              <div className="flex w-1/2">
                <div className="w-1/4 bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-l-[#CACBCB] border-l-[1px] font-inter font-medium text-[16px]">Reason Code</div>
                <div className="w-3/4 py-[16px] pl-[12px] border-[#CACBCB] border-b-[1px] bg-white font-inter font-medium text-[14px] ">{`${currentClaim.Claim.Data.PrimaryGroup} ${currentClaim.Claim.Data.PrimaryCode}`}</div>
              </div>
              <div className="flex w-1/2">
                <div className="w-1/4 bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[#CACBCB] border-b-[1px] border-l-[#C6DCFC] border-l-[1px] font-inter font-medium text-[16px]">Remark Code</div>
                <div className="w-3/4 py-[16px] pl-[12px] border-[#CACBCB] border-r-[1px] border-b-[1px] bg-white font-inter font-medium text-[14px] ">{currentClaim.Claim.Data.Remark.join(", ")}</div>
              </div>
            </div>
            <div className="flex w-full">
              <div className="w-[12.5%] bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-l-[#CACBCB] border-l-[1px] font-inter font-medium text-[16px]">Root Cause</div>
              <div className="w-[87.5%] py-[16px] pl-[12px] border-[#CACBCB] border-r-[1px] border-b-[1px] bg-white font-inter font-medium text-[14px]"
              >{appeal.length == 0 ? "Loading..." : appeal[4]}</div>
            </div>
            <div className="flex w-full">
              <div className="w-[12.5%] bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-l-[#CACBCB] border-l-[1px] font-inter font-medium text-[16px]">Rationale</div>
              <div className="w-[87.5%] py-[16px] pl-[12px] border-[#CACBCB] border-r-[1px] border-b-[1px] bg-white font-inter font-medium text-[14px] cursor-pointer"
              >{appeal[2].split('\n').map((i, key) => <div key={key}>{i}</div>)}</div>
            </div>
            <div className="flex w-full">
              <div className="w-[12.5%] bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-l-[#CACBCB] border-l-[1px] font-inter font-medium text-[16px]">Evidence</div>
              <div className="w-[87.5%] py-[16px] pl-[12px] border-[#CACBCB] border-r-[1px] border-b-[1px] bg-white font-inter font-medium text-[14px]"
              >
                {appeal.length == 0 ? "Loading..." : (<> {currentClaim.Claim.Data.PrimaryCode === '109' ? <> 
                  <Table aria-label="sticky table" stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell className="border border-[#CACBCB] ">Claim ID</TableCell>
                          <TableCell className="border border-[#CACBCB] ">Service Date</TableCell>
                          <TableCell className="border border-[#CACBCB] ">Primary Payer</TableCell>
                          <TableCell className="border border-[#CACBCB] ">Secondary Payer</TableCell>
                          <TableCell className="border border-[#CACBCB] ">Payment Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody className="relative">
                        {chunkArray(appeal[3].split(','), 5).map((chunk, rowIndex) => (
                          <tr key={rowIndex}>
                            {chunk.map((data, index) => (
                              <td key={index} className="border border-[#CACBCB] ">{data}</td>
                            ))}
                          </tr>
                        ))}
                      </TableBody>
                    </Table>

              </> :<Recommendation data={appeal[3]} flag={currentClaim.Claim.Data.Automation} />} </>)}</div>
            </div>
            <div className="flex w-full">
              <div className="w-[12.5%] bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-l-[#CACBCB] border-l-[1px] font-inter font-medium text-[16px]">Recommendation</div>
              <div className="w-[87.5%] py-[16px] pl-[12px] border-[#CACBCB] border-r-[1px] border-b-[1px] bg-white font-inter font-medium text-[14px] flex gap-4 items-center"
              >{appeal.length == 0 ? "Loading..." : <div dangerouslySetInnerHTML={{ __html: makeWordBold(appeal[5], "resubmit") }}></div>}
                <div className={`cursor-pointer flex gap-2 rounded-lg text-white p-2 ${thumb == 1 ? 'bg-[#3b6b2f]' : 'bg-[#8aad95]'}`} onClick={() => setThumb(1)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" class="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                  </svg>
                  <span>{currentClaim.up + (thumb > 0 ? 1 : 0)}</span>
                </div>
                <div className={`cursor-pointer flex gap-2 rounded-lg text-white p-2 ${thumb == -1 ? 'bg-[#ef2f2f]' : 'bg-[#ef8484]'}`} onClick={() => setThumb(-1)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" class="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715a12.137 12.137 0 0 1-.068-1.285c0-2.848.992-5.464 2.649-7.521C5.287 4.247 5.886 4 6.504 4h4.016a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23h1.294M7.498 15.25c.618 0 .991.724.725 1.282A7.471 7.471 0 0 0 7.5 19.75 2.25 2.25 0 0 0 9.75 22a.75.75 0 0 0 .75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 0 0 2.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384m-10.253 1.5H9.7m8.075-9.75c.01.05.027.1.05.148.593 1.2.925 2.55.925 3.977 0 1.487-.36 2.89-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398-.306.774-1.086 1.227-1.918 1.227h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 0 0 .303-.54" />
                  </svg>
                  <span>{currentClaim.down + (thumb < 0 ? 1 : 0)}</span>
                </div>
              </div>
            </div>
            <div className="flex w-full">
              <div className="w-[12.5%] bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-l-[#CACBCB] border-l-[1px] font-inter font-medium text-[16px]">Action</div>
              <div className="w-[87.5%] py-[16px] pl-[12px] border-[#CACBCB] border-r-[1px] border-b-[1px] bg-white font-inter font-medium text-[14px] cursor-pointer flex justify-between p-2">
                <div className="flex justify-between gap-2 w-full items-center">
                  <div className="flex gap-2">
                    <select className="text-sm rounded-lg pyl-2 px-3 text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                      ref={claimStatus}
                      defaultValue={currentClaim.Action.length > 0 ? currentClaim.Action[0].claim_status : ''}
                    >
                      <option value={"none"}>Select</option>
                      <option value={"resubmit"}>Resubmitted to Payer</option>
                      <option value={"appeal"}>Appealed to Payer</option>
                      <option value={"contact"}>Contacted to Patient</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
        
            <div className="flex w-full">
              <div className="flex w-1/2">
                <div className="w-1/4 bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[#C6DCFC] border-r-[1px] border-b-[#CACBCB] border-b-[1px] border-l-[#C6DCFC] border-l-[1px]  font-inter font-medium text-[16px]">Action Date</div>
                <div className="w-3/4 py-[16px] pl-[12px] border-[#CACBCB] border-r-[1px] border-b-[1px] bg-white font-inter font-medium text-[14px]">
                  {actionDate || (currentClaim.Action.length > 0 && currentClaim.Action[0].action_date)}
                </div>
              </div>
              <div className="flex w-1/2">
                <div className="w-1/4 bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-l-[#C6DCFC] border-l-[1px] font-inter font-medium text-[16px]">Charges</div>
                <div className="w-3/4 py-[16px] pl-[12px] border-[#CACBCB] border-r-[1px] border-b-[1px] bg-white font-inter font-medium text-[14px] ">${currentClaim.Claim.Data.Amount}</div>
              </div>
            </div>
            <div className="flex w-full">
              <div className="flex w-1/2">
                <div className="w-1/4 bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[#CACBCB] border-b-[1px] border-l-[#CACBCB] border-l-[1px] font-inter font-medium text-[16px]">Original Allowed Amt</div>
                <div className="w-3/4 py-[16px] pl-[12px] border-[#CACBCB] border-b-[1px] bg-white font-inter font-medium text-[14px] ">
                  ${samplifyDouble(
                    currentClaim.Action.length === 0
                      ? currentClaim.Remit
                        .flatMap((item) => item.ServiceLine.map((it) => Number(it.AllowedAmount)))
                        .reduce((partialSum, a) => partialSum + a, 0)
                      : currentClaim.Remit
                        .filter((item) => Date.parse(item.CheckDate) < Date.parse(currentClaim.Action[0].action_date))
                        .flatMap((item) => item.ServiceLine.map((it) => Number(it.AllowedAmount)))
                        .reduce((partialSum, a) => partialSum + a, 0)
                  )}
                </div>
              </div>
              <div className="flex w-1/2">
                <div className="w-1/4 bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[#C6DCFC] border-r-[1px] border-b-[#CACBCB] border-b-[1px] border-l-[#C6DCFC] border-l-[1px]  font-inter font-medium text-[16px]">Overturned Allowed Amt</div>
                <div className="w-3/4 py-[16px] pl-[12px] border-[#CACBCB] border-r-[1px] border-b-[1px] bg-white font-inter font-medium text-[14px]">
                  ${samplifyDouble(
                    currentClaim.Action.length === 0
                      ? 0
                      : currentClaim.Remit
                        .filter((item) => Date.parse(item.CheckDate) >= Date.parse(currentClaim.Action[0].action_date))
                        .flatMap((item) => item.ServiceLine.map((it) => Number(it.AllowedAmount)))
                        .reduce((partialSum, a) => partialSum + a, 0)
                  )}
                </div>
              </div>
            </div>
            <div className="flex w-full h-4 border-[#CACBCB] border-b-[1px] border-l-[1px] border-r-[1px] bg-white">
            </div>
            <div className="flex w-full rounded-b-lg border-[#CACBCB] border-b-[1px] border-l-[1px] border-r-[1px] bg-white justify-between py-[16px] px-[24px] gap-2">
              <div className="font-semibold bg-[#1A3F59] rounded-lg font-inter text-[16px] px-[20px] py-[12px] text-white cursor-pointer select-none"
                onClick={() => setShowAppealModal(true)}
              >Generate Appeal Letter</div>
              <div className="font-semibold bg-[#1A3F59] rounded-lg font-inter text-[16px] px-[20px] py-[12px] text-white cursor-pointer select-none"
                onClick={onSubmitClaim}>Save</div>
            </div>
          </div> */}
      
       
        </>}
      </div >}
      <Modal
        open={showAppealModal}
        onClose={() => setShowAppealModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="absolute bg-white border-none w-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-10 font-inter">
          <div className='flex flex-col gap-4'>
            <div className='text-[32px] font-semibold text-center text-[#072F40]'>
              Appeal Letter
            </div>
            <hr />
            {generatingAppeal && <div className='text-[32px] font-semibold text-center text-[#072F40]'>
              Generating...
            </div>
            }
            {!generatingAppeal && <div className='text-[14px] font-semibold text-[#072F40]'>
              {appealLetter.split('\n').map((row, index) => <p>{row}</p>)}
            </div>}
            <hr />
            <div className='flex gap-4 justify-end pt-3'>
              <div className='rounded-lg text-[16px] font-semibold px-[33px] py-[10px] border border-solid cursor-pointer select-none'
                onClick={() => setShowAppealModal(false)}
              >
                Close
              </div>
            </div>
          </div>
        </Box>
      </Modal>
      {!currentClaim && <div>Loading...</div>}
    </>
  );
};

export default ReboundDetailView;