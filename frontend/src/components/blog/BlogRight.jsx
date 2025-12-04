import React from "react";
import { Link } from "react-router-dom";

const BlogRight = ({ title, description , time , author ,id ,image }) => {
  return (
    <div>
      <div className="flex w-full h-full md:flex-row flex-col items-center justify-between gap-4">
        <div className="max-w-[567px] md:w-1/2 w-full  flex flex-col justify-start gap-4">
          <h1 className="md:text-[40px] md:leading-[48px] text-[32px] leading-[36px] font-[700] text-white font-poppins">
            {title}
          </h1>
          <p className="text-[22px] leading-[30.8px] font-[400] mt-4 text-[#8BA3D1]">
            {description}
          </p>
          <div className="mt-16 lg:flex justify-between border-[1px] border-[#3025FF] rounded-3xl max-w-[500px] p-2 hidden">
            <div className="flex flex-row  items-center  p-2 py-3">
              {/* <img
                src="./demo_blog_img.png"
                className="w-[54px] h-[54px] mr-5"
              ></img> */}
              <div>
                <p className=" text-[16px] text-[#8BA3D1]">{author}</p>
                <p className=" text-[16px] text-[#60A5FA] font-medium">
                 {time}
                </p>
              </div>
              <div className="pl-10 ">
                <Link to={`/blog/${id}`}><button className="bg-[#3025FF] w-[126px] h-[50px] font-[700] text-[14px] text-white  rounded-lg">
                  Read Article
                </button></Link>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[567px] md:w-1/2 w-full">
          <img
            src={image}
            alt="blog1"
            className="w-full h-full"
          />
        </div>
      </div>
      <div className="mt-16 flex justify-between border-[1px] border-[#3025FF] rounded-3xl max-w-[500px] p-2 lg:hidden">
        <div className="flex flex-row  items-center justify-between  p-2 py-3 w-full">
          {/* <img
            src="./demo_blog_img.png"
            className="w-[54px] h-[54px] md:mr-5 mr-2"
          ></img> */}
          <div>
            <p className=" text-[16px] text-[#8BA3D1]">{author}</p>
            <p className=" text-[16px] text-[#60A5FA] font-medium">{time}</p>
          </div>
          <div className="md:pl-10 pl-2">
            <Link to={`/blog/${id}`}>
                        <button className="bg-[#3025FF] md:w-[126px] w-[50px] h-[50px] font-[700] text-[14px] text-white  rounded-lg items-center flex justify-center">
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
  );
};

export default BlogRight;
