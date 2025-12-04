import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "../components/layout/Header";
import Container from "../components/layout/Container";
import Team from "../components/layout/Team";
import Workflow from "../components/layout/Workflow";
import Footer from "../components/layout/Footer";
import Discover from "../components/layout/Discover";
import FAQ from "../components/layout/FAQ";
import SlotCounter from "react-slot-counter";

import "./Home.css";
import Odometer from "../components/Odometer";
import Discovermob from "../components/layout/Discovermob";
import DenialMenu from "../components/special/DenialMenu";
import { Radar } from "recharts";
import RadarComp from "../components/special/Radar";
import Timeline from "../components/animated-components/OurHistory";

const Home = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [ToggleBtn1, setToggleBtn1] = useState(false);
  const [counter, setCounter] = useState(0);
  const [changeIndex, setChangeIndex] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });


  const sliderRef = useRef(null);
  const intervalRef = useRef(null);
  const [currentIndexSl, setCurrentIndexSl] = useState(0);

  useEffect(() => {
    const scrollSlider = () => {
      if (sliderRef.current) {
        const maxScrollLeft =
          sliderRef.current.scrollWidth - sliderRef.current.clientWidth;
        if (sliderRef.current.scrollLeft >= maxScrollLeft) {
          sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
          setCurrentIndexSl(0);
        } else {
          sliderRef.current.scrollBy({
            left: window.innerWidth,
            behavior: "smooth",
          });
          setCurrentIndexSl((prevIndex) => (prevIndex + 1) % 5); // Assuming 5 slides
        }
      }
    };

    intervalRef.current = setInterval(scrollSlider, 2000);

    return () => clearInterval(intervalRef.current);
  }, []);

  const [value, setValue] = useState(4704782);

  useEffect(() => {
    const interval = setInterval(() => {
      setValue((prevValue) => prevValue + 1);
    }, 1000); // Adjust the interval as needed

    return () => clearInterval(interval);
  }, []);

  const navigate = useNavigate();
  const togglebtn1 = () => {
    setToggleBtn1(!ToggleBtn1);
  };

  document.addEventListener("scroll", function () {
    const button = document.getElementById("calculate-savings-button");
    const footer = document.getElementById("footer");

    if (button && footer) {
      const footerRect = footer.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      if (footerRect.top <= window.innerHeight && footerRect.bottom >= 0) {
        button.classList.remove("fade-in");
        button.classList.add("fade-out");
        setTimeout(() => {
          button.style.position = "absolute";
          button.style.top = `${footerRect.top - buttonRect.height}px`;
        }, 500); // Match the duration of the fade-out transition
      } else {
        button.classList.remove("fade-out");
        button.classList.add("fade-in");
        button.style.position = "fixed";
        button.style.top = "calc(50% - 50px)";
      }
    }
  });

  useEffect(() => { }, [isAuthenticated]);

  return (
    <div
      className="h-full overflow-x-hidden bg-gradient-to-br from-neutral-50 to-primary-50 overflow-y-auto"
    >
      <Header />

      <div className="flex mt-10 flex-col justify-center items-center pt-24 gap-8">
        <p
          className="font-montserrat max-w-[90%] sm:max-w-[75%] text-center text-neutral-800 font-bold text-[42px] leading-[46px] sm:text-[64px] sm:leading-[64px] animate-fade-in-down"
        >
          <span className="gradient-text">Reclaim Lost Revenue from</span>
          <br></br>
          <span className="gradient-text">Denied Claims with AI</span>
        </p>
        <p className="font-montserrat max-w-[90%] sm:max-w-[60%] text-center text-neutral-600 text-[22px] animate-fade-in-up">
          The first AI platform built exclusively for backend denial recovery,
          turning write-offs and denied claims into cash with unmatched
          precision
        </p>
        <div className="flex flex-col  gap-y-4 w-full justify-center items-center sm:flex-row sm:gap-x-4 mb-24">
          <div className="getstarted flex justify-center w-full sm:w-auto">
            <Link to="/contact" onClick={scrollToTop} className="w-full mx-5">
              <button className="p-4 px-6 bg-white border-2 border-primary-500 hover:bg-primary-50 w-full sm:w-[200px] flex flex-row justify-evenly text-primary-600 hover:text-primary-700 font-montserrat font-semibold rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 hover-lift">
                <span>Get Started</span>
                <svg
                  width="25"
                  height="24"
                  viewBox="0 0 25 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.5 12L13 15.5M8.5 12H16.5H8.5ZM16.5 12L13 8.5L16.5 12Z"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12.5 22C18.0228 22 22.5 17.5228 22.5 12C22.5 6.47715 18.0228 2 12.5 2C6.97715 2 2.5 6.47715 2.5 12C2.5 17.5228 6.97715 22 12.5 22Z"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </Link>
          </div>
          <div className="getstarted flex justify-center w-full sm:w-auto">
            <Link to="/demo" onClick={scrollToTop} className="w-full mx-5">
              <button className="p-4 px-6 bg-white border-2 border-primary-500 hover:bg-primary-50 w-full sm:w-[200px] flex flex-row justify-evenly text-primary-600 hover:text-primary-700 font-montserrat font-semibold rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 hover-lift">
                <span>Demo</span>
              </button>
            </Link>
          </div>
          <div className="getstarted flex justify-center w-full sm:w-auto">
            <Link to="/signin" className="w-full mx-5">
              <button className="p-4 px-6 bg-white border-2 border-primary-500 hover:bg-primary-50 w-full sm:w-[200px] flex flex-row justify-evenly text-primary-600 hover:text-primary-700 font-montserrat font-semibold rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 hover-lift">
                Free Trial
              </button>
            </Link>
          </div>
        </div>

        <div className="relative  mt-[-100px]">
          <div className="hidden sm:block">
            <button
              id="calculate-savings-button"
              className="fixed sm top-[calc(50%-50px)] right-0 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 w-[140px] h-[70px] rounded-t-3xl rounded-bl-3xl flex items-center justify-center font-semibold text-white text-[14px] px-[40px] leading-[16px] gap-3 transition-all duration-300 opacity-100 z-10 sm:z-[30] shadow-medium hover:shadow-large hover-lift"
              onClick={() => {
                navigate("/calculate_savings")
                scrollToTop()
              }
              }
            >
              Calculate Savings
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-[24px] w-[24px]"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
        {/* <div className="flex  mt-[-350px] sm:mt-32 mb-5 sm:mb-2 flex-col gap-4 justify-center items-center">
          <span
            className="text-[42px] leading-[48px] sm:text-[64px]  sm:mb-8 font-bold font-poppins text-neutral-800 mb-5"
          >
            Trusted by
          </span>
          <div className="text-center text-neutral-600 text-lg font-montserrat">
            Leading healthcare organizations trust our AI-powered solutions
          </div>
        </div>

        <div className="radar-counter mt-[-100px] mb-[-100px] sm:mt-[-60px] sm:mb-[-100px]">
          <RadarComp />
        </div> */}

        <div className="  z-10   flex flex-col items-center justify-centers" id="aidenial">
          {" "}
          <p className="text-[42px] sm:text-[64px] leading-[48px] mt-10 font-bold text-neutral-800 font-poppins">
            Solution
          </p>
          <p className="font-poppins px-4  text-neutral-600 max-w-[85%] sm:max-w-[65%] text-center text-[22px] mt-5">
            We're redefining denial management with AI-powered solutions that specialize in revenue recovery. Our proprietary platform leverages deep data analysis and payer logic to unlock hidden revenue and streamline denial overturn.</p>
          
          <div className="  flex mx-16 flex-col  sm:mx-32 sm:flex-row my-10  px-10 sm:px-0 ">
            <p className="text-neutral-800 max-w-[550px] sm:max-w-[650px] mt-12 sm:mt-10 text-[38px] leading-[38px] sm:leading-[44px] relative mr-0 sm:mr-0   font-poppins font-bold ">
              Unlock Hidden Revenue in Your Claims with State-of-the-Art AI
              Precision
            </p>
          </div>

          <div className=" mt-0 sm:mt-32 z-10 flex flex-col items-center justify-centers">
            {" "}
            <p className="text-[42px] sm:text-[64px] leading-[48px] font-bold text-neutral-800 font-poppins">
              Benefits
            </p>
            <p className="font-poppins text-neutral-600 max-w-[65%] text-center text-[22px] mt-5">
              Faster Approvals, Lower Costs, Precision Accuracy
            </p>
            <div className="mx-2 sm:mx-32 text-center text-neutral-600 text-lg font-montserrat mt-16">
              Our AI-powered platform delivers measurable results through advanced automation and intelligent decision-making.
            </div>
          </div>

          <div className="mt-10 sm:mt-32 z-10 flex flex-col items-center justify-center">
            <p className="text-[42px] sm:text-[64px] leading-[48px] font-bold text-neutral-800 font-poppins">
              How it works
            </p>
            <p className="font-poppins text-neutral-600 max-w-[65%] text-center text-[22px] mt-5">
              Zero Human Involvement
            </p>
            <div className="text-center text-neutral-600 text-lg font-montserrat mt-10">
              Our automated workflow processes claims from submission to resolution without human intervention.
            </div>
          </div>



          <div className="mx-16 sm:mx-2">
            <FAQ />
          </div>
        </div>

        <DenialMenu />
        <div className="flex justify-center items-center">
          <div className="hidden sm:block">
            <Discover title={`Discover what our AI Denial Agents can do for you`} description={`Recover Revenue, Reduce Denials, Real Results`} />
          </div>
          <div className="block sm:hidden">
            <Discovermob />
          </div>
        </div>

      </div>
      <div className="" id="footer">
        <Footer />
      </div>
    </div>
  );
};

export default Home;
