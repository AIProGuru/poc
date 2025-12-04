import React from "react";

const TestimonialCardEven = ({ testimonial }) => {
  return (
    <div className="flex w-full rounded-lg bg-transparent shadow-lg mx-auto relative">
      <div className="flex flex-col w-1/2">
        <div className="relative w-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold font-montserrat">
                {testimonial.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <h4 className="text-xl font-bold text-neutral-800 font-montserrat">
              {testimonial.name}
            </h4>
            <p className="text-primary-600 font-semibold">
              {testimonial.title}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4 w-[80%]">
          <div>
            <h4 className="font-bold text-[24px] text-neutral-800">Problem:</h4>
            <p className="text-[20px] text-neutral-600">{testimonial.problem}</p>
          </div>
          <div>
            <h4 className="font-bold text-[24px] text-neutral-800">Solution:</h4>
            <p className="text-[20px] text-neutral-600">{testimonial.solution}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCardEven;
