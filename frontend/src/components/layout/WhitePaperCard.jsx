import React from "react";

function DocumentCard({ title, date, size, fileUrl, preview, fileType }) {
  const fileIcon = {
    pdf: "fa-file-pdf",
    doc: "fa-file-word",
    ppt: "fa-file-powerpoint",
    jpg: "fa-file-image",
    png: "fa-file-image",
    // Add more file types and their icons as needed
  };

  const openPdf = (fileName) => {
    // Construct the URL of the PDF
    const pdfUrl = `/papers/files/${fileName}`;
    // Open the URL in a new tab
    window.open(pdfUrl, "_blank");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="relative rounded-3xl overflow-hidden flex flex-col gap-6">
        <div className="w-full h-[230px] bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
            </div>
            <p className="text-white font-semibold text-lg">Document Preview</p>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-full h-full mix-blend-multiply bg-[#002FFF70] rounded-3xl" />
      </div>

      <div className="pb-[35px] text-white flex flex-col gap-6">
        <h1 className="font-bold text-[#EBEDF0] text-[24px] leading-[32px] overflow-hidden overflow-ellipsis line-clamp-2">
          {title}
        </h1>

        <div className="flex justify-between items-center">
          <p className="text-[16px] text-[#6C9BE0]">{date}</p>
          <p className="text-[16px] text-[#6C9BE0]">
            {fileType}.{size}MB
          </p>
          <button
            className="flex bg-[#0048FF] shadow-xl shadow-[#0048FF]/50 text-white text-[14px] md:py-[18px] md:px-[20px] py-[12px] px-[16px] md:gap-3 gap-1 font-bold rounded-xl"
            onClick={()=>openPdf(fileUrl)}
          >
            View
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="m12 16l4-4l-4-4l-1.4 1.4l1.6 1.6H8v2h4.2l-1.6 1.6zm0 6q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocumentCard;
