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
import { useSelector } from "react-redux";
import { IconButton } from "@mui/material";
import "./dashboard.css"


const ReboundDetailView = () => {
  const apiUrl = useApiEndpoint();
  const location = useLocation();
  const [showAppealModal, setShowAppealModal] = useState(false);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const theme = useSelector((state) => state.app.theme);
  const appTitle = useSelector((state) => state.app.title);
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const username = useSelector((state) => state.auth.username);
  const [detailShowStatus, setDetailShowStatus] = useState(0);
  const [routeTitle, setRouteTitle] = useState('');
  const [currentClaim, setCurrentClaim] = useState(null);
  const [appeal, setAppeal] = useState([])
  const [actionDate, setActionDate] = useState(null)
  const [appealLetter, setAppealLetter] = useState('')
  const [status, setStatus] = useState(true)
  const [showComment, setShowComment] = useState(false)
  const [renderIndex, setRenderIndex] = useState(0)
  const [claimNo, setClaimNo] = useState('')
  const [thumb, setThumb] = useState(0);
  const [triageActions, setTriageActions] = useState([]);
  const [triageOtherText, setTriageOtherText] = useState("");
  const [triageNotes, setTriageNotes] = useState("");
  const [triageSaving, setTriageSaving] = useState(false);
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
  // Track expanded 835s per index so multiple remits don't toggle together.
  const [remitExpandSet, setRemitExpandSet] = useState(() => new Set());
  const defaultTriageActions = Array.from({ length: 5 }, () => ({
    label: "Action",
    checked: false,
    allowFreeText: false,
  }));

  let { token } = useParams()
  useEffect(() => {
    if (apiUrl === '') return;
    if (token) {
      token = JSON.parse(atob(token))
      console.log(token)
      if (token.tabIndex !== undefined && token.tabIndex !== null) {
        const legacyMapped =
          token.tabIndex === 0 ? 1 :
            token.tabIndex === 1 ? 2 :
              token.tabIndex === 2 ? 3 :
                token.tabIndex;
        setDetailShowStatus(legacyMapped);
      }
      if (token.claimNo) {
        setClaimNo(token.claimNo);
      }
      if (token.appTitle) {
        setRouteTitle(token.appTitle);
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

  useEffect(() => {
    if (!apiUrl || !currentClaim) return;
    const denialCategory =
      currentClaim?.Claim?.Data?.Category ||
      currentClaim?.Claim?.Data?.CategoryName ||
      currentClaim?.Claim?.Data?.ClaimCategory ||
      "";

    const savedTriage = getSavedTriageEntry(currentClaim);
    const savedTriageValue = parseTriageActionValue(savedTriage?.action);
    setTriageNotes(savedTriage?.notes || "");
    setTriageOtherText(savedTriageValue.otherText || "");

    if (!denialCategory) {
      setTriageActions(applySavedTriageSelection(defaultTriageActions, savedTriageValue));
      return;
    }

    axios
      .get(`${apiUrl}/triage_actions`, {
        params: { denial_category: denialCategory },
      })
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : [];
        if (items.length === 0) {
          setTriageActions(applySavedTriageSelection(defaultTriageActions, savedTriageValue));
          return;
        }
        setTriageActions(
          applySavedTriageSelection(items.map((item) => ({
            label: item.label || item.action || "Action",
            checked: false,
            allowFreeText: Boolean(item.allowFreeText || item.allow_free_text),
          })), savedTriageValue)
        );
      })
      .catch(() => {
        setTriageActions(applySavedTriageSelection(defaultTriageActions, savedTriageValue));
      });
  }, [apiUrl, currentClaim])

  const showDetail = (claimNo) => {
    const token = {
      claimNo
    }
    console.log(location.pathname)
    navigate(`${type === 0 ? '/rebound' : '/pilotcustomer'}/detail/${btoa(JSON.stringify(token))}`);
  }


  const submitDocument = () => {
    axios.post(`${apiUrl}/add_document`, { ...document, ClaimNo: currentClaim.ClaimNo }).then(res => {
      toast.success("Saved successfully!")
    })
  }


  const [notes, setNotes] = useState('')

  const getSavedTriageEntry = (claim) => {
    const actions = claim?.Action || [];
    return actions.find((item) => `${item.claim_status || ""}`.toLowerCase() === "triage") || null;
  };

  const parseTriageActionValue = (value) => {
    if (!value) return { selected: [], otherText: "" };
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return { selected: parsed.filter(Boolean), otherText: "" };
      }
      if (parsed && typeof parsed === "object") {
        return {
          selected: Array.isArray(parsed.selected) ? parsed.selected.filter(Boolean) : [],
          otherText: parsed.otherText ? `${parsed.otherText}` : "",
        };
      }
    } catch (err) {
      // Fall back to comma-delimited list.
    }
    return {
      selected: `${value}`
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      otherText: "",
    };
  };

  const applySavedTriageSelection = (items, saved) => {
    const savedSet = new Set(saved.selected.map((item) => `${item}`.toLowerCase()));
    const savedOther = saved.otherText ? saved.otherText.trim() : "";
    return items.map((item) => {
      const label = `${item.label || ""}`.trim();
      const isOther = item.allowFreeText || label.toLowerCase() === "other";
      const checked = savedSet.has(label.toLowerCase()) || (isOther && savedOther);
      return { ...item, checked };
    });
  };

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

  const onSubmitTriage = () => {
    if (!currentClaim) return;
    const selected = triageActions.filter((item) => item.checked).map((item) => item.label);
    const otherText = triageOtherText.trim();
    if (otherText && !selected.some((label) => `${label}`.toLowerCase() === "other")) {
      selected.push("Other");
    }
    if (selected.length === 0 && triageNotes.trim() === "" && otherText === "") {
      toast.info("Please select an action or add notes before saving.");
      return;
    }
    toast.info("Saving triage actions...");
    setTriageSaving(true);
    const actionPayload = JSON.stringify({ selected, otherText });
    axios
      .post(`${apiUrl}/save_action`, {
        claimno: currentClaim.Claim.Data.ClaimNo,
        action_date: new Date(Date.now()).toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: 'numeric'
        }),
        action: actionPayload,
        claim_status: "triage",
        thumb: null,
        notes: triageNotes,
        username: username
      })
      .then(() => {
        toast.success("Triage actions saved.");
      })
      .catch(() => {
        toast.error("Error occurred while saving triage actions.");
      })
      .finally(() => {
        setTriageSaving(false);
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

  const formatValue = (value, fallback = "N/A") => {
    if (value === undefined || value === null) return fallback;
    if (Array.isArray(value)) {
      const joined = value
        .filter((item) => item !== undefined && item !== null && `${item}`.trim() !== "")
        .join(", ");
      return joined || fallback;
    }
    if (typeof value === "string" && value.trim() === "") return fallback;
    return value;
  };

  const formatDateValue = (value) => {
    if (!value) return "N/A";
    const parsed = new Date(Date.parse(value));
    return Number.isNaN(parsed.getTime()) ? "N/A" : parsed.toLocaleDateString();
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null || value === "") return "N/A";
    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? "N/A" : `$${samplifyDouble(numericValue)}`;
  };

  const getClaimSummary = () => {
    if (!currentClaim?.Claim?.Data) return null;
    const charges = Number(currentClaim.Claim.Data.Amount) || 0;
    const allowed = (currentClaim.Remit?.[0]?.ServiceLine || [])
      .map((rr) => Number(rr.AllowedAmount) || 0)
      .reduce((sum, val) => sum + val, 0);
    const paid = Number(currentClaim.Claim.Data.PaidAmount) || 0;
    const variance = charges - allowed;
    return { count: 1, charges, allowed, paid, variance };
  };

  const renderTruncated = (value, maxWidth = '180px') => {
    const display = value === undefined || value === null ? 'N/A' : `${value}`;
    return (
      <span
        title={display}
        className="block whitespace-nowrap overflow-hidden text-ellipsis"
        style={{ maxWidth }}
      >
        {display}
      </span>
    );
  };

  const extractModifiers = (mod) => {
    if (Array.isArray(mod)) return mod.filter((item) => item).slice(0, 3);
    if (typeof mod === "string") return mod.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 3);
    if (mod && typeof mod === "object") {
      return [mod.Mod1, mod.Mod2, mod.Mod3].filter((item) => item);
    }
    return [];
  };

  const SectionCard = ({ title, children, startCollapsed = true, collapsible = true, showBorder = true }) => {
    const [collapsed, setCollapsed] = useState(startCollapsed);

    const containerClass = `rounded-2xl overflow-hidden ${isDark
      ? `${showBorder ? 'border border-[#1f2433]' : 'border-0'} bg-[#27282D]`
      : `${showBorder ? 'border border-gray-200' : 'border-0'} bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]`
      }`;
    const borderStyle = showBorder ? (isDark ? 'border-[#1f2433]' : 'border-gray-200') : 'border-transparent';
    const headerClasses = `w-full flex items-center justify-between px-4 sm:px-6 py-4 border-b-0 ${borderStyle} ${isDark ? 'hover:bg-[#a8a8a8]' : 'hover:bg-gray-50'} transition`;
    const dividerClass = isDark ? 'bg-[#CDCDCD]' : 'bg-gray-200';
    const titleClasses = `text-sm font-semibold text-left ${isDark ? 'text-[#F4F4F4]' : 'text-gray-800'}`;

    const toggleCollapsed = () => setCollapsed((prev) => !prev);

    if (!collapsible) {
      return (
        <div className={containerClass}>
          <div className={headerClasses}>
            <p className={titleClasses}>{title}</p>
          </div>
          <div className="px-4 sm:px-6 py-4">{children}</div>
        </div>
      );
    }

    return (
      <div className={containerClass}>
        <div
          className={headerClasses}
          role="button"
          tabIndex={0}
          onClick={toggleCollapsed}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleCollapsed();
            }
          }}
        >
          <p className={titleClasses}>{title}</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapsed();
            }}
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            aria-label={collapsed ? 'Expand section' : 'Collapse section'}
          >
            {collapsed ? "-" : "+"}
          </button>
        </div>
        {!collapsed && (
          <>
            <div className="px-4 sm:px-6">
              <div className={`h-px w-full ${dividerClass}`} />
            </div>
            <div className="px-4 sm:px-6 py-4">{children}</div>
          </>
        )}
      </div>
    );
  };

  const InfoGrid = ({ fields }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-6 gap-x-16">
      {fields.map((field, index) => (
        <div
          key={`${field.label}-${index}`}
          className={`flex items-start gap-2 text-sm leading-6 min-w-[260px] ${
            field.colSpan === 2 ? 'md:col-span-2 xl:col-span-2' : ''
          }`}
        >
          <span className={`font-semibold whitespace-nowrap ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
            {field.label}:
          </span>
          <span className={`break-words ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {field.value}
          </span>
        </div>
      ))}
    </div>
  );

  const onDetailShowStatusChange = (value) => {
    setDetailShowStatus(value);
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
    setDetailShowStatus(0);
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
      {(() => {
        const summary = getClaimSummary();
        if (!summary) return null;
        return (
          <div className={`rounded-2xl border m-4 p-4 ${isDark ? 'bg-[#2f3036] border-[#3b3c43] text-white' : 'bg-white border-gray-200 text-[#0f172a]'}`}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: 'Count', value: summary.count },
                { label: 'Charges', value: formatCurrency(summary.charges) },
                { label: 'Exp Reimbursement', value: formatCurrency(summary.paid) },
                { label: 'Allowed', value: formatCurrency(summary.allowed) },
                { label: 'Payment Variance', value: formatCurrency(summary.variance) },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-xl px-4 py-3 text-sm ${isDark ? 'bg-[#3a3b42] text-white shadow-[0_4px_10px_rgba(0,0,0,0.35)]' : 'bg-slate-50 text-slate-900 border border-gray-200'}`}
                >
                  <p className={`text-xs uppercase tracking-wide ${isDark ? 'text-white/70' : 'text-slate-500'}`}>{item.label}</p>
                  <p className="mt-1 text-lg font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
      {currentClaim && (
        <div
          className={`flex flex-col gap-4 p-4 rounded-lg border m-4 ${isDark
            ? 'bg-[#26272c]/20 border-white/5 shadow-[0_4px_4px_rgba(0,0,0,0.25)]'
            : 'bg-white border-gray-200 shadow-[0_8px_18px_rgba(0,0,0,0.08)]'
            }`}
        >

          {/* <div>
          <p className=" text-[32px] font-semibold text-gray-100">Claim ID: {currentClaim.Claim.Data.ClaimNo}</p>
        </div> */}

          {/* <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 p-3 rounded-2xl border ${isDark ? 'bg-[#0b0f16] border-[#1f2433] shadow-[0_12px_30px_rgba(0,0,0,0.35)]' : 'bg-white border-gray-200 shadow-[0_10px_28px_rgba(0,0,0,0.08)]'}`}>
          <div className={`h-full w-full rounded-xl border px-3 py-3 flex flex-col gap-1 justify-between ${isDark ? 'border-[#1f2433] bg-[#121722]' : 'border-gray-200 bg-white shadow-sm'}`}>
            <div className={`text-[12px] uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Service Date(s)</div>
            <div className={`text-[16px] font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              {formatDateValue(currentClaim.Claim.Data.ServiceDate)}
            </div>
          </div>

          <div className={`h-full w-full rounded-xl border px-3 py-3 flex flex-col gap-1 justify-between ${isDark ? 'border-[#1f2433] bg-[#121722]' : 'border-gray-200 bg-white shadow-sm'}`}>
            <div className={`text-[12px] uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Charges</div>
            <div className={`text-[16px] font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{formatCurrency(currentClaim.Claim.Data.Amount)}</div>
          </div>

          <div className={`h-full w-full rounded-xl border px-3 py-3 flex flex-col gap-1 justify-between ${isDark ? 'border-[#1f2433] bg-[#121722]' : 'border-gray-200 bg-white shadow-sm'}`}>
            <div className={`text-[12px] uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Allowed Amt</div>
            <div className={`text-[16px] font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              {formatCurrency(
                currentClaim.Remit.length === 0
                  ? currentClaim.Claim.Data.Amount
                  : currentClaim.Remit[0].ServiceLine.map((rr) => Number(rr.AllowedAmount)).reduce((partialSum, a) => partialSum + a, 0)
              )}
            </div>
          </div>

          <div className={`h-full w-full rounded-xl border px-3 py-3 flex flex-col gap-1 justify-between ${isDark ? 'border-[#1f2433] bg-[#121722]' : 'border-gray-200 bg-white shadow-sm'}`}>
            <div className={`text-[12px] uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Paid Amt</div>
            <div className={`text-[16px] font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{formatCurrency(currentClaim.Claim.Data.PaidAmount)}</div>
          </div>

          <div className={`h-full w-full rounded-xl border px-3 py-3 flex flex-col gap-1 justify-between ${isDark ? 'border-[#1f2433] bg-[#121722]' : 'border-gray-200 bg-white shadow-sm'}`}>
            <div className={`text-[12px] uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Patient Resp</div>
            <div className={`text-[16px] font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{formatCurrency(currentClaim.Claim.Data.PatientResp)}</div>
          </div>

          <div className={`h-full w-full rounded-xl border px-3 py-3 flex flex-col gap-1 justify-between ${isDark ? 'border-[#1f2433] bg-[#121722]' : 'border-gray-200 bg-white shadow-sm'}`}>
            <div className={`text-[12px] uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Contractual Adj</div>
            <div className={`text-[16px] font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              {formatCurrency(
                currentClaim.Remit.length === 0
                  ? 0
                  : currentClaim.Remit[0].ServiceLine.map((rr) => Number(rr.ChargedAmount) - Number(rr.AllowedAmount)).reduce(
                    (partialSum, a) => partialSum + a,
                    0
                  )
              )}
            </div>
          </div>

          <div className={`h-full w-full rounded-xl border px-3 py-3 flex flex-col gap-1 justify-between ${isDark ? 'border-[#1f2433] bg-[#121722]' : 'border-gray-200 bg-white shadow-sm'}`}>
            <div className={`text-[12px] uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Denied Amt</div>
            <div className={`text-[16px] font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{formatCurrency(currentClaim.Claim.Data.DeniedAmount)}</div>
          </div>
        </div> */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className={`text-[12px] font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {routeTitle || appTitle || 'Payment Variance > Underpaid > Priority 01 > Claim (837)'}
            </p>
            {/* <button className={`flex items-center gap-2 px-3 py-2 text-[12px] font-semibold rounded-lg transition ${isDark ? 'text-gray-200 bg-[#1a1f2b] border border-[#2a3142] hover:border-[#3c4661]' : 'text-gray-700 bg-white border border-gray-200 hover:border-gray-300 shadow-sm'}`}>
              Actions
              <span className="text-gray-400 text-xs">▼</span>
            </button> */}
          </div>
          <div className={`flex flex-col gap-3 rounded-2xl ${isDark ? 'bg-[#1f2025] shadow-[0_12px_30px_rgba(0,0,0,0.35)]' : 'bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]'}`}>

            <div
              className={`flex items-center rounded-2xl ${isDark
                ? 'bg-[#26272C]/20 shadow-[0_4px_4px_rgba(0,0,0,0.25)]'
                : 'bg-white border-gray-200 shadow-[0_10px_30px_rgba(0,0,0,0.08)]'
                }`}
            >
              {[
                { id: 0, label: "Insights" },
                { id: 1, label: "Claim (837)" },
                { id: 2, label: "Payments (835)" },
                { id: 3, label: "Related Encounters" },
                { id: 4, label: "Triage" },
              ].map((tab) => {
                const active = detailShowStatus === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onDetailShowStatusChange(tab.id)}
                    className={`flex-1 text-center px-4 py-2 text-sm font-semibold rounded-xl transition ${active
                      ? isDark
                        ? 'bg-[#ffffff]/10 text-white border border-[#3c4661]'
                        : 'bg-slate-900 text-white border border-slate-800'
                      : isDark
                        ? 'text-gray-400 border border-transparent hover:border-[#2e364a] hover:bg-[#141824]'
                        : 'text-gray-600 border border-transparent hover:bg-gray-100'
                      }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {detailShowStatus == 0 && (
            <div className={`rounded-2xl border p-6 ${isDark ? 'bg-[#27282D] border-[#1f2433] text-gray-100 shadow-[0_16px_40px_rgba(0,0,0,0.35)]' : 'bg-white border-gray-200 text-gray-900 shadow-[0_14px_36px_rgba(0,0,0,0.08)]'}`}>
              <p className="text-lg font-semibold">Insights</p>
              <div className={`mt-3 h-px w-full ${isDark ? 'bg-white/20' : 'bg-gray-200'}`} />
              <p className={`mt-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                This was <span className="text-[#FF5C5C] font-semibold">DENIED</span> for:
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {((currentClaim?.Remit?.[0]?.ServiceLine || [])
                  .flatMap((line) => (line.Codes || []).map((code) => {
                    const groupCode = `${code.AdjustmentGroup || ''}`.trim();
                    const reasonCode = `${code.AdjustmentReason || ''}`.trim();
                    const description = `${code.Description || ''}`.trim();
                    if (!groupCode && !reasonCode && !description) return '';
                    if (groupCode === 'CO' && reasonCode === '45') return '';
                    const prefix = groupCode ? `${groupCode} ${reasonCode}`.trim() : reasonCode;
                    return description ? `${prefix} - ${description}`.trim() : prefix;
                  }))
                  .filter(Boolean)
                  .slice(0, 6)).map((reason, idx) => (
                    <li key={`insight-${idx}`} className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                      • {reason}
                    </li>
                  ))}
                {((currentClaim?.Remit?.[0]?.ServiceLine || [])
                  .flatMap((line) => (line.Codes || []).map((code) => {
                    const groupCode = `${code.AdjustmentGroup || ''}`.trim();
                    const reasonCode = `${code.AdjustmentReason || ''}`.trim();
                    const description = `${code.Description || ''}`.trim();
                    if (!groupCode && !reasonCode && !description) return '';
                    if (groupCode === 'CO' && reasonCode === '45') return '';
                    const prefix = groupCode ? `${groupCode} ${reasonCode}`.trim() : reasonCode;
                    return description ? `${prefix} - ${description}`.trim() : prefix;
                  }))
                  .filter(Boolean)
                  .length === 0) && (
                    <li className={isDark ? 'text-gray-400' : 'text-gray-500'}>• No adjustment details available.</li>
                  )}
              </ul>
            </div>
          )}

          {detailShowStatus == 1 && (
            <>
              <SectionCard title="Claim Details" showBorder={false}>
                <InfoGrid
                  fields={[
                    { label: "Claim No", value: formatValue(currentClaim?.Claim?.Data?.ClaimNo) },
                    { label: "Patient Name", value: formatValue(currentClaim?.Claim?.Data?.PatientName || currentClaim?.Claim?.Data?.Patient) },
                    { label: "Patient DOB", value: formatDateValue(currentClaim?.Claim?.Data?.PatientDOB) },
                    { label: "Facility", value: formatValue(currentClaim?.Claim?.Data?.Facility || currentClaim?.Claim?.Data?.BillProvName) },
                    { label: "Facility Taxonomy", value: formatValue(currentClaim?.Claim?.Data?.BillTaxonomy || currentClaim?.Claim?.Data?.FacilityTaxonomy || currentClaim?.Claim?.Data?.RendTaxonomy) },
                    { label: "Payer", value: formatValue(currentClaim?.Claim?.Data?.PayerName) },
                    { label: "Patient ID", value: formatValue(currentClaim?.Claim?.Data?.PatientID) },
                    { label: "Service Type", value: formatValue(currentClaim?.Claim?.Data?.ServiceType) },
                    { label: "Type of Bill", value: formatValue(currentClaim?.Claim?.Data?.TypeOfBill) },
                    { label: "Place of Service", value: formatValue(currentClaim?.Claim?.Data?.PlaceOfService ? samplifyString(currentClaim.Claim.Data.PlaceOfService) : "") },
                    { label: "Principle DX", value: formatValue((currentClaim?.Claim?.Diagnosis || [])[0]?.Code) },
                    { label: "Prior Authorization", value: formatValue(currentClaim?.Claim?.Data?.PriorAuthorization) },
                  ]}
                />
              </SectionCard>

              <SectionCard title="Patient/Subscriber" showBorder={false}>
                <InfoGrid
                  fields={[
                    { label: "Patient Name", value: formatValue(currentClaim?.Claim?.Data?.PatientName || currentClaim?.Claim?.Data?.Patient) },
                    { label: "Patient DOB", value: formatDateValue(currentClaim?.Claim?.Data?.PatientDOB) },
                    { label: "Address", value: formatValue(currentClaim?.Claim?.Data?.PatientAddress || currentClaim?.Claim?.Data?.Address) },
                    { label: "Patient Control #", value: formatValue(currentClaim?.Claim?.Data?.PatientControl || currentClaim?.Claim?.Data?.ControlNumber) },
                    { label: "Gender", value: formatValue(currentClaim?.Claim?.Data?.Gender) },
                    { label: "Subscriber Name", value: formatValue(currentClaim?.Claim?.Data?.SubscriberName) },
                    { label: "Subscriber Relationship", value: formatValue(currentClaim?.Claim?.Data?.SubscriberRelationship) },
                    { label: "Subscriber ID", value: formatValue(currentClaim?.Claim?.Data?.SubscriberID || currentClaim?.Claim?.Data?.Subscriber) },
                    { label: "Subscriber Sex", value: formatValue(currentClaim?.Claim?.Data?.SubscriberSex || currentClaim?.Claim?.Data?.Gender) },
                  ]}
                />
              </SectionCard>

              <SectionCard title="Payer" showBorder={false}>
                <InfoGrid
                  fields={[
                    { label: "Payer", value: formatValue(currentClaim?.Claim?.Data?.PayerName) },
                    { label: "Payer ID", value: formatValue(currentClaim?.Claim?.Data?.PayerID) },
                    { label: "Address", value: formatValue(currentClaim?.Claim?.Data?.PayerAddress) },
                    {
                      label: "Payer Sequence",
                      value: formatValue(
                        currentClaim?.Claim?.Data?.PayerSeq === "P"
                          ? "Primary"
                          : currentClaim?.Claim?.Data?.PayerSeq === "S"
                            ? "Secondary"
                            : currentClaim?.Claim?.Data?.PayerSeq
                      ),
                    },
                    { label: "Policy #", value: formatValue(currentClaim?.Claim?.Data?.Policy || currentClaim?.Claim?.Data?.PolicyNo) },
                    { label: "Subscriber Name", value: formatValue(currentClaim?.Claim?.Data?.SubscriberName) },
                    { label: "Subscriber Relationship", value: formatValue(currentClaim?.Claim?.Data?.SubscriberRelationship) },
                  ]}
                />
              </SectionCard>

              <SectionCard title="Provider" showBorder={false}>
                <InfoGrid
                  fields={[
                    { label: "Facility", value: formatValue(currentClaim?.Claim?.Data?.Facility || currentClaim?.Claim?.Data?.BillProvName) },
                    { label: "Facility Address", value: formatValue(currentClaim?.Claim?.Data?.BillProvAddress || currentClaim?.Claim?.Data?.BIllProvAddress), colSpan: 2 },
                    { label: "Billing Provider NPI", value: formatValue(currentClaim?.Claim?.Data?.ProvNPI) },
                    { label: "Receiving Provider Tax ID", value: formatValue(currentClaim?.Claim?.Data?.ProvTaxID) },
                    { label: "Referring Provider", value: formatValue(currentClaim?.Claim?.Data?.ReferringProvider) },
                    { label: "Taxonomy Code", value: formatValue(currentClaim?.Claim?.Data?.ReferringProviderTaxonomy || currentClaim?.Claim?.Data?.RendTaxonomy || currentClaim?.Claim?.Data?.BillTaxonomy) },
                    { label: "Referring Provider NPI", value: formatValue(currentClaim?.Claim?.Data?.ReferringProviderNPI) },
                    { label: "Referring Provider Tax ID", value: formatValue(currentClaim?.Claim?.Data?.ReferringProviderTaxID) },
                  ]}
                />
              </SectionCard>

              <SectionCard title="Diagnosis" showBorder={false}>
                <div className={`overflow-hidden rounded-2xl border ${isDark ? 'border-[#3f4558] bg-[#1b1f29]' : 'border-gray-200 bg-white'}`}>
                  <table className="w-full text-sm border-separate border-spacing-0">
                    <thead>
                      <tr className={isDark ? 'bg-[#2d3038] text-gray-100' : 'bg-gray-100 text-gray-700'}>
                        {['Diagnosis', 'Description'].map((col, idx, arr) => (
                          <th
                            key={col}
                            className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b ${isDark ? 'border-[#3f4558]' : 'border-gray-200'} ${idx !== arr.length - 1 ? (isDark ? 'border-r border-[#3f4558]' : 'border-r border-gray-200') : ''} ${idx === 0 ? 'rounded-tl-2xl' : ''} ${idx === arr.length - 1 ? 'rounded-tr-2xl' : ''}`}
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(currentClaim?.Claim?.Diagnosis || []).map((row, index, arr) => (
                        <tr key={`${row.Code || index}-${index}`} className={isDark ? (index % 2 === 0 ? 'bg-[#262a33]' : 'bg-[#2c303a]') : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
                          {[formatValue(row.Code), formatValue(row.Description)].map((val, idx) => (
                            <td
                              key={`${index}-${idx}`}
                              className={`px-4 py-3 text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'} ${isDark ? 'border-[#3f4558]' : 'border-gray-200'} border-b ${idx !== 1 ? 'border-r' : ''} ${index === arr.length - 1 ? (idx === 0 ? 'rounded-bl-2xl' : idx === 1 ? 'rounded-br-2xl' : '') : ''}`}
                            >
                              {renderTruncated(val, idx === 0 ? '140px' : '320px')}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {(currentClaim?.Claim?.Diagnosis || []).length === 0 && (
                        <tr>
                          <td colSpan={2} className={`px-4 py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No diagnosis data.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              <SectionCard title="Service Lines" showBorder={false}>
                <div className={`overflow-hidden rounded-2xl border ${isDark ? 'border-[#3f4558] bg-[#1b1f29]' : 'border-gray-200 bg-white'}`}>
                  <table className="w-full text-sm border-separate border-spacing-0">
                    <thead>
                      <tr className={isDark ? 'bg-[#2d3038] text-gray-100' : 'bg-gray-100 text-gray-700'}>
                        {[
                          'Service Line #',
                          'Service Date',
                          'Proc Code - Units',
                          'Charge $',
                          'Allowed $',
                          'Contractual $',
                          'Deductible $',
                        ].map((col, idx, arr) => (
                          <th
                            key={col}
                            className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b ${isDark ? 'border-[#3f4558]' : 'border-gray-200'} ${idx !== arr.length - 1 ? (isDark ? 'border-r border-[#3f4558]' : 'border-r border-gray-200') : ''} ${idx === 0 ? 'rounded-tl-2xl' : ''} ${idx === arr.length - 1 ? 'rounded-tr-2xl' : ''}`}
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(currentClaim?.Claim?.ServiceLine || []).map((line, lineIndex, arr) => {
                        const modifiers = extractModifiers(line.Modifier || line.Modifiers || line.ModifierCodes || line.Mods || line);
                        const cells = [
                          lineIndex + 1,
                          formatDateValue(line.ServiceDate || line.ServiceDateFrom || line.ServiceDateTo),
                          [formatValue(line.ProcedureCode || line.Code), formatValue(line.UnitsPaid || line.Units || line.Quantity), modifiers.filter(Boolean).join(', ')].filter((v) => v && v !== 'N/A').join(' '),
                          formatCurrency(line.ChargedAmount || line.ChargeAmount || line.Amount),
                          formatCurrency(line.AllowedAmount),
                          formatCurrency((line.ChargedAmount || 0) - (line.AllowedAmount || 0)),
                          formatCurrency(line.Deductible),
                        ];
                        return (
                          <tr key={`${line.Code || lineIndex}-${lineIndex}`} className={isDark ? (lineIndex % 2 === 0 ? 'bg-[#262a33]' : 'bg-[#2c303a]') : (lineIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
                            {cells.map((val, idx) => (
                              <td
                                key={`${lineIndex}-${idx}`}
                                className={`px-4 py-3 text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'} ${isDark ? 'border-[#3f4558]' : 'border-gray-200'} border-b ${idx !== cells.length - 1 ? 'border-r' : ''} ${lineIndex === arr.length - 1 ? (idx === 0 ? 'rounded-bl-2xl' : idx === cells.length - 1 ? 'rounded-br-2xl' : '') : ''}`}
                              >
                                {renderTruncated(val, ['72px', '120px', '220px', '120px', '120px', '120px', '120px'][idx] || '180px')}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                      {(currentClaim?.Claim?.ServiceLine || []).length === 0 && (
                        <tr>
                          <td colSpan={7} className={`px-4 py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No service line detail.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </>

          )}

          {detailShowStatus == 2 && (
            // <div className={`flex flex-col p-4 gap-4 rounded-2xl border ${isDark ? 'bg-[#0f131b] border-[#1f2433] text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
            <>
              {currentClaim.Remit.length === 0 ? (
                <div className={`rounded-xl text-center ${isDark ? 'bg-[#27282D] text-gray-400 border border-[#1f2433]' : 'bg-white text-gray-500 border-gray-200'}`}>
                  No data available
                </div>
              ) : (
                currentClaim.Remit.map((row, index) => {
                  const date = new Date(Date.parse(row.CheckDate));
                  const options = { year: 'numeric', month: 'short', day: '2-digit' };
                  const dateLabel = date.toLocaleDateString('en-US', options);
                  const isExpanded = remitExpandSet.has(index);

                  return (
                    <div key={`remit-${row.ClaimID || row.CheckNumber || row.CheckDate || index}-${index}`} className="flex flex-col gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setRemitExpandSet((prev) => {
                            const next = new Set(prev);
                            if (next.has(index)) {
                              next.delete(index);
                            } else {
                              next.add(index);
                            }
                            return next;
                          });
                        }}
                        className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-6 text-left transition w-full ${isDark
                          ? 'bg-[#27282d] hover:bg-[#a8a8a8]'
                          : 'bg-white hover:bg-gray-50'
                          }`}
                      >
                        <span className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{dateLabel}</span>
                        <span className={`flex items-center gap-2 text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-600'}`}>
                          {isExpanded ? 'Hide' : 'Show'}
                          <span
                            className={`inline-block transform transition-transform ${isExpanded ? 'rotate-0' : 'rotate-180'
                              } ${isDark ? 'text-gray-300' : 'text-gray-500'}`}
                          >
                            ▼
                          </span>
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="flex flex-col gap-3 pl-4 sm:pl-6">
                          <SectionCard title="Check Details" showBorder={false}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-6 text-sm">
                              {[
                                { label: "Payer Claim #/Medicare INC", value: formatValue(row.PayerClaimNumber) },
                                { label: "Charges", value: formatCurrency(row.ChargeAmount) },
                                {
                                  label: "Allowed Amount",
                                  value: formatCurrency(
                                    row.ServiceLine.map((rr) => Number(rr.AllowedAmount)).reduce((sum, a) => sum + a, 0)
                                  ),
                                },
                                { label: "Paid Amount", value: formatCurrency(row.PaidAmount) },
                                { label: "Patient Responsibility", value: formatCurrency(row.PatientResp) },
                                {
                                  label: "Contractual",
                                  value: formatCurrency(
                                    row.ServiceLine.map((rr) => Number(rr.ChargedAmount) - Number(rr.AllowedAmount)).reduce((sum, a) => sum + a, 0)
                                  ),
                                },
                                { label: "Check Date", value: formatDate(row.CheckDate) },
                                { label: "Payer Name", value: formatValue(row.PayerName) },
                                { label: "Payer ID", value: formatValue(row.PayerID) },
                              ].map((field) => (
                                <div key={field.label} className="flex items-baseline gap-2">
                                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {field.label}:
                                  </span>
                                  <span className={`${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{field.value}</span>
                                </div>
                              ))}
                            </div>
                          </SectionCard>

                          <SectionCard title="Claim Information" showBorder={false}>
                              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-6 text-sm">
                                {[
                                  { label: "Claim No", value: formatValue(row.ClaimID || row.PayerClaimNumber || currentClaim?.Claim?.Data?.ClaimNo) },
                                  { label: "Facility", value: formatValue(currentClaim?.Claim?.Data?.BillProvName || currentClaim?.Claim?.Data?.ProviderName) },
                                  { label: "Tax ID", value: formatValue(currentClaim?.Claim?.Data?.ProvTaxID) },
                                { label: "NPI", value: formatValue(currentClaim?.Claim?.Data?.ProvNPI || row.NPI) },
                                { label: "Date of Service", value: formatDateValue(currentClaim?.Claim?.Data?.ServiceDate) },
                                { label: "Patient Control #", value: formatValue(currentClaim?.Claim?.Data?.PatientControl || currentClaim?.Claim?.Data?.ControlNumber) },
                              ].map((field) => (
                                <div key={field.label} className="flex items-baseline gap-2">
                                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {field.label}:
                                  </span>
                                  <span className={`${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{field.value}</span>
                                </div>
                              ))}
                            </div>
                          </SectionCard>

                          <SectionCard title="Patient/Subscriber" showBorder={false}>
                            <div className="px-1 pb-1">
                              <InfoGrid
                                fields={[
                                  { label: "Patient Name", value: formatValue(currentClaim?.Claim?.Data?.PatientName || currentClaim?.Claim?.Data?.Patient) },
                                  { label: "Patient DOB", value: formatDateValue(currentClaim?.Claim?.Data?.PatientDOB) },
                                  { label: "Address", value: formatValue(currentClaim?.Claim?.Data?.PatientAddress || currentClaim?.Claim?.Data?.Address) },
                                  { label: "Patient Control #", value: formatValue(currentClaim?.Claim?.Data?.PatientControl || currentClaim?.Claim?.Data?.ControlNumber) },
                                  { label: "Gender", value: formatValue(currentClaim?.Claim?.Data?.Gender) },
                                  { label: "Subscriber Name", value: formatValue(currentClaim?.Claim?.Data?.SubscriberName) },
                                  { label: "Subscriber Relationship", value: formatValue(currentClaim?.Claim?.Data?.SubscriberRelationship) },
                                  { label: "Subscriber ID", value: formatValue(currentClaim?.Claim?.Data?.SubscriberID || currentClaim?.Claim?.Data?.Subscriber) },
                                ]}
                              />
                            </div>
                          </SectionCard>

                          <SectionCard title="Service Line Detail" showBorder={false}>
                            <div className={`overflow-hidden rounded-2xl border ${isDark ? 'border-[#3f4558] bg-[#1b1f29]' : 'border-gray-200 bg-white'}`}>
                              <table className="w-full text-sm border-separate border-spacing-0">
                                <thead>
                                  <tr className={isDark ? 'bg-[#2d3038] text-gray-100' : 'bg-gray-100 text-gray-700'}>
                                    {[
                                      'Service Line #',
                                      'Service Date',
                                      'Proc Code - Units',
                                      'Charge $',
                                      'Allowed $',
                                      'Contractual $',
                                      'Deductible $',
                                    ].map((col, idx, arr) => (
                                      <th
                                        key={col}
                                        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b ${isDark ? 'border-[#3f4558]' : 'border-gray-200'} ${idx !== arr.length - 1 ? (isDark ? 'border-r border-[#3f4558]' : 'border-r border-gray-200') : ''} ${idx === 0 ? 'rounded-tl-2xl' : ''} ${idx === arr.length - 1 ? 'rounded-tr-2xl' : ''}`}
                                      >
                                        {col}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {(row.ServiceLine || []).map((line, lineIndex) => {
                                    const modifiers = extractModifiers(line.Modifier || line.Modifiers || line.ModifierCodes || line.Mods || line);
                                    return (
                                      <tr key={`${line.Code || lineIndex}-${lineIndex}`} className={isDark ? (lineIndex % 2 === 0 ? 'bg-[#262a33]' : 'bg-[#2c303a]') : (lineIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
                                        {[
                                          lineIndex + 1,
                                          formatDateValue(line.ServiceDate),
                                          [formatValue(line.ProcedureCode || line.Code), formatValue(line.UnitsPaid || line.Units || line.Quantity), modifiers.filter(Boolean).join(', ')].filter((v) => v && v !== 'N/A').join(' '),
                                          formatCurrency(line.ChargedAmount || line.ChargeAmount || line.Amount),
                                          formatCurrency(line.AllowedAmount),
                                          formatCurrency((line.ChargedAmount || 0) - (line.AllowedAmount || 0)),
                                          formatCurrency(line.Deductible),
                                        ].map((val, idx, arr) => (
                                          <td
                                            key={`${lineIndex}-${idx}`}
                                            className={`px-4 py-3 text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'} ${isDark ? 'border-[#3f4558]' : 'border-gray-200'} border-b ${idx !== arr.length - 1 ? 'border-r' : ''} ${lineIndex === (row.ServiceLine || []).length - 1 ? (idx === 0 ? 'rounded-bl-2xl' : idx === arr.length - 1 ? 'rounded-br-2xl' : '') : ''}`}
                                          >
                                            {renderTruncated(val, ['72px', '120px', '220px', '120px', '120px', '120px', '120px'][idx] || '180px')}
                                          </td>
                                        ))}
                                      </tr>
                                    );
                                  })}
                                  {(row.ServiceLine || []).length === 0 && (
                                    <tr>
                                      <td colSpan={7} className={`px-4 py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No service line detail.</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </SectionCard>

                          <SectionCard title="Supplement/Adjustment Information" showBorder={false}>
                            <div className={`overflow-hidden rounded-2xl border ${isDark ? 'border-[#3f4558] bg-[#1b1f29]' : 'border-gray-200 bg-white'}`}>
                              <table className="w-full text-sm border-separate border-spacing-0">
                                <thead>
                                  <tr className={isDark ? 'bg-[#2d3038] text-gray-100' : 'bg-gray-100 text-gray-700'}>
                                    {[
                                      'Service Line #',
                                      'Core Business Scenario',
                                      'Supp/Adj Group Code',
                                      'Description',
                                    ].map((col, idx, arr) => (
                                      <th
                                        key={col}
                                        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b ${isDark ? 'border-[#3f4558]' : 'border-gray-200'} ${idx !== arr.length - 1 ? (isDark ? 'border-r border-[#3f4558]' : 'border-r border-gray-200') : ''} ${idx === 0 ? 'rounded-tl-2xl' : ''} ${idx === arr.length - 1 ? 'rounded-tr-2xl' : ''}`}
                                      >
                                        {col}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {(row.ServiceLine || []).map((line, lineIndex) => {
                                    const firstCode = (line.Codes || [])[0] || {};
                                    return (
                                      <tr key={`supp-${lineIndex}`} className={isDark ? (lineIndex % 2 === 0 ? 'bg-[#262a33]' : 'bg-[#2c303a]') : (lineIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
                                        {[
                                          lineIndex + 1,
                                          formatValue(line.CoreBusinessScenario || line.BusinessScenario || 'N/A'),
                                          formatValue(firstCode.AdjustmentGroup || firstCode.GroupCode || 'N/A'),
                                          formatValue(firstCode.Description || firstCode.AdjustmentReason || 'N/A'),
                                        ].map((val, idx, arr) => (
                                          <td
                                            key={`${lineIndex}-${idx}`}
                                            className={`px-4 py-3 text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'} ${isDark ? 'border-[#3f4558]' : 'border-gray-200'} border-b ${idx !== arr.length - 1 ? 'border-r' : ''} ${lineIndex === (row.ServiceLine || []).length - 1 ? (idx === 0 ? 'rounded-bl-2xl' : idx === arr.length - 1 ? 'rounded-br-2xl' : '') : ''}`}
                                          >
                                            {renderTruncated(val, ['72px', '220px', '160px', '260px'][idx] || '180px')}
                                          </td>
                                        ))}
                                      </tr>
                                    );
                                  })}
                                  {(row.ServiceLine || []).length === 0 && (
                                    <tr>
                                      <td colSpan={4} className={`px-4 py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No supplemental data.</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </SectionCard>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}
          {detailShowStatus == 3 && (

            <div className={`flex flex-col gap-4 p-4 sm:p-6 rounded-2xl border ${isDark ? 'text-gray-100 bg-[#27282D] border-[#1f2433] shadow-[0_16px_40px_rgba(0,0,0,0.35)]' : 'text-gray-900 bg-white border-gray-200 shadow-[0_14px_36px_rgba(0,0,0,0.08)]'}`}>

              <div className={`overflow-hidden rounded-2xl border ${isDark ? 'border-[#3f4558] bg-[#1b1f29]' : 'border-gray-200 bg-white'}`}>
                <table className="w-full text-sm border-separate border-spacing-0">
                  <thead>
                    <tr className={isDark ? 'bg-[#2d3038] text-gray-100' : 'bg-gray-100 text-gray-700'}>
                      {[
                        '#',
                        'Claim No',
                        'Service Date',
                        'Transaction Date',
                        'Transaction Type',
                        'Payer ID',
                        'Payer Name',
                        'Payer Sequence',
                        'Claim Frequency',
                        'Patient ID',
                        'Patient Name',
                      ].map((col, idx, arr) => (
                        <th
                          key={col}
                          className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b ${isDark ? 'border-[#3f4558]' : 'border-gray-200'} ${idx !== arr.length - 1 ? (isDark ? 'border-r border-[#3f4558]' : 'border-r border-gray-200') : ''} ${idx === 0 ? 'rounded-tl-2xl' : ''} ${idx === arr.length - 1 ? 'rounded-tr-2xl' : ''}`}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentClaim.RelatedEncounters.map((row, index) => (
                      <tr
                        key={index}
                        onClick={() => showDetail(row.ClaimNo)}
                        className={`${isDark ? (index % 2 === 0 ? 'bg-[#262a33]' : 'bg-[#2c303a]') : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50')} transition-colors cursor-pointer`}
                      >
                        {[
                          index + 1,
                          row.ClaimNo,
                          formatDate(row.ServiceDate),
                          formatDate(row.TransactionDate),
                          samplifyString(row.TransactionType),
                          samplifyString(row.PayerID),
                          samplifyString(row.PayerName),
                          row.PayerSeq == 'P' ? 'Primary' : (row.PayerSeq == 'S' ? 'Secondary' : '-'),
                          row.Frequency,
                          samplifyString(""),
                          samplifyString(""),
                        ].map((val, idx, arr) => (
                          <td
                            key={`${index}-${idx}`}
                            className={`whitespace-nowrap px-4 py-3 text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'} ${isDark ? 'border-[#3f4558]' : 'border-gray-200'} border-b ${idx !== arr.length - 1 ? 'border-r' : ''} ${index === currentClaim.RelatedEncounters.length - 1 ? (idx === 0 ? 'rounded-bl-2xl' : idx === arr.length - 1 ? 'rounded-br-2xl' : '') : ''}`}
                          >
                            {renderTruncated(val, ['64px', '140px', '120px', '140px', '160px', '120px', '160px', '140px', '140px', '120px', '160px'][idx] || '160px')}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {currentClaim.RelatedEncounters.length === 0 && (
                      <tr>
                        <td colSpan={11} className={`px-4 py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No related encounters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          )}

          {detailShowStatus == 4 && (
            <div
              className={`flex flex-col gap-4 p-4 sm:p-6 rounded-2xl ${isDark
                ? 'text-[#F4F4F4] bg-[#27282D] border-[#1f2433]]'
                : 'text-gray-900 bg-white border-gray-200 shadow-[0_14px_36px_rgba(0,0,0,0.08)]'
                }`}
            >
              <div className="flex flex-col gap-3">
                <p className="text-lg font-semibold">Triage</p>
                <div className={`p-4 border-t ${isDark ? 'bg-[#27282D] border-[#CDCDCD]' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex flex-col gap-3">
                    {triageActions.map((action, idx) => {
                      const isOther =
                        action.allowFreeText ||
                        `${action.label || ""}`.trim().toLowerCase() === "other";
                      return (
                        <div key={`triage-${idx}`} className="flex flex-col gap-2">
                          <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-400"
                              checked={action.checked}
                              onChange={() =>
                                setTriageActions((prev) =>
                                  prev.map((item, i) =>
                                    i === idx ? { ...item, checked: !item.checked } : item
                                  )
                                )
                              }
                            />
                            <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>{action.label}</span>
                          </label>
                          {isOther && (
                            <input
                              type="text"
                              value={triageOtherText}
                              onChange={(e) => setTriageOtherText(e.target.value)}
                              disabled={!action.checked}
                              placeholder="Enter other action..."
                              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 ${isDark ? 'bg-[#27282D] border-[#1f2433] text-gray-100' : 'bg-white border-gray-200 text-gray-800'}`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-lg font-semibold">Notes</p>
                <textarea
                  rows={5}
                  className={`w-full rounded-xl border px-3 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 ${isDark ? 'bg-[#3C3D42] border-[#1f2433] text-gray-100' : 'bg-white border-gray-200 text-gray-800'}`}
                  value={triageNotes}
                  onChange={(e) => setTriageNotes(e.target.value)}
                  placeholder="Add notes for this claim..."
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={onSubmitTriage}
                    disabled={triageSaving}
                    className="px-6 py-3 text-sm font-medium text-[#F4F4F4] rounded-lg transition-all duration-200 bg-[#1f3025] hover:bg-[#a8a8a8] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {triageSaving ? "Saving..." : "Save Actions"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {detailShowStatus == 999 && <>

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
                    <div className={` p-6 flex flex-col w-full rounded-xl ${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'}`}>
                      <div>
                        <h2 className="text-[14px] text-gray-400">Root Cause</h2>
                        <div className="text-[14px] mt-3">
                          {appeal[4]}
                        </div>
                      </div>
                    </div>

                    <div className={` p-6 sm:mt-0 mt-2 flex flex-col w-full rounded-xl ${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'}`}>
                      <div>
                        <h2 className="text-[14px] text-gray-400">Rationale</h2>
                        <div className="text-[14px] mt-3">
                          {appeal[2].split('\n').map((i, key) => <div key={`rationale-${key}`}>{i}</div>)}
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className='flex flex-row mt-2 w-full gap-x-2 justify-evenly'>
                    <div className={`${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
                      <div>
                        <h2 className="text-[14px] text-gray-400">Evidence</h2>
                        <div className="text-[14px] mt-3">
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
                          </> : <Recommendation data={appeal[3]} flag={currentClaim.Claim.Data.Automation} />} </>)}
                        </div>
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
                          {currentClaim.Claim.ServiceLine.map((row, index) => row.Code).join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='flex flex-row mt-2 w-full gap-x-2 justify-evenly'>
                    <div className={`${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
                      <div>
                        <h2 className="text-[14px] text-gray-400">Diagnosis Code</h2>
                        <p className="text-[14px] mt-3">
                          {currentClaim.Claim.Diagnosis.map((row, index) => row.Code).join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className={`${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
                      <div>
                        <h2 className="text-[14px] text-gray-400">Reason Code</h2>
                        <p className="text-[14px] mt-3">
                          {`${currentClaim.Claim.Data.PrimaryGroup} ${currentClaim.Claim.Data.PrimaryCode}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='flex flex-row mt-2 w-full gap-x-2 justify-evenly'>
                    <div className={`${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
                      <div>
                        <h2 className="text-[14px] text-gray-400">Payer ID</h2>
                        <p className="text-[14px] mt-3">
                          {currentClaim.Claim.Data.PayerID}
                        </p>
                      </div>
                    </div>
                    <div className={`${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
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
                    <div className={`${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
                      <div>
                        <h2 className="text-[14px] text-gray-400">Category</h2>
                        <p className="text-[14px] mt-3">
                          {currentClaim.Claim.Data.Category}
                        </p>
                      </div>
                    </div>
                    <div className={`${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
                      <div>
                        <h2 className="text-[14px] text-gray-400">Remark Code</h2>
                        <p className="text-[14px] mt-3">
                          {currentClaim.Claim.Data.Remark.join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>







                  <div className='flex flex-row mt-2 w-full gap-x-2 justify-evenly'>
                    <div className={`${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
                      <div>
                        <h2 className="text-[14px] text-gray-400">Action Date</h2>
                        <p className="text-[14px] mt-3">
                          {actionDate || (currentClaim.Action.length > 0 && currentClaim.Action[0].action_date)}
                        </p>
                      </div>
                    </div>
                    <div className={`${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
                      <div>
                        <h2 className="text-[14px] text-gray-400">Charges</h2>
                        <p className="text-[14px] mt-3">
                          ${currentClaim.Claim.Data.Amount}
                        </p>
                      </div>
                    </div>
                  </div>


                  <div className='flex flex-row mt-2 w-full gap-x-2 justify-evenly'>
                    <div className={`${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
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
                    <div className={`${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
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
                  <div className={`${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} p-6  w-full rounded-lg`}>
                    <h2 className="text-[14px] text-gray-400">Recommendation</h2>
                    <p className="text-[14px] mt-3">{appeal[5]}</p>
                    <div className="flex flex-row mt-3 justify-evenly gap-x-3">
                      <div className={`cursor-pointer flex gap-2 rounded-lg text-white w-full p-2 border-[1px] border-[#44BFAB] ${thumb == 1 ? 'bg-[#F5FCFB]' : 'bg-[#F5FCFB] '}`} onClick={() => setThumb(1)}>
                        <div className="flex flex-row w-full justify-center gap-x-2 items-center">
                          <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.22998 18.3505L11.33 20.7505C11.73 21.1505 12.63 21.3505 13.23 21.3505H17.03C18.23 21.3505 19.53 20.4505 19.83 19.2505L22.23 11.9505C22.73 10.5505 21.83 9.35046 20.33 9.35046H16.33C15.73 9.35046 15.23 8.85046 15.33 8.15046L15.83 4.95046C16.03 4.05046 15.43 3.05046 14.53 2.75046C13.73 2.45046 12.73 2.85046 12.33 3.45046L8.22998 9.55046" stroke="#44BFAB" strokeWidth="1.2" strokeMiterlimit="10" />
                            <path d="M3.12988 18.3504V8.55039C3.12988 7.15039 3.72988 6.65039 5.12988 6.65039H6.12988C7.52988 6.65039 8.12988 7.15039 8.12988 8.55039V18.3504C8.12988 19.7504 7.52988 20.2504 6.12988 20.2504H5.12988C3.72988 20.2504 3.12988 19.7504 3.12988 18.3504Z" stroke="#44BFAB" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className="text-[#44BFAB] text-[14px]">Yes</span>
                        </div>
                      </div>

                      <div className={`cursor-pointer flex gap-2 rounded-lg text-white w-full p-2 border-[1px] border-[#F12622] ${thumb == 1 ? 'bg-[#FEF4F4]' : 'bg-[#FEF4F4] '}`} onClick={() => setThumb(1)}>
                        <div className="flex flex-row w-full justify-center gap-x-2 items-center">
                          <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.27 5.65039L14.17 3.25039C13.77 2.85039 12.87 2.65039 12.27 2.65039H8.46998C7.26998 2.65039 5.96998 3.55039 5.66998 4.75039L3.26998 12.0504C2.76998 13.4504 3.66998 14.6504 5.16998 14.6504H9.16998C9.76998 14.6504 10.27 15.1504 10.17 15.8504L9.66998 19.0504C9.46998 19.9504 10.07 20.9504 10.97 21.2504C11.77 21.5504 12.77 21.1504 13.17 20.5504L17.27 14.4504" stroke="#F12622" strokeWidth="1.2" strokeMiterlimit="10" />
                            <path d="M22.3699 5.65V15.45C22.3699 16.85 21.7699 17.35 20.3699 17.35H19.3699C17.9699 17.35 17.3699 16.85 17.3699 15.45V5.65C17.3699 4.25 17.9699 3.75 19.3699 3.75H20.3699C21.7699 3.75 22.3699 4.25 22.3699 5.65Z" stroke="#F12622" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className="text-[#F12622] text-[14px]">No</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-[70%] text-[12px] mt-2 text-gray-400">
                      <h1> Please let us know if this recommendation was useful in addressing the claim. </h1>
                    </div>
                  </div>

                  <div className={`${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
                    <h2 className="text-[14px] mb-2 text-gray-400">Add Action</h2>
                    <div className="relative mt-3">
                      <label
                        htmlFor="action-dropdown"
                        className={`${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  absolute -top-2.5 left-2  px-1 text-[12px] `}
                      >
                        Action
                      </label>
                      <select
                        id="action-dropdown"
                        className={`w-full p-3 border border-gray-300 rounded-lg text-[14px]   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  `}
                        ref={claimStatus}
                        defaultValue={currentClaim.Action.length > 0 ? currentClaim.Action[0].claim_status : ''}
                      >
                        <option value={"none"} disabled hidden>Select an action</option>
                        <option value={"resubmit"}>Resubmitted to payer</option>
                        <option value={"appeal"}>Appealed to payer</option>
                        <option value={"contact"}>Contacted to patient</option>
                      </select>
                    </div>
                  </div>

                  <div className={`${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} p-6 flex flex-col w-full rounded-xl`}>
                    <div className='flex justify-between items-center'>
                      <h2 className="text-[14px] mb-2 text-gray-400">Notes</h2>
                      <button className='text-[14px] text-blue-500' onClick={handleOpenNotesHistory}>View Notes</button>
                    </div>
                    <div className="relative mt-5">
                      <div className={`${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} absolute -top-2.5 left-2  px-1 text-[12px] text-gray-400`}>
                        Leave Note
                      </div>
                      <textarea
                        className={`w-full p-3 border ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  border-gray-300 rounded-lg text-[14px]   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        rows="4"
                        placeholder="Enter your notes here..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                  <div className="flex px-1 py-3 mt-3">
                    <div className='flex flex-row justify-between items-center w-full'>
                      <button className='bg-[#202123] text-white text-[14px] px-4 py-3 rounded-lg' onClick={() => setShowAppealModal(true)}>Generate Appeal Letter</button>
                      <button className='bg-[#005DE2] text-white text-[14px] px-4 py-3 rounded-lg' onClick={onSubmitClaim}>Save Changes</button>
                    </div>
                  </div>
                </div>


                <div className="comment flex flex-col w-full h-full gap-4  mt-8">
                  <div className="flex flex-row justify-items-start items-start gap-2">
                    <h1 className="font-bold ">
                      Your Comments
                    </h1>
                    <button className="text-blue-600" onClick={() => {
                      setComment(originalComment);
                      setShowComment(!showComment);
                    }}>
                      {showComment ? "Hide" : "Show"}
                    </button>
                  </div>

                  {showComment && (
                    <div className={`${theme === 'dark' ? 'bg-[#191a1d]' : 'bg-[#EFF4FE]'} rounded-xl p-2`}>
                      <div className={`flex flex-col w-full gap-4  p-6 rounded-xl shadow-sm ${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} `}>
                        <h1 className="mb-4 text-gray-400">Comments</h1>
                        <div className="space-y-4">
                          {/* Additional Info */}
                          <div className="relative">
                            <label
                              htmlFor="additional-info"
                              className={`absolute -top-2.5 left-2 ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  px-1 text-[12px] `}
                            >
                              Additional Info
                            </label>
                            <input
                              id="additional-info"
                              type="text"
                              className={`w-full p-3 border border-gray-300 rounded-lg text-[14px] ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                              value={comment.Additional}
                              onChange={(e) => setComment({ ...comment, Additional: e.target.value })}
                            />
                          </div>

                          {/* CPT Code */}
                          <div className="relative">
                            <label
                              htmlFor="cpt-code"
                              className={`absolute -top-2.5 left-2 ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  px-1 text-[12px] `}
                            >
                              CPT Code Mismatch
                            </label>
                            <input
                              id="cpt-code"
                              type="text"
                              className={`w-full p-3 border border-gray-300 rounded-lg text-[14px] ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                              value={comment.CPT}
                              onChange={(e) => setComment({ ...comment, CPT: e.target.value })}
                            />
                          </div>

                          {/* Description */}
                          <div className="relative">
                            <label
                              htmlFor="description"
                              className={`absolute -top-2.5 left-2 ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  px-1 text-[12px] `}
                            >
                              Description Mismatch
                            </label>
                            <input
                              id="description"
                              type="text"
                              className={`w-full p-3 border border-gray-300 rounded-lg text-[14px] ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                              value={comment.Description}
                              onChange={(e) => setComment({ ...comment, Description: e.target.value })}
                            />
                          </div>

                          {/* Recommendation */}
                          <div className="relative">
                            <label
                              htmlFor="recommendation"
                              className={`absolute -top-2.5 left-2 ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  px-1 text-[12px] `}
                            >
                              Corrected Recommendation
                            </label>
                            <select
                              id="recommendation"
                              className={`w-full p-3 border border-gray-300 rounded-lg text-[14px] ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                              value={comment.Recommendation}
                              onChange={(e) => setComment({ ...comment, Recommendation: e.target.value })}
                            >
                              <option value="" disabled hidden>Select option</option>
                              <option value="Appeal">Appeal</option>
                              <option value="Resubmit">Resubmit</option>
                              <option value="Write-off">Write-off</option>
                            </select>
                          </div>

                          {/* Root Cause */}
                          <div className="relative">
                            <label
                              htmlFor="root-cause"
                              className={`absolute -top-2.5 left-2 ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  px-1 text-[12px] `}
                            >
                              Updated Root Cause
                            </label>
                            <input
                              id="root-cause"
                              type="text"
                              className={`w-full p-3 border border-gray-300 rounded-lg text-[14px] ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                              value={comment.Root}
                              onChange={(e) => setComment({ ...comment, Root: e.target.value })}
                            />
                          </div>

                          {/* Steps */}
                          <div className="relative">
                            <label
                              htmlFor="steps"
                              className={`absolute -top-2.5 left-2 ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  px-1 text-[12px] `}
                            >
                              Steps to Solve
                            </label>
                            <textarea
                              id="steps"
                              className={`w-full min-h-[120px] p-3 border border-gray-300 rounded-lg text-[14px] ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono resize-y`}
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
                              className={`absolute -top-2.5 left-2 ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  px-1 text-[12px] `}
                            >
                              Evidence #1
                            </label>
                            <input
                              id="evidence1"
                              type="text"
                              className={`w-full p-3 border border-gray-300 rounded-lg text-[14px] ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                              value={comment.Evidence1}
                              onChange={(e) => setComment({ ...comment, Evidence1: e.target.value })}
                            />
                          </div>

                          {/* Evidence 2 */}
                          <div className="relative">
                            <label
                              htmlFor="evidence2"
                              className={`absolute -top-2.5 left-2 ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  px-1 text-[12px] `}
                            >
                              Evidence #2
                            </label>
                            <input
                              id="evidence2"
                              type="text"
                              className={`w-full p-3 border border-gray-300 rounded-lg text-[14px] ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
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
                          onClick={() => {
                            setShowComment(false)
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
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                  </svg>
                  <span>{currentClaim.up + (thumb > 0 ? 1 : 0)}</span>
                </div>
                <div className={`cursor-pointer flex gap-2 rounded-lg text-white p-2 ${thumb == -1 ? 'bg-[#ef2f2f]' : 'bg-[#ef8484]'}`} onClick={() => setThumb(-1)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
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

        </div>
      )}
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
              {appealLetter.split('\n').map((row, index) => (
                <p key={`appeal-line-${index}`}>{row}</p>
              ))}
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

