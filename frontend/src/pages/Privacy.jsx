import React, { useState } from "react";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Header";
import Discover from "../components/layout/Discover";
import Discovermob from "../components/layout/Discovermob";



const Privacy = () => {

  const data = [
    {
      img: "hippa-com.png",
      title: "HIPAA-Compliant",
      description: "Our AI solutions are fully HIPAA-compliant, with strict protocols in place to protect PHI and maintain confidentiality across all data transact"
    },
    {
      img: "audit.png",
      title: "Regular Security Audits",
      description: "Our platform undergoes regular security assessments and audits to identify and mitigate any potential vulnerabilities."
    },
    {
      img: "aes.png",
      title: "Advanced Encryption",
      description: "We use state-of-the-art encryption methods for data storage and transmission, safeguarding data from unauthorized access."
    },
    {
      img: "data-min.png",
      title: "Data Minimization",
      description: "Helio RCM adheres to data minimization principles, collecting and processing only the data necessary to deliver powerful denial management insights."
    },
    {
      img: "soc2.png",
      title: "SOC 2 Certification in Progress",
      description: "We are in the process of obtaining SOC 2 certification, further demonstrating our commitment to the highest security and operational standards.  "
    },
    {
      img: "uac.png",
      title: "User Access Controls",
      description: "With robust access control protocols, we ensure that only authorized personnel have access to sensitive information, enhancing your data’s protection."
    },
  ]

  return (
    <>
      <div className="h-full overflow-x-hidden overflow-y-auto bg-white" style={{ backgroundPosition: ' center top 00px' }}>

        <Navbar />
        <div className="w-[100%] flex flex-col items-center pt-[20vh]">
          <div className="flex flex-col items-center w-full px-[10vw]">
            <span className="text-[#0048FF] text-[20px] text-center">PROTECTING YOUR INFORMATION WITH CONFIDENCE</span>
            <span className=" text-[42px] leading-[46px] mt-5 sm:text-[64px]  font-bold font-poppins text-center text-[#0F172A]">Data Privacy & Security</span>
            <span className="text-[#475569] z-10 font-normal text-[22px] w-full sm:w-[866px] leading-[30.8px] text-center mt-4">
              Ensuring the highest standards of data protection and compliance to safeguard your organization and patients.
            </span>
          </div>
          {/* <div className="flex-1 mt-2 sm:mt-[-50px]">
    <img src="/data-privacy-screen.png" alt="Dashboard Card" className="w-full hidden sm:block" />  
      <img src="/data-privacy-screen-mob.png" alt="Dashboard Card" className="w-full mt-[0px] block sm:hidden" />

  </div> */}
        </div>
        <div className=" mt-[30px] sm:mt-[40px] z-10   mb-0 sm:mb-32 flex flex-col items-center justify-centers">
          {" "}
          <div className="w-[90%] sm:w-[70%] flex justify-center items-center flex-col">
            <p className="text-[38px] leading-[38px] mt-0 md:mt-[260px] lh:mt-0 md:text-[54px] lg:text-[64px] lg:leading-[66px] sm:leading-[54px] font-bold w-[100%] text-center text-[#0F172A] font-poppins">
              Committed to Excellence in Healthcare Data Security
            </p>
            <p className="font-poppins text-[#475569] w-[90%] max-w-[1014px] text-center text-[22px]  mt-5">
              Description: Helio RCM, we understand that data privacy is paramount in healthcare. Our platform is built to meet the highest standards of data protection and regulatory compliance, ensuring that your organization’s information—and your patients’ sensitive data—remain secure and confidential.
            </p>
            <img src="/data_compliance.png" className="mt-10 hidden sm:block" />
          </div>
        </div>



        <div className="flex flex-col sm:hidden mx-10  justify-center items-center">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col justify-center items-center text-center mb-8">
              <img src={item.img} alt={item.title} className="mt-4 h-[100px]" />
              <h1 className="text-[20px] text-[#0F172A] font-poppins font-bold ">{item.title}</h1>
              <p className="text-[#475569] text-[20px] mt-2 ">{item.description}</p>
            </div>
          ))}
        </div>



        <div className="flex justify-center items-center">
          <div className="hidden sm:block">
            <Discover title={"Discover what our GenAI-powered "} description={"Discover what our GenAI-powered platform and technology can do for you"} />
          </div>
          <div className="block sm:hidden">
            <Discovermob />
          </div>
        </div>
        <Footer />
      </div></>
  );
};

export default Privacy;
