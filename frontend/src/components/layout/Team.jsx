import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "../../pages/careers.scss";

const leaders = [
  {
    name: "David Anderson",
    role: "Co-founder & CTO",
    link: "https://www.linkedin.com/in/david-anderson12345",
    description:
      "Veteran Bay Area technology leader with deep expertise building platforms 12+ years at Google. Head of Google Cloud Engineering Product & Services",
  },
];

const Team = () => {
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setColumns(1);
      } else if (window.innerWidth < 1024) {
        setColumns(2);
      } else {
        setColumns(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="py-20 bg-gradient-to-br from-neutral-50 to-primary-50">
      <div className="container mx-auto px-4">
        {/* Leadership Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-6 font-montserrat">
            Meet Our <span className="gradient-text">Leadership Team</span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto font-montserrat">
            Industry veterans with decades of combined experience in healthcare technology and AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {leaders.map((leader, index) => (
            <div key={index} className="modern-card p-8 hover-lift group">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden ring-4 ring-primary-100 group-hover:ring-primary-200 transition-all duration-300 bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold font-montserrat">
                    {leader.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-neutral-800 mb-2 font-montserrat">
                  {leader.name}
                </h3>
                <p className="text-primary-600 font-semibold mb-4">
                  {leader.role}
                </p>
                <p className="text-neutral-600 leading-relaxed mb-6 font-montserrat">
                  {leader.description}
                </p>
                <a
                  href={leader.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-300"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Connect on LinkedIn
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <div className="modern-card p-12 bg-gradient-to-r from-primary-50 to-secondary-50">
            <h3 className="text-3xl font-bold text-neutral-800 mb-4 font-montserrat">
              Join Our Mission
            </h3>
            <p className="text-neutral-600 mb-8 text-lg font-montserrat">
              We're building the future of healthcare revenue cycle management. Join our team and make a difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-8 py-4 rounded-2xl font-semibold shadow-medium hover:shadow-large transition-all duration-300 hover-lift">
                View Open Positions
              </button>
              <button className="bg-white border-2 border-primary-500 hover:bg-primary-50 text-primary-600 hover:text-primary-700 px-8 py-4 rounded-2xl font-semibold shadow-soft hover:shadow-medium transition-all duration-300 hover-lift">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
