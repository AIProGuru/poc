import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Papa from "papaparse";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../components/demo-layout/Header";
import { useApiEndpoint } from "../ApiEndpointContext";

const LIFECYCLE_COLUMNS = [
  { key: "effectiveYear", label: "Effective Year", aliases: ["effective year", "year"], inputType: "number", placeholder: "2026" },
  { key: "expiresOn", label: "Expires On", aliases: ["expires on", "expiry", "expiration"], inputType: "date" },
];

const CONFIG_TABS = [
  {
    id: "carc",
    label: "CARC Mapping",
    columns: [
      { key: "carcCode", label: "CARC Code", aliases: ["code", "carc", "carc code"] },
      { key: "carcDescription", label: "CARC Description", aliases: ["description", "carc description"] },
      { key: "category", label: "Category", aliases: ["category"] },
      ...LIFECYCLE_COLUMNS,
    ],
  },
  {
    id: "rarc",
    label: "RARC Mapping",
    columns: [
      { key: "rarcCode", label: "RARC Code", aliases: ["code", "rarc", "rarc code"] },
      { key: "rarcDescription", label: "RARC Description", aliases: ["description", "rarc description"] },
      { key: "category", label: "Category", aliases: ["category"] },
      ...LIFECYCLE_COLUMNS,
    ],
  },
  {
    id: "actionCodes",
    label: "Action Codes",
    columns: [
      { key: "actionCode", label: "Action Code", aliases: ["action code", "action codes", "code"] },
      { key: "category", label: "Category", aliases: ["category"] },
      { key: "tickleTime", label: "Tickle Time", aliases: ["tickle time"] },
      ...LIFECYCLE_COLUMNS,
    ],
  },
];

const buildEmptyDatasetState = () =>
  Object.fromEntries(CONFIG_TABS.map((tab) => [tab.id, []]));

const normalizeHeader = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const normalizeValue = (value) => String(value ?? "").trim();

