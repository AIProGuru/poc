import React, { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import FAQ from '../components/layout/FAQ';
import Discover from '../components/layout/Discover';
import Collaboration from '../components/layout/Collaboration';
import Discover_collab from '../components/layout/Discover_collab';
import Discovermob from '../components/layout/Discovermob';

export default function Integrations() {
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const data = [
    {
      title: "Athena Health",
      header_image: "/header_image_athena_h.png",
      content: [
        "Athenahealth is a leading innovator in cloud-based healthcare technology, offering comprehensive solutions to streamline healthcare operations and improve patient care. With a primary focus on interoperability, Athenahealth bridges gaps between disparate systems, enabling seamless data exchange and fostering coordinated care delivery. Its portfolio includes electronic health records (EHR), patient engagement platforms, and revenue cycle management (RCM) tools designed to enhance efficiency and accuracy across healthcare organizations.",
        "Headquartered in Boston, Massachusetts, Athenahealth supports healthcare providers of all sizes, from small practices to large health systems, ensuring scalability and adaptability to unique operational needs. The company is recognized for its dedication to empowering providers with actionable insights derived from advanced analytics, enabling better decision-making and improved clinical outcomes.",
        "Athenahealth's robust infrastructure supports initiatives to reduce administrative burdens, accelerate revenue cycles, and improve overall practice performance. With a strong emphasis on innovation and a customer-centric approach, the company continues to redefine healthcare technology, making it a trusted partner for providers navigating the complexities of modern healthcare delivery."

      ],
      desc: "Enhances denial recovery without disrupting processes.",
      img: "/athenahealth.png"
    },
    {
      title: "Cerner",
      header_image: "/cerner.png",
      content: [
        `Cerner Health is a healthcare technology company that provides electronic health record (EHR) solutions, population health management, and data analytics to improve patient care, streamline operations, and enhance healthcare outcomes.`
      ],
      desc: "Supports real-time denial processing and appeals.",
      img: "/cerner.png"
    },
    {
      title: "EPIC",
      header_image: "/epic.png",
      content: [
        `
        Epic Systems is a leading healthcare software company that provides electronic health record (EHR) systems, clinical, and administrative solutions to hospitals and healthcare organizations, aiming to improve patient care, efficiency, and data interoperability across the healthcare ecosystem.
        `
      ],
      desc: "Leverages robust data for efficient denial resolution.",
      img: "/epic.png"
    },
    {
      title: "Nextgen Heathcare",
      header_image: "/nextgen.png",
      content: [
        `
        NextGen Healthcare is a provider of healthcare technology solutions, offering electronic health records (EHR), practice management software, and revenue cycle management services designed to improve the quality of care, streamline operations, and enhance patient engagement for healthcare providers.
        `
      ],
      desc: "Integrates to streamline denied claims management.",
      img: "/nextgen.png"
    },
    // Add more data as needed
  ];

  const handleDetailClick = (item) => {
    setDetailData(item);
    setShowDetail(true);
  };

  const handleBackClick = () => {
    setShowDetail(false);
    setDetailData(null);
  };

  return (
    <>
      <div
        className="h-full bg-white overflow-y-auto overflow-x-hidden "
      >
        <Header />
        {showDetail && detailData ? (
          <>
            <div className='mx-10 sm:mx-64 mt-20'>

              <button onClick={handleBackClick} className=" bg-gradient-to-tl from-[#06060CCC] to-[#1219538F] text-white px-4 py-2 rounded-md hover:bg-blue-700 transition ">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M12.233 4.4545C12.6723 4.89384 12.6723 5.60616 12.233 6.0455L6.27849 12L12.233 17.9545C12.6723 18.3938 12.6723 19.1062 12.233 19.5455C11.7937 19.9848 11.0813 19.9848 10.642 19.5455L3.892 12.7955C3.45267 12.3562 3.45267 11.6438 3.892 11.2045L10.642 4.4545C11.0813 4.01517 11.7937 4.01517 12.233 4.4545Z" fill="#6C9BE0" />
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M4.5 12C4.5 11.3787 5.00368 10.875 5.625 10.875H19.3125C19.9338 10.875 20.4375 11.3787 20.4375 12C20.4375 12.6213 19.9338 13.125 19.3125 13.125H5.625C5.00368 13.125 4.5 12.6213 4.5 12Z" fill="#6C9BE0" />
                </svg>

              </button>
              <div className="flex flex-col mb-32 justify-center  items-center pt-10 gap-8">
                <div className=' flex justify-center flex-col'>
                  <h2 className="text-[#0F172A] text-center text-4xl font-poppins font-bold mb-6">{detailData.title}</h2>
                  {detailData.content.map((para, index) => (
                    <p key={index} className="text-[#475569]  mb-4 leading-7">{para}</p>
                  ))}
                </div>
              </div>
            </div>

          </>
        ) : (
          <div className="flex flex-col mt-10 justify-center items-center pt-24 gap-8">
            <p className="font-poppins  max-w-[55%] text-center text-[#0048FF]  text-[20px] leading-[28px]">
              "WE ARE INTEGRATION AGNOSTIC"
            </p>
            <p className="font-poppins max-w-[80%] sm:max-w-[90%] text-center text-[#0F172A] font-bold text-[42px] sm:text-[56px] leading-[46px] sm:leading-[56px]">
              <span className=' hidden sm:block'>Seamless Integration with EHR</span> <span className=' hidden sm:block'>& Practice Management</span>
              <span className='block sm:hidden'>Seamless Integration with EHR & Practice Management</span>
            </p>
            <p className="font-poppins max-w-[80%] sm:max-w-[65%] z-10 text-center  text-[#475569] text-[20px] leading-[28px]">
              AI Denial Agents are compatible with major EHR and practice management platforms to optimize workflows without disruption.
            </p>
            <div className="relative">

            </div>
            <div className="z-10 flex flex-col items-start mt-2 mx-5 lg:mx-64 sm:mx-10 justify-center">
              <h2 className="text-[#0F172A] text-[32px] md:text-[48px] md:leading-[54px] lg:text-[56px] lg:leading-[60px] font-poppins px-0 sm:px-6 font-bold mb-6"> Compatible with:</h2>
              <div className=" hidden sm:grid grid-cols-1 sm:grid-cols-2 gap-6">
                {data.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-center p-6 rounded-lg bg-white border border-[#E2E8F0] rounded-xl">
                    <div className="flex-1 text-center sm:text-left">
                      <img src={item.img} alt={item.title} className="mb-4 h-[50px] mx-auto sm:mx-0" />
                      <p className="text-[#475569]">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => {
                        handleDetailClick(item);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="bg-[#0048FF] text-white px-4 py-2 rounded-md hover:bg-blue-700 transition mt-4 sm:mt-0 sm:ml-4"
                    >
                      <div className='flex justify-center items-center'>
                        <span className='font-poppins text-[12px] pr-2 font-bold'>Detail</span>
                        <span>
                          <svg width="22" height="23" viewBox="0 0 22 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0.5" y="1.12158" width="21" height="21" rx="4.5" stroke="#EEF6FF" />
                            <path d="M7.5 11.6216H14.7917H7.5ZM14.7917 11.6216L11.2917 8.12158L14.7917 11.6216ZM14.7917 11.6216L11.2917 15.1216L14.7917 11.6216Z" fill="#EBEDF0" />
                            <path d="M14.7917 11.6216L11.2917 15.1216M7.5 11.6216H14.7917H7.5ZM14.7917 11.6216L11.2917 8.12158L14.7917 11.6216Z" stroke="#EBEDF0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                          </svg>
                        </span>
                      </div>
                    </button>
                  </div>
                ))}
              </div>



            </div>

            <div className="flex mb-12 justify-center items-center content-center sm:hidden overflow-x-visible mt-[-40px] w-full">
              <div className=" w-[100vw] overflow-x-scroll hide-scrollbar" >
                <div className="flex flex-row transition-transform duration-1000 ease-in-out">

                  {data.map((item, index) => (
                    <div key={index} className="flex  flex-col  items-start p-6 rounded-lg">
                      <div className="flex-1 w-[200px]">
                        <img src={item.img} alt={item.title} className="mb-4 h-[48px] " />
                        <p className="text-[20px] text-[#A9C5ED]">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => {
                          handleDetailClick(item);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                        }
                        className="bg-[#0048FF] mt-5 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition "
                      >
                        <div className='flex justify-center items-center'>
                          <span className='font-poppins text-[12px] pr-2 font-bold'>Detail</span>
                          <span>

                            <svg width="22" height="23" viewBox="0 0 22 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="0.5" y="1.12158" width="21" height="21" rx="4.5" stroke="#EEF6FF" />
                              <path d="M7.5 11.6216H14.7917H7.5ZM14.7917 11.6216L11.2917 8.12158L14.7917 11.6216ZM14.7917 11.6216L11.2917 15.1216L14.7917 11.6216Z" fill="#EBEDF0" />
                              <path d="M14.7917 11.6216L11.2917 15.1216M7.5 11.6216H14.7917H7.5ZM14.7917 11.6216L11.2917 8.12158L14.7917 11.6216Z" stroke="#EBEDF0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                          </span>

                        </div>
                      </button>
                    </div>
                  ))}


                </div>
              </div>
            </div>

            {/* 
Hidden for deployment purpose because of no data

<div className='mt-2 sm:mt-[-160px]'>
              <Collaboration />
            </div>
*/}

            <div className="flex justify-center items-center">
              <div className="hidden sm:block">
                <Discover title={`We seamlessly integrate with your systems to maximize efficiency`} />
              </div>
              <div className="block sm:hidden">
                <Discovermob title={"We seamlessly integrate with your systems to maximize efficiency"} />
              </div>
            </div>
          </div>
        )}
        <Footer />
      </div>
    </>
  );
}