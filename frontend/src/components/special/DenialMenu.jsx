import React, { useState, useEffect } from "react";
import Papa from "papaparse";

const DenialMenu = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All categories");
  const [selectedDenial, setSelectedDenial] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    Papa.parse("/denial_menu.csv", {
      download: true,
      complete: (result) => setData(result.data),
      header: true,
    });
  }, []);

  const filteredDenials = data.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.Category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All categories" ||
      item.Category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(
    new Set(data.map((item) => item.Category))
  ).filter((category) => category);

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    if (category !== "All categories") {
      const denial = data.find((item) => item.Category === category);
      setSelectedDenial(denial);
    } else {
      setSelectedDenial(null);
    }
  };

  const handleSearchIconClick = () => {
    if (isSearching) {
      setSearchTerm("");
      setSelectedCategory("All categories");
      setSelectedDenial(null);
    }
    setIsSearching(!isSearching);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedCategory("All categories");
    setIsSearching(e.target.value !== "");
  };

  const handlePopularSearchClick = (item) => {
    const denial = data.find((d) => d.Category === item);
    setSelectedDenial(denial);
  };

  return (
    <div className="text-white flex flex-col items-center p-6">
      {/* Header */}
      <h1
        className="text-[54px] leading-[58px] font-bold font-poppins mb-6 text-[#D9D9D9CC]"
        style={{
          "WebkitTextStroke": "0.5px white",
        }}
      >
        Denial Categories
      </h1>

      {/* Search Box with Dropdown for PC */}
      <div className="relative w-full sm:w-[80%] max-w-4xl mb-6 hidden sm:block">
        <div className="flex flex-col sm:flex-row items-center bg-[#16192D] rounded-md">
          {/* Search Input */}
          <div className="flex-grow relative sm:w-[70%]">
            <input
              type="text"
              placeholder="Search by keyword..."
              value={searchTerm}
              onChange={handleInputChange}
              className="w-full py-4 pl-6 pr-16 bg-[#16192D] border-none focus:border-none focus:outline-none rounded-md"
            />
          </div>

          {/* Dropdown */}
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="bg-[#16192D] text-white py-2 px-4 mt-2 sm:mt-0 sm:ml-2 sm:w-[20%] rounded-md focus:outline-none"
          >
            <option value="All categories">All categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* Search Icon */}
          <div
            className="absolute sm:relative sm:w-[10%] left-4 sm:left-auto top-1/2 sm:top-auto transform sm:transform-none -translate-y-1/2 sm:translate-y-0 cursor-pointer"
            onClick={handleSearchIconClick}
          >
            {isSearching ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="sm:ml-2"
              >
                <path
                  d="M6 6L18 18"
                  stroke="#EBEDF0"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 18L18 6"
                  stroke="#EBEDF0"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="sm:ml-2"
              >
                <path
                  d="M15.5 15.5L19 19"
                  stroke="#EBEDF0"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 11C5 14.3137 7.68629 17 11 17C12.6597 17 14.1621 16.3261 15.2483 15.237C16.3308 14.1517 17 12.654 17 11C17 7.68629 14.3137 5 11 5C7.68629 5 5 7.68629 5 11Z"
                  stroke="#EBEDF0"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Search Box with Dropdown for Mobile */}
      <div className="relative w-full sm:w-[80%] max-w-4xl mb-6 sm:hidden">
        <div className="flex flex-col items-center bg-[#16192D] rounded-md">
          {/* Search Input */}
          <div className="flex-grow relative w-full mb-2">
            <input
              type="text"
              placeholder="Search by keyword..."
              value={searchTerm}
              onChange={handleInputChange}
              className="w-full py-4 pl-6 pr-16 bg-[#16192D] border-none focus:border-none focus:outline-none rounded-md"
            />
            <div
              className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
              onClick={handleSearchIconClick}
            >
              {isSearching ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 6L18 18"
                    stroke="#EBEDF0"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 18L18 6"
                    stroke="#EBEDF0"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.5 15.5L19 19"
                    stroke="#EBEDF0"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5 11C5 14.3137 7.68629 17 11 17C12.6597 17 14.1621 16.3261 15.2483 15.237C16.3308 14.1517 17 12.654 17 11C17 7.68629 14.3137 5 11 5C7.68629 5 5 7.68629 5 11Z"
                    stroke="#EBEDF0"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>

          {/* Dropdown */}
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="bg-[#16192D] text-white py-2 px-4 w-full rounded-md focus:outline-none"
          >
            <option value="All categories">All categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Results */}
      {searchTerm && (
        <div className="relative w-full sm:w-[80%] max-w-4xl mb-6">
          <ul className="absolute w-full bg-gray-800 mt-2 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
            {filteredDenials.length > 0 ? (
              filteredDenials.map((denial, index) => (
                <li
                  key={index}
                  onClick={() => setSelectedDenial(denial)}
                  className="p-2 hover:bg-gray-700 cursor-pointer"
                >
                  <strong>{denial.Category}</strong>: {denial["Denial Types"]}
                </li>
              ))
            ) : (
              <li className="p-2 text-gray-400">No results found</li>
            )}
          </ul>
        </div>
      )}

      {/* Popular Searches */}
      <div className="mb-6">
        <h2
          className="text-[40px] font-poppins mt-10 leading-[48px] font-semibold mb-4 text-[#D9D9D9CC]"
          style={{
            "WebkitTextStroke": "0.5px white",
          }}
        >
          Popular Searches
        </h2>
        <div className="flex flex-wrap gap-4">
          {[
            "2. Clinical Denials",
            "1. Administrative Denials",
            "14. Technical Denials",
            "7. Zero-Balance Denials",
            "6. Specialty Denials",
            "10. Health System Denials",
            "9. Ambulatory Denials",
            "3. Compliance Denials",
          ].map((item, index) => (
            <button
              key={index}
              className="px-4 py-2 bg-gradient-to-br text-[#A9C5ED] font-bold from-[#0C0F27] to-[#1e1a6b] rounded-md hover:bg-blue-600"
              onClick={() => handlePopularSearchClick(item)}
            >
              {item.replace(/^\d+\.\s*/, "").replace(" Denials", "")}
            </button>
          ))}
        </div>
      </div>

      {/* Modal for Selected Denial Details */}
      {selectedDenial && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-gray-700 p-6 rounded-md max-w-lg w-full relative">
      <button
        className="absolute top-2 right-2 text-white"
        onClick={() => setSelectedDenial(null)}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 6L18 18"
            stroke="#EBEDF0"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 18L18 6"
            stroke="#EBEDF0"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <h2 className="text-2xl font-bold mb-4">Denial Details</h2>
      <p>
        <strong className='font-bold'>Category:</strong> {selectedDenial.Category}
      </p>
      <p>
        <strong className='font-bold'>Denial Types:</strong> {selectedDenial["Denial Types"]}
      </p>
      <p>
        <strong className='font-bold'>Description:</strong> {selectedDenial.Description}
      </p>
      <p>
        <strong className='font-bold'>AI Agent Solution:</strong>{" "}
        {selectedDenial["Denial AI Agent Solution"]}
      </p>
      <p>
        <strong className='font-bold'>Input Data Source:</strong>{" "}
        {selectedDenial["Input Data Source"]}
      </p>
    </div>
  </div>
)}
    </div>
  );
};

export default DenialMenu;