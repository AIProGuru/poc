import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../components/demo-layout/Header";
import { useApiEndpoint } from "../ApiEndpointContext";

const EMPTY_FORM = {
  name: "",
  payerIds: "",
  notes: "",
  transmissionMethods: [],
};

const TRANSMISSION_OPTIONS = [
  { value: "online_portal", label: "Online Portal" },
  { value: "mail", label: "Mail" },
  { value: "fax", label: "Fax" },
];

const splitPayerIds = (value) =>
  `${value || ""}`
    .split(/[\s,;]+/)
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);

const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileTypeLabel = (template) => {
  const name = template?.originalFileName || "";
  const ext = name.includes(".") ? name.split(".").pop()?.toLowerCase() : "";
  if (ext === "pdf") return "PDF";
  if (ext === "doc" || ext === "docx") return "Word";
  if (ext === "txt") return "Text";

  const mime = `${template?.mimeType || ""}`.toLowerCase();
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("word") || mime.includes("document")) return "Word";
  if (mime.includes("text")) return "Text";
  return ext ? ext.toUpperCase() : "-";
};

const formatTransmissionMethod = (value) => {
  if (!value) return "-";
  return `${value}`
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => TRANSMISSION_OPTIONS.find((option) => option.value === item)?.label || item)
    .join(", ");
};

const TemplateNameWithTooltip = ({ name, notes, isDark, mutedText }) => (
  <div className="relative inline-block max-w-full group">
    <p className={`font-semibold break-words ${notes ? "cursor-help" : ""}`}>{name}</p>
    {notes && (
      <div
        role="tooltip"
        className={`pointer-events-none absolute bottom-full left-0 z-20 mb-2 hidden w-max max-w-xs rounded-lg px-3 py-2 text-xs shadow-lg group-hover:block ${
          isDark ? "bg-[#111218] text-gray-100 border border-[#ffffff14]" : "bg-slate-900 text-white"
        }`}
      >
        {notes}
      </div>
    )}
    {notes && <span className={`sr-only ${mutedText}`}>{notes}</span>}
  </div>
);

