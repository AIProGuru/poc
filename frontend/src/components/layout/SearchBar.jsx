import React, { useState } from "react";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  // Example data
  const data = ["Administrative Denials", "Approval Process", "Account Status", "Account Status", "Account Status", "Account Status"];

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value) {
      const matches = data
        .filter((item) => item.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 3); // Limit to 3 items
      setResults(matches);
    } else {
      setResults([]);
    }
  };

  const handleResultClick = (result) => {
    setQuery(result); // Set the clicked value to the input
    setResults([]); // Clear the results (hides the dropdown)
  };

  return (
    <div className="relative w-80 mx-auto mt-20">
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search..."
        className="w-full p-3 text-white bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {results.length > 0 && (
        <div className="absolute w-full max-h-36 bg-gray-800 rounded-lg shadow-lg overflow-y-auto mt-2">
          {results.map((result, index) => (
            <div
              key={index}
              className="p-3 text-white hover:bg-gray-700 cursor-pointer"
              onClick={() => handleResultClick(result)}
            >
              {result}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
