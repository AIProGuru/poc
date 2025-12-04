import React, { useEffect, useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { getCurrentDateTime } from "../utils/config";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Apply = () => {
  const navigate = useNavigate();
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getDate()).padStart(2, "0");
  const [params, setParams] = useState(null);
  let { token } = useParams();

  useEffect(() => {
    if (token) {
      setParams(JSON.parse(atob(token)));
      console.log(params);
    }
  }, [token]);

  return (
    <div
      className="flex flex-col  bg-[#262830] overflow-y-auto bg-no-repeat bg-cover"
      style={{
        backgroundImage: "url('/bg-optimized.png')",
        backgroundPosition: "center top 000px",
      }}
    >
      <Header />
      <div className="container max-w-[1165px] mx-auto mt-40 gap-[50px] flex flex-col">
        <div className="h-[50px] w-full flex justify-between mx-auto">
          <div className="w-[120px] flex items-center gap-1">
            <img src="/calendar.svg" alt="" className="w-[24px] h-[24px]" />
            <p className="text-[#EBEDF0] text-[14px]">
              {month}.{day}.{year}
            </p>
          </div>
        </div>
        <div className="gap-8 flex flex-col">
          <h1 className="text-[#EBEDF0] md:text-[64px] md:leading-[64px] text-[42px] leading-[46px] font-bold">
            {params && params.title}
          </h1>
          <div className="flex flex-col text-[22px] gap-4">
            <div className="md:flex-row text-[22px] gap-1 flex-col flex">
              <h2 className="text-[#4570FF] ">Location:</h2>{" "}
              <p className="text-[#EBEDF0]">{params && params.location}</p>
            </div>
            <div className="md:flex-row text-[22px] gap-1 flex-col flex">
              <h2 className="text-[#4570FF] ">Starting Date:</h2>{" "}
              <p className="text-[#EBEDF0]">{params && params.startdate}</p>
            </div>
            <div className="md:flex-row text-[22px] gap-1 flex-col flex">
              <h2 className="text-[#4570FF] ">Compensation:</h2>
              <p className="text-[#EBEDF0]">{params && params.compensation}</p>
            </div>
          </div>
          <div className="text-[20px] flex flex-col">
            <h3 className="text-[#EBEDF0] font-bold">
              What We're Looking For:
            </h3>
            <ul className="text-[#A9C5ED]">
              {params &&
                params.lookingfor.map((item) => (
                  <li className="list-disc ml-8">{item}</li>
                ))}
            </ul>
          </div>
          <div className="text-[20px] flex flex-col">
            <h3 className="text-[#EBEDF0] font-bold">Who You Are:</h3>
            <ul className="text-[#A9C5ED]">
              {params &&
                params.whoyouare.map((item) => (
                  <li className="list-disc ml-8">{item}</li>
                ))}
            </ul>
          </div>
        </div>
        <div className="bg-gradient-to-r from-[#3849D8B2] to-[#08105036] md:px-[48px] py-[44px] px-[24px] rounded-[32px] flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h1 className="font-bold text-white md:text-[54px] text-[38px]">
              Apply for this job
            </h1>
            <p className="text-[22px] text-[#A9C5ED]">
              *indicates a required field
            </p>
          </div>
          <div>
            <p className="font-bold text-[#EBEDF0] text-[20px]">Detail</p>
            <div className="grid md:grid-cols-2 grid-cols-1 gap-[32px] items-center text-[#EBEDF0]">
              <div className="flex flex-col gap-[11px]">
                <p className="text-[16px] ">First Name</p>
                <input
                  placeholder="Text here"
                  type="text"
                  className="w-full bg-[#121421] border border-[#06060CCC] p-4 rounded-xl "
                />
              </div>
              <div className="flex flex-col gap-[11px]">
                <p>Second Name</p>
                <input
                  placeholder="Text here"
                  type="text"
                  className="w-full bg-[#121421] border border-[#06060CCC] p-4 rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-[11px]">
                <p>Phone</p>
                <input
                  placeholder="+1 ___-___-____"
                  type="text"
                  className="w-full bg-[#121421] border border-[#06060CCC] p-4 rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-[11px]">
                <p>Email</p>
                <input
                  placeholder="mymail@gmail.com"
                  type="email"
                  className="w-full bg-[#121421] border border-[#06060CCC] p-4 rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-[11px]">
                <p>LinkedIn</p>
                <input
                  placeholder="linkhere"
                  type="text"
                  className="w-full bg-[#121421] border border-[#06060CCC] p-4 rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-[11px]">
                <p>Website</p>
                <input
                  placeholder="mysitehere"
                  type="text"
                  className="w-full bg-[#121421] border border-[#06060CCC] p-4 rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between rounded-[7px] border border-[#1219537D] py-[6px] px-[7px] items-center">
            <div className="flex justify-between w-[300px] text-[#EBEDF0] text-[16px]">
              <p>MyCV.PDF</p>
              <p>342.Kb</p>
            </div>
            <button className="md:block hidden bg-gradient-to-r from-[#16192D] to-[#0810503D] text-[#0048FF] font-bold text-[14px] px-[10px] py-[17px] rounded-xl w-[160px]">
              Change CV file
            </button>
          </div>
          <button className="md:hidden block bg-gradient-to-r from-[#16192D] to-[#0810503D] text-[#0048FF] font-bold text-[14px] px-[10px] py-[17px] rounded-xl w-[180px]">
            Change CV file
          </button>
          <div className="flex justify-between rounded-[7px] border border-[#1219537D] py-[6px] px-[7px] items-center">
            <div className="flex justify-between w-[300px] text-[#EBEDF0] text-[16px]">
              <p>My Cover Letter</p>
              <p>342.Kb</p>
            </div>
            <button className="md:block hidden bg-gradient-to-r from-[#16192D] to-[#0810503D] text-[#0048FF] font-bold text-[14px] px-[10px] py-[17px] rounded-xl w-[160px]">
              Change Cover Letter
            </button>
          </div>
          <button className="md:hidden block bg-gradient-to-r from-[#16192D] to-[#0810503D] text-[#0048FF] font-bold text-[14px] px-[10px] py-[17px] rounded-xl w-[180px]">
            Change CV file
          </button>
          <div className="bg-gradient-to-r from-[#06060CCC] to-[#0810503D] border border-[#1219538F] p-[25px] gap-8 flex flex-col rounded-xl">
            <div className="flex justify-between">
              <p className="text-[20px] font-bold text-[#EBEDF0]">
                Send Notification for this position
              </p>
              <div className="flex items-center space-x-4">
                <label
                  htmlFor="toggle1"
                  className="relative inline-block w-20 h-10"
                >
                  <input type="checkbox" id="toggle1" className="hidden peer" />
                  <span className="slider absolute border inset-0 rounded-full bg-gray-400 transition-all duration-300 peer-checked:bg-[#121421] peer-checked:border-[#002FFF]"></span>
                  <span className="dot absolute w-8 h-8 bg-[#002FFF] rounded-full left-1 top-1 transition-all duration-300 peer-checked:left-11"></span>
                </label>
              </div>
            </div>
            <div className="flex md:flex-row flex-col justify-between gap-[47px]">
              <div className="flex justify-between w-full">
                <p className="text-[#EBEDF0] text-[16px]">On email</p>
                <div className="flex items-center space-x-4">
                  <label
                    htmlFor="toggle2"
                    className="relative inline-block w-20 h-10"
                  >
                    <input
                      type="checkbox"
                      id="toggle2"
                      className="hidden peer"
                    />
                    <span className="slider absolute border inset-0 rounded-full bg-gray-400 transition-all duration-300 peer-checked:bg-[#121421] peer-checked:border-[#002FFF]"></span>
                    <span className="dot absolute w-8 h-8 bg-[#002FFF] rounded-full left-1 top-1 transition-all duration-300 peer-checked:left-11"></span>
                  </label>
                </div>
              </div>
              <div className="flex justify-between w-full">
                <p className="text-[#EBEDF0] text-[16px]">On phone</p>
                <div className="flex items-center space-x-4">
                  <label
                    htmlFor="toggle3"
                    className="relative inline-block w-20 h-10"
                  >
                    <input
                      type="checkbox"
                      id="toggle3"
                      className="hidden peer"
                    />
                    <span className="slider absolute border inset-0 rounded-full bg-gray-400 transition-all duration-300 peer-checked:bg-[#121421] peer-checked:border-[#002FFF]"></span>
                    <span className="dot absolute w-8 h-8 bg-[#002FFF] rounded-full left-1 top-1 transition-all duration-300 peer-checked:left-11"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="text-white md:text-[20px] text-[16px] font-black bg-[#0048FF] shadow-xl shadow-[#0048FF]/50 items-center rounded-xl flex gap-2 md:py-[23px] py-[13px] px-[56px] ">
              Submit application
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="m12 16l4-4l-4-4l-1.4 1.4l1.6 1.6H8v2h4.2l-1.6 1.6zm0 6q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Apply;
