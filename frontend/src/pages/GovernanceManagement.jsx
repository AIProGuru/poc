import { useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../components/demo-layout/Header";

const CONFIG_TABS = [
  {
    id: "carc",
    shortLabel: "CARC",
    label: "CARC Mapping",
    description: "Maintain Claim Adjustment Reason Code mappings and categories.",
    columns: [
      {
        key: "carcCode",
        label: "CARC Code",
        placeholder: "CO-45",
        aliases: ["code", "carc", "carc code", "claim adjustment reason code"],
      },
      {
        key: "carcDescription",
        label: "CARC Description",
        placeholder: "Charge exceeds fee schedule",
        aliases: ["description", "carc description", "reason description"],
      },
      {
        key: "category",
        label: "Category",
        placeholder: "Pricing",
        aliases: ["category", "mapping category"],
      },
    ],
  },
  {
    id: "rarc",
    shortLabel: "RARC",
    label: "RARC Mapping",
    description: "Capture Remittance Advice Remark Code definitions and category groupings.",
    columns: [
      {
        key: "rarcCode",
        label: "RARC Code",
        placeholder: "M15",
        aliases: ["code", "rarc", "rarc code", "remark code"],
      },
      {
        key: "rarcDescription",
        label: "RARC Description",
        placeholder: "Missing referral number",
        aliases: ["description", "rarc description", "remark description"],
      },
      {
        key: "category",
        label: "Category",
        placeholder: "Authorization",
        aliases: ["category", "mapping category"],
      },
    ],
  },
  {
    id: "actionCodes",
    shortLabel: "Action Codes",
    label: "Action Codes",
    description: "Track operational actions and the expected tickle time for follow-up.",
    columns: [
      {
        key: "category",
        label: "Category",
        placeholder: "Appeal",
        aliases: ["category", "action category"],
      },
      {
        key: "actionCode",
        label: "Action Codes",
        placeholder: "SEND_APPEAL",
        aliases: ["action code", "action codes", "code"],
      },
      {
        key: "tickleTime",
        label: "Tickle Time",
        placeholder: "7 days",
        aliases: ["tickle time", "follow up time", "follow-up time", "sla"],
      },
    ],
  },
];

const buildEmptyFormState = () =>
  Object.fromEntries(
    CONFIG_TABS.map((tab) => [
      tab.id,
      Object.fromEntries(tab.columns.map((column) => [column.key, ""])),
    ])
  );

const buildEmptyDatasetState = () =>
  Object.fromEntries(CONFIG_TABS.map((tab) => [tab.id, []]));

const buildEmptyUploadState = () =>
  Object.fromEntries(CONFIG_TABS.map((tab) => [tab.id, { fileName: "", importedCount: 0 }]));

const normalizeHeader = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const normalizeCellValue = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return String(value);
  return String(value).trim();
};

