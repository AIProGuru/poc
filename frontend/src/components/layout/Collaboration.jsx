import React, { useEffect, useState } from "react";

export default function Collaboration() {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  // Function to handle dot click
  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };
  const testimonials = [
    {
      quote:
        "“Partnering with Helio RCM has been a game-changer for us. Their AI didn't just automate our workflows—it recovered lost revenue by overturning denials we had written off as unrecoverable. In fact, 50% of all overturns during the pilot came from those write-offs. Their expertise and dedication have made a real difference, and we're truly grateful for their partnership.”",
      name: "Clay Foster",
      role: "Director of Business Services, Rebound Orthopedics",
      image: "",
    },
  ];
  return (
    <>
      <div className="mt-10 sm:mt-52 z-10 flex flex-col items-start mx-52  content-start justify-start bg-dark text-white py-16 px-4">
        {/* Heading */}

        {/* Testimonial Content */}
        <div className=" flex flex-col ml-16  sm:flex-row items-start sm:items-start space-y-6 sm:space-y-0 sm:space-x-8 transition-transform duration-500">
          {/* Quote Section */}
          <div className="  text-center sm:text-left">
            <h2 className="text-4xl mr-[-200px] font-poppins  font-bold mb-10">
              Stories of Our Collaborations
            </h2>
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-[15px]  w-[300px]  text-[#6C9BE0] leading-relaxed ">
              {testimonials[currentIndex].quote}
            </p>
            <div className="mt-[70px] border-[1px]  border-[#3025FF] rounded-3xl   p-3">
              <div className="flex flex-row  items-center  p-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-5">
                  <span className="text-white font-bold text-sm">
                    {testimonials[currentIndex].name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-[16px]">
                    {testimonials[currentIndex].name}
                  </p>
                  <p className="  text-[#002FFF]">
                    {testimonials[currentIndex].role}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="relative left-[-50px] pt-5 sm:pt-44 flex flex-col items-end">
            <div className="w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="font-semibold">Collaboration</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dots Section */}
        <div className="ml-16 flex justify-between space-x-2 mt-[30px]">
          {testimonials.map((_, index) => (
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
        {/* <button className="mt-8 bg-blue-500 text-white text-sm py-2 px-6 rounded-lg hover:bg-blue-600">
        Learn More
      </button> */}
      </div>
    </>
  );
}
