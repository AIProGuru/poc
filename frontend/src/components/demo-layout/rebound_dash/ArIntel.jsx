import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAppTitle, setModels } from '../../../redux/reducers/app.reducer';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useApiEndpoint } from '../../../ApiEndpointContext';

const ArIntel = () => {
  const apiUrl = useApiEndpoint();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const models = useSelector((state) => state.app.models);
  const theme = useSelector((state) => state.app.theme);
  const tags = useSelector((state) => state.tags.allTags);

  console.log('apiUrl', apiUrl)

  useEffect(() => {
    if (apiUrl === "") return;
    dispatch(setAppTitle("AI Automation"));
    if (models.length === 0) {
      axios.get(`${apiUrl}/get_artificial_intelligence`).then(res => {
        dispatch(setModels(res.data.map((row, index) => ({
          ...row,
          Group: (() => {
            switch (row.Category) {
              case "Contractual Adj":
                return "Non-Recoverable";
              case "Patient Resp":
                return "Patient Resp";
              case null:
                return "Delinquent";
              default:
                return "Recoverable";
            }
          })()
        }))))
      })
    }
  }, [apiUrl])

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
    };
    dispatch(setAppTitle(row.Title));
    const tenantBase = location.pathname.split('/')[1] || 'rebound';
    navigate(`/${tenantBase}/denials/${btoa(JSON.stringify(payload))}`);
  };

  return (
    <div className="flex mt-[-20px] flex-col">
      <div className={`mt-2 max-h-[calc(100vh-240px)] overflow-y-auto pr-3 rounded-3xl border ${theme === 'dark' ? 'bg-white/5 border-white/10 backdrop-blur-xl' : 'bg-gradient-to-b from-white to-slate-50 border-slate-200 shadow-lg'}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${theme === 'dark' ? 'border-white/10 text-white' : 'border-slate-200 text-slate-700'}`}>
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-[#3881E3]">AI Models</p>
            <h2 className="text-lg font-semibold mt-1">Denial Automation Catalog</h2>
          </div>
          <div className="text-sm">
            {models.length} models
          </div>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {models.map((row) => (
            <div
              key={row.id}
              title={buildTooltip(row)}
              onClick={() => handleModelClick(row)}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-lg cursor-pointer ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-slate-200 bg-white text-slate-900'}`}
            >
              <div className="min-w-0 pr-3">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#3881E3]">{row.Category || 'Model'}</p>
                <h3 className="text-sm font-semibold truncate" title={row.Title}>{row.Title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-300 truncate">
                  {row.UpdatedAt ? new Date(row.UpdatedAt).toLocaleDateString() : 'No timestamp'}
                </p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${theme === 'dark' ? 'border-white/15 bg-white/5 text-white' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                {row.Count ?? 0} claims
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ArIntel;
