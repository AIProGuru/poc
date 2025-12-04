import React, { useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Header";
import FAQ from "../components/layout/FAQ";

const QACard = ({ defaultExpanded = false, title, content }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleChange = () => setExpanded(!expanded);

  return expanded ? (
    <div className="border-gray-300 w-full rounded-2xl p-3 bg-white shadow-md">
      <div
        className="flex flex-row items-center justify-between border-b border-gray-200 py-2"
        onClick={handleChange}
      >
        <span className="text-gray-800 text-[20px]">
          {title.split(" ").map((word, index) =>
            word === "Aaftaab" ? (
              <React.Fragment key={`title-${index}`}>
                <u className="text-[#002FFF]">{word}</u>{" "}
              </React.Fragment>
            ) : (
              <span key={`title-${index}`}>{word} </span>
            )
          )}
        </span>

        <div className="p-3 bg-gray-100 rounded-md cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
          >
            <g
              fill="none"
              stroke="#002FFF"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21l-4.3-4.3" />
            </g>
          </svg>
        </div>
      </div>

      <div className="py-3">
        <span className="text-gray-700 text-[16px]">
          {content.split(" ").map((word, index) =>
            word === "Aaftaab" ? (
              <React.Fragment key={`content-${index}`}>
                <u className="text-[#002FFF]">{word}</u>{" "}
              </React.Fragment>
            ) : (
              <span key={`content-${index}`}>{word} </span>
            )
          )}
        </span>
      </div>
    </div>
  ) : (
    <div className="bg-gray-50 w-full rounded-2xl p-3 border border-gray-200">
      <div
        className="flex flex-row items-center justify-between py-2"
        onClick={handleChange}
      >
        <span className="text-gray-800 text-[20px]">
          {title.split(" ").map((word, index) =>
            word === "Aaftaab" ? (
              <React.Fragment key={`title-collapsed-${index}`}>
                <u className="text-[#002FFF]">{word}</u>{" "}
              </React.Fragment>
            ) : (
              <span key={`title-collapsed-${index}`}>{word} </span>
            )
          )}
        </span>
        <div className="p-3 bg-gray-100 rounded-md cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
          >
            <g
              fill="none"
              stroke="#002FFF"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21l-4.3-4.3" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

const Contact = () => {
  return (
    <div
      className="flex flex-col bg-white overflow-y-auto bg-no-repeat bg-cover overflow-x-hidden"
      style={{
        // backgroundImage: "url('/bg-optimized.png')",
        backgroundPosition: "center top 000px",
      }}
    >
      <Header />
      <div className="container mx-auto">
        <div className="w-[100%] flex flex-col justify-center items-center mb-20">
          <div className="flex flex-col max-w-[879px] w-full pt-[20vh] md:text-center text-start">
            <span className="md:text-[64px] text-[42px] text-gray-800 font-bold">
              Contact Us:
            </span>
            <span className="text-gray-600 font-normal text-[22px] leading-[30.8px]">
              Let's discuss how Aaftaab can transform your denial management.
              Whether you're looking for a demo, have questions about our
              platform, or want to explore a partnership, our team is here to
              help
            </span>
          </div>
          {/* <div class="flex-1 sm:w-full w-[160%]">
            <img src="/contact-card.svg" alt="Dashbaord Card" className="" />
          </div> */}
        </div>

        <div className="w-[100%] flex flex-col gap-14">
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(240,242,255,1) 100%)",
            }}
            className="rounded-2xl md:p-10 px-[24px] py-[32px] flex flex-col gap-2 items-center border border-gray-200 shadow-lg"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <span className="text-gray-800 font-bold md:text-[54px] text-[38px] leading-[38px]">
                Reach out to our team
              </span>
              <span className="text-gray-600 text-[22px] font-normal leading-[30.8px]">
                Fill out the form below, and we'll get back to you promptly!
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4 w-[100%] grid-cols-1 text-gray-800">
              <div className="flex flex-col">
                <label className="text-gray-700 font-medium">Your Name</label>
                <input
                  type="text"
                  className="rounded-lg bg-white mt-2 p-3 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  placeholder="Enter your Name"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-700 font-medium">Email</label>
                <input
                  type="text"
                  className="rounded-lg bg-white mt-2 p-3 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  placeholder="Enter your Email"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-700 font-medium">Company Name</label>
                <input
                  type="text"
                  className="rounded-lg bg-white mt-2 p-3 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  placeholder="Enter your Company Name"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-700 font-medium">Write your question</label>
                <input
                  type="text"
                  className="rounded-lg bg-white mt-2 p-3 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  placeholder="Enter your Question"
                />
              </div>
            </div>

            <button className="text-white bg-[#0048FF] py-4 px-6 flex rounded-md items-center gap-2 mt-10 w-full justify-center sm:w-fit hover:bg-blue-600 transition-colors shadow-md">
              Send
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1.5em"
                height="1.5em"
                viewBox="0 0 24 24"
              >
                <g fill="currentColor">
                  <path d="m12.052 14.829l1.414 1.414L17.71 12l-4.243-4.243l-1.414 1.415L13.88 11H6.343v2h7.537z" />
                  <path
                    fillRule="evenodd"
                    d="M19.778 19.778c4.296-4.296 4.296-11.26 0-15.556s-11.26-4.296-15.556 0s-4.296 11.26 0 15.556s11.26 4.296 15.556 0m-1.414-1.414A9 9 0 1 0 5.636 5.636a9 9 0 0 0 12.728 12.728"
                    clipRule="evenodd"
                  />
                </g>
              </svg>
            </button>
          </div>

          {/* <div className="flex gap-4 justify-stretch md:flex-row flex-col">
            <div className="border border-blue-500 rounded-2xl flex gap-10 md:w-[60%] w-full items-center sm:flex-row flex-col relative bg-white shadow-md">
              <div className="flex flex-col md:p-4 md:w-2/3 w-full p-[24px] z-10 gap-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1.5em"
                  height="1.5em"
                  viewBox="0 0 256 256"
                >
                  <path
                    fill="#0048FF"
                    d="M128 66a38 38 0 1 0 38 38a38 38 0 0 0-38-38m0 64a26 26 0 1 1 26-26a26 26 0 0 1-26 26m0-112a86.1 86.1 0 0 0-86 86c0 30.91 14.34 63.74 41.47 94.94a252.3 252.3 0 0 0 41.09 38a6 6 0 0 0 6.88 0a252.3 252.3 0 0 0 41.09-38c27.13-31.2 41.47-64 41.47-94.94a86.1 86.1 0 0 0-86-86m0 206.51C113 212.93 54 163.62 54 104a74 74 0 0 1 148 0c0 59.62-59 108.93-74 120.51"
                  />
                </svg>
                <span className="text-gray-800 font-medium">Address</span>

                <span className="text-gray-600 z-10 gap-2 w-[70%] flex flex-col">
                  <p>Aaftaab HQ Address</p>
                  <p>691 S Milpitas Blvd Suite 217, Milpitas, CA 95035</p>
                </span>
              </div>
              <div className="md:absolute md:w-1/2 right-0 top-0 h-full w-full">
                <div className="relative w-full h-full md:w-full">
                  <img
                    src="/contact-map.png"
                    alt="map"
                    className="rounded-xl w-full h-full"
                  />
                  <div className="absolute left-0 top-0 mix-blend-multiply bg-blue-100 w-full h-full rounded-xl" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 flex-1">
              <div className="border border-blue-500 p-7 rounded-2xl flex flex-col gap-2 h-1/2 justify-center bg-white shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1.5em"
                  height="1.5em"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#0048FF"
                    d="M19.5 22a1.5 1.5 0 0 0 1.5-1.5V17a1.5 1.5 0 0 0-1.5-1.5c-1.17 0-2.32-.18-3.42-.55a1.51 1.51 0 0 0-1.52.37l-1.44 1.44a14.77 14.77 0 0 1-5.89-5.89l1.43-1.43c.41-.39.56-.97.38-1.53c-.36-1.09-.54-2.24-.54-3.41A1.5 1.5 0 0 0 7 3H3.5A1.5 1.5 0 0 0 2 4.5C2 14.15 9.85 22 19.5 22M3.5 4H7a.5.5 0 0 1 .5.5c0 1.28.2 2.53.59 3.72c.05.14.04.34-.12.5L6 10.68c1.65 3.23 4.07 5.65 7.31 7.32l1.95-1.97c.14-.14.33-.18.51-.13c1.2.4 2.45.6 3.73.6a.5.5 0 0 1 .5.5v3.5a.5.5 0 0 1-.5.5C10.4 21 3 13.6 3 4.5a.5.5 0 0 1 .5-.5"
                  />
                </svg>
                <span className="text-gray-800 font-medium">Phone</span>

                <span className="text-gray-600">408-625-7777</span>
              </div>

              <div className="border border-blue-500 p-7 rounded-2xl flex flex-col gap-2 h-1/2 justify-center bg-white shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1.5em"
                  height="1.5em"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#0048FF"
                    d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2zm-2 0l-8 5l-8-5zm0 12H4V8l8 5l8-5z"
                  />
                </svg>
                <span className="text-gray-800 font-medium">Email</span>

                <span className="text-gray-600">contact@gabeo.ai</span>
              </div>
            </div>
          </div> */}
        </div>
        <FAQ />
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
