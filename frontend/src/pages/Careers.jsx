import React from "react";
import Header from "../components/layout/Header";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "./careers.scss";
import Footer from "../components/layout/Footer";
import { useNavigate } from "react-router-dom";
import Discover_all from "../components/layout/Discover_all";
import Discover from "../components/layout/Discover";
import Discovermob from "../components/layout/Discovermob";
const members = [
  {
    image: "/katie.png",
    name: "Katie Sims",
    role: "Machine Learning Specialist",
    description:
      "The culture here is both supportive and stimulating, with talented professionals who push boundaries and share insights. A strong focus on innovation ensures constant growth and staying ahead of industry trends.",
  },
  {
    image: "/patricia.png",
    name: "Patricia Sanders",
    role: "Product Manager",
    description:
      "Working at Aaftaab has been a career-defining experience. As a Product Manager, I lead innovative projects that directly influence the healthcare industry. The collaborative environment inspires teams to transform ambitious ideas into impactful, cutting-edge solutions.",
  },
  {
    image: "/rodger.png",
    name: "Rodger Struck",
    role: "Data Engineer",
    description:
      "As a Data Engineer at Aaftaab, I enjoy tackling technical challenges with meaningful impact. Building systems that improve healthcare efficiency is incredibly rewarding, and the collaborative team values my contributions to a seamless platform.",
  },
];

const Member = ({ member }) => {
  return (
    <div className="bg-gradient-to-r from-[#06060CCC] to-[#0810503D] flex flex-col justify-between items-center text-center rounded-[32px] z-10 md:px-[40px] md:py-[35px] px-[24px] py-[35px] max-w-[400px]">
      <div className="flex flex-col gap-4 items-center">
        <img
          src={member.image}
          alt=""
          className="rounded-full w-[92px] h-[92px]"
        />
        <h2 className="text-[#EBEDF0] font-bold text-[24px] leading-[32px]">
          {member.name}
        </h2>
        <h3 className="text-[#4570FF] text-[14px] leading-[22.82px]">
          {member.role}
        </h3>
        <p className="text-[#6C9BE0] leading-[26px] text-[16px] ">
          "{member.description}"
        </p>
      </div>
      <button className="flex w-[142px] h-[50px] px-[24px] py-[17px] justify-between text-white text-[14px] font-bold bg-[#0048FF] shadow-xl shadow-[#0048FF]/50 items-center rounded-xl">
        Connect{" "}
        <img className="w-[22px] h-[22px]" src="/LinkedinIcon.svg" alt="" />
      </button>
    </div>
  );
};

