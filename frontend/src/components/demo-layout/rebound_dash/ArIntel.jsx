import { useEffect, useState } from 'react';
import ModelCard from "./ModelCard";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAppTitle, setModels, setStatus, setUpdatedAt, setUser } from '../../../redux/reducers/app.reducer';
import axios from 'axios';
import { useApiEndpoint } from '../../../ApiEndpointContext';

const ArIntel = () => {
  const apiUrl = useApiEndpoint();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const models = useSelector((state) => state.app.models);
  const [currentType, setCurrentType] = useState("All");

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

  return (
    <div className="flex  mt-[-20px] flex-col ">
      

      <div className="text-sm font-medium text-left text-gray-500 border-gray-200 dark:text-gray-400 dark:border-gray-700 gap-7 overflow-x-auto whitespace-nowrap hide-scrollbar">
  <ul className="inline-flex -mb-px">
    <li className=" me-2">
      <a
        href="#"
        className={` inline-block py-4 mr-3 border-b-2 text-md ${currentType === 'All'
          ? "text-[#3881E3] border-b-2 w-full flex justify-center border-[#005DE2] rounded-t-lg active"
          : "text-[#828385] border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
          }`}
        onClick={() => setCurrentType("All")}
      >
        All
      </a>
    </li>
    <li className="ml-5 me-2">
      <a
        href="#"
        className={` inline-block py-4 mr-3 border-b-2 text-md ${currentType === 'approved'
          ? "text-[#3881E3] border-b-2 w-full flex justify-center border-[#005DE2] rounded-t-lg active"
          : "text-[#828385] border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
          }`}
        onClick={() => setCurrentType("approved")}
      >
        Approved
      </a>
    </li>

    <li className="ml-5 me-2">
      <a
        href="#"
        className={` inline-block py-4 mr-3 border-b-2 text-md ${currentType === 'denied'
          ? "text-[#3881E3] border-b-2 w-full flex justify-center border-[#005DE2] rounded-t-lg active"
          : "text-[#828385] border-transparent rounded-t-lg  hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
          }`}
        onClick={() => setCurrentType("denied")}
      >
        Denied
      </a>
    </li>

    <li className="ml-5 me-2">
      <a
        href="#"
        className={` inline-block py-4 mr-3 border-b-2 text-md ${currentType === 'pending'
          ? "text-[#3881E3] border-b-2 w-full flex justify-center border-[#005DE2] rounded-t-lg active"
          : "text-[#828385] border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
          }`}
        onClick={() => setCurrentType("pending")}
      >
        Pending
      </a>
    </li>
  </ul>
</div>
<h1 className=' mt-10 text-lg'>Select Model for Automation</h1>


        <div className="p-4 pl-0 pr-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
    {
      models.filter((row, index) => currentType === 'All' || row.Status === currentType).map((row, index) => <ModelCard
        backgroundColor={(() => {
          if (row.Status === 'approved') {
            return "#F4FFF8";
          } else if (row.Status === 'pending') {
            return "#F4F6F8";
          } else if (row.Status === 'refused') {
            return "#FFEEED";
          }
        })()}
        id={row.id}
        count={row.Count}
        charge={row.Amount}
        state={row.Group}
        category={row.Category}
        carc={row.Code}
        rarc={row.Remark}
        group_code={row.GroupCode}
        status={row.Status}
        updated_at={row.UpdatedAt}
        title={row.Title}
        extra={row.extra}
        user={row.User}
        setUser={(value) => {
          dispatch(setUser({
            index: index,
            value: value
          }))
        }}
        setStatus={(value) => {
          dispatch(setStatus({
            index: index,
            value: value
          }))
        }}
        setUpdatedAt={(value) => {
          dispatch(setUpdatedAt({
            index: index,
            value: value
          }))
        }}
      />)
    }
  </div>
   

     
    </div>
  )
}

export default ArIntel;