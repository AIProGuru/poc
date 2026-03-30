import { useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../components/demo-layout/Header";

const CONFIG_TABS = [
  {
    id: "carc",
    label: "CARC Mapping",
    columns: [
      { key: "carcCode", label: "CARC Code", aliases: ["code", "carc", "carc code"] },
      { key: "carcDescription", label: "CARC Description", aliases: ["description", "carc description"] },
      { key: "category", label: "Category", aliases: ["category"] },
    ],
  },
  {
    id: "rarc",
    label: "RARC Mapping",
    columns: [
      { key: "rarcCode", label: "RARC Code", aliases: ["code", "rarc", "rarc code"] },
      { key: "rarcDescription", label: "RARC Description", aliases: ["description", "rarc description"] },
      { key: "category", label: "Category", aliases: ["category"] },
    ],
  },
  {
    id: "actionCodes",
    label: "Action Codes",
    columns: [
      { key: "category", label: "Category", aliases: ["category"] },
      { key: "actionCode", label: "Action Codes", aliases: ["action code", "action codes", "code"] },
      { key: "tickleTime", label: "Tickle Time", aliases: ["tickle time"] },
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

const GovernanceManagement = () => {
  const navigate = useNavigate();
  const theme = useSelector((state) => state.app.theme);
  const isDark = theme === "dark";
  const fileInputRefs = useRef({});

  const [activeTab, setActiveTab] = useState(CONFIG_TABS[0].id);
  const [datasets, setDatasets] = useState(buildEmptyDatasetState);
  const [uploadingTab, setUploadingTab] = useState("");

  const activeConfig = useMemo(
    () => CONFIG_TABS.find((tab) => tab.id === activeTab) || CONFIG_TABS[0],
    [activeTab]
  );
  const activeRows = datasets[activeTab] || [];

  const containerClasses = isDark ? "border-[#ffffff14] bg-[#23252b]" : "border-slate-200 bg-white";
  const subduedText = isDark ? "text-[#9ca3af]" : "text-slate-500";
  const inputClasses = isDark
    ? "border-[#ffffff14] bg-[#1b1d22] text-white placeholder:text-[#6b7280] focus:border-cyan-400/60"
    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-cyan-600";

  const handleAddRow = (tabId) => {
    const config = CONFIG_TABS.find((tab) => tab.id === tabId);
    const emptyRow = Object.fromEntries(config.columns.map((column) => [column.key, ""]));
    setDatasets((current) => ({
      ...current,
      [tabId]: [...current[tabId], buildRowWithId(tabId, emptyRow)],
    }));
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
      toast.success(`Imported ${mappedRows.length} row${mappedRows.length === 1 ? "" : "s"}.`);
    } catch (error) {
      toast.error(error.message || "Upload failed.");
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
            <p className={subduedText}>Three columns per config with manual entry and one upload action.</p>
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
            <h2 className="text-xl font-semibold">{activeConfig.label}</h2>
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
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isDark
                    ? "bg-[#ffffff12] text-white hover:bg-[#ffffff1f]"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Add Row
              </button>
              <button
                type="button"
                onClick={() => fileInputRefs.current[activeTab]?.click()}
                disabled={uploadingTab === activeTab}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isDark
                    ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {uploadingTab === activeTab ? "Uploading..." : "Upload File"}
              </button>
            </div>
          </div>

          {activeRows.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    {activeConfig.columns.map((column) => (
                      <th
                        key={column.key}
                        className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] ${
                          isDark ? "text-[#9ca3af]" : "text-slate-500"
                        }`}
                      >
                        {column.label}
                      </th>
                    ))}
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
                  {activeRows.map((row) => (
                    <tr key={row.id}>
                      {activeConfig.columns.map((column) => (
                        <td key={`${row.id}-${column.key}`} className="px-3 py-2">
                          <input
                            type="text"
                            value={row[column.key] || ""}
                            onChange={(event) =>
                              handleRowChange(activeTab, row.id, column.key, event.target.value)
                            }
                            className={`w-full min-w-[220px] rounded-lg border px-3 py-2 outline-none transition ${inputClasses}`}
                          />
                        </td>
                      ))}
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(activeTab, row.id)}
                          className={`rounded-lg px-3 py-2 text-sm transition ${
                            isDark
                              ? "bg-rose-500/15 text-rose-200 hover:bg-rose-500/25"
                              : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                          }`}
                        >
                          Remove
                        </button>
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
              <p className="text-sm font-medium">No rows yet.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default GovernanceManagement;
