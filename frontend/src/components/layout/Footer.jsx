import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useApiEndpoint } from "../../ApiEndpointContext";

const Footer = () => {
  const [isPlatformOpen, setIsPlatformOpen] = useState(true);
  const [isSolutionOpen, setIsSolutionOpen] = useState(true);
  const [isResourcesOpen, setIsResourcesOpen] = useState(true);
  const [isCompanyOpen, setIsCompanyOpen] = useState(true);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const apiUrl = useApiEndpoint();

  const togglePlatform = () => {
    setIsPlatformOpen(!isPlatformOpen);
  };

  const toggleSolution = () => {
    setIsSolutionOpen(!isSolutionOpen);
  };

  const toggleResources = () => {
    setIsResourcesOpen(!isResourcesOpen);
  };

  const toggleCompany = () => {
    setIsCompanyOpen(!isCompanyOpen);
  };

  const handleSubscribe = async (e) => {
    console.log("asdfasdfsadf", apiUrl);
    e.preventDefault();
    if (apiUrl === "") return;
    if (email === "") return;
    try {
      const response = await axios.post(`${apiUrl}/subscribe`, {
        email: email,
      });

      setMessage("Subscribed successfully!");
      alert("Subscribed successfully!");
      setEmail(""); // Clear the input
    } catch (error) {
      if (error.response) {
        // Backend error response
        setMessage(error.response.data.message || "Failed to subscribe.");
      } else {
        // Network error or other issues
        setMessage("An error occurred. Please try again.");
        alert("An error occurred. Please try again.");
      }
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-gradient-to-r from-neutral-800 to-neutral-900 text-neutral-300 py-16 px-6 w-full">
      <div className="flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start lg:items-center ml-0 sm:ml-5 mb-10 gap-4">
          <div className="one mb-6 sm:mb-0">
            <Link to={"/"} onClick={scrollToTop}>
              <h2 className="text-2xl font-bold text-white">Helio RCM</h2>
            </Link>
            <p className="text-neutral-400 mt-4 max-w-md">
              AI-powered healthcare revenue cycle management platform that transforms denied claims into recovered revenue.
            </p>
          </div>
          
          {/* Column 1: Platform */}
          <div>
            <h3
              className="text-sm font-bold mb-2 cursor-pointer text-primary-400"
              onClick={togglePlatform}
            >
              <span className="flex flex-row sm:justify-start justify-between content-center items-center">
                <p className="mr-2">Platform</p>
                <svg
                  width="14"
                  height="8"
                  viewBox="0 0 14 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 7.07812L7 1.07812L13 7.07812"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </h3>
            {isPlatformOpen && (
              <ul className="space-y-2">

              </ul>
            )}
          </div>
          
          {/* Column 2: Solution */}
          <div>
            <h3
              className="text-sm font-bold mb-2 cursor-pointer text-primary-400"
              onClick={toggleSolution}
            >
              <span className="flex flex-row sm:justify-start justify-between content-center items-center">
                <p className="mr-2">Solutions</p>
                <svg
                  width="14"
                  height="8"
                  viewBox="0 0 14 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 7.07812L7 1.07812L13 7.07812"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </h3>
            {isSolutionOpen && (
              <ul className="space-y-2">
                <Link
                  to="/clients/hospitals-and-health-systems"
                  onClick={scrollToTop}
                >
                  <li>Hospitals and Health Systems</li>
                </Link>
                <Link
                  to="/clients/physician-practices-and-providers"
                  onClick={scrollToTop}
                >
                  <li>Physician Practices and Providers</li>
                </Link>
                <Link
                  to="/clients/revenue-cycle-management-rcm-vendors"
                  onClick={scrollToTop}
                >
                  <li>Revenue Cycle Management (RCM) Vendors</li>
                </Link>
                <Link
                  to="/clients/practice-management-systems-and-ehr-vendors"
                  onClick={scrollToTop}
                >
                  <li>Practice Management Systems and EHR Vendors</li>
                </Link>
                <Link
                  to="/clients/billing-agencies-msos-and-tpas"
                  onClick={scrollToTop}
                >
                  <li>
                    Billing Agencies, MSOs, and TPAs (Third-Party
                    Administrators)
                  </li>
                </Link>
              </ul>
            )}
          </div>
          
          {/* Column 3: Resources and Company */}
          <div>
            <div>
              <h3
                className="text-sm font-bold mb-2 cursor-pointer text-primary-400"
                onClick={toggleResources}
              >
                <span className="flex flex-row sm:justify-start justify-between content-center items-center">
                  <p className="mr-2">Resources</p>
                  <svg
                    width="14"
                    height="8"
                    viewBox="0 0 14 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 7.07812L7 1.07812L13 7.07812"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </h3>
              {isResourcesOpen && (
                <ul className="space-y-2">
                  <Link to="/blog" onClick={scrollToTop}>
                    <li>Blog</li>
                  </Link>
                  <Link to="/whitepaper" onClick={scrollToTop}>
                    <li>White Paper</li>
                  </Link>
                </ul>
              )}
            </div>
            <div className="mt-6">
              <h3
                className="text-sm font-bold mb-2 cursor-pointer text-primary-400"
                onClick={toggleCompany}
              >
                <span className="flex flex-row sm:justify-start justify-between content-center items-center">
                  <p className="mr-2">Company</p>
                  <svg
                    width="14"
                    height="8"
                    viewBox="0 0 14 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 7.07812L7 1.07812L13 7.07812"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </h3>
              {isCompanyOpen && (
                <ul className="space-y-2">
                  <Link to="/about" onClick={scrollToTop}>
                    <li>About us</li>
                  </Link>
                  <Link to="/integrations" onClick={scrollToTop}>
                    <li>Popular integration</li>
                  </Link>
                  <Link to="/careers" onClick={scrollToTop}>
                    <li>Careers</li>
                  </Link>
                </ul>
              )}
            </div>
          </div>
          
          {/* Column 4: Contact - Only Divyang */}
          {/* <div>
            <div className="mt-0 mb-5">
              <h3 className="text-sm font-bold mb-2 text-primary-400">
                Contact
              </h3>
              <div className="space-y-2">
                <p className="text-sm">Divyang Sheth</p>
                <p className="text-sm text-neutral-400">Co-founder & CTO</p>
                <a 
                  href="https://www.linkedin.com/in/divyang-sheth" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary-400 hover:text-primary-300 text-sm transition-colors duration-300"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Connect on LinkedIn
                </a>
              </div>
            </div>
          </div> */}
        </div>
        
        {/* Bottom Section */}
        <div className="mt-10 border-t border-gray-600 pt-6 text-sm flex flex-col sm:flex-row justify-between">
          <p>Helio RCM © 2025. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link to="/privacy" onClick={scrollToTop} className="hover:opacity-75">
              Privacy Policy
            </Link>
            <a href="#" className="hover:opacity-75">
              Term and Services
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
