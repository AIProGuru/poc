import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

import { setAppTitle } from '../../../redux/reducers/app.reducer';
import { samplifyInteger } from '../../../utils/config';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApiEndpoint } from '../../../ApiEndpointContext';

const ModelCard = ({ id, title, count, charge, state, category, carc, rarc, status, group_code, updated_at, extra, backgroundColor, setStatus, setUpdatedAt, user, setUser }) => {
  const apiUrl = useApiEndpoint();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.app.theme);
  const tags = useSelector((state) => state.tags.allTags);
  const [_status, _setStatus] = useState(status);
  const [_updatedAt, _setUpdatedAt] = useState(updated_at);
  const [loading, setLoading] = useState(false);
  const firstname = useSelector((state) => state.auth.firstname);
  const lastname = useSelector((state) => state.auth.lastname);

  const saveStatus = (value) => {
    setLoading(true);
    setStatus(value);
    _setStatus(value);
    axios.post(`${apiUrl}/change_model_status`, {
      id: id,
      status: value,
      user: `${firstname} ${lastname}`
    }).then((res) => {
      _setUpdatedAt(res.data);
      setUpdatedAt(res.data);
      setUser(`${firstname[0]?.toUpperCase() || ''} ${lastname[0]?.toUpperCase() || ''}`);
      setLoading(false);
    });
  };

  return (
    <div className={`pt-2  px-2 pb-2 rounded-3xl flex flex-col ${theme === 'dark' ? 'bg-[#1E1E1E]' : 'bg-[#EFF4FE]'}`}>
      <div className={`select-none rounded-3xl ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-black'} flex flex-col py-3`}>
        <div className="flex justify-between items-center px-6 py-2">
          <div className="flex flex-col w-full">
          <div className="flex flex-col sm:flex-row justify-between">
  <div className="text-[20px] font-semibold flex flex-col">
    <span>{title}</span>
    {!loading && user != null && <span className='text-[12px]'>{`${user.split(' ').map((row, index) => row).filter((row) => row != "").map((row) => row[0].toUpperCase()).join(' ')}, ${_updatedAt}`}</span>}
    {loading && <div className="spinner-3"></div>}
  </div>
  <div className="w-full  sm:w-[40%] flex sm:justify-end justify-start mt-4 sm:mt-0">
    <select
      className={`
        bg-transparent text-sm rounded-lg h-[40px] sm:w-[80%] w-full
        border
        ${theme === 'dark' && _status === 'approved' ? 'bg-[#151D1F] text-white' : 'text-gray-900'}
        ${theme === 'dark' && _status === 'refused' ? 'bg-[#20171A] text-white' : 'text-gray-900'}
        ${theme === 'dark' && _status === 'pending' ? 'bg-[#201E18] text-white' : 'text-gray-900'}
        ${_status === 'approved' ? 'bg-[#F3FAF9] border-green-500' : ''}
        ${_status === 'pending' ?  ' bg-[#FEFBF2] border-[#F9B701]' : ''}
        ${_status === 'refused' ?  'bg-[#FEF4F4] border-red-500' : ''}
      `}
      value={_status}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => saveStatus(e.target.value)}
    >
      <option value="approved" className={`border-none ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>Approved</option>
      <option value="pending" className={`border-none ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>Pending</option>
      <option value="refused" className={`border-none ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>Refused</option>
    </select>
  </div>
</div>
          </div>
        </div>
<hr className = {` mx-5 mt-5 ${theme === 'dark' ? 'border-gray-800':'border-gray-300' }`}/>
        <div className="px-6">
          <div className="grid grid-cols-2 md:grid-cols-2 pt-5 pb-3 lg:grid-cols-3 gap-y-4 gap-x-6">
            {[
              { label: 'Count', value: count },
              { label: 'Charges', value: `$${samplifyInteger(charge)}` },
              { label: 'Claim State', value: state },
              { label: 'Category', value: category },
              { label: 'CARC', value: carc },
              { label: 'RARC', value: rarc },
            ].map((item, index) => (
              <div key={index} className="flex flex-col">
                <div className={`font-medium text-[14px] ${theme === 'dark' ? 'text-gray-300' : 'text-[#35383B]'}`}>
                  {item.label}
                </div>
                <div className={`font-semibold text-[16px] ${theme === 'dark' ? 'text-white' : 'text-[#151618]'}`}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 flex justify-between items-center cursor-pointer text-blue-600"
        onClick={() => {
          const data = {
            code: group_code + carc,
            remark: rarc,
            procedure: '',
            keyword: '',
            pos: '',
            tabIndex: 5,
            extra: extra,
            selectedTags: tags,
          };
          dispatch(setAppTitle(title));
          navigate(`/${location.pathname.split('/')[1]}/${btoa(JSON.stringify(data))}`);
        }}>
        <a className="font-semibold cursor-pointer">View in table</a>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.85547 15.5L12.3832 10.9722C12.918 10.4375 12.918 9.5625 12.3832 9.02778L7.85547 4.5"
            stroke="#005DE2"
            strokeWidth="1.4"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

export default ModelCard;