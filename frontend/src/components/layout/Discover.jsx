import React from "react";
import { Link } from "react-router-dom";

const Discover = () => {
  return (
    <div className="py-20 bg-gradient-to-br from-neutral-50 to-primary-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-6 font-montserrat">
            Discover Our{" "}
            <span className="gradient-text">AI-Powered Solutions</span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto font-montserrat">
            Transform your healthcare revenue cycle with cutting-edge AI technology
            designed to maximize recovery and minimize denials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="modern-card p-8 hover-lift group">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-glow transition-all duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-neutral-800 mb-4 font-montserrat">
              Revenue Recovery
            </h3>
            <p className="text-neutral-600 mb-6 leading-relaxed">
              Automatically identify and recover lost revenue from denied claims
              with our advanced AI algorithms.
            </p>
            <Link 
              to="/features" 
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-300"
            >
              Learn More
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Card 2 */}
          <div className="modern-card p-8 hover-lift group">
            <div className="w-16 h-16 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-glow-orange transition-all duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-neutral-800 mb-4 font-montserrat">
              Smart Analytics
            </h3>
            <p className="text-neutral-600 mb-6 leading-relaxed">
              Get real-time insights into your denial patterns and optimize your
              revenue cycle performance.
            </p>
            <Link 
              to="/analytics" 
              className="inline-flex items-center text-secondary-600 hover:text-secondary-700 font-semibold transition-colors duration-300"
            >
              Explore Analytics
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Card 3 */}
          <div className="modern-card p-8 hover-lift group">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-500 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-glow transition-all duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-neutral-800 mb-4 font-montserrat">
              Secure Platform
            </h3>
            <p className="text-neutral-600 mb-6 leading-relaxed">
              Enterprise-grade security with HIPAA compliance ensures your data
              is protected at every step.
            </p>
            <Link 
              to="/security" 
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-300"
            >
              Security Details
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discover;