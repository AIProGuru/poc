import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center mr-3">
                <div className="w-6 h-6 bg-white rounded-full opacity-80"></div>
              </div>
              <span className="text-2xl font-bold text-teal-600">HELIO</span>
              <span className="text-sm text-gray-500 ml-1">RCM</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-orange-500 font-medium">Home</a>
              <a href="#" className="text-gray-700 hover:text-orange-500">About</a>
              <a href="#" className="text-gray-700 hover:text-orange-500">Products</a>
              <a href="#" className="text-gray-700 hover:text-orange-500">Innovation Suite</a>
              <a href="#" className="text-gray-700 hover:text-orange-500">Resources</a>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link to="/signin" className="text-gray-700 hover:text-orange-500">Login</Link>
              <Link 
                to="/contact" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content - AI Hand Image */}
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-slate-800 to-blue-900 rounded-2xl overflow-hidden">
                <div className="w-full h-full bg-cover bg-center" 
                     style={{
                       backgroundImage: "url('/ai-hand-image.png')"
                     }}>
                </div>
              </div>
            </div>

            {/* Right Content - Text */}
            <div className="text-white">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Simple RCM, <span className="text-orange-500">AI</span>
                <br />
                <span className="text-orange-500">Precision</span>, Powerful
                <br />
                Results
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                We Provide a Single Solution That Handles Claim 
                Scrubbing, Denials, and Payments With 
                Unmatched Accuracy
              </p>

              <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg">
                Get a Custom RCM Solution
              </button>
            </div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-orange-500 rounded-full animate-pulse delay-500"></div>
          <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 right-40 w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-1500"></div>
        </div>
      </main>
    </div>
  );
};

export default Home;