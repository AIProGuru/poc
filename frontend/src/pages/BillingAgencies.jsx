import React from "react";
import Header from "../components/layout/Header";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "./careers.scss";
import Discover from "../components/layout/Discover";
import Footer from "../components/layout/Footer";
import ProfileCard from "../components/layout/ProfileCard";
import Discover_all from "../components/layout/Discover_all";

const BillingAgencies = () => {
  const introduction_images = [
    "/careers1.png",
  ];
  return (
    <div
      className="flex flex-col bg-white overflow-y-auto overflow-hidden"
    >
      <Header />
      <div className="hero mt-32 relative w-full h-full md:mb-20 mb-1">
        {/* <div className="absolute top-4 -left-6 z-10">
          <img src="/icons.png" alt="" />
        </div> */}

        <div className="container mx-auto flex overflow-hidden">
          <div className="xl:w-1/2 lg:w-[60%] gap-8 flex flex-col text-center sm:text-left sm:w-[80%] w-full overflow-visible">
            <p className="text-[#0048FF] text-[20px] leading-7 z-20">
              Billing Agencies, MSOs, and TPAs
            </p>
            <h1
              className="text-[#0F172A] text-[42px] leading-[46px] md:text-[56px] md:leading-[56px] font-bold z-20"
            >
              Fewer Denials. More Revenue.
            </h1>
            <p className="text-[20px] text-[#475569] leading-[28px] md:w-[72%] w-full z-20">
              <u className="text-[#0048FF]">Helio RCM</u> boosts denial recovery
              with smarter workflows and improved financial outcomes for your
              business.
            </p>

            <button className="h-[70px] md:w-[240px] w-full bg-[#0048FF] shadow-xl shadow-[#0048FF]/50 items-center rounded-xl flex text-white font-semibold text-[20px] leading-[24px] py-[23px] px-[42px] justify-center gap-2 z-20">
              Get Started
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="m12 16l4-4l-4-4l-1.4 1.4l1.6 1.6H8v2h4.2l-1.6 1.6zm0 6q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"
                />
              </svg>
            </button>
            
            <p className="md:px-7 md:py-[40.5px] px-1 py-2 border-l-[#0048FF] border-l text-[20px] leading-[28px] text-[#475569] md:w-[92%] w-full z-20 sm:mt-0 -mt-48 text-left">
              Managing claim denials presents a unique set of challenges.
              Whether that's meeting payer-specific requirements or changing
              policies, the manual handling of this crucial process can lead to
              inefficiencies and subsequently, financial losses.{" "}
              <u className="text-[#0048FF]">Helio RCM's</u> is here to change
              that for good.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto flex flex-col md:gap-[200px] gap-[120px] overflow-visable">
        <div className="flex gap-4 justify-center items-center lg:gap-32 md:flex-row flex-col mx-auto">
          <div className="flex flex-col md:max-w-[380px] gap-8 md:order-1 order-2 mt-4 w-full">
            <h1
              className="text-[#0F172A] font-bold md:text-[48px] md:leading-[52px] text-[34px] leading-[38px]"
            >
              Optimize Denial Recovery Workflows
            </h1>

            <p className="text-[20px] text-[#475569] leading-[28px]">
              <u className="text-[#0048FF]">Helio RCM's</u> cutting-edge
              AI-powered platform overhauls the denial recovery workflow by
              eliminating manual errors and reducing the need for human
              interventions in the appeals and recovery process.
            </p>
          </div>

          <div className="relative md:order-2 order-1 w-full">
            <div className="1/2">
              <img
                src="/Frame 23856.png"
                alt=""
                className="max-w-[570px] w-full"
              />
            </div>
            <div className="absolute top-10 -left-[182px] hidden xl:block">
              <div className="relative">
                <img src="/Vector 7.svg" alt="" />
                <img
                  className="absolute -top-6 -left-6"
                  src="/Group 91.svg"
                  alt=""
                />
                <img
                  className="absolute -bottom-[42px] -right-6"
                  src="/Group 91.svg"
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center relative md:flex-row flex-col w-full gap-8">
          <div className="1/2">
            <img
              src="/Frame 23857.png"
              alt=""
              className="max-w-[570px] w-full"
            />
          </div>
          <div className="flex flex-col gap-8 relative md:max-w-[370px] md:w-1/2 w-full">
            <div className="absolute -left-52 top-12 hidden xl:block">
              <div className="relative">
                <img src="/vector123.svg" className="" />
                <img
                  className="absolute -top-6 -right-6"
                  src="/Group 91.svg"
                  alt=""
                />
                <img
                  className="absolute -bottom-[42px] -left-6"
                  src="/Group 91.svg"
                  alt=""
                />
              </div>
            </div>
            <h1
              className="md:text-[48px] font-bold text-[#0F172A] md:leading-[52px] text-[34px] leading-[38px]"
            >
              Complete Payer Rule Compliance
            </h1>
            <p className="text-[20px] leading-[24px] text-[#475569]">
              Integrate our AI-powered denial recovery tools in your software to
              help clients reduce the time they spend on dealing with denials by
              providing an intelligent and evolving denial management solution.
            </p>
          </div>
        </div>

        <div className="flex justify-center items-center relative md:flex-row flex-col overflow-visable">
          
          <div className="w-1/2"></div>
          <div className="flex flex-col gap-8 md:py-[75px] relative w-full md:max-w-[420px]">
            <div className="absolute hidden xl:block -left-52 top-24">
              <div className="relative">
                <img src="/vector123.svg" className="" />
                <img
                  className="absolute -top-6 -right-6"
                  src="/Group 91.svg"
                  alt=""
                />
                <img
                  className="absolute -bottom-[42px] -left-6"
                  src="/Group 91.svg"
                  alt=""
                />
              </div>
            </div>
            <h1
              className="md:text-[48px] md:leading-[52px] text-[34px] leading-[38px] font-bold text-[#0F172A] md:mt-0 -mt-[50]"
            >
              The Helio RCM Advantage
            </h1>
            <p className="text-[20px] leading-[24px] text-[#475569]">
              <strong className="text-[#0F172A] font-bold">
                Increased Operational Efficiency:
              </strong>{" "}
              Automate labor-intensive to save on administrative expenses.
            </p>
            <p className="text-[20px] leading-[24px] text-[#475569]">
              <strong className="text-[#0F172A] font-bold">
                Improve Client Retention:
              </strong>{" "}
              Offer better services to your clients for higher retention rates.
            </p>
            <p className="text-[20px] leading-[24px] text-[#475569]">
              <strong className="text-[#0F172A] font-bold">
                Boost Revenue:
              </strong>{" "}
              Convert lost revenue opportunities into gains with efficient claim
              handling.
            </p>
          </div>
        </div>
        {/* <div className="flex">
          <Swiper
            slidesPerView={1}
            spaceBetween={10}
            pagination={true}
            modules={[Pagination]}
            className="services flex"
          >
            {introduction_images.map((image, index) => (
              <SwiperSlide key={index}>
                <div className="flex w-full rounded-lg bg-transparent shadow-lg mx-auto relative justify-between md:flex-row flex-col mb-20 gap-8 md:gap-0">
                  <div className="flex flex-col md:w-[50%] gap-12 w-full 2xl:w-[30%]">
                    <h4
                      className="text-[#D9D9D9CC] md:text-[64px] md:leading-[64px] text-[38px] leading-[38px] font-bold"
                      style={{
                        "-webkit-text-stroke": "1px white",
                      }}
                    >
                      What Our Clients Say
                    </h4>
                    <p className="text-[20px] leading-[28px] text-[#6C9BE0]">
                      “Partnering with Helio RCM has been a game-changer for us.
                      Their AI didn't just automate our workflows—it recovered
                      lost revenue by overturning denials we had written off as
                      unrecoverable. In fact, 50% of all overturns during the
                      pilot came from those write-offs. Their expertise and
                      dedication have made a real difference, and we're truly
                      grateful for their partnership.”
                    </p>
                    <div className="md:block hidden">
                      <ProfileCard
                        image=""
                        name="Clay Foster"
                        title="Director of Business Services, Rebound Orthopedics"
                      />
                    </div>
                  </div>
                  <div className="md:w-1/2 w-full">
                    <div className="relative h-full">
                      <img
                        className="w-full max-w-[569px] object-cover h-full rounded-2xl"
                        src=""
                        alt=""
                      />
                      <div className="absolute left-0 top-0 w-full max-w-[569px] h-full mix-blend-multiply bg-[#002FFF99] rounded-2xl" />
                      <div className="absolute top-24 -left-[340px] 2xl:block hidden">
                        <div className="relative">
                          <img
                            src="/Vector77.png"
                            alt="Vector7"
                            className="h-[500px] w-[345px]"
                          />
                          <img
                            className="absolute -top-6 -right-6"
                            src="/Group 91.svg"
                            alt=""
                          />
                          <img
                            className="absolute -bottom-[42px] -left-6"
                            src="/Group 91.svg"
                            alt=""
                          />
                        </div>
                      </div>
                    </div>
                    <div className="md:hidden block mt-[48px]">
                      <ProfileCard
                        image=""
                        name="Clay Foster"
                        title="Director of Business Services, Rebound Orthopedics"
                      />
                    </div>
                    <div className="absolute bottom-[32px] left-[32px] flex items-center w-full">
                      <img
                        src="/Frame 24951.svg"
                        alt="Frame 2495"
                        className="w-[56px]"
                      />
                      <p className="font-semibold text-[#EBEDF0] text-[20px]">
                        Watch testimonials 1:23
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div> */}
      </div>

      <div className="mx-[1rem] sm:mx-[2rem] lg:mx-[4rem] xl:mx-[5rem] 2xl:mx-[6rem] flex justify-center mt-20 mb-10 sm:mb-32">
        <Discover_all
          title="Redefining Revenue Cycle Management"
          desc="Discover how Helio RCM can transform your revenue cycle management today."
          link="/#aidenial"
          button="Explore More"
        />
      </div>
      <Footer />
    </div>
  );
};

export default BillingAgencies;
