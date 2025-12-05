import React from "react";
import Container from "../components/layout/Container";
import ProfileCard from "../components/layout/ProfileCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "./careers.scss";
import TestimonialCardEven from "../components/layout/TestimonialCardEven";
import TestimonialCardOdd from "../components/layout/TestimonialCardOdd";
import Discover_all from "../components/layout/Discover_all";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import Discover from "../components/layout/Discover";
import Discovermob from "../components/layout/Discovermob";

const testimonials = [
  {
    name: "Alex Mendes",
    title: "CEO of Medical Plus",
    problem:
      "Crypto ipsum bitcoin ethereum dogecoin litecoin. Holo chainlink stellar terraUSD maker neo gala zcash. PancakeSwap audius solana amp dash klaytn terraUSD filecoin polkadot kusama. USD decred golem aave velas fantom. Tezos chiliz gala elrond EOS decentraland shiba-inu. Flow.",
    solution:
      "Crypto ipsum bitcoin ethereum dogecoin litecoin. Holo chainlink stellar terraUSD maker neo gala zcash. PancakeSwap audius solana amp dash klaytn terraUSD filecoin polkadot kusama. USD decred golem aave velas fantom. Tezos chiliz gala elrond EOS decentraland shiba-inu. Flow.",
    videoLink: "https://www.youtube.com/watch?v=r7hULM1qRf4",
    image: "/Alex.jpg",
  },
  
];

const TestimonialPage = () => {
  return (
    <div
      className="flex flex-col  bg-[#0B0C14] overflow-y-auto bg-no-repeat bg-cover gap-40 overflow-hidden"
      style={{
        backgroundImage: "url('/bg-optimized.png')",
        backgroundPosition: "center top 000px",
      }}
    >
      <Header />
      <div className="container mx-auto overflow-visible">
        <div className="flex items-center mt-32">
          <div className="relative w-full">
            <div className="md:w-[35%] w-full">
              <p className="font-bold text-[#D9D9D9CC] text-[64px] leading-[64px]"  style={{
            "-webkit-text-stroke": "0.5px white",
          }}>
                Customer Impact and Feedback
              </p>
              <p className="text-[22px] text-[#6C9BE0]">
                Explore our testimonials to discover how we've optimized company
                processes, resulting in significant savings of time, money, and
                resources.
              </p>
            </div>
            {/* <div className="absolute top-[32px] left-[25%] w-full">
              <div className="relative w-full">
                <div>
                  <img
                    src="/Vector 7.png"
                    alt="Vector7"
                    className="h-[407px] w-[345px]"
                  />
                </div>
                <div className="absolute top-[20%] left-[171px]">
                  <div className="relative">
                    <img
                      src="/Vector 9.png"
                      alt="Vector9"
                      className=" w-[100%]"
                    />
                    <div className="absolute left-[99%] -top-[72px] ">
                      <ProfileCard
                        name="Katie Sims"
                        title="CEO of Medical Plus"
                        image="/Katie.jpg"
                      />
                    </div>
                  </div>
                </div>
                <div className="absolute top-[60%] left-[171px]">
                  <img src="Vector 9.png" alt="Vector9" className="w-[476px]" />
                  <div className="absolute left-[99%] -top-[72px] ">
                    <ProfileCard
                      name="Autumn Phillips"
                      title="CEO of Medical Plus"
                      image="Michael.jpg"
                    />
                  </div>
                </div>
                <div className="absolute top-[100%] left-[342px]">
                  <div className="absolute left-[99%] -top-[72px] ">
                    <ProfileCard
                      name="Autumn Phillips"
                      title="CEO of Medical Plus"
                      image="Michael.jpg"
                    />
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
        <Container className="flex flex-col items-center justify-center text-center mt-64">
          <h2 className="text-[#D9D9D9CC] text-[54px] lg:text-[64px] font-bold font-sans"  style={{
            "-webkit-text-stroke": "0.5px white",
          }}>
            Testimonials
          </h2>
          <p className="text-[#6C9BE0] text-center items-center justify-center text-[22px] font-sans md:max-w-[55%] max-w-[90%]">
            Discover five essential strategies that healthcare organizations can
            implement to effectively manage claim denials
          </p>
        </Container>

        {/* <div className="flex mt-6">
          <Swiper
            slidesPerView={1}
            spaceBetween={10}
            pagination={true}
            modules={[Pagination]}
            className="services flex"
          >
            {testimonials.map((image, index) => (
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

        {/* {testimonials.map((testimonial, idx) => {
            if (idx % 2 === 1) {
              return <TestimonialCardOdd key={idx} testimonial={testimonial} />;
            } else {
              return (
                <TestimonialCardEven key={idx} testimonial={testimonial} />
              );
            }
          })} */}
      </div>

      <div className="flex justify-center items-center">
           <div className="hidden sm:block">
           <Discover title={`Discover what our AI Denial Agents can do for you`} description={`Recover Revenue, Reduce Denials, Real Results`}/>
            </div>
            <div className="block sm:hidden">
           <Discovermob/>
            </div>
           </div>
      <Footer />
    </div>
  );
};

export default TestimonialPage;
