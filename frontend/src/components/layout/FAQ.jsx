import React, { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question:
        "What makes Helio RCM different from other revenue recovery solutions?",
      answer:
        "Helio RCM specializes in backend revenue recovery with a laser focus on denied claims and zero-balance recoveries. Unlike broader automation providers, we use human-capable AI agents to pursue claim resubmissions and appeals, ensuring no revenue is left unclaimed.",
    },
    {
      question: "How does Helio RCM's platform help reduce denial rates?",
      answer:
        "Our platform includes AI-driven solutions that proactively scrub claims for errors before submission, minimising the risk of denials. These systems adapt continuously based on real-time insights, ensuring compliance with payer-specific requirements and reducing overall denial rates.",
    },
    {
      question: "What types of denials can Helio RCM's AI agents handle?",
      answer:
        "Helio RCM's AI solutions can manage both soft and hard denials. They are trained to resubmit and appeal claims autonomously, generating customised responses based on specific denial reasons to maximise recovery potential.",
    },
    {
      question: "How quickly can Helio RCM recover denied revenue?",
      answer:
        "With AI solutions working around the clock, Helio RCM accelerates cash recovery significantly. Our systems can reduce the typical 90-day resubmission process to just 20 days, bringing denied revenue back into your cash flow faster.",
    },
    {
      question:
        "Is Helio RCM's platform compatible with existing EHR and practice management systems?",
      answer:
        "Yes, Helio RCM integrates seamlessly with major EHR and practice management systems, including Epic, Cerner, and AthenaHealth, allowing your organisation to optimise denial management without workflow disruptions.",
    },
  ];

  return (
    <div className="py-20 bg-gradient-to-br from-neutral-50 to-primary-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-6 font-montserrat">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto font-montserrat">
            Get answers to the most common questions about our AI-powered revenue recovery platform.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`mb-6 modern-card overflow-hidden transition-all duration-300 ${
                openIndex === index ? 'ring-2 ring-primary-200' : ''
              }`}
            >
              <button
                className="w-full text-left p-8 focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-neutral-800 font-montserrat pr-8">
                    {faq.question}
                  </h3>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    openIndex === index 
                      ? 'bg-primary-500 rotate-180' 
                      : 'bg-neutral-100 hover:bg-neutral-200'
                  }`}>
                    <svg 
                      className={`w-5 h-5 transition-all duration-300 ${
                        openIndex === index ? 'text-white' : 'text-neutral-600'
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-8 pb-8">
                  <div className="border-t border-neutral-200 pt-6">
                    <p className="text-neutral-600 leading-relaxed font-montserrat">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="modern-card p-12 bg-gradient-to-r from-primary-50 to-secondary-50">
            <h3 className="text-3xl font-bold text-neutral-800 mb-4 font-montserrat">
              Still Have Questions?
            </h3>
            <p className="text-neutral-600 mb-8 text-lg font-montserrat">
              Our team is here to help you understand how Helio RCM can transform your revenue cycle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-8 py-4 rounded-2xl font-semibold shadow-medium hover:shadow-large transition-all duration-300 hover-lift">
                Contact Sales
              </button>
              <button className="bg-white border-2 border-primary-500 hover:bg-primary-50 text-primary-600 hover:text-primary-700 px-8 py-4 rounded-2xl font-semibold shadow-soft hover:shadow-medium transition-all duration-300 hover-lift">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