const AppealTemplates = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const theme = useSelector((state) => state.app.theme);
  const username = useSelector((state) => state.auth.username);
  const isDark = theme === "dark";
  const apiBaseUrl = useApiEndpoint();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState(null);

  const payerIds = useMemo(() => splitPayerIds(form.payerIds), [form.payerIds]);

  const filteredTemplates = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return templates;
    return templates.filter((template) =>
      [
        template.name,
        template.originalFileName,
        template.notes,
        template.transmissionMethod,
        ...(template.payerIds || []),
      ]
        .filter(Boolean)
        .some((value) => `${value}`.toLowerCase().includes(term))
    );
  }, [search, templates]);

  const inputClass = `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#44BFAB] ${
    isDark
      ? "border-[#30323a] bg-[#191a1f] text-white placeholder-gray-500"
      : "border-slate-200 bg-white text-slate-900 placeholder-slate-400"
  }`;
  const panelClass = `rounded-xl border p-4 sm:p-5 ${
    isDark ? "border-[#ffffff14] bg-[#23252b]" : "border-slate-200 bg-white"
  }`;
  const mutedText = isDark ? "text-gray-400" : "text-slate-500";

  const fetchData = async () => {
    if (!apiBaseUrl) return;
    try {
      setLoading(true);
      const templateRes = await axios.get(`${apiBaseUrl}/appeal-templates`, { withCredentials: true });
      setTemplates(Array.isArray(templateRes.data) ? templateRes.data : []);
    } catch (err) {
      toast.error("Could not load appeal template data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiBaseUrl]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleTransmissionMethod = (value) => {
    setForm((prev) => {
      const selected = new Set(prev.transmissionMethods);
      if (selected.has(value)) {
        selected.delete(value);
      } else {
        selected.add(value);
      }
      return { ...prev, transmissionMethods: Array.from(selected) };
    });
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.info("Template name is required.");
      return;
    }
    if (payerIds.length === 0) {
      toast.info("Add at least one 835 payer ID.");
      return;
    }
    if (!selectedFile) {
      toast.info("Choose a template file.");
      return;
    }
    if (form.transmissionMethods.length === 0) {
      toast.info("Select at least one transmission method.");
      return;
    }
    if (!apiBaseUrl) {
      toast.info("Tenant API is still loading.");
      return;
    }

    try {
      setSaving(true);
      const payload = new FormData();
      payload.append("name", form.name.trim());
      payload.append("payer_ids", payerIds.join(","));
      payload.append("notes", form.notes.trim());
      payload.append("transmission_method", form.transmissionMethods.join(","));
      payload.append("uploaded_by", username || "");
      payload.append("file", selectedFile);

      const res = await axios.post(`${apiBaseUrl}/appeal-templates`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setTemplates((prev) => [res.data, ...prev]);
      resetForm();
      toast.success("Appeal template uploaded.");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Could not upload appeal template.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (templateId) => {
    const confirmed = window.confirm("Delete this appeal template?");
    if (!confirmed) return;
    try {
      await axios.delete(`${apiBaseUrl}/appeal-templates/${templateId}`, { withCredentials: true });
      setTemplates((prev) => prev.filter((template) => template.id !== templateId));
      toast.success("Appeal template deleted.");
    } catch (err) {
      toast.error("Could not delete appeal template.");
    }
  };

  return (
    <div
      className={`min-h-screen w-full overflow-x-hidden ${
        isDark ? "bg-[#1e1f24] text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      <div className="px-4 sm:px-6 pt-4 [&>div]:!mt-0 [&>div]:!mb-4">
        <Header />
      </div>
      <div className="container mx-auto w-full max-w-[1440px] px-4 sm:px-6 pb-10 pt-4">
        <div className="mb-6 flex items-start gap-4">
          <button
            type="button"
            onClick={() => navigate("/governance-management")}
            className={`mt-1 rounded-lg p-2 transition ${isDark ? "bg-[#ffffff10] hover:bg-[#ffffff20]" : "bg-white hover:bg-slate-100 border border-slate-200"}`}
            aria-label="Back to Governance Management"
            title="Back to Governance Management"
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
            <h1 className="text-2xl font-bold">Appeal Templates</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[400px_minmax(0,1fr)] xl:items-start">
          <form onSubmit={handleSubmit} className={`${panelClass} flex flex-col gap-3`}>
            <h2 className="text-lg font-semibold">Upload</h2>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold">Template Name</span>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className={inputClass}
                placeholder="Example: UHC Medical Necessity Appeal"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold">835 Payer IDs</span>
              <textarea
                rows={4}
                value={form.payerIds}
                onChange={(e) => setForm((prev) => ({ ...prev, payerIds: e.target.value }))}
                className={`${inputClass} resize-none`}
                placeholder="87726, 06111"
              />
            </label>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold">Template</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
                tabIndex={-1}
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={openFilePicker}
                className={`self-start rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  isDark
                    ? "border-[#30323a] bg-[#191a1f] text-gray-100 hover:bg-[#24262d]"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                Choose File
              </button>
              <span className={`text-xs ${mutedText}`}>PDF, Word, or text. Maximum file size: 50 MB.</span>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-semibold">Transmission Method</legend>
              <div className="flex flex-col gap-2">
                {TRANSMISSION_OPTIONS.map((option) => (
                  <label key={option.value} className="inline-flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.transmissionMethods.includes(option.value)}
                      onChange={() => toggleTransmissionMethod(option.value)}
                      className="h-4 w-4 rounded border-gray-400"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold">Notes</span>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                className={`${inputClass} resize-none`}
                placeholder="Provide a description for when this template should be used."
              />
            </label>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#44BFAB] px-4 py-2 text-sm font-semibold text-[#06211e] hover:bg-[#35b7a5] disabled:opacity-60"
              >
                {saving ? "Uploading..." : "Upload"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${isDark ? "bg-[#ffffff10] hover:bg-[#ffffff20]" : "bg-slate-100 hover:bg-slate-200"}`}
              >
                Clear
              </button>
            </div>
          </form>

          <div className={`${panelClass} flex flex-col gap-4`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold">Template Library</h2>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputClass} w-full sm:max-w-xs`}
                placeholder="Search templates or Payer IDs"
              />
            </div>

            {loading ? (
              <div className={`py-12 text-center ${mutedText}`}>Loading templates...</div>
            ) : filteredTemplates.length === 0 ? (
              <div className={`py-12 text-center ${mutedText}`}>No appeal templates found.</div>
            ) : (
              <>
                <div className="mt-5 grid grid-cols-1 gap-3 lg:hidden">
                  {filteredTemplates.map((template) => {
                    const templatePayerIds = template.payerIds || [];
                    return (
                      <div
                        key={`card-${template.id}`}
                        className={`rounded-lg border p-4 ${isDark ? "border-[#ffffff14] bg-[#191a1f]" : "border-slate-200 bg-slate-50"}`}
                      >
                        <div className="flex flex-col gap-3">
                          <TemplateNameWithTooltip
                            name={template.name}
                            notes={template.notes}
                            isDark={isDark}
                            mutedText={mutedText}
                          />

                          <div>
                            <p className={`text-xs font-semibold uppercase ${mutedText}`}>Payer IDs</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {templatePayerIds.length > 0 ? (
                                templatePayerIds.map((payerId) => (
                                  <span
                                    key={payerId}
                                    className={`rounded-md px-2 py-1 text-xs font-semibold ${isDark ? "bg-[#ffffff10] text-gray-200" : "bg-white text-slate-700 border border-slate-200"}`}
                                  >
                                    {payerId}
                                  </span>
                                ))
                              ) : (
                                <span className={`text-sm ${mutedText}`}>No payer IDs</span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className={`text-xs font-semibold uppercase ${mutedText}`}>File Type</p>
                              <p className="mt-1">{getFileTypeLabel(template)}</p>
                              <p className={`text-xs ${mutedText}`}>{formatFileSize(template.fileSize)}</p>
                            </div>
                            <div>
                              <p className={`text-xs font-semibold uppercase ${mutedText}`}>Transmission Method</p>
                              <p className={`mt-1 ${mutedText}`}>
                                {formatTransmissionMethod(template.transmissionMethod)}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <a
                              href={`${apiBaseUrl}/appeal-templates/${template.id}/download`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`rounded-lg px-3 py-2 text-xs font-semibold ${isDark ? "bg-[#ffffff10] text-gray-100 hover:bg-[#ffffff20]" : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"}`}
                            >
                              Download
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDelete(template.id)}
                              className={`rounded-lg px-3 py-2 text-xs font-semibold ${isDark ? "bg-red-500/15 text-red-200 hover:bg-red-500/25" : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-100"}`}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 hidden lg:block overflow-x-auto">
                  <table className="min-w-[760px] w-full table-fixed">
                    <colgroup>
                      <col className="w-[28%]" />
                      <col className="w-[24%]" />
                      <col className="w-[16%]" />
                      <col className="w-[20%]" />
                      <col className="w-[12%]" />
                    </colgroup>
                    <thead>
                      <tr className={`border-b text-left text-xs uppercase ${isDark ? "border-[#ffffff14] text-gray-400" : "border-slate-200 text-slate-500"}`}>
                        <th className="px-3 py-3">Template</th>
                        <th className="px-3 py-3">Payer IDs</th>
                        <th className="px-3 py-3">File Type</th>
                        <th className="px-3 py-3">Transmission Method</th>
                        <th className="px-3 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTemplates.map((template) => {
                        const templatePayerIds = template.payerIds || [];
                        return (
                          <tr key={template.id} className={`border-b text-sm ${isDark ? "border-[#ffffff10]" : "border-slate-100"}`}>
                            <td className="px-3 py-4 align-top">
                              <TemplateNameWithTooltip
                                name={template.name}
                                notes={template.notes}
                                isDark={isDark}
                                mutedText={mutedText}
                              />
                            </td>
                            <td className="px-3 py-4 align-top">
                              <div className="flex flex-wrap gap-1">
                                {templatePayerIds.map((payerId) => (
                                  <span
                                    key={payerId}
                                    className={`rounded-md px-2 py-1 text-xs font-semibold ${isDark ? "bg-[#ffffff10] text-gray-200" : "bg-slate-100 text-slate-700"}`}
                                  >
                                    {payerId}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-3 py-4 align-top">
                              <p>{getFileTypeLabel(template)}</p>
                              <p className={`text-xs ${mutedText}`}>{formatFileSize(template.fileSize)}</p>
                            </td>
                            <td className="px-3 py-4 align-top">
                              <span className={mutedText}>
                                {formatTransmissionMethod(template.transmissionMethod)}
                              </span>
                            </td>
                            <td className="px-3 py-4 align-top">
                              <div className="flex flex-col items-center gap-2">
                                <a
                                  href={`${apiBaseUrl}/appeal-templates/${template.id}/download`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`inline-flex min-w-[88px] items-center justify-center rounded-lg px-3 py-1.5 text-center text-xs font-semibold leading-5 whitespace-nowrap ${isDark ? "bg-[#ffffff10] text-gray-100 hover:bg-[#ffffff20]" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                                >
                                  Download
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(template.id)}
                                  className={`inline-flex min-w-[88px] items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold leading-5 whitespace-nowrap ${isDark ? "bg-red-500/15 text-red-200 hover:bg-red-500/25" : "bg-red-50 text-red-700 hover:bg-red-100"}`}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppealTemplates;
