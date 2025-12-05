import React from 'react';

const Workflow = () => {
  return (
    <>
      <div className="gap-6 flex flex-col pt-24">
        <p className="text-[rgb(4,75,217)] text-5xl font-poppins font-semibold text-[30px]">
          Introducing rcmGPT<sup>TM</sup>
        </p>
        <p className="text-[rgb(4,75,217)] text-2xl font-poppins font-semibold text-[30px]">
          Redefining Claims Recovery – Swifter, More Affordable, and with
          Peerless Accuracy
        </p>
      </div>
      <div className="hidden xl:flex flex-col">
        <p className="font-poppins font-normal pt-10">
        Helio RCM Denial management process
        </p>
        <div className="flex justify-between">
          <div className="flex items-end gap-4">
            <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-end">
            <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-end">
            <div className="w-16 h-16 bg-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex items-center pt-4">
          <div className="pr-10">
            <p className="font-poppins text-center">
              <span className="text-[rgb(4,75,217)] font-semibold">
                Autonomously selects denied claims
              </span>{" "}
              for processing
            </p>
          </div>
          <div className="flex-1 h-px bg-gray-300 mx-4"></div>
          <div className="pl-20 pr-20">
            <p className="font-poppins text-center">
              <span className="text-[rgb(4,75,217)] font-semibold">
                Autonomously identifies denial
              </span>{" "}
              reason, establishes the best resolution path based on POS,
              collects necessary docs, draft payer forms & appeal letters
            </p>
          </div>
          <div className="flex-1 h-px bg-gray-300 mx-4"></div>
          <div className="pl-20">
            <p className="font-poppins text-center">
              <span className="text-[rgb(4,75,217)] font-semibold">
                Autonomously resubmits and appeals
              </span>{" "}
              corrected claim to payer - AR collection
            </p>
          </div>
        </div>
        <div className="flex justify-between items-end">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-sm font-semibold">Provider</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-semibold">rcmGPT</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-green-600 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <p className="text-sm font-semibold">Payer</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-y-12 pt-12 xl:hidden">
        <p className="font-poppins font-semibold">
        Helio RCM Denial management process
        </p>
        <div className="flex flex-col gap-y-3">
          <div className="w-full h-16 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold">Step 1: Claim Processing</span>
          </div>
          <div className="h-px bg-gray-300 w-full"></div>
          <div className="w-full h-16 bg-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold">Step 2: Analysis & Resolution</span>
          </div>
          <div className="h-px bg-gray-300 w-full"></div>
          <div className="w-full h-16 bg-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold">Step 3: Appeal & Collection</span>
          </div>
        </div>
      </div>
      <div className="pb-12 pt-12">
        <div className="w-full h-px bg-gray-300 mb-4"></div>
        <p className="text-[rgb(4,75,217)] font-poppins font-semibold text-center">
          (0) ZERO FTE TOUCHES
        </p>
      </div>
    </>
  );
};

export default Workflow;