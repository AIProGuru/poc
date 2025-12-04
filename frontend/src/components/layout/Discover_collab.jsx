import React from 'react';
import { Link } from 'react-router-dom';

export default function Discover_collab() {
  return (
    <div className="relative mb-10 sm:mb-32 sm:mt-16 bg-gradient-to-r from-[#3849D8B2] to-[#1219537D] w-full sm:w-[1042px] rounded-2xl p-10 overflow-visible flex flex-col justify-center sm:flex-row items-center sm:items-start">
      {/* Left Content */}
      <div className="flex-1">
        <h1 className="text-[#EBEDF0] text-[36px] sm:text-[54px] leading-[40px] sm:leading-[54px] font-bold font-poppins w-[90%] mb-4">
          We seamlessly integrate with your systems to maximize efficiency
        </h1>
      </div>
      <div className="getstarted mx-2 z-50 mt-4 sm:mt-0">
        <Link to='/contact'>
          <button className="p-4 px-6 bg-[#0048FF] flex flex-row justify-evenly w-[160px] mt-10 mr-10 text-white font-semibold rounded-xl">
            Contact Us
            <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5 12L13 15.5M8.5 12H16.5H8.5ZM16.5 12L13 8.5L16.5 12Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12.5 22C18.0228 22 22.5 17.5228 22.5 12C22.5 6.47715 18.0228 2 12.5 2C6.97715 2 2.5 6.47715 2.5 12C2.5 17.5228 6.97715 22 12.5 22Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </Link>
      </div>
      {/* AI Image */}
      <div className="absolute bottom-[-50px] right-[-50px] sm:bottom-[-160px] sm:right-[-250px]">
        <img
          src="/ai.png" // Replace this with the correct path to your ai.png file
          alt="AI Icon"
          className="h-[200px] sm:h-[400px] opacity-90"
        />
      </div>
    </div>
  );
}