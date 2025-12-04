import React, { useEffect, useState, useMemo } from "react";
import Header from "../components/layout/Header";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "./careers.scss";
import Discover from "../components/layout/Discover";
import Discovermob from "../components/layout/Discovermob";
import Footer from "../components/layout/Footer";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/layout/SearchBar";
import DocumentCard from "../components/layout/WhitePaperCard";
import Discover_all from "../components/layout/Discover_all";

const WhitePaper = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedTimeRange, setSelectedTimeRange] = useState("All");


  const fileList = [
    {
      title: "Rebound Orthopedics - Case Study (Nov24)",
      upload: "27 dec 2024",
      size: "89kb",
      fileUrl: "Rebound Orthopedics - Case Study (Nov24).pdf",
      preview: "Rebound Orthopedics - Case Study (Nov24).jpg",
      fileType: "PDF",
    },
  ];

  const fileTypeCategories = {
    PDF: "PDF&TIFF",
    TIFF: "PDF&TIFF",
    JPEG: "Jpeg&PNG",
    JPG: "Jpeg&PNG",
    PNG: "Jpeg&PNG",
    XLS: "XLS&CSV",
    CSV: "XLS&CSV",
    PPT: "PPT",
    TXT: "TXT",
    RTF: "RTF",
    DOC: "DOC&DOCX",
    DOCX: "DOC&DOCX",
  };

  const [filteredFiles, setFilteredFiles] = useState(fileList);

  const filterByTime = (fileDate, timeRange) => {
    const currentDate = new Date(); // Get the current date
    const fileDateObj = new Date(fileDate); // Convert file's upload date to Date object
    const timeDiffInMs = currentDate - fileDateObj; // Get the difference in milliseconds

    switch (timeRange) {
      case "Last week":
        return timeDiffInMs <= 7 * 24 * 60 * 60 * 1000; // 1 week in ms
      case "Last month":
        return timeDiffInMs <= 30 * 24 * 60 * 60 * 1000; // 30 days in ms
      case "Last 3 months":
        return timeDiffInMs <= 90 * 24 * 60 * 60 * 1000; // 3 months in ms
      case "Last 6 months":
        return timeDiffInMs <= 180 * 24 * 60 * 60 * 1000; // 6 months in ms
      case "Last year":
        return timeDiffInMs <= 365 * 24 * 60 * 60 * 1000; // 1 year in ms
      case "Clean all":
        return true; // Show all files if "Clean all" is selected
      default:
        return true; // Default to showing all files if no time filter is selected
    }
  };

  const fileTypeCounts = useMemo(() => {
    const initialFileTypeCounts = {
      All: 0,
      "PDF&TIFF": 0,
      "Jpeg&PNG": 0,
      "XLS&CSV": 0,
      PPT: 0,
      TXT: 0,
      RTF: 0,
      "DOC&DOCX": 0,
    };

    const updatedFileTypeCounts = { ...initialFileTypeCounts };

    const filtered = fileList.filter((file) => {
      // Check if file matches the selected time range
      const matchesTimeRange = filterByTime(file.upload, selectedTimeRange);

      // Check if file matches the search query (optional)
      const matchesQuery = file.title
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchesTimeRange && matchesQuery;
    });

    filtered.forEach((file) => {
      // Determine the file type and update the count
      const fileTypeKey = fileTypeCategories[file.fileType] || file.fileType;
      updatedFileTypeCounts[fileTypeKey] =
        updatedFileTypeCounts[fileTypeKey] + 1;
    });

    // Set the "All" count to reflect the total number of filtered files
    updatedFileTypeCounts["All"] = filtered.length;

    return updatedFileTypeCounts;
  }, [query, selectedTimeRange]);

  // const [fileTypeCounts, setFileTypeCounts] = useState({
  //   All: 0,
  //   "PDF&TIFF": 0,
  //   "Jpeg&PNG": 0,
  //   "XLS&CSV": 0,
  //   PPT: 0,
  //   TXT: 0,
  //   RTF: 0,
  //   "DOC&DOCX": 0,
  // });

  const handleTimeRangeSelect = (timeRange) => {
    setSelectedTimeRange(timeRange); // Update the selected time range
    setIsOpen(false); // Close the dropdown after selection
  };

  useEffect(() => {
    // Filter the files based on file type, time, and search query
    const filtered = fileList.filter((file) => {
      // Check if file matches the active filter category
      const matchesFilter =
        activeFilter === "All" ||
        fileTypeCategories[file.fileType] === activeFilter;

      // Check if file matches the selected time range
      const matchesTimeRange = filterByTime(file.upload, selectedTimeRange);

      // Check if file matches the search query (optional)
      const matchesQuery = file.title
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchesFilter && matchesTimeRange && matchesQuery;
    });

    // Update the filtered files list
    setFilteredFiles(filtered);
  }, [activeFilter, selectedTimeRange, query]);

  const handleFilterClick = (filter) => {
    setResults([]);
    setActiveFilter(filter);
  };

  const [isOpen, setIsOpen] = useState(false);
  const options = [
    "Last week",
    "Last month",
    "Last 3 months",
    "Last 6 months",
    "Last year",
    "Clean all",
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSearch = (value) => {
    setQuery(value); // Update the query state

    if (value) {
      const matches = filteredFiles
        .filter((item) =>
          item.title.toLowerCase().includes(value.toLowerCase())
        ) // Filter by title
        .slice(0, 3); // Limit to 3 items

      setResults([...matches]); // Update the results state with filtered items
    } else {
      setResults([]); // Reset results if no query
    }
  };

  const handleResultClick = (result) => {
    setQuery(result); // Set the clicked value to the input
    setResults([]); // Clear the results (hides the dropdown)
  };

  return (
    <div
      className="h-full overflow-y-auto bg-white overflow-x-hidden"
    >
      <Header />
      <div className="container mx-auto mt-32 gap-[32px] flex flex-col">
        <div className="flex flex-col ">
          <h1 className="font-bold md:text-[54px] text-[#0F172A] text-[42px]">
            White paper
          </h1>
          <p className="text-[22px] text-[#475569] hidden md:block">
            Empowering decision-makers and educating the future on automation.
          </p>
          <div className="relative w-full z-20">
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Key word here"
              className={`w-full h-[73px] pr-[14px] py-[11.5px] text-[#EBEDF0] text-[20px] bg-[#16192D] focus:shadow-none focus:ring-0 focus:ring-offset-0 focus:border-[#002fff] ${
                results.length > 0
                  ? "border-2 border-b-0 border-[#002FFF] rounded-t-lg"
                  : "rounded-lg border-none"
              }`}
            />
            <img src="/searchButton.svg" className="absolute top-1 right-0" />
            {results.length > 0 && (
              <div className="absolute w-full h-fit bg-[#16192D] shadow-lg overflow-y-auto rounded-b-xl border-[#002FFF] border-2 border-t-0">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="text-[#5C7EB0] text-[16px] hover:text-[#EBEDF0] cursor-pointer overflow-ellipsis overflow-hidden whitespace-nowrap"
                    onClick={() => handleResultClick(result.title)}
                  >
                    <div className="pl-[10px]">
                      <p className="py-[11px] px-[24px] hover:border-l-2">
                        {result.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div
              className={`relative inline-block text-left z-10 w-full md:hidden ${
                results.length === 0
                  ? "mt-[10px]"
                  : results.length === 1
                  ? "mt-[50px]"
                  : results.length === 2
                  ? "mt-[100px]"
                  : "mt-[150px]"
              } }`}
            >
              <button
                onClick={toggleDropdown}
                className={`inline-flex justify-between w-full rounded-md border-2 border-[#161358] text-[#EBEDF0] text-[20px] bg-[#16192D] focus:shadow-none focus:ring-0 focus:ring-offset-0 px-4 py-2 items-center ${
                  isOpen && "border-b-0 rounded-b-none"
                }`}
              >
                {selectedTimeRange} {/* Display the selected time range */}
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
                  className={`origin-top-right absolute right-0 w-full rounded-md shadow-lg bg-[#16192D] ring-1 ring-black ring-opacity-5 border-2 border-[#161358] text-[#EBEDF0] text-[20px] focus:shadow-none focus:ring-0 focus:ring-offset-0 px-4 py-2 items-center ${
                    isOpen && "border-t-0 rounded-t-none"
                  }`}
                >
                  <div className="py-1">
                    {options.map((option) => (
                      <a
                        key={option}
                        href="#"
                        onClick={() => handleTimeRangeSelect(option)} // Update selected time range on click
                        className="block px-3 py-4 text-sm text-[#6C9BE0] hover:text-[#EBEDF0] hover:border-l-2 border-[#EBEDF0]"
                      >
                        {option}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {filteredFiles.length === 0 && (
              <div className="absolute top-10 -left-[100px] -z-10">
                <img src="/dotline.svg" alt="" />
              </div>
            )}
          </div>
        </div>
        <div
          className={`${
            results.length === 0
              ? "md:mt-[10px]"
              : results.length === 1
              ? "md:mt-[50px]"
              : results.length === 2
              ? "md:mt-[100px]"
              : "md:mt-[150px]"
          } flex w-full items-center`}
        >
          <Swiper
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
                slidesPerView: 7,
                spaceBetween: 5,
              },
              1440: {
                slidesPerView: 8,
                spaceBetween: 5,
              },
              1600: {
                slidesPerView: 8,
                spaceBetween: 10,
              },
              // Ultra-wide screens
              1920: {
                slidesPerView: 8,
                spaceBetween: 15,
              },
              2560: {
                slidesPerView: 8,
                spaceBetween: 20,
              },
            }}
          >
            {Object.entries(fileTypeCounts).map(([fileType, count]) => (
              <SwiperSlide
                key={fileType}
                className="items-center flex text-center"
              >
                <button
                  onClick={() => handleFilterClick(fileType)}
                  className={`flex gap-2 font-semibold text-[16px] justify-center w-full ${
                    activeFilter === fileType
                      ? "text-[#EBEDF0] "
                      : "text-[#5C7EB0]"
                  }`}
                >
                  <span>{fileType}</span>
                  <span
                    className={`py-1 px-2 rounded-full flex items-center justify-center text-xs ${
                      activeFilter === fileType
                        ? "bg-[#002FFF] text-[#EBEDF0] "
                        : "bg-[#4570FF] text-[#16192D]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="relative md:inline-block text-left z-10 w-[175px] hidden">
            <button
              onClick={toggleDropdown}
              className={`inline-flex justify-between w-full rounded-md border-2 border-[#161358] text-[#EBEDF0] text-[20px] bg-[#16192D] focus:shadow-none focus:ring-0 focus:ring-offset-0 px-4 py-2 items-center ${
                isOpen && "border-b-0 rounded-b-none"
              }`}
            >
              {selectedTimeRange}
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
                className={`origin-top-right absolute right-0 w-full rounded-md shadow-lg bg-[#16192D] ring-1 ring-black ring-opacity-5 border-2 border-[#161358] text-[#EBEDF0] text-[20px] focus:shadow-none focus:ring-0 focus:ring-offset-0 px-4 py-2 items-center ${
                  isOpen && "border-t-0 rounded-t-none"
                }`}
              >
                <div className="py-1">
                  {options.map((option) => (
                    <a
                      key={option}
                      href="#"
                      onClick={() => handleTimeRangeSelect(option)} // Update selected time range on click
                      className="block xl:px-[24px] xl:py-[11px] px-0 py-[6px] text-sm text-[#6C9BE0] hover:text-[#EBEDF0] hover:border-l-2 border-[#EBEDF0]"
                    >
                      {option}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-7">
          {filteredFiles.map((file, index) => (
            <DocumentCard
              key={index}
              title={file.title}
              size={file.size}
              date={file.upload}
              fileUrl={file.fileUrl}
              preview={file.preview}
              fileType={file.fileType}
            />
          ))}
        </div>
        {filteredFiles.length === 0 && (
          <div className="text-[#EBEDF0] text-center text-[22px] mt-12">
            <p>Sorry, we don't have a result for "{query}"</p>
          </div>
        )}
        {filteredFiles.length >= 9 && (
          <div>
            <button className="w-[160px] h-[50px] bg-gradient-to-r from-[#06060CCC] to-[#0810503D] font-bold text-[#0048FF] text-[14px] rounded-xl">
              Show more
            </button>
          </div>
        )}

<div className="flex justify-center items-center">
           <div className="hidden sm:block">
           <Discover title={`Discover what our AI Denial Agents can do for you`} description={`Recover Revenue, Reduce Denials, Real Results`}/>
            </div>
            <div className="block sm:hidden">
           <Discovermob/>
            </div>
           </div>
      </div>
      <Footer />
    </div>
  );
};

export default WhitePaper;
