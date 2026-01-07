import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAppTitle } from '../../../redux/reducers/app.reducer';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApiEndpoint } from '../../../ApiEndpointContext';

const ArIntel = ({ onModelSelect }) => {
  const apiUrl = useApiEndpoint();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const models = useSelector((state) => state.app.models);
  const theme = useSelector((state) => state.app.theme);
  const tags = useSelector((state) => state.tags.allTags);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!apiUrl) return;
    dispatch(setAppTitle("AI Automation"));
  }, [apiUrl, dispatch]);

  const formatAmount = (value) => {
    const numeric = Number(value ?? 0);
    if (Number.isNaN(numeric)) return '$0';
    return `$${numeric.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
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
    const payload = {
      code: `${row.GroupCode || ''}${row.Code || ''}`,
      remark: row.Remark || '',
      procedure: '',
      keyword: '',
      pos: '',
      tabIndex: 5,
      extra: row.extra,
      selectedTags: tags,
      source: 'ai-library',
    };
    dispatch(setAppTitle(row.Title));
    if (typeof onModelSelect === 'function') {
      onModelSelect(row);
    }
    const tenantBase = location.pathname.split('/')[1] || 'rebound';
    navigate(`/${tenantBase}/denials/${btoa(JSON.stringify(payload))}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className={`rounded-[32px] border ${isDark ? 'bg-[#0B0E17] border-[#1F2231] text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-[0_20px_60px_rgba(0,0,0,0.15)]`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#8A8FB1]">AI Models</p>
            <h2 className="text-xl font-semibold mt-1 leading-tight">Denial Automation Catalog</h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
              Browse automation recipes aligned to your denial categories.
            </p>
          </div>
          <div className={`text-sm font-semibold ${isDark ? 'text-white/80' : 'text-slate-600'}`}>
            {models.length} models
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {models.length === 0 && (
            <div className={`col-span-full rounded-2xl border text-sm text-center py-6 ${isDark ? 'border-white/10 bg-white/5 text-white/70' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
              No AI models available.
            </div>
          )}
          {models.map((row) => (
            <button
              type="button"
              key={row.id}
              title={buildTooltip(row)}
              onClick={() => handleModelClick(row)}
              className={`group flex items-center justify-between rounded-2xl border px-5 py-4 transition cursor-pointer text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005DE2] ${isDark ? 'border-white/10 bg-white/5 text-white hover:bg-white/10' : 'border-slate-200 bg-white text-slate-900 hover:shadow-lg hover:-translate-y-0.5'}`}
            >
              <div className="min-w-0 pr-3">
                <p className="text-[11px] uppercase tracking-[0.25em] text-[#8A8FB1]">{row.Category || 'Model'}</p>
                <h3 className="text-sm font-semibold truncate leading-snug text-[#8A8FB1]" title={row.Title}>{row.Title}</h3>
                {/* <p className={`text-xs truncate mt-1 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
                  {row.UpdatedAt ? new Date(row.UpdatedAt).toLocaleDateString() : 'Last updated: N/A'}
                </p> */}
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${isDark ? 'border-white/15 bg-white/5 text-white' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                {row.Count ?? 0} claims
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArIntel;
