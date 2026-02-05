import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setAppTitle,
  setTabIndex,
  setKeyword,
  setCode,
  setRemark,
  setProcedure,
  setPOS,
  setExtraFilter,
  setTableLoading,
  setPart1Loading,
  setPart2Loading,
  setCurrentPage,
  setTableData,
} from '../../../redux/reducers/app.reducer';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApiEndpoint } from '../../../ApiEndpointContext';
import { setSelectedTags } from '../../../redux/reducers/tag.reducer';

const ArIntel = ({ onModelSelect }) => {
  const apiUrl = useApiEndpoint();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const models = useSelector((state) => state.app.models);
  const theme = useSelector((state) => state.app.theme);
  const tags = useSelector((state) => state.tags.allTags);
  const role = useSelector((state) => state.auth.role);
  const allowedCategories = useSelector((state) => state.auth.denialCategory);
  const isDark = theme === 'dark';
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [openModelGroups, setOpenModelGroups] = useState(() => new Set());

  useEffect(() => {
    if (!apiUrl) return;
    dispatch(setAppTitle("AI Automation"));
  }, [apiUrl, dispatch]);

  const formatAmount = (value) => {
    const numeric = Number(value ?? 0);
    if (Number.isNaN(numeric)) return '$0';
    return `$${numeric.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  const normalizeTag = (tag) => {
    if (!tag) return '';
    if (typeof tag === 'string') return tag.trim();
    return `${tag.label || tag.name || tag.value || tag.id || ''}`.trim();
  };

  const availableFilters = useMemo(() => {
    const seen = new Set();
    return (models || [])
      .map((row) => `${row.ModelTitle || row.model_title || 'AI Agent'}`.trim())
      .filter((title) => title !== '')
      .filter((title) => {
        if (seen.has(title)) return false;
        seen.add(title);
        return true;
      });
  }, [models]);

  const filteredModels = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    const selectedSet = new Set(selectedFilters);
    const restrictCategories = Array.isArray(allowedCategories) && allowedCategories.length > 0
      && !['admin', 'super-admin', 'manager', 'internal-admin'].includes(role);
    return (models || []).filter((row) => {
      const title = `${row.Title || ''}`.toLowerCase();
      const category = `${row.Category || row.Group || ''}`.toLowerCase();
      const code = `${row.Code || ''}`.toLowerCase();
      const modelTitle = `${row.ModelTitle || row.model_title || ''}`.toLowerCase();
      const normalizedCategory = row.Category === 'Delinquent' ? 'Pend 835' : row.Category;
      const matchesCategory =
        !restrictCategories ||
        !normalizedCategory ||
        allowedCategories.includes(normalizedCategory);
      const matchesSearch =
        !needle ||
        title.includes(needle) ||
        category.includes(needle) ||
        code.includes(needle) ||
        modelTitle.includes(needle);
      const categoryLabel = `${row.ModelTitle || row.model_title || ''}`.trim();
      const matchesFilters =
        selectedSet.size === 0 ||
        (categoryLabel && selectedSet.has(categoryLabel));
      return matchesCategory && matchesSearch && matchesFilters;
    });
  }, [models, searchTerm, selectedFilters, allowedCategories, role]);

  const groupedModels = useMemo(() => {
    const groups = new Map();
    (filteredModels || []).forEach((row) => {
      const groupTitle = `${row.ModelTitle || row.model_title || 'AI Agent'}`.trim() || 'AI Agent';
      if (!groups.has(groupTitle)) {
        groups.set(groupTitle, []);
      }
      groups.get(groupTitle).push(row);
    });
    return Array.from(groups.entries()).map(([title, items]) => ({ title, items }));
  }, [filteredModels]);

  useEffect(() => {
    setOpenModelGroups((prev) => {
      const next = new Set(prev);
      groupedModels.forEach((group) => next.add(group.title));
      return next;
    });
  }, [groupedModels]);

  const toggleFilter = (filter) => {
    setSelectedFilters((prev) => {
      if (prev.includes(filter)) {
        return prev.filter((item) => item !== filter);
      }
      return [...prev, filter];
    });
  };

  const buildTooltip = (row) => [
    `Status: ${row.Status ?? 'N/A'}`,
    `Count: ${row.Count ?? '0'}`,
    `Charges: ${formatAmount(row.Amount)}`,
    `Claim State: ${row.Group ?? 'N/A'}`,
    `Category: ${row.Category ?? 'N/A'}`,
    `CARC: ${row.Code ?? 'N/A'}`,
    `RARC: ${row.Remark ?? 'N/A'}`,
    `Updated: ${row.UpdatedAt ?? 'N/A'}`
  ].join('\n');

  const handleModelClick = (row) => {
    const nonce = Date.now();
    const groupCode = `${row.GroupCode || ''}`.trim();
    const reasonCode = `${row.Code || ''}`.trim();
    const isCarc = groupCode.length === 2 && reasonCode !== '';
    const adjustmentCode = isCarc ? `${groupCode}${reasonCode}` : '';
    const remarkCode = isCarc
      ? (row.Remark || '')
      : (row.Remark || `${groupCode}${reasonCode}` || '');
    const remarkCodes = Array.isArray(row?.extra?.remarkCodes)
      ? row.extra.remarkCodes.filter(Boolean).join('*')
      : remarkCode;
    const payload = {
      code: adjustmentCode,
      remark: remarkCodes,
      procedure: '',
      keyword: '',
      pos: '',
      // Use the custom tab to avoid automation-only filtering.
      tabIndex: 6,
      extra: row.extra || {},
      selectedTags: tags,
      source: 'ai-library',
      nonce,
    };
    // Pre-apply filters locally so clicking the same model twice still triggers correct data load.
    dispatch(setKeyword(''));
    dispatch(setCode(payload.code));
    dispatch(setRemark(payload.remark));
    dispatch(setProcedure(''));
    dispatch(setPOS(''));
    dispatch(setExtraFilter(payload.extra));
    dispatch(setSelectedTags(tags));
    // Ensure any in-flight AI Library requests are cleared so the drilldown triggers a single load.
    dispatch(setTableLoading(false));
    dispatch(setPart1Loading(false));
    dispatch(setPart2Loading(false));
    dispatch(setTabIndex(5));
    dispatch(setCurrentPage(1));
    dispatch(setTableData([]));
    dispatch(setTableLoading(true));
    dispatch(setAppTitle(row.Title));
    if (typeof onModelSelect === 'function') {
      onModelSelect(row);
    }
    const tenantBase = location.pathname.split('/')[1] || 'rebound';
    navigate(`/${tenantBase}/denials/${btoa(JSON.stringify(payload))}`, { replace: true });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className={`ont-inter font-semibold text-[24px] leading-none tracking-normal ${isDark ? 'text-[#F4F4F4]' : 'text-slate-500'}`}>
          Denials &gt; Automation Catalog
        </div>
      </div>

      <div className={`rounded-xl border ${isDark ? 'bg-[#27282D] border-[#222632] text-[#F4F4F4]' : 'bg-white border-slate-200 text-slate-900'} shadow-none`}>
        <button
          type="button"
          onClick={() => setIsFilterOpen((prev) => !prev)}
          className={`w-full flex items-center justify-between px-6 py-4 shadow-none ${isDark ? 'text-[#F4F4F4]' : 'text-slate-900'}`}
        >
          <span className="text-[24px] font-semibold">Filter</span>
          <span className={`text-lg leading-none ${isDark ? 'text-[#F4F4F4]' : 'text-slate-500'}`}>
            {isFilterOpen ? '-' : '+'}
          </span>
        </button>
        <div
          className={`collapse-panel ${isFilterOpen ? 'collapse-panel--open' : ''}`}
          aria-hidden={!isFilterOpen}
        >
          <div className="px-6 pb-6">
            <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
              <svg className={`h-4 w-4 ${isDark ? 'text-[#F4F4F4]' : 'text-slate-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search"
                className={`w-full bg-transparent text-sm outline-none ${isDark ? 'placeholder:text-white/40 text-white' : 'placeholder:text-slate-400 text-slate-700'}`}
              />
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {availableFilters.length === 0 && (
                <div className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                  No filters available.
                </div>
              )}
              {availableFilters.map((filter) => (
                <label key={filter} className="flex items-center gap-2 text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={selectedFilters.includes(filter)}
                    onChange={() => toggleFilter(filter)}
                    className={`h-4 w-4 rounded ${isDark ? 'accent-emerald-400' : 'accent-emerald-600'}`}
                  />
                  <span className={isDark ? 'text-[#F4F4F4]' : 'text-slate-600'}>
                    {filter}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`rounded-xl border ${isDark ? 'bg-[#27282D] border-[#222632] text-[#F4F4F4]' : 'bg-white border-slate-200 text-slate-900'} shadow-none`}>
        <div className="w-full px-6 py-5 text-left shadow-none">
          <div>
            <p className="font-inter font-medium text-[24px] leading-[100%] tracking-[0%]">AI Agent</p>

          </div>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-6">
          {groupedModels.length === 0 && (
            <div className={`rounded-2xl border text-sm text-center py-6 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
              No AI models available.
            </div>
          )}
          {groupedModels.map((group) => {
            const isOpen = openModelGroups.has(group.title);
            return (
              <div
                key={group.title}
                className={`rounded-2xl border ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenModelGroups((prev) => {
                      const next = new Set(prev);
                      if (next.has(group.title)) {
                        next.delete(group.title);
                      } else {
                        next.add(group.title);
                      }
                      return next;
                    })
                  }
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <div>
                    <h3 className={`mt-1 text-lg font-semibold ${isDark ? 'text-[#F4F4F4]' : 'text-slate-900'}`}>
                      {group.title}
                    </h3>
                  </div>
                  <span className={`text-lg leading-none ${isDark ? 'text-white/70' : 'text-slate-500'}`}>
                    {isOpen ? '-' : '+'}
                  </span>
                </button>
                <div className={`collapse-panel ${isOpen ? 'collapse-panel--open' : ''}`} aria-hidden={!isOpen}>
                  <div className="px-6">
                    <div className={`h-px w-full ${isDark ? 'bg-[#CDCDCD]' : 'bg-slate-200'}`} />
                  </div>
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {group.items.map((row) => (
                      <button
                        type="button"
                        key={row.id}
                        title={buildTooltip(row)}
                        onClick={() => handleModelClick(row)}
                        className={`group flex items-start justify-between rounded-2xl border px-[14px] py-[10px] transition cursor-pointer text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24B47E] ${isDark ? 'border-white/10 bg-white/5 text-white hover:bg-white/10' : 'border-slate-200 bg-white text-slate-900 hover:shadow-lg hover:-translate-y-0.5'}`}
                      >
                        <div className="flex flex-col min-w-0 pr-3 h-full">
                          <p className="font-inter text-[18px] font-medium leading-[1.2] tracking-normal uppercase tracking-[0.2em] text-[#0E7D81] break-words line-clamp-2">
                            {row.Category || 'Model'}
                          </p>
                          <h3
                            className={`text-sm font-semibold truncate leading-snug mt-2 ${isDark ? 'text-[#F4F4F4]' : 'text-slate-900'}`}
                            title={row.Title}
                          >
                            {row.Title}
                          </h3>
                          <p className={`text-xs mt-auto ${isDark ? 'text-[#F4F4F4]' : 'text-slate-500'}`}>
                            {row.UpdatedAt ? new Date(row.UpdatedAt).toLocaleDateString() : 'Date'}
                          </p>
                        </div>
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border self-center ${isDark ? 'border-white/15 bg-white/5 text-white' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                          {row.Count ?? 0}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ArIntel;
