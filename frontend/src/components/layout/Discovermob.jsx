import React from 'react';
import { Link } from 'react-router-dom';

export default function Discovermob({title, description}) {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className='flex justify-center'>
      <div className="relative mb-10 sm:mb-32 sm:mt-16 bg-gradient-to-r from-[#3849D8B2] to-[#1219537D] h-auto sm:h-[250px] rounded-2xl p-10 overflow-hidden flex flex-col justify-center sm:flex-row items-center sm:items-start max-w-[90%]">
        {/* Left Content */}
        <div className="flex-1">
          <h1 className={`text-white z-30 text-[38px] leading-[38px] font-bold font-poppins w-[70%] mb-4 ${title?'w-[90%]':'w-[60%]'}`}>
           {title? <><span>{title}</span></> :<span>Discover what our AI Denial Agents can do for you</span>}
          </h1>
          <p className="text-[#C6D4FF] text-[22px] leading-[30px] w-[90%] font-poppins mb-6">
          {title && !description? <></> :<span>Recover Revenue, Reduce Denials, Real Results</span>}  
          </p>
        </div>
        <div className="getstarted mx-2 z-10 sm:mt-0 w-full flex justify-center bg-[#0048FF] rounded-xl items-center">
          <Link to='/contact'
            onClick={scrollToTop}
           >
            <button className="p-4 px-6 flex flex-row justify-evenly w-full mr-10 text-white font-semibold">
              <div className='flex justify-center'>
                <span className='pr-2'>Contact Us</span>
                <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.5 12L13 15.5M8.5 12H16.5H8.5ZM16.5 12L13 8.5L16.5 12Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12.5 22C18.0228 22 22.5 17.5228 22.5 12C22.5 6.47715 18.0228 2 12.5 2C6.97715 2 2.5 6.47715 2.5 12C2.5 17.5228 6.97715 22 12.5 22Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}