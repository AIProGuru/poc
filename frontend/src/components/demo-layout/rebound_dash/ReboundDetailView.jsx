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
  const [routeCategory, setRouteCategory] = useState('');
  const [currentClaim, setCurrentClaim] = useState(null);
  const [appeal, setAppeal] = useState([])
  const [actionDate, setActionDate] = useState(null)
  const [appealLetter, setAppealLetter] = useState('')
  const [status, setStatus] = useState(true)
  const [showComment, setShowComment] = useState(false)
  const [renderIndex, setRenderIndex] = useState(0)
  const [claimNo, setClaimNo] = useState('')
  const [thumb, setThumb] = useState(0);
  const [optumRequest, setOptumRequest] = useState(null);
  const [optumResponse, setOptumResponse] = useState(null);
  const [optumLoading, setOptumLoading] = useState(false);
  const [optumError, setOptumError] = useState("");
  const [showOptumDetails, setShowOptumDetails] = useState(false);
  const [eligibilityRequest, setEligibilityRequest] = useState(null);
  const [eligibilityResponse, setEligibilityResponse] = useState(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibilityError, setEligibilityError] = useState("");
  const [showEligibilityDetails, setShowEligibilityDetails] = useState(false);
  const [triageActions, setTriageActions] = useState([]);
  const [triageOtherText, setTriageOtherText] = useState("");
  const [triageNotes, setTriageNotes] = useState("");
  const [triageSaving, setTriageSaving] = useState(false);
  const [generatingAppeal, setGeneratingAppeal] = useState(false);
  const [openTriageDropdown, setOpenTriageDropdown] = useState(null);
  const type = useSelector((state) => state.app.type)
  const claimStatus = useRef(null);
  const triageDropdownRefs = useRef({});
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
  const [documentForm, setDocumentForm] = useState({
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
    transactionCode: "",
    transactionOptions: [],
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
      if (token.claimCategory) {
        setRouteCategory(token.claimCategory);
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
            transactionCode: "",
            transactionOptions: Array.isArray(item.transactionOptions)
              ? item.transactionOptions
              : [],
          })), savedTriageValue)
        );
      })
      .catch(() => {
        setTriageActions(applySavedTriageSelection(defaultTriageActions, savedTriageValue));
      });
  }, [apiUrl, currentClaim])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (openTriageDropdown === null) return;
      const container = triageDropdownRefs.current[openTriageDropdown];
      if (container && !container.contains(event.target)) {
        setOpenTriageDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [openTriageDropdown]);

  const showDetail = (claimNo) => {
    const token = {
      claimNo
    }
    console.log(location.pathname)
    navigate(`${type === 0 ? '/rebound' : type === 3 ? '/betacustomer' : '/pilotcustomer'}/detail/${btoa(JSON.stringify(token))}`);
  }


  const submitDocument = () => {
    axios.post(`${apiUrl}/add_document`, { ...documentForm, ClaimNo: currentClaim.ClaimNo }).then(res => {
      toast.success("Saved successfully!")
    })
  }


  const [notes, setNotes] = useState('')

  const getSavedTriageEntry = (claim) => {
    const actions = claim?.Action || [];
    return actions.find((item) => `${item.claim_status || ""}`.toLowerCase() === "triage") || null;
  };

  const parseTriageActionValue = (value) => {
    if (!value) return { selected: [], otherText: "", transactionCodes: {} };
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return { selected: parsed.filter(Boolean), otherText: "", transactionCodes: {} };
      }
      if (parsed && typeof parsed === "object") {
        return {
          selected: Array.isArray(parsed.selected) ? parsed.selected.filter(Boolean) : [],
          otherText: parsed.otherText ? `${parsed.otherText}` : "",
          transactionCodes:
            parsed.transactionCodes && typeof parsed.transactionCodes === "object"
              ? parsed.transactionCodes
              : {},
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
      transactionCodes: {},
    };
  };

  const applySavedTriageSelection = (items, saved) => {
    const savedSet = new Set(saved.selected.map((item) => `${item}`.toLowerCase()));
    const savedOther = saved.otherText ? saved.otherText.trim() : "";
    return items.map((item) => {
      const label = `${item.label || ""}`.trim();
      const isOther = item.allowFreeText || label.toLowerCase() === "other";
      const checked = savedSet.has(label.toLowerCase()) || (isOther && savedOther);
      const transactionCode =
        saved.transactionCodes && saved.transactionCodes[label]
          ? `${saved.transactionCodes[label]}`
          : "";
      return { ...item, checked, transactionCode };
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
    const transactionCodes = triageActions.reduce((acc, item) => {
      if (item.checked && item.transactionCode) {
        acc[item.label] = item.transactionCode;
      }
      return acc;
    }, {});
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
    const actionPayload = JSON.stringify({ selected, otherText, transactionCodes });
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
  const getPatientPaymentValue = () => 0;

  const formatUnitsValue = (value) => {
    if (value === undefined || value === null || value === "") return "N/A";
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return `${value}`;
    return Number.isInteger(numericValue)
      ? `${numericValue}`
      : `${numericValue}`.replace(/\.0+$/, "");
  };

  const resolveActionDate = () => actionDate || currentClaim?.Action?.[0]?.action_date || null;
  const isAfterActionDate = (checkDate) => {
    const action = resolveActionDate();
    if (!action || !checkDate) return false;
    const actionTime = Date.parse(action);
    const checkTime = Date.parse(checkDate);
    if (Number.isNaN(actionTime) || Number.isNaN(checkTime)) return false;
    return checkTime > actionTime;
  };

  const shouldExcludeAdjustment = (groupCode, reasonCode) => {
    const normalizedGroup = `${groupCode || ""}`.trim().toUpperCase();
    const normalizedReason = `${reasonCode || ""}`.trim().replace(/^0+/, "");
    return normalizedGroup === "CO" && normalizedReason === "45";
  };

  const getContractualCO45Amount = (line) => {
    const codes = Array.isArray(line?.Codes) ? line.Codes : [];
    return codes.reduce((sum, code) => {
      const group = `${code?.AdjustmentGroup || code?.GroupCode || ""}`.trim().toUpperCase();
      const reason = `${code?.AdjustmentReason || code?.ReasonCode || ""}`.trim().replace(/^0+/, "");
      if (group === "CO" && reason === "45") {
        return sum + (Number(code?.AdjustmentAmount) || 0);
      }
      return sum;
    }, 0);
  };

  const normalizeAdjustmentReason = (value) => {
    const raw = `${value || ""}`.trim();
    if (!raw) return "N/A";
    const normalized = raw.replace(/^0+/, "");
    return normalized || "0";
  };

  const getLineAdjustmentSummary = (line) => {
    const codes = Array.isArray(line?.Codes) ? line.Codes : [];
    const summaryMap = new Map();
    codes.forEach((code) => {
      const group = `${code?.AdjustmentGroup || code?.GroupCode || ""}`.trim().toUpperCase() || "N/A";
      const reason = normalizeAdjustmentReason(code?.AdjustmentReason || code?.ReasonCode || "");
      const description = `${code?.Description || ""}`.trim();
      const amount = Number(code?.AdjustmentAmount) || 0;
      const key = `${group}|${reason}|${description}`;
      const existing = summaryMap.get(key) || { group, reason, description, amount: 0 };
      existing.amount += amount;
      summaryMap.set(key, existing);
    });
    return Array.from(summaryMap.values());
  };

  const getAllServiceLines = () =>
    (currentClaim?.Remit || []).flatMap((remit) => remit.ServiceLine || []);

  const getClaimSummary = () => {
    if (!currentClaim?.Claim?.Data) return null;
    const latestLines = currentClaim?.Remit?.[0]?.ServiceLine || [];
    const chargesFromLines = latestLines.reduce(
      (sum, line) => sum + (Number(line?.ChargedAmount) || 0),
      0
    );
    const chargesFromRemit = Number(currentClaim?.Remit?.[0]?.ChargeAmount) || 0;
    const charges =
      chargesFromLines ||
      chargesFromRemit ||
      Number(currentClaim.Claim.Data.Amount) ||
      0;
    const allowed = latestLines
      .map((rr) => Number(rr.AllowedAmount) || 0)
      .reduce((sum, val) => sum + val, 0);
    const adjustment45 = latestLines.reduce(
      (sum, line) => sum + getContractualCO45Amount(line),
      0
    );
    const expReimbursement = Number(
      currentClaim.Claim.Data.ExpReimbursement ||
      currentClaim.Claim.Data.ExpectedReimbursement ||
      currentClaim.Claim.Data.ExpectedAmount
    ) || 0;
    const payerPayments = latestLines
      .map((rr) => Number(rr.PaidAmount) || 0)
      .reduce((sum, val) => sum + val, 0);
    const patientPayment = getPatientPaymentValue();
    const patientResp = Number(currentClaim?.Remit?.[0]?.PatientResp) || 0;
    const balance = charges - adjustment45 - payerPayments - patientPayment;
    return { count: 1, charges, expReimbursement, allowed, payerPayments, patientPayment, patientResp, balance };
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

  const normalizeDateInput = (value) => {
    if (!value) return "";
    const parsed = new Date(Date.parse(value));
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toISOString().slice(0, 10);
  };

  const splitName = (value) => {
    const raw = `${value || ""}`.trim();
    if (!raw) return { firstName: "", lastName: "" };
    if (raw.includes(",")) {
      const [last, first] = raw.split(",").map((part) => part.trim());
      return { firstName: first || "", lastName: last || "" };
    }
    const parts = raw.split(" ").filter(Boolean);
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: "" };
    }
    return {
      firstName: parts.slice(0, parts.length - 1).join(" "),
      lastName: parts[parts.length - 1],
    };
  };

  const buildOptumRequestFromClaim = (claim) => {
    const claimData = claim?.Claim?.Data || {};
    const serviceLine = (claim?.Claim?.ServiceLine || [])[0] || {};
    const serviceDate =
      normalizeDateInput(serviceLine?.ServiceDate) ||
      normalizeDateInput(claimData?.ServiceDate);
    const patientName = claimData?.PatientName || claimData?.Patient || "";
    const nameParts = splitName(patientName);
    const procedureModifiers = extractModifiers(serviceLine?.Modifier);
    return {
      controlNumber: `${claimData?.ClaimNo || claim?.ClaimNo || "277"}-${Date.now()}`,
      tradingPartnerName: claimData?.PayerName || "",
      tradingPartnerServiceId: claimData?.PayerID || "",
      providers: [
        {
          providerType: "Billing",
          organizationName: claimData?.BillProvName || "",
          npi: claimData?.ProvNPI || "",
          taxId: claimData?.ProvTaxID || "",
        },
      ],
      subscriber: {
        memberId: claimData?.PatientID || "",
        firstName: nameParts.firstName,
        lastName: nameParts.lastName,
      },
      encounter: {
        beginningDateOfService: serviceDate,
        endDateOfService: serviceDate,
        trackingNumber: claimData?.ClaimNo || claim?.ClaimNo || "",
        tradingPartnerClaimNumber: claimData?.ClaimNo || claim?.ClaimNo || "",
        patientAccountNumber: claimData?.ClaimNo || claim?.ClaimNo || "",
        submittedAmount: claimData?.Amount || "",
      },
      serviceLineInformation: {
        productOrServiceIDQualifier: "HC",
        procedureCode: serviceLine?.Code || "",
        procedureModifiers,
        lineItemChargeAmount: serviceLine?.Charges || "",
        unitsOfServiceCount: serviceLine?.Units || "",
        serviceLineDate: serviceDate,
      },
    };
  };

  const buildEligibilityRequestFromClaim = (claim) => {
    const data = claim?.Claim?.Data || {};
    const patientName = `${data.PatientName || data.Patient || ""}`.trim();
    const [lastName, firstName] = patientName.includes(",")
      ? patientName.split(",").map((part) => part.trim())
      : ["", patientName.split(" ").slice(0, -1).join(" ")];
    return {
      payerId: data.PayerID || "",
      payerName: data.PayerName || "",
      memberId: data.PatientID || "",
      patientFirstName: firstName || "",
      patientLastName: lastName || patientName.split(" ").slice(-1)[0] || "",
      patientDob: data.PatientDOB || "",
      serviceDate: data.ServiceDate || "",
    };
  };

  const updateProviderField = (field, value) => {
    setOptumRequest((prev) => {
      const next = { ...(prev || {}), providers: [...((prev && prev.providers) || [])] };
      next.providers[0] = { ...(next.providers[0] || {}), [field]: value };
      return next;
    });
  };

  const updateSubscriberField = (field, value) => {
    setOptumRequest((prev) => ({
      ...(prev || {}),
      subscriber: { ...((prev && prev.subscriber) || {}), [field]: value },
    }));
  };

  const updateEncounterField = (field, value) => {
    setOptumRequest((prev) => ({
      ...(prev || {}),
      encounter: { ...((prev && prev.encounter) || {}), [field]: value },
    }));
  };

  const updateServiceLineField = (field, value) => {
    setOptumRequest((prev) => ({
      ...(prev || {}),
      serviceLineInformation: { ...((prev && prev.serviceLineInformation) || {}), [field]: value },
    }));
  };

  const getInsightStatusLabel = (value) => {
    if (!value) return "";
    const text = `${value}`.toLowerCase();
    if (text.includes("accept")) return "Accepted";
    if (text.includes("pending")) return "Pending";
    if (text.includes("final") || text.includes("paid")) return "Finalized/Paid";
    if (text.includes("denied") || text.includes("reject")) return "Denied/Rejected";
    return "Pending";
  };

  const SectionCard = ({ title, children, startCollapsed = true, collapsible = true, showBorder = true }) => {
    const [collapsed, setCollapsed] = useState(startCollapsed);

    const containerClass = `rounded-2xl overflow-hidden ${isDark
      ? `${showBorder ? 'border border-[#1f2433]' : 'border-0'} bg-[#27282D]`
      : `${showBorder ? 'border border-gray-200' : 'border-0'} bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]`
      }`;
    const borderStyle = showBorder ? (isDark ? 'border-[#1f2433]' : 'border-gray-200') : 'border-transparent';
    const headerClasses = `w-full flex items-center justify-between px-4 sm:px-6 py-4 border-b-0 ${borderStyle} ${isDark ? 'hover:bg-[#353639]' : 'hover:bg-gray-50'} transition`;
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
        <div className={`collapse-panel ${collapsed ? '' : 'collapse-panel--open'}`} aria-hidden={collapsed}>
          <div className="px-4 sm:px-6">
            <div className={`h-px w-full ${dividerClass}`} />
          </div>
          <div className="px-4 sm:px-6 py-4">{children}</div>
        </div>
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
    if (value !== 4) {
      setShowOptumDetails(false);
      setShowEligibilityDetails(false);
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
    setDetailShowStatus(0);
    axios.get(`${apiUrl}/get_claim?id=${claimNo}&username=${username}`).then(res => {
      console.log("@@@@@@@@@@@@@@", res.data)
      setCurrentClaim(res.data);
      setOriginalComment(res.data.Comment);
      setDocumentForm(res.data.Document);
      setAppeal([...res.data.Appeal]);
      setThumb(res.data.rate);
    })
  }, [claimNo, apiUrl])

  useEffect(() => {
    if (!currentClaim) return;
    setOptumRequest(buildOptumRequestFromClaim(currentClaim));
    setOptumResponse(null);
    setOptumError("");
    setEligibilityRequest(buildEligibilityRequestFromClaim(currentClaim));
    setEligibilityResponse(null);
    setEligibilityError("");
  }, [currentClaim]);

  const handleRequest277 = () => {
    if (!optumRequest) return;
    setOptumLoading(true);
    setOptumError("");
    axios
      .post(`${apiUrl}/claim-status/optum`, {
        claimId:
          currentClaim?.Claim?.Data?.ClaimNo ||
          currentClaim?.ClaimNo ||
          optumRequest?.encounter?.tradingPartnerClaimNumber ||
          "",
      })
      .then((res) => {
        const payload = res?.data?.response || res?.data || {};
        setOptumResponse(payload);
        toast.success("277 response received.");
      })
      .catch((err) => {
        const detail =
          err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to request 277.";
        setOptumError(detail);
        toast.error("Failed to request 277.");
      })
      .finally(() => {
        setOptumLoading(false);
      });
  };

  const handleRequest270 = () => {
    if (!eligibilityRequest) return;
    setEligibilityLoading(true);
    setEligibilityError("");
    axios
      .post(`${apiUrl}/eligibility/270`, eligibilityRequest)
      .then((res) => {
        setEligibilityResponse(res?.data || {});
        toast.success("270 response received.");
      })
      .catch((err) => {
        const detail =
          err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to request 270.";
        setEligibilityError(detail);
        toast.error("Failed to request 270.");
      })
      .finally(() => {
        setEligibilityLoading(false);
      });
  };

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
  const claimCategory =
    currentClaim?.Claim?.Data?.Category ||
    currentClaim?.Claim?.Data?.CategoryName ||
    currentClaim?.Claim?.Data?.ClaimCategory ||
    "";
  const normalizePend = (value) =>
    `${value}`.toLowerCase().replace(/[^a-z0-9]/g, "");
  const pend277Flag = Boolean(currentClaim?.Claim?.Data?.Pend277);
  const isPend277 = pend277Flag || [routeTitle, appTitle, routeCategory, claimCategory]
    .filter(Boolean)
    .some((value) => normalizePend(value).includes("pend277"));
  const isEligibility = [routeTitle, appTitle, routeCategory, claimCategory]
    .filter(Boolean)
    .some((value) => normalizePend(value).includes("eligibility"));
  const showRaw277 = () => {
    setShowOptumDetails(true);
  };
  const showRaw270 = () => {
    setShowEligibilityDetails(true);
  };

  return (
    <>
      {(() => {
        const summary = getClaimSummary();
        if (!summary) return null;
        return (
          <div
            className={`rounded-2xl border m-4 p-4 ${isDark ? 'border-transparent text-white shadow-[0_4px_4px_rgba(0,0,0,0.25)]' : 'bg-white border-gray-200 text-[#0f172a]'}`}
            style={isDark ? { background: 'linear-gradient(90deg, #4B9187 0%, #6911AC 100%)' } : undefined}
          >
            <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
              {[
                { label: 'Count', value: samplifyInteger(summary.count) },
                { label: 'Charges', value: formatCurrency(summary.charges) },
                { label: 'Exp Reimbursement', value: formatCurrency(summary.expReimbursement) },
                { label: 'Allowed Amt', value: formatCurrency(summary.allowed) },
                { label: 'Payer Payments', value: formatCurrency(summary.payerPayments) },
                { label: 'Patient Payment', value: formatCurrency(summary.patientPayment) },
                { label: 'Balance', value: formatCurrency(summary.balance) },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-xl px-4 py-3 text-sm ${isDark ? 'bg-black/15 text-white border border-white/20 shadow-[0_4px_4px_rgba(0,0,0,0.25)]' : 'bg-slate-50 text-slate-900 border border-gray-200'}`}
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
              {isPend277 ? (
                <>
                  <p className={`mt-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    This requires <span className="text-[#FF5C5C] font-semibold">REVIEW</span> for:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                      - 277 pending from Payer
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <p className={`mt-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    This was <span className="text-[#FF5C5C] font-semibold">DENIED</span> for:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {(() => {
                      const reasons = (currentClaim?.Remit?.[0]?.ServiceLine || [])
                        .flatMap((line) => (line.Codes || []).map((code) => {
                          const groupCode = `${code.AdjustmentGroup || ''}`.trim();
                          const reasonCode = `${code.AdjustmentReason || ''}`.trim();
                          const description = `${code.Description || ''}`.trim();
                          if (!groupCode && !reasonCode && !description) return '';
                          if (shouldExcludeAdjustment(groupCode, reasonCode)) return '';
                          const prefix = groupCode ? `${groupCode} ${reasonCode}`.trim() : reasonCode;
                          return description ? `${prefix} - ${description}`.trim() : prefix;
                        }))
                        .filter(Boolean);

                      if (reasons.length === 0) {
                        return (
                          <li className={isDark ? 'text-gray-400' : 'text-gray-500'}>- No adjustment details available.</li>
                        );
                      }

                      return reasons.slice(0, 6).map((reason, idx) => (
                        <li key={`insight-${idx}`} className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                          - {reason}
                        </li>
                      ));
                    })()}
                  </ul>
                </>
              )}
            </div>
          )}

          {detailShowStatus == 1 && (
            <>
              <SectionCard title="Claim Details" showBorder={false}>
                <InfoGrid
                  fields={[
                    {
                      label: "Claim Number",
                      value: formatValue(
                        currentClaim?.Claim?.Data?.ClaimNo ||
                          currentClaim?.ClaimNo ||
                          currentClaim?.Claim?.Data?.ClaimID
                      ),
                    },
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
                          'Rev Code',
                          'Proc Code',
                          'Mod Cd1',
                          'Mod Cd2',
                          'Mod Cd3',
                          'Charge $',
                          'Proc Description',
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
                        const revCode = formatValue(line.RevCode || line.RevenueCode || line.Revenue || line.Rev);
                        const procCode = formatValue(line.ProcedureCode || line.Code);
                        const procDescription = formatValue(
                          line.Description || line.ProcedureDescription || line.ProcDescription
                        );
                        const charge = formatCurrency(
                          line.Charges ||
                          line.Charge ||
                          line.Amount ||
                          line.BilledAmount ||
                          line.Billed
                        );
                        const cells = [
                          revCode,
                          procCode,
                          formatValue(modifiers[0]),
                          formatValue(modifiers[1]),
                          formatValue(modifiers[2]),
                          charge,
                          procDescription,
                        ];
                        return (
                          <tr key={`${line.Code || lineIndex}-${lineIndex}`} className={isDark ? (lineIndex % 2 === 0 ? 'bg-[#262a33]' : 'bg-[#2c303a]') : (lineIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
                            {cells.map((val, idx) => (
                              <td
                                key={`${lineIndex}-${idx}`}
                                className={`px-4 py-3 text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'} ${isDark ? 'border-[#3f4558]' : 'border-gray-200'} border-b ${idx !== cells.length - 1 ? 'border-r' : ''} ${lineIndex === arr.length - 1 ? (idx === 0 ? 'rounded-bl-2xl' : idx === cells.length - 1 ? 'rounded-br-2xl' : '') : ''}`}
                              >
                                {renderTruncated(val, ['90px', '110px', '80px', '80px', '80px', '120px', '260px'][idx] || '180px')}
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
                          ? 'bg-[#27282d] hover:bg-[#353639]'
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
                                    row.ServiceLine
                                      .map((rr) => getContractualCO45Amount(rr))
                                      .reduce((sum, a) => sum + a, 0)
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
                                  {
                                    label: "Claim Number",
                                    value: formatValue(
                                      row.ClaimID ||
                                        currentClaim?.Claim?.Data?.ClaimNo ||
                                        currentClaim?.ClaimNo ||
                                        row.PayerClaimNumber
                                    ),
                                  },
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
                                        'Proc Code',
                                        'Units',
                                        'Charge $',
                                        'Allowed $',
                                        'Contractual $',
                                        'Deductible $',
                                        'Adjustments',
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
                                    const adjustments = getLineAdjustmentSummary(line);
                                    const rowCount = (row.ServiceLine || []).length;
                                    const baseCells = [
                                      lineIndex + 1,
                                      formatDateValue(line.ServiceDate),
                                      formatValue(line.ProcedureCode || line.Code),
                                      formatUnitsValue(line.UnitsPaid || line.Units || line.Quantity),
                                      formatCurrency(line.ChargedAmount || line.ChargeAmount || line.Amount),
                                      formatCurrency(line.AllowedAmount),
                                      formatCurrency(getContractualCO45Amount(line)),
                                      formatCurrency(line.Deductible),
                                    ];
                                    return (
                                      <tr key={`${line.Code || lineIndex}-${lineIndex}`} className={isDark ? (lineIndex % 2 === 0 ? 'bg-[#262a33]' : 'bg-[#2c303a]') : (lineIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
                                        {baseCells.map((val, idx) => (
                                          <td
                                            key={`${lineIndex}-${idx}`}
                                            className={`px-4 py-3 text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'} ${isDark ? 'border-[#3f4558]' : 'border-gray-200'} border-b border-r ${lineIndex === rowCount - 1 && idx === 0 ? 'rounded-bl-2xl' : ''}`}
                                          >
                                            {renderTruncated(val, ['72px', '120px', '140px', '100px', '120px', '120px', '120px', '120px'][idx] || '180px')}
                                          </td>
                                        ))}
                                        <td
                                          className={`px-4 py-3 text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'} ${isDark ? 'border-[#3f4558]' : 'border-gray-200'} border-b ${lineIndex === rowCount - 1 ? 'rounded-br-2xl' : ''}`}
                                        >
                                          {adjustments.length === 0 ? (
                                            <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>N/A</span>
                                          ) : (
                                            <div className="flex flex-wrap gap-2">
                                              {adjustments.slice(0, 3).map((adj, adjIndex) => {
                                                const label = `${adj.group} ${adj.reason}`.trim();
                                                const title = adj.description
                                                  ? `${label} - ${adj.description}`
                                                  : label;
                                                return (
                                                  <span
                                                    key={`${label}-${adjIndex}`}
                                                    title={title}
                                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${isDark ? 'bg-[#303544] text-gray-200' : 'bg-gray-100 text-gray-700'}`}
                                                  >
                                                    <span>{label}</span>
                                                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>&middot;</span>
                                                    <span>{formatCurrency(adj.amount)}</span>
                                                  </span>
                                                );
                                              })}
                                              {adjustments.length > 3 && (
                                                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                  +{adjustments.length - 3} more
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                  {(row.ServiceLine || []).length === 0 && (
                                    <tr>
                                      <td colSpan={9} className={`px-4 py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No service line detail.</td>
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
                                      'Adj Code',
                                      'Amount',
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
                                    const adjustments = getLineAdjustmentSummary(line);
                                    if (adjustments.length === 0) {
                                      return (
                                        <tr key={`supp-${lineIndex}-none`} className={isDark ? (lineIndex % 2 === 0 ? 'bg-[#262a33]' : 'bg-[#2c303a]') : (lineIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
                                          {[
                                            lineIndex + 1,
                                            'N/A',
                                            'N/A',
                                            'N/A',
                                          ].map((val, idx, arr) => (
                                            <td
                                              key={`${lineIndex}-none-${idx}`}
                                              className={`px-4 py-3 text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'} ${isDark ? 'border-[#3f4558]' : 'border-gray-200'} border-b ${idx !== arr.length - 1 ? 'border-r' : ''} ${lineIndex === (row.ServiceLine || []).length - 1 ? (idx === 0 ? 'rounded-bl-2xl' : idx === arr.length - 1 ? 'rounded-br-2xl' : '') : ''}`}
                                            >
                                              {renderTruncated(val, ['72px', '180px', '120px', '260px'][idx] || '180px')}
                                            </td>
                                          ))}
                                        </tr>
                                      );
                                    }

                                    return adjustments.map((adj, adjIndex) => {
                                      const label = `${adj.group} ${adj.reason}`.trim();
                                      const isLastLine = lineIndex === (row.ServiceLine || []).length - 1;
                                      const isLastAdj = adjIndex === adjustments.length - 1;
                                      return (
                                        <tr key={`supp-${lineIndex}-${adjIndex}`} className={isDark ? (lineIndex % 2 === 0 ? 'bg-[#262a33]' : 'bg-[#2c303a]') : (lineIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
                                          {[
                                            lineIndex + 1,
                                            label || 'N/A',
                                            formatCurrency(adj.amount),
                                            formatValue(adj.description || 'N/A'),
                                          ].map((val, idx, arr) => (
                                            <td
                                              key={`${lineIndex}-${adjIndex}-${idx}`}
                                              className={`px-4 py-3 text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'} ${isDark ? 'border-[#3f4558]' : 'border-gray-200'} border-b ${idx !== arr.length - 1 ? 'border-r' : ''} ${isLastLine && isLastAdj ? (idx === 0 ? 'rounded-bl-2xl' : idx === arr.length - 1 ? 'rounded-br-2xl' : '') : ''}`}
                                            >
                                              {renderTruncated(val, ['72px', '180px', '120px', '260px'][idx] || '180px')}
                                            </td>
                                          ))}
                                        </tr>
                                      );
                                    });
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

              <div className={`rounded-2xl border ${isDark ? 'border-[#3f4558] bg-[#1b1f29]' : 'border-gray-200 bg-white'}`}>
                <div className="max-h-[360px] overflow-auto datatable-scroll">
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
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-lg font-semibold">Triage</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {isEligibility && (
                      <button
                        type="button"
                        onClick={showRaw270}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${isDark
                          ? 'bg-[#2d3348] text-white hover:bg-[#39415c]'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                      >
                        Raw 270
                      </button>
                    )}
                    {isPend277 && (
                      <button
                        type="button"
                        onClick={showRaw277}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${isDark
                          ? 'bg-[#2d3348] text-white hover:bg-[#39415c]'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                      >
                        Raw 277
                      </button>
                    )}
                  </div>
                </div>
                <div className={`p-4 border-t ${isDark ? 'bg-[#27282D] border-[#CDCDCD]' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex flex-col gap-3">
                    {isEligibility && (
                      <button
                        type="button"
                        onClick={handleRequest270}
                        disabled={eligibilityLoading || !eligibilityRequest}
                        className={`self-start px-4 py-2 rounded-xl text-xs font-semibold transition ${eligibilityLoading || !eligibilityRequest
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : isDark
                            ? 'bg-[#2d3348] text-white hover:bg-[#39415c]'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                      >
                        {eligibilityLoading ? 'Requesting 270...' : 'Request 270'}
                      </button>
                    )}
                    {isPend277 && (
                      <button
                        type="button"
                        onClick={handleRequest277}
                        disabled={optumLoading || !optumRequest}
                        className={`self-start px-4 py-2 rounded-xl text-xs font-semibold transition ${optumLoading || !optumRequest
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : isDark
                            ? 'bg-[#2d3348] text-white hover:bg-[#39415c]'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                      >
                        {optumLoading ? 'Requesting 277...' : 'Request 277'}
                      </button>
                    )}
                    {triageActions.map((action, idx) => {
                      const isOther =
                        action.allowFreeText ||
                        `${action.label || ""}`.trim().toLowerCase() === "other";
                      const transactionOptions = Array.isArray(action.transactionOptions)
                        ? action.transactionOptions
                        : [];
                      const selectedOption = transactionOptions.find(
                        (option) => option.value === action.transactionCode
                      );
                      return (
                        <div key={`triage-${idx}`} className="flex flex-col gap-2">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <label className="inline-flex items-center gap-3 text-sm cursor-pointer select-none min-w-0 sm:flex-1">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={action.checked}
                                onChange={() =>
                                  setTriageActions((prev) =>
                                    prev.map((item, i) =>
                                      i === idx
                                        ? {
                                          ...item,
                                          checked: !item.checked,
                                          transactionCode: item.checked ? "" : item.transactionCode,
                                        }
                                        : item
                                    )
                                  )
                                }
                              />
                              <span
                                className={`relative h-7 w-7 rounded-lg border transition-all duration-200
                                  ${isDark ? 'border-[#4B4F5A] bg-[#2B2F36]' : 'border-gray-300 bg-white'}
                                  peer-checked:border-[#6f7074] peer-checked:bg-[#24252a] peer-checked:shadow-[0_2px_6px_rgba(0,0,0,0.35)]
                                  peer-checked:[&>svg]:opacity-100
                                  `}
                              >
                                <svg
                                  className="absolute inset-0 m-auto h-4 w-4 opacity-0 transition-opacity duration-150"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  stroke="#F4F4F4"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3.5 8.5L6.5 11.5L12.5 4.5" />
                                </svg>
                              </span>
                              <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>{action.label}</span>
                            </label>
                            {transactionOptions.length > 0 && action.checked && (
                              <div
                                ref={(el) => {
                                  if (el) {
                                    triageDropdownRefs.current[idx] = el;
                                  }
                                }}
                                className="relative w-full sm:w-[260px] shrink-0"
                              >
                                <button
                                  type="button"
                                  disabled={!action.checked}
                                  onClick={() =>
                                    setOpenTriageDropdown((prev) =>
                                      prev === idx ? null : idx
                                    )
                                  }
                                  className={`w-full rounded-lg border px-3 py-1.5 text-left text-sm focus:outline-none focus:ring-2 focus:ring-[#6f7074] focus:border-[#6f7074] disabled:opacity-60 flex items-center justify-between gap-2 ${isDark ? 'bg-[#3C3D42] border-[#1f2433] text-gray-100' : 'bg-white border-gray-200 text-gray-800'}`}
                                >
                                  <span className="truncate">
                                    {selectedOption?.label || "Select transaction code..."}
                                  </span>
                                  <svg
                                    className={`h-4 w-4 transition-transform ${openTriageDropdown === idx ? 'rotate-180' : ''} ${isDark ? 'text-gray-300' : 'text-gray-500'}`}
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M6 8l4 4 4-4" />
                                  </svg>
                                </button>
                                {openTriageDropdown === idx && action.checked && (
                                  <div
                                    className={`triage-dropdown absolute z-20 mt-2 max-h-48 w-full overflow-y-auto rounded-lg border shadow-lg ${isDark ? 'border-[#1f2433] bg-[#24252a]' : 'border-gray-200 bg-white'}`}
                                  >
                                    {transactionOptions.map((option) => (
                                      <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                          setTriageActions((prev) =>
                                            prev.map((item, i) =>
                                              i === idx
                                                ? { ...item, transactionCode: option.value }
                                                : item
                                            )
                                          );
                                          setOpenTriageDropdown(null);
                                        }}
                                        className={`triage-dropdown-item w-full px-3 py-2 text-left text-sm ${isDark ? 'text-[#F4F4F4]' : 'text-gray-800'}`}
                                      >
                                        {option.label}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          {isOther && (
                            <input
                              type="text"
                              value={triageOtherText}
                              onChange={(e) => setTriageOtherText(e.target.value)}
                              disabled={!action.checked}
                              placeholder="Enter other action..."
                              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#6f7074] focus:border-[#6f7074] disabled:opacity-60 ${isDark ? 'bg-[#3C3D42] border-[#1f2433] text-gray-100' : 'bg-white border-gray-200 text-gray-800'}`}
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
                    className="px-6 py-3 text-sm font-medium text-[#F4F4F4] rounded-lg transition-all duration-200 bg-[#1f3025] hover:bg-[#353639] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
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
                                .filter((item) => isAfterActionDate(item.CheckDate))
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
                        className={`w-full p-3 border border-gray-300 rounded-lg text-[14px]   focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  `}
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
                      <button className='text-[14px] text-gray-500' onClick={handleOpenNotesHistory}>View Notes</button>
                    </div>
                    <div className="relative mt-5">
                      <div className={`${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} absolute -top-2.5 left-2  px-1 text-[12px] text-gray-400`}>
                        Leave Note
                      </div>
                      <textarea
                        className={`w-full p-3 border ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  border-gray-300 rounded-lg text-[14px]   focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500`}
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
                      <button className='bg-[#3b3f46] text-white text-[14px] px-4 py-3 rounded-lg' onClick={onSubmitClaim}>Save Changes</button>
                    </div>
                  </div>
                </div>


                <div className="comment flex flex-col w-full h-full gap-4  mt-8">
                  <div className="flex flex-row justify-items-start items-start gap-2">
                    <h1 className="font-bold ">
                      Your Comments
                    </h1>
                    <button className="text-gray-600" onClick={() => {
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
                              className={`w-full p-3 border border-gray-300 rounded-lg text-[14px] ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500`}
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
                              className={`w-full p-3 border border-gray-300 rounded-lg text-[14px] ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500`}
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
                              className={`w-full p-3 border border-gray-300 rounded-lg text-[14px] ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500`}
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
                              className={`w-full p-3 border border-gray-300 rounded-lg text-[14px] ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500`}
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
                              className={`w-full p-3 border border-gray-300 rounded-lg text-[14px] ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500`}
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
                              className={`w-full min-h-[120px] p-3 border border-gray-300 rounded-lg text-[14px] ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'} focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 font-mono resize-y`}
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
                              className={`w-full p-3 border border-gray-300 rounded-lg text-[14px] ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500`}
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
                              className={`w-full p-3 border border-gray-300 rounded-lg text-[14px] ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-700'}  focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500`}
                              value={comment.Evidence2}
                              onChange={(e) => setComment({ ...comment, Evidence2: e.target.value })}
                            />
                          </div>
                        </div>


                      </div>
                      {/* Action Buttons */}
                      <div className="flex justify-end mb-3 gap-3 mt-6">
                        <button
                          className="px-6 py-3 text-sm font-medium text-gray-600 bg-[#E5E7EB] rounded-lg  transition-colors duration-200"
                          onClick={() => {
                            setShowComment(false)
                            scrollToTop()
                          }

                          }
                        >
                          Cancel
                        </button>
                        <button
                          className="px-6 py-3 text-sm font-medium text-white bg-[#3b3f46] rounded-lg transition-colors duration-200"
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
              <div className="font-semibold bg-[#3a3f46] rounded-lg font-inter text-[16px] px-[20px] py-[12px] text-white cursor-pointer select-none"
                onClick={() => setShowAppealModal(true)}
              >Generate Appeal Letter</div>
              <div className="font-semibold bg-[#3a3f46] rounded-lg font-inter text-[16px] px-[20px] py-[12px] text-white cursor-pointer select-none"
                onClick={onSubmitClaim}>Save</div>
            </div>
          </div> */}
          </>}

        </div>
      )}
      {isPend277 && (
        <Modal
          open={showOptumDetails}
          onClose={() => setShowOptumDetails(false)}
          aria-labelledby="raw-277-title"
        >
          <Box className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[90vh] w-[90vw] max-w-5xl overflow-y-auto rounded-2xl p-6 ${isDark ? 'bg-[#1b1f29] text-gray-100' : 'bg-white text-gray-900'}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p id="raw-277-title" className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Claim Status (277)</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Send a 276 request to Optum and view the 277 response.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRequest277}
                  disabled={optumLoading}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${optumLoading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : isDark
                      ? 'bg-[#2d3348] text-white hover:bg-[#39415c]'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                >
                  {optumLoading ? 'Requesting...' : 'Request 277'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowOptumDetails(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${isDark
                    ? 'bg-[#2b2f36] text-gray-200 hover:bg-[#3a3f4a]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Close
                </button>
              </div>
            </div>
            {optumRequest && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <label className="flex flex-col gap-1">
                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Control Number</span>
                  <input
                    value={optumRequest.controlNumber || ""}
                    onChange={(e) => setOptumRequest((prev) => ({ ...(prev || {}), controlNumber: e.target.value }))}
                    className={`rounded-lg border px-3 py-2 ${isDark ? 'bg-[#10131b] border-[#2f364a] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Trading Partner Service ID</span>
                  <input
                    value={optumRequest.tradingPartnerServiceId || ""}
                    onChange={(e) => setOptumRequest((prev) => ({ ...(prev || {}), tradingPartnerServiceId: e.target.value }))}
                    className={`rounded-lg border px-3 py-2 ${isDark ? 'bg-[#10131b] border-[#2f364a] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </label>
                <label className="flex flex-col gap-1 md:col-span-2">
                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Trading Partner Name</span>
                  <input
                    value={optumRequest.tradingPartnerName || ""}
                    onChange={(e) => setOptumRequest((prev) => ({ ...(prev || {}), tradingPartnerName: e.target.value }))}
                    className={`rounded-lg border px-3 py-2 ${isDark ? 'bg-[#10131b] border-[#2f364a] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Provider Type</span>
                  <input
                    value={(optumRequest.providers && optumRequest.providers[0]?.providerType) || ""}
                    onChange={(e) => updateProviderField("providerType", e.target.value)}
                    className={`rounded-lg border px-3 py-2 ${isDark ? 'bg-[#10131b] border-[#2f364a] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Provider NPI</span>
                  <input
                    value={(optumRequest.providers && optumRequest.providers[0]?.npi) || ""}
                    onChange={(e) => updateProviderField("npi", e.target.value)}
                    className={`rounded-lg border px-3 py-2 ${isDark ? 'bg-[#10131b] border-[#2f364a] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Provider Tax ID</span>
                  <input
                    value={(optumRequest.providers && optumRequest.providers[0]?.taxId) || ""}
                    onChange={(e) => updateProviderField("taxId", e.target.value)}
                    className={`rounded-lg border px-3 py-2 ${isDark ? 'bg-[#10131b] border-[#2f364a] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Subscriber Member ID</span>
                  <input
                    value={optumRequest.subscriber?.memberId || ""}
                    onChange={(e) => updateSubscriberField("memberId", e.target.value)}
                    className={`rounded-lg border px-3 py-2 ${isDark ? 'bg-[#10131b] border-[#2f364a] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Subscriber First Name</span>
                  <input
                    value={optumRequest.subscriber?.firstName || ""}
                    onChange={(e) => updateSubscriberField("firstName", e.target.value)}
                    className={`rounded-lg border px-3 py-2 ${isDark ? 'bg-[#10131b] border-[#2f364a] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Subscriber Last Name</span>
                  <input
                    value={optumRequest.subscriber?.lastName || ""}
                    onChange={(e) => updateSubscriberField("lastName", e.target.value)}
                    className={`rounded-lg border px-3 py-2 ${isDark ? 'bg-[#10131b] border-[#2f364a] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Date of Service</span>
                  <input
                    type="date"
                    value={optumRequest.encounter?.beginningDateOfService || ""}
                    onChange={(e) => {
                      updateEncounterField("beginningDateOfService", e.target.value);
                      updateEncounterField("endDateOfService", e.target.value);
                      updateServiceLineField("serviceLineDate", e.target.value);
                    }}
                    className={`rounded-lg border px-3 py-2 ${isDark ? 'bg-[#10131b] border-[#2f364a] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Submitted Amount</span>
                  <input
                    value={optumRequest.encounter?.submittedAmount || ""}
                    onChange={(e) => updateEncounterField("submittedAmount", e.target.value)}
                    className={`rounded-lg border px-3 py-2 ${isDark ? 'bg-[#10131b] border-[#2f364a] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Procedure Code</span>
                  <input
                    value={optumRequest.serviceLineInformation?.procedureCode || ""}
                    onChange={(e) => updateServiceLineField("procedureCode", e.target.value)}
                    className={`rounded-lg border px-3 py-2 ${isDark ? 'bg-[#10131b] border-[#2f364a] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Procedure Modifiers (comma-separated)</span>
                  <input
                    value={(optumRequest.serviceLineInformation?.procedureModifiers || []).join(", ")}
                    onChange={(e) => updateServiceLineField(
                      "procedureModifiers",
                      e.target.value.split(",").map((item) => item.trim()).filter(Boolean)
                    )}
                    className={`rounded-lg border px-3 py-2 ${isDark ? 'bg-[#10131b] border-[#2f364a] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </label>
              </div>
            )}
            {optumError && (
              <div className={`mt-4 text-sm ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                {optumError}
              </div>
            )}
            {optumResponse && (
              <div className={`mt-4 rounded-xl border p-4 ${isDark ? 'border-[#30354a] bg-[#10131b]' : 'border-gray-200 bg-white'}`}>
                <p className={`text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Latest 277 Response</p>
                <div className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Control Number: {optumResponse.controlNumber || "N/A"}
                </div>
                {(optumResponse.claims || []).map((claim, idx) => {
                  const status = claim?.claimStatus || {};
                  const statusValue = status.statusCategoryCodeValue || status.statusCodeValue || "";
                  const insightLabel = getInsightStatusLabel(statusValue);
                  return (
                    <div key={`optum-claim-${idx}`} className="mt-3 text-sm">
                      <div className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        Status: {insightLabel || "Pending"}
                      </div>
                      <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {statusValue || "No status description available."}
                      </div>
                      <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Effective Date: {status.effectiveDate || "N/A"}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Box>
        </Modal>
      )}
      {isEligibility && (
        <Modal
          open={showEligibilityDetails}
          onClose={() => setShowEligibilityDetails(false)}
          aria-labelledby="raw-270-title"
        >
          <Box className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[90vh] w-[90vw] max-w-4xl overflow-y-auto rounded-2xl p-6 ${isDark ? 'bg-[#1b1f29] text-gray-100' : 'bg-white text-gray-900'}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p id="raw-270-title" className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Eligibility (270)</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Send a 270 request and view the 271 response.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRequest270}
                  disabled={eligibilityLoading || !eligibilityRequest}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${eligibilityLoading || !eligibilityRequest
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : isDark
                      ? 'bg-[#2d3348] text-white hover:bg-[#39415c]'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                >
                  {eligibilityLoading ? 'Requesting 270...' : 'Request 270'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEligibilityDetails(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${isDark
                    ? 'bg-[#2b2f36] text-gray-200 hover:bg-[#3a3f4a]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Close
                </button>
              </div>
            </div>
            {eligibilityRequest && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <label className="flex flex-col gap-1">
                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Payer ID</span>
                  <input
                    value={eligibilityRequest.payerId || ""}
                    onChange={(e) => setEligibilityRequest((prev) => ({ ...(prev || {}), payerId: e.target.value }))}
                    className={`rounded-lg border px-3 py-2 ${isDark ? 'bg-[#10131b] border-[#2f364a] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Payer Name</span>
                  <input
                    value={eligibilityRequest.payerName || ""}
                    onChange={(e) => setEligibilityRequest((prev) => ({ ...(prev || {}), payerName: e.target.value }))}
                    className={`rounded-lg border px-3 py-2 ${isDark ? 'bg-[#10131b] border-[#2f364a] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Member ID</span>
                  <input
                    value={eligibilityRequest.memberId || ""}
                    onChange={(e) => setEligibilityRequest((prev) => ({ ...(prev || {}), memberId: e.target.value }))}
                    className={`rounded-lg border px-3 py-2 ${isDark ? 'bg-[#10131b] border-[#2f364a] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Patient DOB</span>
                  <input
                    type="date"
                    value={normalizeDateInput(eligibilityRequest.patientDob || "")}
                    onChange={(e) => setEligibilityRequest((prev) => ({ ...(prev || {}), patientDob: e.target.value }))}
                    className={`rounded-lg border px-3 py-2 ${isDark ? 'bg-[#10131b] border-[#2f364a] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Patient First Name</span>
                  <input
                    value={eligibilityRequest.patientFirstName || ""}
                    onChange={(e) => setEligibilityRequest((prev) => ({ ...(prev || {}), patientFirstName: e.target.value }))}
                    className={`rounded-lg border px-3 py-2 ${isDark ? 'bg-[#10131b] border-[#2f364a] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Patient Last Name</span>
                  <input
                    value={eligibilityRequest.patientLastName || ""}
                    onChange={(e) => setEligibilityRequest((prev) => ({ ...(prev || {}), patientLastName: e.target.value }))}
                    className={`rounded-lg border px-3 py-2 ${isDark ? 'bg-[#10131b] border-[#2f364a] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </label>
                <label className="flex flex-col gap-1 md:col-span-2">
                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Date of Service</span>
                  <input
                    type="date"
                    value={normalizeDateInput(eligibilityRequest.serviceDate || "")}
                    onChange={(e) => setEligibilityRequest((prev) => ({ ...(prev || {}), serviceDate: e.target.value }))}
                    className={`rounded-lg border px-3 py-2 ${isDark ? 'bg-[#10131b] border-[#2f364a] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </label>
              </div>
            )}
            {eligibilityError && (
              <div className={`mt-4 text-sm ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                {eligibilityError}
              </div>
            )}
            {eligibilityResponse && (
              <div className={`mt-4 rounded-xl border p-4 text-xs ${isDark ? 'border-[#30354a] bg-[#10131b] text-gray-200' : 'border-gray-200 bg-white text-gray-700'}`}>
                <div className="font-semibold mb-2">Latest 271 Response</div>
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify(eligibilityResponse, null, 2)}
                </pre>
              </div>
            )}
          </Box>
        </Modal>
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


