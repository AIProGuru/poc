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
};

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

const AppealTemplates = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const theme = useSelector((state) => state.app.theme);
  const username = useSelector((state) => state.auth.username);
  const isDark = theme === "dark";
  const apiBaseUrl = useApiEndpoint();

  const [templates, setTemplates] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState(null);

  const payerIds = useMemo(() => splitPayerIds(form.payerIds), [form.payerIds]);
  const contactsByPayerId = useMemo(() => {
    const map = new Map();
    contacts.forEach((contact) => {
      const key = `${contact.payerId || ""}`.toUpperCase();
      if (!key) return;
      map.set(key, [...(map.get(key) || []), contact]);
    });
    return map;
  }, [contacts]);

  const matchedContacts = useMemo(
    () => payerIds.flatMap((payerId) => contactsByPayerId.get(payerId) || []),
    [contactsByPayerId, payerIds]
  );

  const filteredTemplates = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return templates;
    return templates.filter((template) =>
      [
        template.name,
        template.originalFileName,
        template.notes,
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
  const panelClass = `rounded-xl border p-5 ${
    isDark ? "border-[#ffffff14] bg-[#23252b]" : "border-slate-200 bg-white"
  }`;
  const mutedText = isDark ? "text-gray-400" : "text-slate-500";

  const fetchData = async () => {
    if (!apiBaseUrl) return;
    try {
      setLoading(true);
      const [templateRes, contactRes] = await Promise.all([
        axios.get(`${apiBaseUrl}/appeal-templates`, { withCredentials: true }),
        axios.get(`${apiBaseUrl}/payer-appeal-contacts`, { withCredentials: true }),
      ]);
      setTemplates(Array.isArray(templateRes.data) ? templateRes.data : []);
      setContacts(Array.isArray(contactRes.data) ? contactRes.data : []);
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
    <div className={`min-h-screen ${isDark ? "bg-[#1e1f24] text-white" : "bg-slate-50 text-slate-900"}`}>
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-start gap-4 mb-8">
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
            <h1 className="mb-2 text-2xl font-bold">Appeal Templates</h1>
            <p className={mutedText}>
              Upload appeal letter templates and map them to the 835 payer IDs used in triage.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
          <form onSubmit={handleSubmit} className={`${panelClass} flex flex-col gap-4`}>
            <div>
              <h2 className="text-lg font-semibold">Upload Template</h2>
              <p className={`mt-1 text-sm ${mutedText}`}>
                Enter the payer IDs from the 835 remit. Multiple IDs can map to the same template.
              </p>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold">Template Name</span>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className={inputClass}
                placeholder="Example: UHC medical necessity appeal"
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

            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold">Template File</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className={inputClass}
              />
              <span className={`text-xs ${mutedText}`}>PDF, Word, or text. Maximum file size: 50 MB.</span>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold">Notes</span>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                className={`${inputClass} resize-none`}
                placeholder="Internal notes for when this template should be used"
              />
            </label>

            {payerIds.length > 0 && (
              <div className={`rounded-lg border p-3 text-sm ${isDark ? "border-[#30323a] bg-[#191a1f]" : "border-slate-200 bg-slate-50"}`}>
                <p className="font-semibold">Contact preview</p>
                {matchedContacts.length > 0 ? (
                  <div className="mt-2 flex flex-col gap-2">
                    {matchedContacts.slice(0, 4).map((contact) => (
                      <div key={`${contact.payerId}-${contact.id}`} className={mutedText}>
                        <span className={isDark ? "text-white" : "text-slate-900"}>{contact.payerId}</span>
                        {contact.payerDescription ? ` - ${contact.payerDescription}` : ""}
                        {contact.payerPhoneNumber ? ` | Phone: ${contact.payerPhoneNumber}` : ""}
                        {contact.payerFaxNumber ? ` | Fax: ${contact.payerFaxNumber}` : ""}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`mt-2 ${mutedText}`}>
                    No matching client-management payer contact found for these 835 payer IDs yet.
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#44BFAB] px-4 py-2 text-sm font-semibold text-[#06211e] hover:bg-[#35b7a5] disabled:opacity-60"
              >
                {saving ? "Uploading..." : "Upload Template"}
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

          <div className={panelClass}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Template Library</h2>
                <p className={`mt-1 text-sm ${mutedText}`}>
                  Triage will match against the payer ID from the 835 remit, not the 837 claim.
                </p>
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputClass} md:max-w-xs`}
                placeholder="Search templates or payer IDs"
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
                    const hasContact = templatePayerIds.some((payerId) => contactsByPayerId.has(`${payerId}`.toUpperCase()));
                    return (
                      <div
                        key={`card-${template.id}`}
                        className={`rounded-lg border p-4 ${isDark ? "border-[#ffffff14] bg-[#191a1f]" : "border-slate-200 bg-slate-50"}`}
                      >
                        <div className="flex flex-col gap-3">
                          <div>
                            <p className="font-semibold break-words">{template.name}</p>
                            {template.notes && <p className={`mt-1 text-xs break-words ${mutedText}`}>{template.notes}</p>}
                          </div>

                          <div>
                            <p className={`text-xs font-semibold uppercase ${mutedText}`}>835 Payer IDs</p>
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
                              <p className={`text-xs font-semibold uppercase ${mutedText}`}>File</p>
                              <p className="mt-1 break-words">{template.originalFileName || "-"}</p>
                              <p className={`text-xs ${mutedText}`}>{formatFileSize(template.fileSize)}</p>
                            </div>
                            <div>
                              <p className={`text-xs font-semibold uppercase ${mutedText}`}>Contact Status</p>
                              <p className={`mt-1 ${hasContact ? "text-[#44BFAB]" : mutedText}`}>
                                {hasContact ? "Client contact found" : "No contact match"}
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
                    <col className="w-[20%]" />
                    <col className="w-[16%]" />
                    <col className="w-[12%]" />
                  </colgroup>
                  <thead>
                    <tr className={`border-b text-left text-xs uppercase ${isDark ? "border-[#ffffff14] text-gray-400" : "border-slate-200 text-slate-500"}`}>
                      <th className="px-3 py-3">Template</th>
                      <th className="px-3 py-3">835 Payer IDs</th>
                      <th className="px-3 py-3">File</th>
                      <th className="px-3 py-3">Contact Status</th>
                      <th className="px-3 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTemplates.map((template) => {
                      const templatePayerIds = template.payerIds || [];
                      const hasContact = templatePayerIds.some((payerId) => contactsByPayerId.has(`${payerId}`.toUpperCase()));
                      return (
                        <tr key={template.id} className={`border-b text-sm ${isDark ? "border-[#ffffff10]" : "border-slate-100"}`}>
                          <td className="px-3 py-4 align-top">
                            <p className="font-semibold break-words">{template.name}</p>
                            {template.notes && <p className={`mt-1 text-xs break-words ${mutedText}`}>{template.notes}</p>}
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
                            <p className="break-words">{template.originalFileName || "-"}</p>
                            <p className={`text-xs ${mutedText}`}>{formatFileSize(template.fileSize)}</p>
                          </td>
                          <td className="px-3 py-4 align-top">
                            <span className={hasContact ? "text-[#44BFAB]" : mutedText}>
                              {hasContact ? "Client contact found" : "No contact match"}
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
