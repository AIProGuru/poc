import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setAdvancedFilters,
  clearAdvancedFilters,
  setCurrentPage,
  setPart1Loading,
  setPart2Loading,
  setTableLoading,
} from '../../redux/reducers/app.reducer';
import {
  ADVANCED_FILTER_FIELDS,
  EMPTY_ADVANCED_FILTERS,
  countActiveAdvancedFilters,
  getActiveAdvancedFilterEntries,
} from '../../utils/advancedFilters';

const triggerPlatformReload = (dispatch) => {
  dispatch(setCurrentPage(1));
  dispatch(setPart1Loading(true));
  dispatch(setPart2Loading(true));
  dispatch(setTableLoading(true));
};

const AdvancedSearch = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.app.theme);
  const advancedFilters = useSelector((state) => state.app.advancedFilters);
  const isDark = theme === 'dark';

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_ADVANCED_FILTERS);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  const activeCount = useMemo(
    () => countActiveAdvancedFilters(advancedFilters),
    [advancedFilters]
  );
  const activeEntries = useMemo(
    () => getActiveAdvancedFilterEntries(advancedFilters),
    [advancedFilters]
  );

  useEffect(() => {
    if (open) {
      setDraft({ ...EMPTY_ADVANCED_FILTERS, ...advancedFilters });
    }
  }, [open, advancedFilters]);

  useEffect(() => {
    if (!open) return undefined;
    const handleOutsideClick = (event) => {
      if (
        panelRef.current?.contains(event.target) ||
        buttonRef.current?.contains(event.target)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  const handleDraftChange = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    dispatch(setAdvancedFilters(draft));
    triggerPlatformReload(dispatch);
    setOpen(false);
  };

  const handleClearDraft = () => {
    setDraft({ ...EMPTY_ADVANCED_FILTERS });
  };

  const handleClearAll = () => {
    dispatch(clearAdvancedFilters());
    setDraft({ ...EMPTY_ADVANCED_FILTERS });
    triggerPlatformReload(dispatch);
    setOpen(false);
  };

  const handleRemoveChip = (key) => {
    const next = { ...advancedFilters, [key]: '' };
    dispatch(setAdvancedFilters(next));
    triggerPlatformReload(dispatch);
  };

  const inputClass = `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B9187]/40 ${
    isDark
      ? 'bg-[#1f232a] border-[#3f4558] text-white placeholder:text-gray-500'
      : 'bg-white border-gray-300 text-slate-900 placeholder:text-gray-400'
  }`;

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
            isDark
              ? 'border-gray-600 bg-[#27282D] text-white hover:bg-[#32343a]'
              : 'border-gray-300 bg-white text-slate-700 hover:bg-gray-50'
          } ${open ? (isDark ? 'ring-2 ring-[#4B9187]/50' : 'ring-2 ring-[#4B9187]/30') : ''}`}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <svg width="18" height="18" viewBox="0 0 21 20" fill="none" aria-hidden="true">
            <path d="M6.84717 16.9446V12.0835" stroke="#9598B0" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M6.84717 5.139V3.05566" stroke="#9598B0" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M14.4861 16.9444V14.8611" stroke="#9598B0" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M14.4861 7.91678V3.05566" stroke="#9598B0" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M8.93049 6.5278V10.6945C8.93049 11.4584 8.58327 12.0834 7.5416 12.0834H6.15271C5.11105 12.0834 4.76382 11.4584 4.76382 10.6945V6.5278C4.76382 5.76392 5.11105 5.13892 6.15271 5.13892H7.5416C8.58327 5.13892 8.93049 5.76392 8.93049 6.5278Z" stroke="#9598B0" strokeWidth="1.3" />
            <path d="M16.5694 9.30564V13.4723C16.5694 14.2362 16.2222 14.8612 15.1805 14.8612H13.7916C12.75 14.8612 12.4027 14.2362 12.4027 13.4723V9.30564C12.4027 8.54175 12.75 7.91675 13.7916 7.91675H15.1805C16.2222 7.91675 16.5694 8.54175 16.5694 9.30564Z" stroke="#9598B0" strokeWidth="1.3" />
          </svg>
          <span>Advanced</span>
          {activeCount > 0 && (
            <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-[#4B9187] px-1.5 py-0.5 text-[11px] font-semibold text-white">
              {activeCount}
            </span>
          )}
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className={`transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            <path d="M11.0666 5.30542L7.44441 8.92764C7.01663 9.35542 6.31663 9.35542 5.88885 8.92764L2.26663 5.30542" stroke="#9598B0" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>

        {open && (
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Advanced filters"
            className={`absolute right-0 top-[calc(100%+8px)] z-[1200] w-[min(720px,calc(100vw-2rem))] rounded-2xl border shadow-2xl ${
              isDark ? 'border-[#3f4558] bg-[#1b1f29] text-white' : 'border-gray-200 bg-white text-slate-900'
            }`}
          >
            <div className={`flex items-start justify-between gap-3 border-b px-5 py-4 ${isDark ? 'border-[#3f4558]' : 'border-gray-200'}`}>
              <div>
                <p className="text-base font-semibold">Advanced filters</p>
                <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Narrow claims by facility, payer, patient, and other columns. Use the search box for Claim ID.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={`rounded-md p-1 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-slate-900'}`}
                aria-label="Close advanced filters"
              >
                ×
              </button>
            </div>

            <div className="grid max-h-[420px] grid-cols-1 gap-3 overflow-y-auto px-5 py-4 sm:grid-cols-2">
              {ADVANCED_FILTER_FIELDS.map((field) => (
                <label key={field.key} className="block">
                  <span className={`mb-1 block text-xs font-medium uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {field.label}
                  </span>
                  <input
                    type={field.inputType || 'text'}
                    value={draft[field.key] || ''}
                    onChange={(e) => handleDraftChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className={inputClass}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApply();
                      }
                    }}
                  />
                </label>
              ))}
            </div>

            <div className={`flex flex-wrap items-center justify-between gap-2 border-t px-5 py-4 ${isDark ? 'border-[#3f4558]' : 'border-gray-200'}`}>
              <button
                type="button"
                onClick={handleClearDraft}
                className={`text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-slate-900'}`}
              >
                Reset form
              </button>
              <div className="flex items-center gap-2">
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className={`rounded-lg px-3 py-2 text-sm font-medium ${isDark ? 'text-gray-300 hover:bg-white/10' : 'text-slate-600 hover:bg-gray-100'}`}
                  >
                    Clear all filters
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleApply}
                  className="rounded-lg bg-[#4B9187] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d7a72]"
                >
                  Apply filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {activeEntries.length > 0 && (
        <div className="flex max-w-[min(720px,calc(100vw-2rem))] flex-wrap items-center justify-end gap-2">
          {activeEntries.map((entry) => (
            <span
              key={entry.key}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${
                isDark ? 'border-[#3f4558] bg-[#27282D] text-gray-200' : 'border-gray-200 bg-gray-50 text-slate-700'
              }`}
            >
              <span className="font-medium">{entry.label}:</span>
              <span className="max-w-[140px] truncate">{entry.displayValue || entry.value}</span>
              <button
                type="button"
                onClick={() => handleRemoveChip(entry.key)}
                className={`ml-0.5 rounded-full px-1 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
                aria-label={`Remove ${entry.label} filter`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
