import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { useApiEndpoint } from "../../../ApiEndpointContext";

const AIDetail = () => {
  const apiUrl = useApiEndpoint();
  const { token } = useParams();
  const [detail, setDetail] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (apiUrl === '') return;
    if (token) {
    }
  }, [apiUrl, token])

  return (
    <div className="rounded-lg flex flex-col">
      <div className="flex w-full">
        <div className="flex w-1/2">
          <div className="w-1/4 bg-[#E4F1FF] rounded-tl-lg py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-t-[#CACBCB] border-t-[1px] border-l-[#CACBCB] border-l-[1px]  font-inter font-medium text-[16px]">Prediction Score</div>
          <div className="w-3/4 py-[16px] pl-[12px] border-[#CACBCB] border-t-[1px] border-b-[1px] bg-white font-inter font-medium text-[14px]">80%</div>
        </div>
        <div className="flex w-1/2">
          <div className="w-1/4 bg-[#E4F1FF] py-[15px] pl-[12px] border-t-[#CACBCB] border-t-[1px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-l-[#C6DCFC] border-l-[1px] font-inter font-medium text-[16px]">Payer ID</div>
          <div className="w-3/4 rounded-tr-lg py-[16px] pl-[12px] border-[#CACBCB] border-t-[1px] border-r-[1px] border-b-[1px] bg-white font-inter font-medium text-[14px] ">Various</div>
        </div>
      </div>
      <div className="flex w-full">
        <div className="flex w-1/2">
          <div className="w-1/4 bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-l-[#CACBCB] border-l-[1px] font-inter font-medium text-[16px]">Procedure Code</div>
          <div className="w-3/4 py-[16px] pl-[12px] border-[#CACBCB] border-b-[1px] bg-white font-inter font-medium text-[14px] ">Various</div>
        </div>
        <div className="flex w-1/2">
          <div className="w-1/4 bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-l-[#C6DCFC] border-l-[1px] font-inter font-medium text-[16px]">Claim State</div>
          <div className="w-3/4 py-[16px] pl-[12px] border-[#CACBCB] border-r-[1px] border-b-[1px] bg-white font-inter font-medium text-[14px] ">Various</div>
        </div>
      </div>
      <div className="flex w-full">
        <div className="flex w-1/2">
          <div className="w-1/4 bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-l-[#CACBCB] border-l-[1px] font-inter font-medium text-[16px]">Diagnosis Code</div>
          <div className="w-3/4 py-[16px] pl-[12px] border-[#CACBCB] border-b-[1px] bg-white font-inter font-medium text-[14px] ">Various</div>
        </div>
        <div className="flex w-1/2">
          <div className="w-1/4 bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-l-[#C6DCFC] border-l-[1px] font-inter font-medium text-[16px]">Category</div>
          <div className="w-3/4 py-[16px] pl-[12px] border-[#CACBCB] border-r-[1px] border-b-[1px] bg-white font-inter font-medium text-[14px] ">Various</div>
        </div>
      </div>
      <div className="flex w-full">
        <div className="flex w-1/2">
          <div className="w-1/4 bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-l-[#CACBCB] border-l-[1px] font-inter font-medium text-[16px]">Reason Code</div>
          <div className="w-3/4 py-[16px] pl-[12px] border-[#CACBCB] border-b-[1px] bg-white font-inter font-medium text-[14px] ">Various</div>
        </div>
        <div className="flex w-1/2">
          <div className="w-1/4 bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[#CACBCB] border-b-[1px] border-l-[#C6DCFC] border-l-[1px] font-inter font-medium text-[16px]">Remark Code</div>
          <div className="w-3/4 py-[16px] pl-[12px] border-[#CACBCB] border-r-[1px] border-b-[1px] bg-white font-inter font-medium text-[14px] ">Various</div>
        </div>
      </div>
      <div className="flex w-full">
        <div className="w-[12.5%] bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-l-[#CACBCB] border-l-[1px] font-inter font-medium text-[16px]">Evidence</div>
        <div className="w-[87.5%] py-[16px] pl-[12px] border-[#CACBCB] border-r-[1px] border-b-[1px] bg-white font-inter font-medium text-[14px] ">Various</div>
      </div>
      <div className="flex w-full">
        <div className="w-[12.5%] bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-l-[#CACBCB] border-l-[1px] font-inter font-medium text-[16px]">Root Cause</div>
        <div className="w-[87.5%] py-[16px] pl-[12px] border-[#CACBCB] border-r-[1px] border-b-[1px] bg-white font-inter font-medium text-[14px] ">Various</div>
      </div>
      <div className="flex w-full">
        <div className="w-[12.5%] bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-l-[#CACBCB] border-l-[1px] font-inter font-medium text-[16px]">Recommendation</div>
        <div className="w-[87.5%] py-[16px] pl-[12px] border-[#CACBCB] border-r-[1px] border-b-[1px] bg-white font-inter font-medium text-[14px] ">Various</div>
      </div>
      <div className="flex w-full">
        <div className="w-[12.5%] bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-l-[#CACBCB] border-l-[1px] font-inter font-medium text-[16px]">Action</div>
        <div className="w-[87.5%] py-[16px] pl-[12px] border-[#CACBCB] border-r-[1px] border-b-[1px] bg-white font-inter font-medium text-[14px] ">Various</div>
      </div>
      <div className="flex w-full">
        <div className="w-[12.5%] bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-l-[#CACBCB] border-l-[1px] font-inter font-medium text-[16px]">Notes</div>
        <div className="w-[87.5%] py-[16px] pl-[12px] border-[#CACBCB] border-r-[1px] border-b-[1px] bg-white font-inter font-medium text-[14px] ">Various</div>
      </div>
      <div className="flex w-full">
        <div className="flex w-1/2">
          <div className="w-1/4 bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-l-[#CACBCB] border-l-[1px] font-inter font-medium text-[16px]">Count</div>
          <div className="w-3/4 py-[16px] pl-[12px] border-[#CACBCB] border-b-[1px] bg-white font-inter font-medium text-[14px] ">Various</div>
        </div>
        <div className="flex w-1/2">
          <div className="w-1/4 bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[1px] border-l-[#C6DCFC] border-l-[1px] font-inter font-medium text-[16px]">Charges</div>
          <div className="w-3/4 py-[16px] pl-[12px] border-[#CACBCB] border-r-[1px] border-b-[1px] bg-white font-inter font-medium text-[14px] ">Various</div>
        </div>
      </div>
      <div className="flex w-full">
        <div className="flex w-1/2">
          <div className="w-1/4 bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[1px] border-b-[#CACBCB] border-b-[1px] border-l-[#CACBCB] border-l-[1px] font-inter font-medium text-[16px]">Original Allowed Amt</div>
          <div className="w-3/4 py-[16px] pl-[12px] border-[#CACBCB] border-b-[1px] bg-white font-inter font-medium text-[14px] ">Various</div>
        </div>
        <div className="flex w-1/2">
          <div className="w-1/4 bg-[#E4F1FF] py-[15px] pl-[12px] border-[#C6DCFC] border-r-[#C6DCFC] border-r-[1px] border-b-[#CACBCB] border-b-[1px] border-l-[#C6DCFC] border-l-[1px]  font-inter font-medium text-[16px]">Overturned Allowed Amt</div>
          <div className="w-3/4 py-[16px] pl-[12px] border-[#CACBCB] border-r-[1px] border-b-[1px] bg-white font-inter font-medium text-[14px]">80%</div>
        </div>
      </div>
      <div className="flex w-full h-4 border-[#CACBCB] border-b-[1px] border-l-[1px] border-r-[1px] bg-white">
      </div>
      <div className="flex w-full rounded-b-lg border-[#CACBCB] border-b-[1px] border-l-[1px] border-r-[1px] bg-white justify-end py-[16px] pr-[24px]">
        <div className="font-semibold bg-[#1A3F59] rounded-lg font-inter text-[16px] px-[20px] py-[12px] text-white cursor-pointer select-none"
          onClick={() => {
            navigate(`/${location.pathname.split('/')[1]}/${token}`);
          }}
        >View Claims</div>
      </div>
    </div>
  )
}

export default AIDetail;