const Careers = () => {
  const navigate = useNavigate();
  const introduction_images = [
    "/careers1.png",
    "/careers2.png",
    "/careers2.png",
    "/careers4.png",
    "/careers1.png",
    "/careers2.png",
    "/careers2.png",
    "/careers4.png",
  ];

  const scrollToDiv = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const services = [
    {
      image: "/circuit 1.svg",
      title: "Innovative Work",
      description:
        "We foster a culture of creativity and innovation, encouraging our team members to think outside the box and bring their ideas to life.",
    },
    {
      image: "/path 1.svg",
      title: "Professional Growth",
      description:
        "To lead in denial management with AI agents that deliver measurable, transformative outcomes for U.S. healthcare.",
    },
    {
      image: "/collaboration-2 1.svg",
      title: "Collaborative Team",
      description:
        "Our open communication approach ensures that every voice is heard, and diverse perspectives are celebrated, creating a supportive work environment.",
    },
    {
      image: "/job-security 1.svg",
      title: "Flexible Work",
      description:
        "Our flexible work policies, including remote work options and adaptable hours, allow you to create a schedule that suits your lifestyle while maintaining productivity.",
    },
    {
      image: "/job-security 1.svg",
      title: "Innovative Work",
      description:
        "We foster a culture of creativity and innovation, encouraging our team members to think outside the box and bring their ideas to life.",
    },
  ];

  const roles = [
    {
      location: "Remote",
      title: "Product manager",
      startdate: "Immediate",
      compensation: "Competitive Market Salary + Strong Equity Offering",
      lookingfor: [
        "Extensive experience with denied medical claims, specifically write-offs and zero-balance recovery.",
        "Proven track record of overturning write-offs, maximizing claim recovery, and optimizing financial performance.",
        "Background in billing, revenue cycle management, or other related fields highly valued.",
        "Ability to analyze complex claims data and provide insights that drive results.",
      ],
      whoyouare: [
        "You are a technical expert in the field of medical claims management, with a deep understanding of the intricacies of denied claims and zero-balance recovery.",
        "Your extensive experience includes utilizing billing systems and analytics tools to dissect complex claim data, identify root causes of write-offs, and develop strategies for resolution.",
        "Proficient in leveraging revenue cycle management platforms, you bring technical precision and a systematic approach to optimizing claim recovery processes.",
        "Your ability to interpret large datasets and translate them into actionable financial insights ensures maximized recoveries and streamlined workflows. If you're technically adept and solution-oriented, we're eager to collaborate with you.",
      ],
      subtitle: "Join Aaftaab as a Product Manager",
      description:
        "Lead AI-driven solutions for healthcare revenue recovery, collaborate with teams to define strategies, prioritize features, and deliver innovative tools to address industry challenges.",
    },
    {
      location: "Remote",
      startdate: "Immediate",
      compensation: "Competitive Market Salary + Strong Equity Offering",
      lookingfor: [
        "Extensive experience with denied medical claims, specifically write-offs and zero-balance recovery.",
        "Proven track record of overturning write-offs, maximizing claim recovery, and optimizing financial performance.",
        "Background in billing, revenue cycle management, or other related fields highly valued.",
        "Ability to analyze complex claims data and provide insights that drive results.",
      ],
      whoyouare: [
        "You are a technical expert in the field of medical claims management, with a deep understanding of the intricacies of denied claims and zero-balance recovery.",
        "Your extensive experience includes utilizing billing systems and analytics tools to dissect complex claim data, identify root causes of write-offs, and develop strategies for resolution.",
        "Proficient in leveraging revenue cycle management platforms, you bring technical precision and a systematic approach to optimizing claim recovery processes.",
        "Your ability to interpret large datasets and translate them into actionable financial insights ensures maximized recoveries and streamlined workflows. If you're technically adept and solution-oriented, we're eager to collaborate with you.",
      ],
      title: "Data Engineer",
      subtitle: "Join Aaftaab as a Data Engineer",
      description:
        "Design and maintain scalable data infrastructure for our AI-powered platform. Ensure data integrity, accessibility, and performance to support advanced analytics and machine learning solutions.",
    },
    {
      location: "Remote",
      startdate: "Immediate",
      compensation: "Competitive Market Salary + Strong Equity Offering",
      lookingfor: [
        "Extensive experience with denied medical claims, specifically write-offs and zero-balance recovery.",
        "Proven track record of overturning write-offs, maximizing claim recovery, and optimizing financial performance.",
        "Background in billing, revenue cycle management, or other related fields highly valued.",
        "Ability to analyze complex claims data and provide insights that drive results.",
      ],
      whoyouare: [
        "You are a technical expert in the field of medical claims management, with a deep understanding of the intricacies of denied claims and zero-balance recovery.",
        "Your extensive experience includes utilizing billing systems and analytics tools to dissect complex claim data, identify root causes of write-offs, and develop strategies for resolution.",
        "Proficient in leveraging revenue cycle management platforms, you bring technical precision and a systematic approach to optimizing claim recovery processes.",
        "Your ability to interpret large datasets and translate them into actionable financial insights ensures maximized recoveries and streamlined workflows. If you're technically adept and solution-oriented, we're eager to collaborate with you.",
      ],
      title: "Product manager",
      subtitle: "Join Aaftaab as a Product Manager",
      description:
        "Lead AI-driven solutions for healthcare revenue recovery, collaborate with teams to define strategies, prioritize features, and deliver innovative tools to address industry challenges.",
    },
    {
      location: "Remote",
      startdate: "Immediate",
      compensation: "Competitive Market Salary + Strong Equity Offering",
      lookingfor: [
        "Extensive experience with denied medical claims, specifically write-offs and zero-balance recovery.",
        "Proven track record of overturning write-offs, maximizing claim recovery, and optimizing financial performance.",
        "Background in billing, revenue cycle management, or other related fields highly valued.",
        "Ability to analyze complex claims data and provide insights that drive results.",
      ],
      whoyouare: [
        "You are a technical expert in the field of medical claims management, with a deep understanding of the intricacies of denied claims and zero-balance recovery.",
        "Your extensive experience includes utilizing billing systems and analytics tools to dissect complex claim data, identify root causes of write-offs, and develop strategies for resolution.",
        "Proficient in leveraging revenue cycle management platforms, you bring technical precision and a systematic approach to optimizing claim recovery processes.",
        "Your ability to interpret large datasets and translate them into actionable financial insights ensures maximized recoveries and streamlined workflows. If you're technically adept and solution-oriented, we're eager to collaborate with you.",
      ],
      title: "Machine Learning Specialist",
      subtitle: "Join Aaftaab as a Machine Learning Specialist",
      description:
        "Design and implement AI models for denial recovery solutions. Work on cutting-edge projects, tackle complex challenges, and push the boundaries of AI in healthcare.",
    },
  ];

  const OnApply = (role) => {
    const token = btoa(JSON.stringify(role));
    navigate(`/apply/${token}`);
  };

  return (
    <div
      className="h-full bg-white overflow-y-auto overflow-x-hidden"
    >
      <Header />
      <div className="container hero mt-24 flex flex-col mx-auto">
        <div className="max-w-[700px] flex-col gap-8 relative h-full hidden lg:flex">
          <h1 className="text-[#0F172A] font-bold text-[48px] leading-[52px] ">
            Become Part of One of the Most Promising Healthcare Startups
          </h1>
          <button
            className="h-[70px] w-[270px] bg-[#0048FF] shadow-xl shadow-[#0048FF]/50 items-center rounded-xl flex text-white font-semibold text-[20px] leading-[24px] py-[23px] px-[38px] justify-between gap-2"
            onClick={() => scrollToDiv("openings")}
          >
            View open roles
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
          
        </div>
        <div className="flex flex-col gap-8 lg:hidden">
          <div className="flex flex-col gap-8 relative">
            <h1 className="text-[#0F172A] font-bold text-[36px] leading-[40px]">
              Become Part of One of the Most Promising Healthcare Startups
            </h1>
            <button
              className="h-[56px] w-full bg-[#0048FF] shadow-md shadow-[#0048FF]/20 items-center rounded-xl flex text-white font-semibold text-[18px] leading-[24px] py-[16px] px-[28px] justify-center gap-2"
              onClick={() => scrollToDiv("openings")}
            >
              View open roles
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
            <img
              src="/Vector 101.svg"
              className="absolute -bottom-[104px] left-20 w-[100px] z-20"
            />
            <img
              src="/Vector 111.svg"
              className="absolute -bottom-[100px] left-60 w-[200px] z-20"
            />
            <img
              src="/Vector 111.svg"
              className="absolute -bottom-[100px] left-96 w-[200px] z-20"
            />
          </div>

          <div className="mt-[69px]">
            <Swiper
              spaceBetween={10}
              modules={[Pagination]}
              className="intro flex"
              breakpoints={{
                // Small screens (mobile)

                // Extra small screens (mobile portrait)
                320: {
                  slidesPerView: 1,
                  spaceBetween: 5,
                },
                // Small mobile landscape
                420: {
                  slidesPerView: 1.5,
                  spaceBetween: 5,
                },
                // Small tablets
                540: {
                  slidesPerView: 2,
                  spaceBetween: 8,
                },
                // Tablets portrait
                640: {
                  slidesPerView: 2,
                  spaceBetween: 10,
                },
                // Tablets landscape
                768: {
                  slidesPerView: 2.5,
                  spaceBetween: 12,
                },
                // Small laptops
                960: {
                  slidesPerView: 3,
                  spaceBetween: 15,
                },
                // Large laptops
                1024: {
                  slidesPerView: 3.5,
                  spaceBetween: 18,
                },
                // Desktop screens
                1280: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
                // Large desktops
                1440: {
                  slidesPerView: 4,
                  spaceBetween: 25,
                },
              }}
            >
              {members.map((member, index) => (
                <SwiperSlide key={index}>
                  <div className="flex h-full justify-center">
                    <Member member={member} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
      <div className="aboutus">
        <div className="flex justify-center">
          <h1 className="md:text-[48px] font-bold md:leading-[52px] text-[34px] leading-[38px] text-[#0F172A] text-center max-w-[800px] pt-[40px] pb-[40px]">
            Allow Us To Introduce Ourselves
          </h1>
        </div>

        <Swiper
          spaceBetween={10}
          pagination={true}
          modules={[Pagination]}
          className="intro flex"
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 5,
            },
            // Small mobile landscape
            420: {
              slidesPerView: 1.5,
              spaceBetween: 5,
            },
            // Small tablets
            540: {
              slidesPerView: 2,
              spaceBetween: 8,
            },
            // Tablets portrait
            640: {
              slidesPerView: 2,
              spaceBetween: 10,
            },
            // Tablets landscape
            768: {
              slidesPerView: 2.5,
              spaceBetween: 12,
            },
            // Small laptops
            960: {
              slidesPerView: 3,
              spaceBetween: 15,
            },
            // Large laptops
            1024: {
              slidesPerView: 3.5,
              spaceBetween: 18,
            },
            // Desktop screens
            1280: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
            // Large desktops
            1440: {
              slidesPerView: 4,
              spaceBetween: 25,
            },
          }}
        >
          {introduction_images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="pb-14 justify-center flex">
                <div className="max-w-[500px] max-h-[500px] relative">
                  <img
                    style={{ filter: "grayscale(100%)" }}
                    src={image}
                    alt={`Introduction Image ${index + 1}`}
                    className="rounded-3xl"
                  />
                  <div className="absolute right-0 top-0 w-full h-full mix-blend-multiply bg-[#002fff96] rounded-3xl" />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="lg:ml-[200px] p-[30px] gap-8 flex flex-col">
        <div className="gap-8">
          <h1 className="text-[#0F172A] md:leading-[52px] md:text-[48px] text-[34px] leading-[38px] font-bold">
            Why Work with us
          </h1>
          <p className="text-[#475569] text-[20px] leading-[28px] max-w-[840px]">
            Join a close-knit, ambitious team where you will have the
            opportunity to directly impact our success and work at the forefront
            of healthcare innovation.
          </p>
        </div>
        <div className="flex relative">
          <Swiper
            pagination={true}
            spaceBetween={10}
            modules={[Pagination]}
            className="services flex"
            breakpoints={{
              // Small screens (mobile)
              320: {
                slidesPerView: 1,
                spaceBetween: 5,
              },
              // Medium screens (tablets)
              768: {
                slidesPerView: 2,
                spaceBetween: 10,
              },
              // Large screens (desktops)
              1024: {
                slidesPerView: 3,
                spaceBetween: 15,
              },
              // Extra large screens
              1280: {
                slidesPerView: 4,
                spaceBetween: 20,
              },
            }}
          >
            {services.map((service, index) => (
              <SwiperSlide key={index}>
                <div className="pb-20 h-full flex justify-center">
                  <div className="p-6 max-w-[422px] bg-white gap-8 flex flex-col rounded-[24px] border border-[#E2E8F0] shadow-sm">
                    <img
                      src={service.image}
                      alt=""
                      className="w-[148px] py-4"
                    />
                    <h2 className="font-bold text-[32px] leading-[40px] text-[#0048FF] w-[80%]">
                      {service.title}
                    </h2>
                    <p className="text-[18px] text-[#475569] leading-[26px] w-[82%]">
                      {service.description}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
      <div
        className="container flex flex-col items-center justify-center mx-auto"
        id="openings"
      >
        <h2 className="text-[#0F172A] md:text-[48px] md:leading-[52px] text-[34px] leading-[38px] font-bold py-12">
          Current Openings
        </h2>
        <div class="grid md:grid-cols-2 grid-cols-1 gap-4 max-w-[1164px]">
          {roles.map((role, idx) => (
            <div className="px-[40px] py-[30px] border border-[#E2E8F0] rounded-[24px] gap-4 bg-white shadow-sm">
              <p className="text-[14px] leading-[22.82px] text-[#0048FF]">
                {role.location}
              </p>
              <h1 className="font-bold text-[#0F172A] text-[24px]">
                {role.title}
              </h1>
              <p className="text-[16px] text-[#0048FF] leading-[26px]">
                {role.subtitle}
              </p>
              <p className="text-[#475569] text-[16px] leading-[26px]">
                {role.description}
              </p>
              <button
                className="text-white bg-[#0048FF] rounded-xl px-6 py-[14px] w-[160px] h-[50px] flex items-center mt-12 shadow-md shadow-[#0048FF]/20"
                onClick={() => OnApply(role)}
              >
                Apply now <img src="/Frame 143.svg" alt="" />{" "}
              </button>
            </div>
          ))}
        </div>
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

export default Careers;
