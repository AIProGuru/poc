import React, { useState, useEffect } from 'react';

const DetailSection = ({ title, children, subtitle, styleName, className, status, showArrow, isCollapse, isDark = false }) => {
  const [collapse, setCollapse] = useState(status || false);

  useEffect(() => {
    setCollapse(isCollapse);
  }, [isCollapse]);

  return (
    <div className="rounded-lg">
      <div className={`flex justify-between items-center select-none py-[8px] pl-[12px] ${isDark ? 'bg-[#27282D] text-gray-200' : 'bg-white text-[#072F40]'}`}>
        <div className='text-[14px] font-inter font-semibold flex gap-4 items-center'>
          <div>{title}</div>
          {subtitle && <div className={`${styleName} min-w-6 text-center`}>{subtitle}</div>}
        </div>
        {showArrow && (
          <div className='pr-[36px] cursor-pointer' onClick={() => setCollapse(value => !value)}>
            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`transition-transform ${collapse ? '' : 'rotate-180'}`}
            >
              <path fillRule={"evenodd"} clipRule={"evenodd"} d="M0.40814 0.910826C0.733577 0.585389 1.26121 0.585389 1.58665 0.910826L5.9974 5.32157L10.4081 0.910826C10.7336 0.585389 11.2612 0.585389 11.5867 0.910826C11.9121 1.23626 11.9121 1.7639 11.5867 2.08934L6.58665 7.08934C6.26121 7.41477 5.73358 7.41477 5.40814 7.08934L0.40814 2.08934C0.0827033 1.7639 0.0827033 1.23626 0.40814 0.910826Z" fill={isDark ? '#CBD5E1' : '#1A3F59'} />
            </svg>
          </div>
        )}
      </div>
      <div className={`collapse-panel ${collapse ? '' : 'collapse-panel--open'}`} aria-hidden={collapse}>
        <div className={className}>
          {children}
        </div>
        <div className='h-[10px] border-none'></div>
      </div>
    </div>
  );
}

export default DetailSection;
