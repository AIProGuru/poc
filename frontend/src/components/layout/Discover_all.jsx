import React from "react";
import { Link } from "react-router-dom";

export default function Discover_all({ title, desc, link, button }) {
  return (
    <div className="max-w-[1165px] relative sm:mt-16 bg-gradient-to-r from-[#3849D8B2] to-[#1219537D] w-full rounded-2xl md:p-10 px-[24px] py-[32px] overflow-visible flex flex-col justify-between sm:flex-row items-center gap-8">
      {/* Left Content */}
      <div className="md:w-[60%] w-full z-10">
        <h1 className="text-[#EBEDF0] md:text-[54px] md:leading-[54px] text-[38px] leading-[38px] font-bold font-poppins mb-4 w-[70%] sm:w-[100%] z-10">
          {title}
        </h1>
        <p className="text-[#C6D4FF] text-[22px] font-poppins mb-6 leading-[30.8px] z-10">
          {desc.split(" ").map((word, index) =>
            word === "Helio RCM" ? (
              <React.Fragment key={index}>
                 {word}{" "}
              </React.Fragment>
            ) : (
              <span key={index}>{word} </span>
            )
          )}
        </p>
      </div>
      <div className="mx-2 z-10 mt-4 sm:mt-0 flex md:w-[40%] w-full">
        <Link
          to={link}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="mx-auto p-4 px-6 bg-[#0048FF] flex flex-row justify-center sm:w-fit text-white font-semibold rounded-xl w-full gap-4"
        >
          {button}
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
        </Link>
      </div>
      {/* AI Image */}
      <div className="absolute -top-10 right-[-80px] sm:top-10 sm:right-[-250px]">
        <img
          src="/ai.png" // Replace this with the correct path to your ai.png file
          alt="AI Icon"
          className="h-[250px] sm:h-[400px] opacity-90"
        />
      </div>
    </div>
  );
}