const buildRowWithId = (tabId, row) => ({
  id: `${tabId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  ...row,
});

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
    throw new Error("Excel parsing is pending package enablement. Please upload the sheet as CSV, TSV, or TXT.");
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

      const mappedRow = {};
      config.columns.forEach((column) => {
        const candidateHeaders = [column.key, column.label, ...(column.aliases || [])].map(normalizeHeader);
        const matchedHeader = candidateHeaders.find((header) => normalizedRecord[header] !== undefined);
        mappedRow[column.key] = normalizeCellValue(
          matchedHeader ? normalizedRecord[matchedHeader] : ""
        );
      });

      return mappedRow;
    })
    .filter((row) => config.columns.some((column) => row[column.key]));

const downloadTemplate = (config) => {
  const headerRow = config.columns.map((column) => column.label).join(",");
  const blob = new Blob([`${headerRow}\n`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${config.label.toLowerCase().replace(/\s+/g, "_")}_template.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
};

const GovernanceManagement = () => {
  const navigate = useNavigate();
  const theme = useSelector((state) => state.app.theme);
  const isDark = theme === "dark";
  const fileInputRefs = useRef({});

  const [activeTab, setActiveTab] = useState(CONFIG_TABS[0].id);
  const [datasets, setDatasets] = useState(buildEmptyDatasetState);
  const [forms, setForms] = useState(buildEmptyFormState);
  const [uploadState, setUploadState] = useState(buildEmptyUploadState);
  const [uploadingTab, setUploadingTab] = useState("");

  const activeConfig = useMemo(
    () => CONFIG_TABS.find((tab) => tab.id === activeTab) || CONFIG_TABS[0],
    [activeTab]
  );
  const activeRows = datasets[activeTab] || [];
  const activeForm = forms[activeTab] || {};
  const totalRecords = Object.values(datasets).reduce((sum, rows) => sum + rows.length, 0);

  const cardClasses = isDark
    ? "border-[#ffffff14] bg-[#23252b] shadow-[0_20px_45px_rgba(15,23,42,0.25)]"
    : "border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]";

  const subduedText = isDark ? "text-[#9ca3af]" : "text-slate-500";
  const inputClasses = isDark
    ? "border-[#ffffff14] bg-[#1b1d22] text-white placeholder:text-[#6b7280] focus:border-cyan-400/60"
    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-cyan-600";

  const handleFormChange = (tabId, field, value) => {
    setForms((current) => ({
      ...current,
      [tabId]: {
        ...current[tabId],
        [field]: value,
      },
    }));
  };

  const resetForm = (tabId) => {
    setForms((current) => ({
      ...current,
      [tabId]: Object.fromEntries(
        CONFIG_TABS.find((tab) => tab.id === tabId).columns.map((column) => [column.key, ""])
      ),
    }));
  };

  const handleAddManualRow = (tabId) => {
    const config = CONFIG_TABS.find((tab) => tab.id === tabId);
    const draftRow = forms[tabId];
    const missingFields = config.columns.filter((column) => !String(draftRow[column.key] || "").trim());

    if (missingFields.length) {
      toast.error(`Complete all fields for ${config.label} before adding the row.`);
      return;
    }

    const cleanedRow = Object.fromEntries(
      config.columns.map((column) => [column.key, normalizeCellValue(draftRow[column.key])])
    );

    setDatasets((current) => ({
      ...current,
      [tabId]: [...current[tabId], buildRowWithId(tabId, cleanedRow)],
    }));
    resetForm(tabId);
    toast.success(`${config.label} row added.`);
  };

  const handleRowChange = (tabId, rowId, field, value) => {
    setDatasets((current) => ({
      ...current,
      [tabId]: current[tabId].map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    }));
  };

  const handleDeleteRow = (tabId, rowId) => {
    setDatasets((current) => ({
      ...current,
      [tabId]: current[tabId].filter((row) => row.id !== rowId),
    }));
  };

  const handleClearAll = (tabId) => {
    const config = CONFIG_TABS.find((tab) => tab.id === tabId);
    setDatasets((current) => ({ ...current, [tabId]: [] }));
    setUploadState((current) => ({ ...current, [tabId]: { fileName: "", importedCount: 0 } }));
    toast.info(`${config.label} has been cleared.`);
  };

  const handleFileUpload = async (tabId, file) => {
    if (!file) return;

    const config = CONFIG_TABS.find((tab) => tab.id === tabId);
    setUploadingTab(tabId);

    try {
      const parsedRecords = await parseUploadFile(file);
      const mappedRows = mapUploadedRows(parsedRecords, config);

      if (!mappedRows.length) {
        toast.error(`No usable ${config.label} rows were found in ${file.name}.`);
        return;
      }

      setDatasets((current) => ({
        ...current,
        [tabId]: [...current[tabId], ...mappedRows.map((row) => buildRowWithId(tabId, row))],
      }));
      setUploadState((current) => ({
        ...current,
        [tabId]: { fileName: file.name, importedCount: mappedRows.length },
      }));
      toast.success(`Imported ${mappedRows.length} ${config.label} row${mappedRows.length === 1 ? "" : "s"}.`);
    } catch (error) {
      toast.error(`Upload failed for ${config.label}: ${error.message}`);
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
      <div className="container mx-auto px-4 py-10">
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
          <div className="flex-1">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold tracking-tight">Governance Management</h1>
                <p className={subduedText}>
                  Configure CARC, RARC, and Action Code mappings through manual entry or bulk file upload.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={`mb-8 rounded-3xl border p-3 ${cardClasses}`}>
          <div className="grid gap-3 md:grid-cols-3">
            {CONFIG_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-2xl border px-5 py-4 text-left transition ${
                    isActive
                      ? isDark
                        ? "border-cyan-400/60 bg-cyan-500/10"
                        : "border-cyan-600 bg-cyan-50"
                      : isDark
                        ? "border-[#ffffff10] bg-[#1b1d22] hover:border-[#ffffff24]"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{tab.label}</p>
                      <p className={`mt-1 text-xs ${subduedText}`}>{tab.description}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        isActive
                          ? isDark
                            ? "bg-cyan-400/20 text-cyan-200"
                            : "bg-cyan-100 text-cyan-800"
                          : isDark
                            ? "bg-[#ffffff12] text-[#d1d5db]"
                            : "bg-white text-slate-600"
                      }`}
                    >
                      {datasets[tab.id].length} rows
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className={`rounded-3xl border p-6 ${cardClasses}`}>
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className={`text-xs uppercase tracking-[0.24em] ${subduedText}`}>Manual Entry</p>
                <h2 className="mt-2 text-2xl font-semibold">{activeConfig.label}</h2>
                <p className={`mt-2 text-sm ${subduedText}`}>
                  Add rows one at a time and refine them directly in the table below.
                </p>
              </div>
              <button
                type="button"
                onClick={() => downloadTemplate(activeConfig)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  isDark
                    ? "bg-[#ffffff12] text-white hover:bg-[#ffffff1c]"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Download CSV template
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {activeConfig.columns.map((column) => (
                <label key={column.key} className="block">
                  <span className={`mb-2 block text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                    {column.label}
                  </span>
                  <input
                    type="text"
                    value={activeForm[column.key] || ""}
                    onChange={(event) => handleFormChange(activeTab, column.key, event.target.value)}
                    placeholder={column.placeholder}
                    className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${inputClasses}`}
                  />
                </label>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleAddManualRow(activeTab)}
                className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                  isDark
                    ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                Add row
              </button>
              <button
                type="button"
                onClick={() => resetForm(activeTab)}
                className={`rounded-xl px-5 py-3 text-sm font-medium transition ${
                  isDark
                    ? "bg-[#ffffff12] text-white hover:bg-[#ffffff1f]"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Reset fields
              </button>
            </div>
          </section>

          <aside className={`rounded-3xl border p-6 ${cardClasses}`}>
            <p className={`text-xs uppercase tracking-[0.24em] ${subduedText}`}>Bulk Upload</p>
            <h2 className="mt-2 text-2xl font-semibold">Import {activeConfig.shortLabel}</h2>
            <p className={`mt-2 text-sm ${subduedText}`}>
              Upload a flat file now, or select an Excel workbook once spreadsheet parsing is enabled in this environment.
            </p>

            <div
              className={`mt-6 rounded-3xl border border-dashed p-6 ${
                isDark ? "border-[#ffffff1f] bg-[#1b1d22]" : "border-slate-300 bg-slate-50"
              }`}
            >
              <input
                ref={(node) => {
                  fileInputRefs.current[activeTab] = node;
                }}
                type="file"
                accept=".csv,.txt,.tsv,.xls,.xlsx"
                className="hidden"
                onChange={(event) => handleFileUpload(activeTab, event.target.files?.[0])}
              />
              <p className="text-sm font-medium">
                Accepted formats: <span className={subduedText}>CSV, TSV, TXT, XLS, XLSX</span>
              </p>
              <p className={`mt-2 text-sm ${subduedText}`}>
                Expected columns: {activeConfig.columns.map((column) => column.label).join(" | ")}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRefs.current[activeTab]?.click()}
                  disabled={uploadingTab === activeTab}
                  className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                    isDark
                      ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300 disabled:bg-emerald-500/60"
                      : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-400"
                  }`}
                >
                  {uploadingTab === activeTab ? "Uploading..." : "Select file"}
                </button>
                <button
                  type="button"
                  onClick={() => handleClearAll(activeTab)}
                  disabled={!activeRows.length}
                  className={`rounded-xl px-5 py-3 text-sm font-medium transition ${
                    isDark
                      ? "bg-[#ffffff12] text-white hover:bg-[#ffffff1f] disabled:bg-[#ffffff0a] disabled:text-[#6b7280]"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                  }`}
                >
                  Clear current tab
                </button>
              </div>

              <div className={`mt-6 rounded-2xl border p-4 ${isDark ? "border-[#ffffff12] bg-[#23252b]" : "border-slate-200 bg-white"}`}>
                <p className="text-sm font-semibold">Last import</p>
                {uploadState[activeTab].fileName ? (
                  <div className={`mt-2 text-sm ${subduedText}`}>
                    <p>{uploadState[activeTab].fileName}</p>
                    <p>{uploadState[activeTab].importedCount} rows imported</p>
                  </div>
                ) : (
                  <p className={`mt-2 text-sm ${subduedText}`}>No file uploaded yet for this configuration.</p>
                )}
              </div>
            </div>
          </aside>
        </div>

        <section className={`mt-6 rounded-3xl border p-6 ${cardClasses}`}>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={`text-xs uppercase tracking-[0.24em] ${subduedText}`}>Editable Records</p>
              <h2 className="mt-2 text-2xl font-semibold">{activeConfig.label} Table</h2>
            </div>
            <p className={`text-sm ${subduedText}`}>
              {activeRows.length} record{activeRows.length === 1 ? "" : "s"} loaded
            </p>
          </div>

          {activeRows.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr>
                    {activeConfig.columns.map((column) => (
                      <th
                        key={column.key}
                        className={`px-4 pb-1 text-left text-xs font-semibold uppercase tracking-[0.18em] ${
                          isDark ? "text-[#9ca3af]" : "text-slate-500"
                        }`}
                      >
                        {column.label}
                      </th>
                    ))}
                    <th
                      className={`px-4 pb-1 text-right text-xs font-semibold uppercase tracking-[0.18em] ${
                        isDark ? "text-[#9ca3af]" : "text-slate-500"
                      }`}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activeRows.map((row) => (
                    <tr key={row.id}>
                      {activeConfig.columns.map((column) => (
                        <td key={`${row.id}-${column.key}`} className="px-2 align-top">
                          <input
                            type="text"
                            value={row[column.key] || ""}
                            onChange={(event) =>
                              handleRowChange(activeTab, row.id, column.key, event.target.value)
                            }
                            className={`w-full min-w-[220px] rounded-2xl border px-4 py-3 outline-none transition ${inputClasses}`}
                          />
                        </td>
                      ))}
                      <td className="px-2 align-top">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(activeTab, row.id)}
                            className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                              isDark
                                ? "bg-rose-500/15 text-rose-200 hover:bg-rose-500/25"
                                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                            }`}
                          >
                            Remove
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
              className={`rounded-3xl border border-dashed px-6 py-12 text-center ${
                isDark ? "border-[#ffffff14] bg-[#1b1d22]" : "border-slate-300 bg-slate-50"
              }`}
            >
              <h3 className="text-lg font-semibold">No rows added yet</h3>
              <p className={`mt-2 text-sm ${subduedText}`}>
                Add a row manually or import a file to populate the {activeConfig.label.toLowerCase()} table.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default GovernanceManagement;