const buildDraftRow = (tabId, row = {}) => ({
  id: `draft-${tabId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  isDraft: true,
  isDirty: true,
  saving: false,
  ...row,
});

const rowPayload = (config, row) => {
  const payload = {};
  config.columns.forEach(({ key }) => {
    payload[key] = normalizeValue(row[key]);
  });
  return payload;
};

const parseDelimitedFile = (file) =>
  new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors?.length) {
          reject(new Error(results.errors[0].message || "Unable to parse file."));
          return;
        }
        resolve(results.data || []);
      },
      error: (error) => reject(error),
    });
  });

const parseUploadFile = async (file) => {
  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
    throw new Error("Excel parsing is not enabled here yet. Please upload CSV, TSV, or TXT.");
  }
  return parseDelimitedFile(file);
};

const mapUploadedRows = (records, config) =>
  records
    .map((record) => {
      const normalizedRecord = Object.entries(record || {}).reduce((accumulator, [key, value]) => {
        accumulator[normalizeHeader(key)] = value;
        return accumulator;
      }, {});

      const row = {};
      config.columns.forEach((column) => {
        const possibleHeaders = [column.key, column.label, ...(column.aliases || [])].map(normalizeHeader);
        const matchedHeader = possibleHeaders.find((header) => normalizedRecord[header] !== undefined);
        row[column.key] = normalizeValue(matchedHeader ? normalizedRecord[matchedHeader] : "");
      });
      return row;
    })
    .filter((row) => config.columns.some((column) => row[column.key]));

const CODE_FIELD_BY_TAB = {
  carc: "carcCode",
  rarc: "rarcCode",
  actionCodes: "actionCode",
};

const usesNumericCodeSort = (tabId) => tabId === "carc" || tabId === "rarc";

const compareCodeValues = (left, right) => {
  const a = normalizeValue(left);
  const b = normalizeValue(right);
  const aNumeric = /^\d+$/.test(a);
  const bNumeric = /^\d+$/.test(b);
  if (aNumeric && bNumeric) {
    return Number(a) - Number(b);
  }
  if (aNumeric !== bNumeric) {
    return aNumeric ? -1 : 1;
  }
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
};

const compareTextValues = (left, right) =>
  normalizeValue(left).localeCompare(normalizeValue(right), undefined, {
    numeric: true,
    sensitivity: "base",
  });

const SortIndicator = ({ active, direction }) => {
  if (!active) {
    return <span className="ml-1 opacity-40">↕</span>;
  }
  return <span className="ml-1">{direction === "asc" ? "↑" : "↓"}</span>;
};

const GovernanceManagement = () => {
  const navigate = useNavigate();
  const apiUrl = useApiEndpoint();
  const theme = useSelector((state) => state.app.theme);
  const isDark = theme === "dark";
  const fileInputRefs = useRef({});

  const [activeTab, setActiveTab] = useState(CONFIG_TABS[0].id);
  const [datasets, setDatasets] = useState(buildEmptyDatasetState);
  const [loadingTab, setLoadingTab] = useState("");
  const [uploadingTab, setUploadingTab] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [sortConfig, setSortConfig] = useState({ field: "code", direction: "asc" });
  const [categoryFilter, setCategoryFilter] = useState("");

  const activeConfig = useMemo(
    () => CONFIG_TABS.find((tab) => tab.id === activeTab) || CONFIG_TABS[0],
    [activeTab]
  );
  const activeRows = datasets[activeTab] || [];
  const codeField = CODE_FIELD_BY_TAB[activeTab];
  const supportsTableSorting = Boolean(codeField);

  const categoryOptions = useMemo(() => {
    if (activeTab !== "actionCodes") return [];
    const categories = new Set();
    activeRows.forEach((row) => {
      const value = normalizeValue(row.category);
      if (value) categories.add(value);
    });
    return Array.from(categories).sort((left, right) => compareTextValues(left, right));
  }, [activeRows, activeTab]);

  const sortedActiveRows = useMemo(() => {
    let draftRows = activeRows.filter((row) => row.isDraft);
    let savedRows = activeRows.filter((row) => !row.isDraft);

    if (activeTab === "actionCodes" && categoryFilter) {
      const matchesCategory = (row) =>
        normalizeValue(row.category).toLowerCase() === categoryFilter.toLowerCase();
      draftRows = draftRows.filter(matchesCategory);
      savedRows = savedRows.filter(matchesCategory);
    }

    if (!supportsTableSorting || !codeField) {
      return [...draftRows, ...savedRows];
    }

    const compareCodes = usesNumericCodeSort(activeTab) ? compareCodeValues : compareTextValues;
    const directionMultiplier = sortConfig.direction === "asc" ? 1 : -1;
    const sortedSavedRows = [...savedRows].sort((left, right) => {
      let result = 0;
      if (sortConfig.field === "category") {
        result = compareTextValues(left.category, right.category);
        if (result === 0) {
          result = compareCodes(left[codeField], right[codeField]);
        }
      } else {
        result = compareCodes(left[codeField], right[codeField]);
        if (result === 0) {
          result = compareTextValues(left.category, right.category);
        }
      }
      return result * directionMultiplier;
    });
    return [...draftRows, ...sortedSavedRows];
  }, [activeRows, activeTab, categoryFilter, codeField, sortConfig, supportsTableSorting]);

  useEffect(() => {
    setSortConfig({ field: "code", direction: "asc" });
    setCategoryFilter("");
  }, [activeTab]);

  const containerClasses = isDark ? "border-[#ffffff14] bg-[#23252b]" : "border-slate-200 bg-white";
  const subduedText = isDark ? "text-[#9ca3af]" : "text-slate-500";
  const inputClasses = isDark
    ? "border-[#ffffff14] bg-[#1b1d22] text-white placeholder:text-[#6b7280] focus:border-cyan-400/60"
    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-cyan-600";

  const loadTabData = useCallback(
    async (tabId, includeInactive = showInactive) => {
      if (!apiUrl) return;
      setLoadingTab(tabId);
      try {
        const response = await axios.get(`${apiUrl}/governance/${tabId}`, {
          withCredentials: true,
          params: includeInactive ? { includeInactive: 1 } : {},
        });
        const rows = Array.isArray(response.data) ? response.data : [];
        setDatasets((current) => ({
          ...current,
          [tabId]: rows.map((row) => ({
            ...row,
            id: `${row.id}`,
            isDraft: false,
            isDirty: false,
            saving: false,
          })),
        }));
      } catch (error) {
        toast.error(error?.response?.data?.error || `Could not load ${tabId} mappings.`);
        setDatasets((current) => ({ ...current, [tabId]: [] }));
      } finally {
        setLoadingTab("");
      }
    },
    [apiUrl, showInactive]
  );

  useEffect(() => {
    loadTabData(activeTab, showInactive);
  }, [activeTab, showInactive, loadTabData]);

  const handleAddRow = (tabId) => {
    const config = CONFIG_TABS.find((tab) => tab.id === tabId);
    const emptyRow = Object.fromEntries(config.columns.map((column) => [column.key, ""]));
    if (tabId === "actionCodes" && categoryFilter) {
      emptyRow.category = categoryFilter;
    }
    setDatasets((current) => ({
      ...current,
      [tabId]: [buildDraftRow(tabId, emptyRow), ...current[tabId]],
    }));
  };

  const handleRowChange = (tabId, rowId, field, value) => {
    setDatasets((current) => ({
      ...current,
      [tabId]: current[tabId].map((row) =>
        row.id === rowId ? { ...row, [field]: value, isDirty: true } : row
      ),
    }));
  };

  const handleSaveRow = async (tabId, row) => {
    if (!apiUrl) return;
    const config = CONFIG_TABS.find((tab) => tab.id === tabId);
    const payload = rowPayload(config, row);

    setDatasets((current) => ({
      ...current,
      [tabId]: current[tabId].map((item) =>
        item.id === row.id ? { ...item, saving: true } : item
      ),
    }));

    try {
      let savedRow = null;
      if (row.isDraft) {
        const response = await axios.post(`${apiUrl}/governance/${tabId}`, payload, {
          withCredentials: true,
        });
        savedRow = response.data;
      } else {
        const response = await axios.put(`${apiUrl}/governance/${tabId}/${encodeURIComponent(row.id)}`, payload, {
          withCredentials: true,
        });
        savedRow = response.data;
      }

      setDatasets((current) => ({
        ...current,
        [tabId]: current[tabId].map((item) =>
          item.id === row.id
            ? {
                ...savedRow,
                id: `${savedRow.id}`,
                isDraft: false,
                isDirty: false,
                saving: false,
              }
            : item
        ),
      }));
      toast.success("Row saved.");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Could not save row.");
      setDatasets((current) => ({
        ...current,
        [tabId]: current[tabId].map((item) =>
          item.id === row.id ? { ...item, saving: false } : item
        ),
      }));
    }
  };

  const handleDeleteRow = async (tabId, row) => {
    if (row.isDraft) {
      setDatasets((current) => ({
        ...current,
        [tabId]: current[tabId].filter((item) => item.id !== row.id),
      }));
      return;
    }

    if (!apiUrl) return;
    const confirmed = window.confirm(
      "Retire this code? It will be hidden from active use but kept for history."
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${apiUrl}/governance/${tabId}/${encodeURIComponent(row.id)}`, {
        withCredentials: true,
      });
      setDatasets((current) => ({
        ...current,
        [tabId]: current[tabId].filter((item) => item.id !== row.id),
      }));
      toast.success("Row retired.");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Could not remove row.");
    }
  };

  const handleSort = (field) => {
    setSortConfig((current) =>
      current.field === field
        ? { field, direction: current.direction === "asc" ? "desc" : "asc" }
        : { field, direction: "asc" }
    );
  };

  const handleFileUpload = async (tabId, file) => {
    if (!file || !apiUrl) return;

    const config = CONFIG_TABS.find((tab) => tab.id === tabId);
    setUploadingTab(tabId);

    try {
      const parsedRecords = await parseUploadFile(file);
      const mappedRows = mapUploadedRows(parsedRecords, config);

      if (!mappedRows.length) {
        toast.error(`No usable ${config.label} rows were found in ${file.name}.`);
        return;
      }

      const savedRows = [];
      for (const mappedRow of mappedRows) {
        const response = await axios.post(`${apiUrl}/governance/${tabId}`, mappedRow, {
          withCredentials: true,
        });
        savedRows.push({
          ...response.data,
          id: `${response.data.id}`,
          isDraft: false,
          isDirty: false,
          saving: false,
        });
      }

      setDatasets((current) => ({
        ...current,
        [tabId]: [...current[tabId], ...savedRows],
      }));
      toast.success(`Imported ${savedRows.length} row${savedRows.length === 1 ? "" : "s"}.`);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message || "Upload failed.");
    } finally {
      setUploadingTab("");
      if (fileInputRefs.current[tabId]) {
        fileInputRefs.current[tabId].value = "";
      }
    }
  };

  return (
    <div
      className={`min-h-screen overflow-x-hidden ${
        isDark ? "bg-[#1e1f24] text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-start gap-4">
          <button
            type="button"
            onClick={() => navigate("/clientmanagement")}
            className={`mt-1 rounded-lg p-2 transition ${
              isDark
                ? "bg-[#ffffff10] hover:bg-[#ffffff20]"
                : "border border-slate-200 bg-white hover:bg-slate-100"
            }`}
            aria-label="Back to Client Management"
            title="Back to Client Management"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 12H5M5 12L12 19M5 12L12 5"
                stroke={isDark ? "white" : "#0F172A"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div>
            <h1 className="mb-2 text-2xl font-bold">Governance Management</h1>
            <p className={subduedText}>
              A standardized framework for rules, processes, and CMS codes to ensure consistency and compliance across all clients.
            </p>
          </div>
        </div>

        <div className={`mb-6 rounded-2xl border p-3 ${containerClasses}`}>
          <div className="grid gap-3 md:grid-cols-3">
            {CONFIG_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    isActive
                      ? isDark
                        ? "border-cyan-400/60 bg-cyan-500/10"
                        : "border-cyan-600 bg-cyan-50"
                      : isDark
                        ? "border-[#ffffff10] bg-[#1b1d22] hover:border-[#ffffff24]"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <p className="text-sm font-semibold">{tab.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        <section className={`rounded-2xl border p-6 ${containerClasses}`}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">{activeConfig.label}</h2>
              {loadingTab === activeTab && (
                <p className={`mt-1 text-sm ${subduedText}`}>Loading saved rows...</p>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <input
                ref={(node) => {
                  fileInputRefs.current[activeTab] = node;
                }}
                type="file"
                accept=".csv,.txt,.tsv,.xls,.xlsx"
                className="hidden"
                onChange={(event) => handleFileUpload(activeTab, event.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => handleAddRow(activeTab)}
                disabled={!apiUrl || loadingTab === activeTab}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isDark
                    ? "bg-[#ffffff12] text-white hover:bg-[#ffffff1f] disabled:opacity-50"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                }`}
              >
                Add Row
              </button>
              <button
                type="button"
                onClick={() => fileInputRefs.current[activeTab]?.click()}
                disabled={!apiUrl || uploadingTab === activeTab || loadingTab === activeTab}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isDark
                    ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
                    : "bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
                }`}
              >
                {uploadingTab === activeTab ? "Uploading..." : "Upload File"}
              </button>
            </div>
          </div>

          {!apiUrl && (
            <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${isDark ? "border-amber-500/30 bg-amber-500/10 text-amber-100" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
              Select a tenant context before editing governance mappings.
            </div>
          )}

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {activeTab === "actionCodes" && (
                <>
                  <label className={`inline-flex items-center gap-2 text-sm ${subduedText}`}>
                    <span>Filter by category</span>
                    <select
                      value={categoryFilter}
                      onChange={(event) => setCategoryFilter(event.target.value)}
                      className={`rounded-lg border px-3 py-2 text-sm outline-none transition ${inputClasses}`}
                    >
                      <option value="">All categories</option>
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              )}
            </div>
            <label className={`inline-flex items-center gap-2 text-sm ${subduedText}`}>
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(event) => setShowInactive(event.target.checked)}
                className="rounded border-gray-400"
              />
              Show retired codes
            </label>
          </div>

          {sortedActiveRows.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    {activeConfig.columns.map((column) => {
                      const isCodeColumn = column.key === codeField;
                      const isCategoryColumn = column.key === "category";
                      const isSortable = supportsTableSorting && (isCodeColumn || isCategoryColumn);
                      const sortField = isCategoryColumn ? "category" : "code";

                      return (
                        <th
                          key={column.key}
                          className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] ${
                            isDark ? "text-[#9ca3af]" : "text-slate-500"
                          }`}
                        >
                          {isSortable ? (
                            <button
                              type="button"
                              onClick={() => handleSort(sortField)}
                              className={`inline-flex items-center transition ${
                                isDark ? "hover:text-white" : "hover:text-slate-800"
                              }`}
                            >
                              {column.label}
                              <SortIndicator
                                active={sortConfig.field === sortField}
                                direction={sortConfig.direction}
                              />
                            </button>
                          ) : (
                            column.label
                          )}
                        </th>
                      );
                    })}
                    <th
                      className={`px-3 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] ${
                        isDark ? "text-[#9ca3af]" : "text-slate-500"
                      }`}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedActiveRows.map((row) => (
                    <tr
                      key={row.id}
                      className={row.isActive === false ? (isDark ? "opacity-60" : "opacity-70") : ""}
                    >
                      {activeConfig.columns.map((column) => (
                        <td key={`${row.id}-${column.key}`} className="px-3 py-2">
                          <input
                            type={column.inputType || "text"}
                            value={row[column.key] || ""}
                            onChange={(event) =>
                              handleRowChange(activeTab, row.id, column.key, event.target.value)
                            }
                            placeholder={column.placeholder}
                            className={`w-full rounded-lg border px-3 py-2 outline-none transition ${inputClasses} ${
                              column.key === "tickleTime"
                                ? "min-w-[72px] max-w-[96px]"
                                : column.inputType === "date"
                                  ? "min-w-[150px] max-w-[170px]"
                                  : column.key === "effectiveYear"
                                    ? "min-w-[96px] max-w-[110px]"
                                    : "min-w-[180px]"
                            }`}
                          />
                        </td>
                      ))}
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          {row.isActive === false && (
                            <span className={`self-center rounded-full px-2 py-1 text-[11px] ${isDark ? "bg-white/10 text-gray-300" : "bg-slate-200 text-slate-600"}`}>
                              Retired
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSaveRow(activeTab, row)}
                            disabled={!apiUrl || row.saving || (!row.isDraft && !row.isDirty)}
                            className={`rounded-lg px-3 py-2 text-sm transition disabled:opacity-50 ${
                              isDark
                                ? "bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30"
                                : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                            }`}
                          >
                            {row.saving ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(activeTab, row)}
                            disabled={row.saving}
                            className={`rounded-lg px-3 py-2 text-sm transition ${
                              isDark
                                ? "bg-rose-500/15 text-rose-200 hover:bg-rose-500/25"
                                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                            }`}
                          >
                            {row.isDraft ? "Remove" : "Retire"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              className={`rounded-2xl border border-dashed px-6 py-12 text-center ${
                isDark ? "border-[#ffffff14] bg-[#1b1d22]" : "border-slate-300 bg-slate-50"
              }`}
            >
              <p className="text-sm font-medium">
                {loadingTab === activeTab
                  ? "Loading rows..."
                  : activeRows.length && categoryFilter
                    ? "No action codes match the selected category."
                    : "No rows yet."}
              </p>
              {!loadingTab && (
                <p className={`mt-2 text-sm ${subduedText}`}>
                  Add a row, enter values, then click Save to persist it.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default GovernanceManagement;
