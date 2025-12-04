import React, { useEffect, useState } from 'react';

const Odometer = ({ value }) => {
  const [digits, setDigits] = useState([]);

  useEffect(() => {
    const valueStr = value.toString().padStart(7, '0');
    setDigits(valueStr.split(''));
  }, [value]);

  return (
    <section className="odometer">
      <div className="container">
        <div id="number-ticker" className="number-ticker font-poppins font-bold mb-0 sm:mb-[-40px]">
          {digits.map((digit, index) => (
            <div key={index} id={`digit-place${index}`} className="digit">
              {[...Array(10).keys(), 0].map((num) => (
                <div
                  key={num}
                  className={`col-num ${index === digits.length - 1 ? 'last-digit' : 'other-digits'}`}
                  style={{
                    transform: `translateY(-${digit * 100}%)`,
                    transition: 'transform 0.5s ease-in-out',
                  }}
                >
                  {num}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Odometer;