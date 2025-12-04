import React, { useState, useRef, useEffect } from 'react';

const MultiSelect = ({ 
  label, 
  options, 
  selected, 
  onChange, 
  placeholder,
  theme
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDisplayValue = (option) => {
    if (!option) return '';
    return typeof option === 'object' ? option.PayerName : option;
  };

  const filteredOptions = options.filter(option => {
    if (!option) return false;
    const displayValue = getDisplayValue(option);
    return displayValue.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const toggleOption = (option) => {
    const newSelected = selected.some(item => getDisplayValue(item) === getDisplayValue(option))
      ? selected.filter(item => getDisplayValue(item) !== getDisplayValue(option))
      : [...selected, option];
    onChange(newSelected);
  };

  const isSelected = (option) => {
    return selected.some(item => getDisplayValue(item) === getDisplayValue(option));
  };

  return (
    <div className="mb-6 w-full" ref={wrapperRef}>

      <div className="relative">
        <div 
          className={`min-h-[42px] p-2 border rounded-lg cursor-text flex flex-wrap gap-2 transition-all duration-200 ${
            theme === 'dark' 
              ? 'bg-[#1E1E1E] border-gray-600 hover:border-gray-500 focus-within:border-blue-500' 
              : 'bg-white border-gray-300 hover:border-gray-400 focus-within:border-blue-400'
          } ${isOpen ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}
          onClick={() => setIsOpen(true)}
        >
          {selected.map((item) => (
            <span 
              key={getDisplayValue(item)}
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              {getDisplayValue(item)}
              <button
                type="button"
                className={`ml-1.5 hover:bg-opacity-80 rounded-full p-0.5 transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-500' : 'hover:bg-blue-200'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(item);
                }}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
          <input
            type="text"
            className={`flex-1 outline-none min-w-[60px] text-sm ${
              theme === 'dark' 
                ? 'bg-[#1E1E1E] text-gray-200 placeholder-gray-500' 
                : 'bg-white text-gray-700 placeholder-gray-400'
            }`}
            placeholder={selected.length === 0 ? placeholder : 'Add more...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
          />
        </div>

        {isOpen && (
          <div className={`absolute z-50 w-full mt-1 rounded-lg shadow-lg border ${
            theme === 'dark' 
              ? 'bg-[#1E1E1E] border-gray-600' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="max-h-60 overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
              {filteredOptions.length === 0 ? (
                <div className={`px-4 py-3 text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={getDisplayValue(option)}
                    className={`flex items-center px-4 py-2.5 cursor-pointer transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleOption(option)}
                  >
                    <div className={`w-4 h-4 rounded border mr-3 flex items-center justify-center transition-colors ${
                      isSelected(option)
                        ? theme === 'dark' 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'bg-blue-500 border-blue-500'
                        : theme === 'dark'
                          ? 'border-gray-500'
                          : 'border-gray-300'
                    }`}>
                      {isSelected(option) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }>
                      {getDisplayValue(option)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelect;