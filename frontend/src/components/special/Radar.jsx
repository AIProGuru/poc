import React, { useEffect, useRef, useState } from 'react';
import './Radar.css';
import Odometer from '../Odometer';

const RadarComp = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const diameter = 480; // Reduced diameter by an additional 20%
    const radius = diameter / 2;
    const scannerLength = radius * 0.5; // Reduce the length of the scanner line to 75% of the radius
    const dToR = (degrees) => degrees * (Math.PI / 180);
    let sweepAngle = 270;
    const sweepSize = 2;
    const sweepSpeed = 1.2;
    const gradient = ctx.createLinearGradient(radius, 0, 0, 0);

    gradient.addColorStop(0, `hsla(225, 100%, 50%, 1)`); // Start color #002FFF
    gradient.addColorStop(1, `hsla(225, 100%, 50%, 0.1)`); // End color with reduced opacity

    const renderSweep = () => {
      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate(dToR(sweepAngle));
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, scannerLength, dToR(-sweepSize), dToR(sweepSize), false); // Use scannerLength instead of radius
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();
    };

    const clear = () => {
      ctx.clearRect(0, 0, diameter, diameter);
    };

    const update = () => {
      sweepAngle += sweepSpeed;
    };

    const draw = () => {
      renderSweep();
    };

    const animate = () => {
      clear();
      update();
      draw();
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  const [value, setValue] = useState(4704782);

  useEffect(() => {
    const interval = setInterval(() => {
      setValue((prevValue) => prevValue + 1);
    }, 1000); // Adjust the interval as needed

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="radar-container">
      <div
        className="radar"
        style={{
          width: '480px', // Reduced width by an additional 20%
          height: '480px', // Reduced height by an additional 20%
        }}
      >
        <canvas ref={canvasRef} width="480" height="480"></canvas> {/* Reduced canvas size by an additional 20% */}
        <div className="radar-text mt-[-20px]"><Odometer value={value} /></div> {/* Center text */}
        <div className="radar-text mt-10 sm:mt-12 font-poppins">Processed Denials</div> {/* Center text */}
      </div>
    </div>
  );
};

export default RadarComp;