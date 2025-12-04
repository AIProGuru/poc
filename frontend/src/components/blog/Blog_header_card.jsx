import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
export default function BlogHeader() {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % blogcontent.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  // Function to handle dot click
  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };
  const blogcontent = [
    {
      quote:"Healthcare operators face growing denial rates and longer reimbursement timelines. AI can help, but it's just one facet of revenue cycle management, and can't be implemented without an understanding of the end-to-end processes. ",

      name: `Greg Magrisi,
Robert Chamberlain,
John Menton`,
      time: "July 22, 2024",
      image: "https://res.cloudinary.com/alixpartners/image/upload/v1719329556/Imagery/Insights/Healthcare%20revenue%20cycle%20%282024%29/HC_test_-_revenue_cycle-01_xzbxj7.jpg",
    },
  ];
  return (
    <>
      <div className="mt-10 sm:mt-32 z-10 flex flex-col content-start justify-start w-full">
        {/* Heading */}
        {/* <div className="absolute w-[220px]  top-[350px] left-[28%] z-10">
        <img src='./testimonial_stucture.png' className=''/>
        </div> */}
        {/* Testimonial Content */}
        <div className="flex flex-col mt-5 space-y-6 sm:space-y-0  transition-transform duration-500 ">
          {/* Quote Section */}
          <div className="flex flex-col md:flex-row flex justify-between">
            <div className=" sm:max-w-[500px]  text-center sm:text-left md:w-1/2 w-full">
              <h2 className="lg:text-[42px] lg:leading-[44px] font-poppins font-bold mb-10 text-[42px] leading-[46px] w-full text-[#6C9BE0]">
              AI is just one piece of healthcare's RCM puzzle
              </h2>
              <p className="text-[20px] mr-0  sm:mr-16 w-full text-[#6C9BE0] leading-[30.8px] ">
                "{blogcontent[currentIndex].quote}"
              </p>
              <div className="mt-[55px] lg:flex justify-center border-[1px] border-[#3025FF] rounded-3xl w-full p-2 hidden">
                <div className="flex flex-row  items-center justify-between  p-2 py-3 w-full">
                  {/* <img
                    src="./demo_blog_img.png"
                    className="w-[54px] h-[54px] md:mr-5 mr-2"
                  ></img> */}
                  <div>
                    <p className=" text-[16px] text-[#8BA3D1]">{blogcontent[currentIndex].name}</p>
                    <p className=" text-[16px] text-[#002FFF]">
                    {blogcontent[currentIndex].time}
                    </p>
                  </div>
                  <div className="md:pl-10 pl-2">
                  <Link to={`/blog/3`}>
                    <button className="bg-[#3025FF] md:w-[126px] w-[50px] h-[50px] font-[700] text-[14px] text-[#002FFF]  rounded-lg items-center flex justify-center">
                      <span className="hidden md:block text-white">Read Article</span>
                      <span className="block md:hidden">
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
                      </span>
                    </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Section */}
            <div className="relative flex flex-col items-end md:w-1/2 w-full">
              <div className="w-full h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <div className="text-center text-[#002FFF]">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="font-semibold text-lg">Blog Article</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-[125px] flex justify-center border-[1px] border-[#3025FF] rounded-3xl w-full p-2 lg:hidden">
            <div className="flex flex-row  items-center justify-between  p-2 py-3 w-full">
              {/* <img
                src="./demo_blog_img.png"
                className="w-[54px] h-[54px] md:mr-5 mr-2"
              ></img> */}
              <div>
                <p className=" text-[16px] text-[#002FFF]">{blogcontent[currentIndex].name}</p>
                <p className=" text-[16px] text-[#002FFF]">
                {blogcontent[currentIndex].time}
                </p>
              </div>
              <div className="md:pl-10 pl-2">
              <Link to={`/blog/3`}>
            <button className="bg-[#3025FF] md:w-[126px] w-[50px] h-[50px] font-[700] text-[14px] text-[#002FFF]  rounded-lg items-center flex justify-center">
              <span className="hidden md:block">Read Article</span>
              <span className="block md:hidden">
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
              </span>
            </button>
            </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Dots Section */}
        <div className="flex justify-between space-x-2 mt-10 mb-32">
          {blogcontent.map((_, index) => (
            <div key={index} className=" flex items-center justify-center bg-[#0F133180] rounded-full w-5  h-5">
              <button
                className={`w-3 h-3 rounded-full ${
                  index === currentIndex
                    ? "bg-blue-600 "
                    : "bg-gray-400 hover:bg-gray-500"
                } transition duration-300`}
                onClick={() => handleDotClick(index)}
              />
            </div>
          ))}
        </div>

        {/* Learn More Button */}
        {/* <button className="mt-8 bg-blue-500 text-[#002FFF] text-sm py-2 px-6 rounded-lg hover:bg-blue-600">
        Learn More
      </button> */}
      </div>
    </>
  );
}
