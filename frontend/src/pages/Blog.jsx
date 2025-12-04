import React, { useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Discover_reusable from "../components/layout/Discover_resuable";
import BlogHeader from "../components/blog/Blog_header_card";
import BlogLeft from "../components/blog/BlogLeft";
import BlogRight from "../components/blog/BlogRight";
import Discover_all from "../components/layout/Discover_all";
import Discover from "../components/layout/Discover";
import Discovermob from "../components/layout/Discovermob";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "./careers.scss";
import { Link } from "react-router-dom";
const Blog = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [suggestions, setSuggestions] = useState([
    "Suggestion 1",
    "Suggestion 2",
    "Suggestion 3",
    "Suggestion 4",
  ]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const [inputValue, setInputValue] = useState("");
  const blogContent = [
    {
      id: 1, 
      title: "Setting the revenue cycle up for success in automation and AI",
      description: "As new technologies emerge, revenue cycle leaders can prepare to harness the potential of these capabilities by establishing the conditions for success today.",
      tag: 'AI in Healthcare',
      created_at: "June 25, 2024",
      time: "June 25, 2024",
      author: "By Sanjiv Baxi, Sagar Parikh, Michael Peterson, and Andrew Ray",
      image: "./blogleft_temp.png"
    },
    {
      id: 2, 
      title: "Claim Denial Prediction: Harnessing AI For Healthcare Revenue Cycle Management",
      description: "Claim denials pose a significant challenge in healthcare, leading to financial losses, operational inefficiencies and disruptions in patient care.",
      tag: 'Revenue Management',
      author: `Paul Kovalenko
Forbes Councils Member
Forbes Technology Council`,
      created_at: "Sep 6, 2024",
      time: "Sep 6, 2024",
      image: "https://imageio.forbes.com/specials-images/imageserve/66d9f69afbda5c12b7d194e8//960x0.jpg?format=jpg&width=1440"
    },
    {
      id: 3, 
      title: "AI is just one piece of healthcare's RCM puzzle",
      description: "Healthcare operators face growing denial rates and longer reimbursement timelines. ",
      tag: 'Denial Strategies',
      author: `Greg Magrisi,
Robert Chamberlain,
John Menton`,
      created_at: "July 22, 2024",
      time: "July 22, 2024",
      image: "https://res.cloudinary.com/alixpartners/image/upload/v1719329556/Imagery/Insights/Healthcare%20revenue%20cycle%20%282024%29/HC_test_-_revenue_cycle-01_xzbxj7.jpg"
    },
  ];
  const [selectedContent, setSelectedContent] = useState(null);
  const [selectedSection, setSelectedSection] = useState("All");

  const filteredSuggestions = blogContent.filter((content) =>
    content.title.toLowerCase().includes(inputValue.toLowerCase())
  );

  const sections = [
    "All",
    "AI in Healthcare",
    "Revenue Management",
    "Denial Strategies",
    "Industry Trends",
    "More...",
  ];

  const options = [
    "Most newest",
    "Most popular",
    "Most recent",
    "A-Z",
    "Z-A",
    "Clean all",
  ];

  const handleFilterSelect = (filter) => {
    if (filter === "Clean all") setSelectedFilter("All");
    else setSelectedFilter(filter); // Update the selected time range
    setIsOpen(false); // Close the dropdown after selection
  };

  const handleSuggestionClick = (content) => {
    setSelectedContent(content);
    setInputValue(content.title);
    setIsExpanded(false);
  };

  return (
    <>
      <div
        className="h-full overflow-x-hidden overflow-y-auto bg-no-repeat bg-cover"
        style={{
          backgroundSize: "100%",
          backgroundPosition: "center top 0px",
        }}
      >
        <Header />

        <div className="container mx-auto mt-10 mb-10 flex flex-row justify-center content-center">
          <BlogHeader />
        </div>
        <div className="container flex flex-col justify-center w-full mx-auto">
          <h1 className="text-[#EBEDF0] md:text-[54px] text-[38px] font-[700] font-poppins">
            All News
          </h1>

          <div className="mt-0 mb-[-120px] sm:mb-2 z-10 flex flex-col items-center justify-center">
            <div className="mt-6 flex items-center justify-center w-full relative">
              <input
                type="text"
                placeholder="Key word here"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full py-3 sm:pl-16 pl-4 pr-4 h-[73px] rounded-tl-lg border-b-0 rounded-tr-lg rounded-br-lg rounded-bl-lg shadow-md bg-[#16192D] text-white placeholder-gray-300 focus:outline-none border-none focus:ring-transparent  focus:rounded-bl-none focus:rounded-br-none"
                onFocus={() => setIsExpanded(true)}
                onBlur={() => setIsExpanded(false)}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-[#0052FF] p-3 rounded-lg sm:block hidden">
                <svg
                  width="16"
                  height="17"
                  viewBox="0 0 16 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.5 12.1875L15 15.6875"
                    stroke="#EBEDF0"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M1 7.6875C1 11.0012 3.68629 13.6875 7 13.6875C8.6597 13.6875 10.1621 13.0136 11.2483 11.9245C12.3308 10.8392 13 9.3415 13 7.6875C13 4.37379 10.3137 1.6875 7 1.6875C3.68629 1.6875 1 4.37379 1 7.6875Z"
                    stroke="#EBEDF0"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              {isExpanded && filteredSuggestions.length > 0 && (
                <div className="absolute border-l border-b border-r z-40 border-[#002FFF] top-full left-0 w-full bg-[#16192D] border-none rounded-bl-lg rounded-br-lg shadow-md">
                  {filteredSuggestions.map((suggestion, index) => (
                    <p
                      key={index}
                      className="ml-4 sm:ml-16 py-2 text-[#8BA3D1] hover:text-white cursor-pointer mb-2"
                      onMouseDown={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.title}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div
            className={`relative inline-block text-left z-10 w-full md:hidden mb-4 ${filteredSuggestions.length === 0
                ? "mt-[10px]"
                : filteredSuggestions.length === 1
                  ? "mt-[50px]"
                  : filteredSuggestions.length === 2
                    ? "mt-[100px]"
                    : "mt-[150px]"
              } }`}
          >
            <button
              onClick={toggleDropdown}
              className={`inline-flex justify-between w-full rounded-md border-2 border-[#161358] text-[#EBEDF0] text-[20px] bg-[#16192D] focus:shadow-none focus:ring-0 focus:ring-offset-0 px-4 py-2 items-center ${isOpen && "border-b-0 rounded-b-none"
                }`}
            >
              {selectedFilter} {/* Display the selected time range */}
              <svg
                className="-mr-1 ml-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {isOpen && (
              <div
                className={`origin-top-right absolute right-0 w-full rounded-md shadow-lg bg-[#16192D] ring-1 ring-black ring-opacity-5 border-2 border-[#161358] text-[#EBEDF0] text-[20px] focus:shadow-none focus:ring-0 focus:ring-offset-0 px-4 py-2 items-center ${isOpen && "border-t-0 rounded-t-none"
                  }`}
              >
                <div className="py-1">
                  {options.map((option) => (
                    <a
                      key={option}
                      href="#"
                      onClick={() => handleFilterSelect(option)} // Update selected time range on click
                      className="block px-3 py-4 text-sm text-[#8BA3D1] hover:text-[#EBEDF0] hover:border-l-2 border-[#EBEDF0]"
                    >
                      {option}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* <div className="container flex justify-around mx-auto mt-10 space-x-4"> */}
        <div
          className={`${filteredSuggestions.length === 0
              ? "md:mt-[10px]"
              : filteredSuggestions.length === 1
                ? "md:mt-[50px]"
                : filteredSuggestions.length === 2
                  ? "md:mt-[100px]"
                  : "md:mt-[150px]"
            } flex w-full items-center container mx-auto`}
        >
          <Swiper
            autoplay={{
              enabled: true,
              delay: 2500,
              pauseOnMouseEnter: false,
              disableOnInteraction: false,
            }}
            modules={[Autoplay]}
            speed={3000}
            breakpoints={{
              // Small screens (mobile)
              320: {
                slidesPerView: 2,
                spaceBetween: 5,
              },
              480: {
                slidesPerView: 3,
                spaceBetween: 5,
              },
              // Medium screens (tablets)
              640: {
                slidesPerView: 4,
                spaceBetween: 5,
              },
              768: {
                slidesPerView: 5,
                spaceBetween: 5,
              },
              // Large screens (desktops)
              1024: {
                slidesPerView: 6,
                spaceBetween: 5,
              },
              1280: {
                slidesPerView: 6,
                spaceBetween: 5,
              },
              1440: {
                slidesPerView: 6,
                spaceBetween: 5,
              },
              1600: {
                slidesPerView: 6,
                spaceBetween: 10,
              },
              // Ultra-wide screens
              1920: {
                slidesPerView: 6,
                spaceBetween: 15,
              },
              2560: {
                slidesPerView: 6,
                spaceBetween: 20,
              },
            }}
          >
            {sections.map((section) => (
              <SwiperSlide
                key={section}
                className="items-center flex text-center"
              >
                <button
                  key={section}
                  className={`px-4 py-2 rounded-lg ${selectedSection === section
                      ? "underline font-poppins text-white"
                      : " text-[#8BA3D1]"
                    }`}
                  onClick={() => setSelectedSection(section)}
                >
                  {section}
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="relative md:inline-block text-left z-10 w-[175px] hidden">
            <button
              onClick={toggleDropdown}
              className={`inline-flex justify-between w-full rounded-md border-2 border-[#161358] text-[#EBEDF0] text-[20px] bg-[#16192D] focus:shadow-none focus:ring-0 focus:ring-offset-0 px-4 py-2 items-center ${isOpen && "border-b-0 rounded-b-none"
                }`}
            >
              {selectedFilter}
              <svg
                className="-mr-1 ml-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {isOpen && (
              <div
                className={`origin-top-right absolute right-0 w-full rounded-md shadow-lg bg-[#16192D] ring-1 ring-black ring-opacity-5 border-2 border-[#161358] text-[#EBEDF0] text-[20px] focus:shadow-none focus:ring-0 focus:ring-offset-0 px-4 py-2 items-center ${isOpen && "border-t-0 rounded-t-none"
                  }`}
              >
                <div className="py-1">
                  {options.map((option) => (
                    <a
                      key={option}
                      href="#"
                      onClick={() => handleFilterSelect(option)} // Update selected time range on click
                      className="block xl:px-[24px] xl:py-[11px] px-0 py-[6px] text-sm text-[#8BA3D1] hover:text-[#EBEDF0] hover:border-l-2 border-[#EBEDF0]"
                    >
                      {option}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* <div className="relative">
            <button
              className="px-4 py-2  bg-[#16192D] rounded-xl w-48 text-gray-300"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="flex justify-between p-2 ">
                <span>All</span>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.0716 13.3139L17.0216 8.36388C17.1139 8.26837 17.2242 8.19219 17.3462 8.13978C17.4682 8.08737 17.5995 8.05979 17.7322 8.05863C17.865 8.05748 17.9967 8.08278 18.1196 8.13306C18.2425 8.18334 18.3541 8.25759 18.448 8.35149C18.5419 8.44538 18.6162 8.55703 18.6665 8.67993C18.7167 8.80282 18.742 8.9345 18.7409 9.06728C18.7397 9.20006 18.7121 9.33128 18.6597 9.45329C18.6073 9.57529 18.5311 9.68564 18.4356 9.77788L12.7786 15.4349C12.5911 15.6224 12.3368 15.7277 12.0716 15.7277C11.8065 15.7277 11.5522 15.6224 11.3646 15.4349L5.70763 9.77788C5.61212 9.68564 5.53594 9.57529 5.48353 9.45329C5.43112 9.33128 5.40354 9.20006 5.40238 9.06728C5.40123 8.9345 5.42653 8.80282 5.47681 8.67993C5.52709 8.55703 5.60134 8.44538 5.69524 8.35149C5.78913 8.25759 5.90078 8.18334 6.02368 8.13306C6.14657 8.08278 6.27825 8.05748 6.41103 8.05863C6.54381 8.05979 6.67503 8.08737 6.79704 8.13978C6.91904 8.19219 7.02939 8.26837 7.12163 8.36388L12.0716 13.3139Z"
                    fill="white"
                  />
                </svg>
              </div>
            </button>
            {isDropdownOpen && (
              <div className="absolute  w-48 bg-gray-700 rounded-xl text-gray-300 ">
                <p className="px-4 py-2 cursor-pointer hover:bg-gray-600">
                  Option 1
                </p>
                <p className="px-4 py-2 cursor-pointer hover:bg-gray-600">
                  Option 2
                </p>
              </div>
            )}
          </div> */}
        </div>

        {filteredSuggestions.length > 0 ? (
          filteredSuggestions.map((content, index) => (
            <>
              <div key={content.id} className={`my-10 container mx-auto`}>
                {index % 2 === 0 ? (
                  <>
                    <BlogLeft title={content.title} description={content.description} author={content.author} time={content.time} id={content.id} image={content.image} />
                    <hr className="my-10 mx-2 sm:mx-32 border-[#1E3A8A]"></hr>
                  </>
                ) : (
                  <BlogRight title={content.title} description={content.description} author={content.author} time={content.time} id={content.id} image={content.image} />
                )}
              </div>
            </>
          ))
        ) : (
          <>
            <span className="mt-[-50px]">
              <svg
                className="mt-[-140px] ml-5"
                width="177"
                height="248"
                viewBox="0 0 177 248"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="144.25"
                  cy="202"
                  r="32.2501"
                  fill="#0F1331"
                  fill-opacity="0.5"
                />
                <circle
                  cx="143.864"
                  cy="201.611"
                  r="21.6763"
                  fill="#0F1331"
                  fill-opacity="0.5"
                />
                <g filter="url(#filter0_di_165_6710)">
                  <circle cx="144.255" cy="202" r="6.22371" fill="#002FFF" />
                </g>
                <path
                  d="M106.907 3C106.907 1.52724 108.101 0.333328 109.574 0.333328C111.047 0.333328 112.241 1.52724 112.241 3C112.241 4.47275 111.047 5.66666 109.574 5.66666C108.101 5.66666 106.907 4.47275 106.907 3ZM141.333 202C141.333 200.527 142.527 199.333 144 199.333C145.473 199.333 146.667 200.527 146.667 202C146.667 203.473 145.473 204.667 144 204.667C142.527 204.667 141.333 203.473 141.333 202ZM109.574 3.5H103.502V2.5H109.574V3.5ZM91.3588 3.5H79.2153V2.5H91.3588V3.5ZM67.0718 3.5H61V2.5H67.0718V3.5ZM61 3.5C59.4271 3.5 57.8686 3.56102 56.3266 3.68082L56.2491 2.68381C57.8168 2.56203 59.4012 2.5 61 2.5V3.5ZM47.1036 5.13141C44.0453 5.86311 41.0787 6.83099 38.2243 8.01469L37.8412 7.09096C40.744 5.88724 43.7608 4.90295 46.8709 4.15886L47.1036 5.13141ZM29.9081 12.2599C27.2455 13.895 24.7215 15.7337 22.3576 17.7546L21.7078 16.9945C24.1112 14.9399 26.6775 13.0703 29.3848 11.4078L29.9081 12.2599ZM15.7546 24.3576C13.7338 26.7214 11.895 29.2455 10.2599 31.9081L9.4078 31.3848C11.0703 28.6775 12.9399 26.1111 14.9945 23.7078L15.7546 24.3576ZM6.01471 40.2242C4.83101 43.0787 3.86313 46.0452 3.13142 49.1035L2.15887 48.8709C2.90297 45.7608 3.88725 42.744 5.09098 39.8412L6.01471 40.2242ZM1.68082 58.3265C1.56102 59.8685 1.5 61.4271 1.5 63H0.5C0.5 61.4012 0.562027 59.8168 0.683821 58.2491L1.68082 58.3265ZM1.5 63V67.9375H0.5V63H1.5ZM1.5 77.8125V87.6875H0.5V77.8125H1.5ZM1.5 97.5625V107.438H0.5V97.5625H1.5ZM1.5 117.312V127.188H0.5V117.312H1.5ZM1.5 137.062V142H0.5V137.062H1.5ZM1.5 142C1.5 143.573 1.56102 145.131 1.68082 146.673L0.683821 146.751C0.562027 145.183 0.5 143.599 0.5 142H1.5ZM3.13141 155.896C3.86313 158.955 4.831 161.921 6.0147 164.776L5.09097 165.159C3.88724 162.256 2.90297 159.239 2.15886 156.129L3.13141 155.896ZM10.2599 173.092C11.895 175.754 13.7338 178.279 15.7546 180.642L14.9945 181.292C12.9399 178.889 11.0703 176.323 9.40778 173.615L10.2599 173.092ZM22.3576 187.245C24.7214 189.266 27.2455 191.105 29.9081 192.74L29.3848 193.592C26.6775 191.93 24.1111 190.06 21.7078 188.006L22.3576 187.245ZM38.2243 196.985C41.0787 198.169 44.0453 199.137 47.1036 199.869L46.8709 200.841C43.7608 200.097 40.744 199.113 37.8412 197.909L38.2243 196.985ZM56.3265 201.319C57.8685 201.439 59.4271 201.5 61 201.5V202.5C59.4012 202.5 57.8168 202.438 56.2491 202.316L56.3265 201.319ZM61 201.5H66.1875V202.5H61V201.5ZM76.5625 201.5H86.9375V202.5H76.5625V201.5ZM97.3125 201.5H107.688V202.5H97.3125V201.5ZM118.062 201.5H128.438V202.5H118.062V201.5ZM138.812 201.5H144V202.5H138.812V201.5Z"
                  fill="#002FFF"
                />
                <defs>
                  <filter
                    id="filter0_di_165_6710"
                    x="114.631"
                    y="188.376"
                    width="59.2492"
                    height="59.2473"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                  >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset dy="16" />
                    <feGaussianBlur stdDeviation="11.7" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0.233333 0 0 0 0 1 0 0 0 0.3 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="BackgroundImageFix"
                      result="effect1_dropShadow_165_6710"
                    />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="effect1_dropShadow_165_6710"
                      result="shape"
                    />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset />
                    <feGaussianBlur stdDeviation="2.55" />
                    <feComposite
                      in2="hardAlpha"
                      operator="arithmetic"
                      k2="-1"
                      k3="1"
                    />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0.5 0 0 0 0 1 0 0 0 1 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="shape"
                      result="effect2_innerShadow_165_6710"
                    />
                  </filter>
                </defs>
              </svg>
            </span>

            <div className="my-10 ml-2 mt-[-60px] sm:ml-52 text-left text-[22px] text-white font-medium">
              Sorry, we don't have a result for "{inputValue}"
            </div>
          </>
        )}

        {/* <button className=" mx-4 sm:mx-32 p-3 px-6 text-[16px] flex bg-gradient-to-r from-[#06060CCC] to-[#1219538F]  w-[150px] text-[#0048FF] mb-10  justify-center font-[700] mt-10 rounded-xl">
          {" "}
          Show more
        </button> */}
        <div className="mt-10 flex justify-start"></div>

        <div className="flex flex-col sm:ml-32 mt-32">
          <p className="font-poppins mb-10 text-white md:text-[54px] md:leading-[54px] text-[38px] leading-[38px] font-[700] px-4">
            Related news
          </p>
          <div className="flex overflow-x-auto space-x-4 p-4 scrollbar-hide">
            {blogContent.map((blog) => (
              <Link to={`/blog/${blog.id}`}>
                <div key={blog.id} className="flex-none  bg-[#1E3A8A] rounded-lg shadow-lg text-white h-[481px] w-[420px] p-4 relative overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{ backgroundImage: `url(${blog.image})` }}
                  ></div>
                  <div className="relative z-10 flex flex-col justify-end h-full">
                    <h2 className="text-[24px] font-[700] leading-[32px]">
                      {blog.title}
                    </h2>
                    <div className="flex flex-row justify-between z-10 md:mt-0 mt-4">
                      <p className="text-sm mt-2 text-[#60A5FA] font-medium">{blog.created_at}</p>
                      <svg
                        width="50"
                        height="49"
                        viewBox="0 0 50 49"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M33.1668 24.4998L26.021 31.6457M16.8335 24.4998H33.1668H16.8335ZM33.1668 24.4998L26.021 17.354L33.1668 24.4998Z"
                          stroke="#60A5FA"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M25.0002 44.9168C36.2759 44.9168 45.4168 35.7759 45.4168 24.5002C45.4168 13.2243 36.2759 4.0835 25.0002 4.0835C13.7243 4.0835 4.5835 13.2243 4.5835 24.5002C4.5835 35.7759 13.7243 44.9168 25.0002 44.9168Z"
                          stroke="#60A5FA"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex justify-center items-center">
          <div className="hidden sm:block">
            <Discover title={`Discover what our AI Denial Agents can do for you`} description={`Recover Revenue, Reduce Denials, Real Results`} />
          </div>
          <div className="block sm:hidden">
            <Discovermob />
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Blog;
