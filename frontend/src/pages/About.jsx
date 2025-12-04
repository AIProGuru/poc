import React from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Discover from "../components/layout/Discover";
import "./careers.scss";
import Discovermob from "../components/layout/Discovermob";
 
const About = () => {

  return (
    <div
      className="flex flex-col bg-white overflow-y-auto overflow-x-hidden"
    >
      <Header />

      <div className="container flex flex-col mx-auto ">

      <div className="w-[100%] flex flex-col justify-center items-center ">
          <div className="z-10 flex justify-center items-center flex-col">
          <div className="flex flex-col max-w-[879px] w-full pt-[20vh] md:text-center text-start">
            <span className="text-[42px] leading-[46px] sm:text-[64px] sm:leading-[64px] text-[#0F172A] font-bold">
             Redefining Revenue Recovery with AI
            </span>
            <span className="text-[#475569] mt-3 font-normal text-[22px] leading-[30.8px]">
            We empower providers with innovative tools to recover lost revenue, reduce manual workloads, and secure financial health.
            </span>

            

          </div>
          <button className="h-[70px] mt-5 md:w-[235px] w-full bg-[#0048FF] shadow-xl shadow-[#0048FF]/30 items-center rounded-xl flex text-white font-semibold text-[20px] leading-[24px] py-[23px] px-[42px] justify-center gap-2">
              Get Started
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
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
        
        <div className="flex flex-col gap-4 sm:mt-10 mt-6 justify-center items-center">
          <div className="flex justify-center">
            <span className="text-[42px] leading-[46px] sm:text-[48px] sm:leading-[52px] font-bold text-[#0F172A]">
              Our Investors
            </span>
          </div>
          <div className="relative flex flex-row gap-8 mt-5 justify-center overflow-x-hidden w-full">

            <div className="flex flex-row gap-8 text-[#334155] max-w-[90vw] animate-rotate whitespace-nowrap">
              <img
                src="/xoogler.png"
                alt="xoogler ventures"
                className="h-[60px] px-5"
              />
              <img src="/hatcher.png" alt="Hatcher" className="h-[60px] px-5" />
              <img
                src="/plugnplay.png"
                alt="Plug and Play"
                className="h-[60px] px-5"
              />
              <img
                src="/yar.png"
                alt="Yar Ventures"
                className="h-[50px] py-2 mt-2 px-5"
              />
              <img
                src="/xoogler.png"
                alt="xoogler ventures"
                className="h-[60px] px-5"
              />
              <img src="/hatcher.png" alt="Hatcher" className="h-[60px] px-5" />
              <img
                src="/plugnplay.png"
                alt="Plug and Play"
                className="h-[60px] px-5"
              />
              <img
                src="/yar.png"
                alt="Yar Ventures"
                className="h-[50px] py-2 mt-2 px-5"
              />
              <img
                src="/xoogler.png"
                alt="xoogler ventures"
                className="h-[60px] px-5"
              />
              <img src="/hatcher.png" alt="Hatcher" className="h-[60px] px-5" />
              <img
                src="/plugnplay.png"
                alt="Plug and Play"
                className="h-[60px] px-5"
              />
              <img
                src="/yar.png"
                alt="Yar Ventures"
                className="h-[50px] py-2 mt-2 px-5"
              />
              <img
                src="/oncology.svg"
                alt="The Oncology Institue of Hope & Innovation"
                className="h-[60px] px-5"
              />
            </div>
          </div>
          
        </div>
        <div className="lg:mt-[120px] mt-[64px]">
          <div className="flex flex-col gap-y-8">
            <div className="flex py-2 md:justify-start text-center justify-center">
              <p className="text-[42px] leading-[46px] sm:text-[48px] sm:leading-[52px] font-bold  text-[#0F172A]" >
                Who we are
              </p>
            </div>
            <div className="flex flex-col md:flex-row md:gap-x-8 items-center md:h-[376px] gap-y-8">
              <div className="relative flex items-center rounded-2xl shadow-sm bg-white border border-[#E2E8F0] lg:w-[60%] sm:w-[80%] w-full h-full">
                <div className="w-full py-8 px-6 py-4">
                  <h3 className="md:text-[40px] text-[32px] font-bold text-[#0048FF] mb-4">
                    Mission
                  </h3>
                  <p className="text-[22px] text-[#475569]">
                    To unlock hidden revenue in denied claims and redefine
                    denial management for healthcare providers.
                  </p>
                </div>
                
              </div>

              <div className="flex flex-col justify-center bg-white border border-[#E2E8F0] rounded-lg shadow-sm lg:w-2/5 sm:w-[80%] w-full h-full">
                <div className="lg:w-2/3 w-full py-8 px-6 md:py-[10px] md:px-6">
                  <h3 className="md:text-[40px] text-[32px] font-bold text-[#0048FF] mb-4">
                    Vision
                  </h3>
                  <p className="text-[22px] text-[#475569]">
                    To lead in denial management with AI agents that deliver
                    measurable, transformative outcomes for U.S. healthcare.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:gap-x-8 items-center md:h-[376px] gap-y-8">
              <div className="flex flex-col justify-center bg-white border border-[#E2E8F0] rounded-lg shadow-sm lg:w-2/5 sm:w-[80%] w-full h-full">
                <div className="lg:w-2/3 w-full py-8 px-6 md:py-[10px] md:px-6">
                  <h3 className="md:text-[40px] text-[32px] font-bold text-[#0048FF] mb-4">
                    Core Values
                  </h3>
                  <p className="text-[22px] text-[#475569]">
                    Innovation, Reliability, and Revenue-Driven Results.
                  </p>
                </div>
              </div>

              <div className="relative flex items-center rounded-2xl shadow-sm bg-white border border-[#E2E8F0] lg:w-[60%] sm:w-[80%] w-full h-full">
                <div className="w-full py-8 px-6 md:py-[10px] md:px-6">
                  <h3 className="md:text-[40px] text-[32px] font-bold text-[#0048FF] mb-4">
                    Presentation
                  </h3>
                  {/* <div className="flex items-center gap-2">
                    <img
                      src="/Frame 24951.svg"
                      className="w-[48px] md:w-[74px]"
                    />
                    <p className="md:text-[22px] text-[14px] text-[#6C9BE0]">
                      Watch video 3:12
                    </p>
                  </div> */}
                </div>
                
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="md:py-12 md:px-20 py-12 px-0 mt-20 mb-20">
            <div className="flex justify-center md:px-[64px] md:py-[43px] px-[24px] py-[32px] bg-white border border-[#E2E8F0] rounded-2xl">
              <div className="flex w-full lg:items-center lg:flex-row flex-col gap-4">
                <div className="flex flex-col items xl:p-[29px] max-w-[650px] lg:w-[60%] w-full">
                  <h3 className="lg:text-[54px] lg:leading-[54px] text-[38px] leading-[38px] font-extrabold text-[#0F172A]">
                    We are part of the Google Startup Cloud Program
                  </h3>

                  <p className="text-xl mt-3 text-[#475569]">
                    with $350K in credits given to us as Google trusted partners
                  </p>
                </div>
                <div className="">
                  <img
                    src="/gpartner.svg"
                    alt="Google Partner"
                    className="md:w-[324px] w-[186px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      {/* <div className="gap-6 mt-0 sm:mt-32 flex flex-col py-12 sm:px-12 px-4">
        <div className="flex justify-center">
          <span className="md:text-[64px] text-[38px] font-bold text-[#D9D9D9CC]"  style={{
            "-webkit-text-stroke": "0.5px white",
          }}>
            Team members
          </span>
        </div>
        <Team />
      </div> */}
      <div className="flex justify-center items-center">
           <div className="hidden sm:block">
           <Discover title={`Discover what our AI Denial Agents can do for you`} description={`Recover Revenue, Reduce Denials, Real Results`}/>
            </div>
            <div className="block sm:hidden">
           <Discovermob/>
            </div>
           </div>
      <Footer />
    </div>
  );
};

export default About;
