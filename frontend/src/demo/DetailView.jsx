import { useEffect, useState, useRef } from "react";
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

import Description from "../components/demo-layout/rebound_dash/Description";
import Recommendation from "../components/demo-layout/rebound_dash/Recommendation";
import { samplifyDouble, SERVER_URL } from "../utils/config";
import { useApiEndpoint } from "../ApiEndpointContext";
import { useDispatch, useSelector } from "react-redux";
import { setAppTitle } from "../redux/reducers/app.reducer";
import "../components/demo-layout/rebound_dash/dashboard.css"


const DetailView = () => {
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
  const [remit_collapse_state, SetRemit_state] = useState(true)

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


  const [notes, setNotes] = useState('')

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
    axios.get(`${SERVER_URL}/api/v1/demo/get_claim?id=${claimNo}`).then(res => {
      setCurrentClaim(res.data);
      console.log(res.data)
    })
  }, [claimNo])

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
          <p className=" text-[32px] font-semibold">Claim ID: {currentClaim.LIMS_CLINIC_ID}</p>
        </div>

        <div className={`flex sm:flex-row flex-col rounded-xl p-2 gap-2 items-center font-inter w-full ${theme === 'dark' ? 'bg-[#191a1d]' : 'bg-[#EFF4FE]'} `}>
          <div className={` h-full w-full rounded-xl flex flex-row sm:items-start items-center sm:flex-col sm:justify-center justify-between p-3 ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'} `}>
            <div className="text-[12px] text-[#828385]">Service Date(s)</div>
            <div className={`text-[16px] ${theme === 'dark' ? 'text-gray-300' : 'text-[#151618]'}  mt-0 sm:mt-5`}>
              {(() => {
                const date = new Date(Date.parse(currentClaim.LIMS_DATE_OF_SERVICE));
                const day = String(date.getUTCDate()).padStart(2, '0');
                const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                const year = date.getUTCFullYear();
                return `${month}/${day}/${year}`;
              })()}
            </div>
          </div>
          <div className={` h-full w-full rounded-xl flex flex-row sm:items-start items-center sm:flex-col sm:justify-center justify-between p-3 ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'} `}>
            <div className={`text-[12px] ${theme === 'dark' ? 'text-gray-300' : 'text-[#828385]'} text-[#828385]`}>Charges</div>
            <div className={`text-[16px] ${theme === 'dark' ? 'text-gray-300' : 'text-[#151618]'}  mt-0 sm:mt-5`}>{`$${samplifyDouble(currentClaim.BILLPRICE)}`}</div>
          </div>
          <div className={` h-full w-full rounded-xl flex flex-row sm:items-start items-center sm:flex-col sm:justify-center justify-between p-3 ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'} `}>
            <div className={`text-[12px] ${theme === 'dark' ? 'text-gray-300' : 'text-[#828385]'} text-[#828385]`}>Allowed Amt</div>
            <div className={`text-[16px] ${theme === 'dark' ? 'text-gray-300' : 'text-[#151618]'}  mt-0 sm:mt-5`}>{`$${samplifyDouble(currentClaim.ALLOWEDAMOUNT)}`}</div>
          </div>
          <div className={` h-full w-full rounded-xl flex flex-row sm:items-start items-center sm:flex-col sm:justify-center justify-between p-3 ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'} `}>
            <div className={`text-[12px] ${theme === 'dark' ? 'text-gray-300' : 'text-[#828385]'} text-[#828385]`}>Paid Amt</div>
            <div className={`text-[16px] ${theme === 'dark' ? 'text-gray-300' : 'text-[#151618]'}  mt-0 sm:mt-5`}>{`$${samplifyDouble(currentClaim.TOTALPAID)}`}</div>
          </div>
          <div className={` h-full w-full rounded-xl flex flex-row sm:items-start items-center sm:flex-col sm:justify-center justify-between p-3 ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'} `}>
            <div className={`text-[12px] ${theme === 'dark' ? 'text-gray-300' : 'text-[#828385]'} text-[#828385]`}>Patient Resp</div>
            <div className={`text-[16px] ${theme === 'dark' ? 'text-gray-300' : 'text-[#151618]'}  mt-0 sm:mt-5`}>{`$${samplifyDouble(currentClaim.TOTALPATIENTPAYMENTAMOUNT)}`}</div>
          </div>
          <div className={` h-full w-full rounded-xl flex flex-row sm:items-start items-center sm:flex-col sm:justify-center justify-between p-3 ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'} `}>
            <div className={`text-[12px] ${theme === 'dark' ? 'text-gray-300' : 'text-[#828385]'} text-[#828385]`}>Contractual Adj</div>
            <div className={`text-[16px] ${theme === 'dark' ? 'text-gray-300' : 'text-[#151618]'}  mt-0 sm:mt-5`}>{`$${samplifyDouble(currentClaim.TOTALINSURANCEPAYMENTAMOUNT)}`}</div>
          </div>

          {/* Denied Amount */}
          <div className={` h-full w-full rounded-xl flex flex-row sm:items-start items-center sm:flex-col sm:justify-center justify-between p-2 ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'} `}>
            <div className={`text-[12px] ${theme === 'dark' ? 'text-gray-300' : 'text-[#828385]'} text-[#828385]`}>Denied Amt</div>
            <div className={`text-[16px] ${theme === 'dark' ? 'text-gray-300' : 'text-[#151618]'}  mt-0 sm:mt-5`}>{`$${samplifyDouble(currentClaim.BILLPRICE - currentClaim.ALLOWEDAMOUNT)}`}</div>
          </div>
        </div>
        {/* <div className="text-[12px] h-[90px] font-medium  text-center text-[#005DE2]  flex justify-between items-center overflow-x-auto overflow-y-auto whitespace-nowrap">
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
          </ul>
        </div> */}
        {detailShowStatus == 4 && <>

          <div
            className="flex my-10   sm:flex-row flex-col gap-4 justify-evenly"
          >
            <div className="flex flex-col w-full sm:w-[49.5%]">
              <h1 className="mb-5 font-semibold ">General Information</h1>
              <div
                className={`sm:w-full w-full h-auto  rounded-xl p-2 ${theme === 'dark' ? 'bg-[#191a1d]' : 'bg-[#EFF4FE]'} `}
                style={{ display: 'flex', flexDirection: 'column' }}

              >   <div className='flex sm:flex-row flex-col w-full gap-x-2  justify-evenly'>
                  <div className={` p-6 flex flex-col w-full rounded-xl ${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'}`}>
                    <div>
                      <h2 className="text-[14px] text-gray-400">Root Cause</h2>
                      <p className="text-[14px] mt-3">
                        {currentClaim.root_cause}
                      </p>
                    </div>
                  </div>

                  <div className={` p-6 sm:mt-0 mt-2 flex flex-col w-full rounded-xl ${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'}`}>
                    <div>
                      <h2 className="text-[14px] text-gray-400">Rationale</h2>
                      <p className="text-[14px] mt-3">
                        {currentClaim.rationale}
                      </p>
                    </div>
                  </div>

                </div>

                <div className='flex flex-row mt-2 w-full gap-x-2 justify-evenly'>
                  <div className={`${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
                    <div>
                      <h2 className="text-[14px] text-gray-400">Evidence</h2>
                      <p className="text-[14px] mt-3">
                        {currentClaim.evidence}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='flex flex-row mt-2 w-full gap-x-2 justify-evenly'>
                  <div className={`${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
                    <div>
                      <h2 className="text-[14px] text-gray-400">Prediction Score</h2>
                      <p className="text-[14px] mt-3">98%</p>
                    </div>
                  </div>
                  <div className={`${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
                    <div>
                      <h2 className="text-[14px] text-gray-400">Procedure Code</h2>
                      <p className="text-[14px] mt-3">
                        {currentClaim.ALLPROCCODES.split("; ").map((row, index) => row).join(", ")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='flex flex-row mt-2 w-full gap-x-2 justify-evenly'>
                  <div className={`${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
                    <div>
                      <h2 className="text-[14px] text-gray-400">Diagnosis Code</h2>
                      <p className="text-[14px] mt-3">
                      </p>
                    </div>
                  </div>
                  <div className={`${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
                    <div>
                      <h2 className="text-[14px] text-gray-400">Reason Code</h2>
                      <p className="text-[14px] mt-3">
                      </p>
                    </div>
                  </div>
                </div>

                <div className='flex flex-row mt-2 w-full gap-x-2 justify-evenly'>
                  <div className={`${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
                    <div>
                      <h2 className="text-[14px] text-gray-400">Payer ID</h2>
                      <p className="text-[14px] mt-3">
                        {currentClaim.D_PAYOR_ID}
                      </p>
                    </div>
                  </div>
                  <div className={`${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
                    <div>
                      <h2 className="text-[14px] text-gray-400">Charges</h2>
                      <p className="text-[14px] mt-3">
                        ${currentClaim.BILLPRICE}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <div
              className="flex flex-col w-full sm:w-[49.5%]"
            >
              <h1 className="mb-5 font-semibold   ">Action</h1>
              <div
                className={`sm:w-full w-full  sm:max-h-[750px] md:max-h-[710px] h-auto rounded-xl p-2 ${theme === 'dark' ? 'bg-[#191a1d]' : 'bg-[#EFF4FE]'}`}
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                <div className={`${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} p-6  w-full rounded-lg`}>
                  <h2 className="text-[14px] text-gray-400">Recommendation</h2>
                  <p className="text-[14px] mt-3">{currentClaim.recommendation}</p>
                  <div className="flex flex-row mt-3 justify-evenly gap-x-3">
                    <div className={`cursor-pointer flex gap-2 rounded-lg text-white w-full p-2 border-[1px] border-[#44BFAB] ${thumb == 1 ? 'bg-[#F5FCFB]' : 'bg-[#F5FCFB] '}`} onClick={() => setThumb(1)}>
                      <div className="flex flex-row w-full justify-center gap-x-2 items-center">
                        <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8.22998 18.3505L11.33 20.7505C11.73 21.1505 12.63 21.3505 13.23 21.3505H17.03C18.23 21.3505 19.53 20.4505 19.83 19.2505L22.23 11.9505C22.73 10.5505 21.83 9.35046 20.33 9.35046H16.33C15.73 9.35046 15.23 8.85046 15.33 8.15046L15.83 4.95046C16.03 4.05046 15.43 3.05046 14.53 2.75046C13.73 2.45046 12.73 2.85046 12.33 3.45046L8.22998 9.55046" stroke="#44BFAB" stroke-width="1.2" stroke-miterlimit="10" />
                          <path d="M3.12988 18.3504V8.55039C3.12988 7.15039 3.72988 6.65039 5.12988 6.65039H6.12988C7.52988 6.65039 8.12988 7.15039 8.12988 8.55039V18.3504C8.12988 19.7504 7.52988 20.2504 6.12988 20.2504H5.12988C3.72988 20.2504 3.12988 19.7504 3.12988 18.3504Z" stroke="#44BFAB" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <span className="text-[#44BFAB] text-[14px]">Yes</span>
                      </div>
                    </div>

                    <div className={`cursor-pointer flex gap-2 rounded-lg text-white w-full p-2 border-[1px] border-[#F12622] ${thumb == 1 ? 'bg-[#FEF4F4]' : 'bg-[#FEF4F4] '}`} onClick={() => setThumb(1)}>
                      <div className="flex flex-row w-full justify-center gap-x-2 items-center">
                        <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.27 5.65039L14.17 3.25039C13.77 2.85039 12.87 2.65039 12.27 2.65039H8.46998C7.26998 2.65039 5.96998 3.55039 5.66998 4.75039L3.26998 12.0504C2.76998 13.4504 3.66998 14.6504 5.16998 14.6504H9.16998C9.76998 14.6504 10.27 15.1504 10.17 15.8504L9.66998 19.0504C9.46998 19.9504 10.07 20.9504 10.97 21.2504C11.77 21.5504 12.77 21.1504 13.17 20.5504L17.27 14.4504" stroke="#F12622" stroke-width="1.2" stroke-miterlimit="10" />
                          <path d="M22.3699 5.65V15.45C22.3699 16.85 21.7699 17.35 20.3699 17.35H19.3699C17.9699 17.35 17.3699 16.85 17.3699 15.45V5.65C17.3699 4.25 17.9699 3.75 19.3699 3.75H20.3699C21.7699 3.75 22.3699 4.25 22.3699 5.65Z" stroke="#F12622" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <span className="text-[#F12622] text-[14px]">No</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-[70%] text-[12px] mt-2 text-gray-400">
                    <h1> Please let us know if this recommendation was useful in addressing the claim. </h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>}
      </div >}
      {!currentClaim && <div>Loading...</div>}
    </>
  );
};

export default DetailView;