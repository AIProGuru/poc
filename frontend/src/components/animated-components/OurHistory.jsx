import React from 'react';
import { motion } from 'framer-motion';

const TimelineConnector = ({ index, side }) => {
  const verticalOffset = 120;
  const horizontalGap = side === 'left' ? -200 : 200;
  const startX = window.innerWidth / 2;
  const endX = startX + horizontalGap;
  const y = index * 240 + verticalOffset;

  return (
    <svg 
      className="absolute top-0 left-0 w-full h-full" 
      style={{ zIndex: 0, minHeight: '1000px' }}
      viewBox={`0 0 ${window.innerWidth} 1000`}
      preserveAspectRatio="none"
    >
      {/* Curved connecting line */}
      <motion.path
        d={`
          M ${startX} ${y}
          C ${startX + horizontalGap/3} ${y},
            ${endX - horizontalGap/3} ${y},
            ${endX} ${y}
        `}
        stroke="#2563eb"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
      
      {/* Connection point circle */}
      <motion.circle
        cx={startX}
        cy={y}
        r="4"
        fill="#2563eb"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      />
    </svg>
  );
};

const TimelineItem = ({ title, year, description, side, index }) => {
  // Calculate positions based on SVG coordinates
  const positions = {
    left: {
      x: 127,
      y: 611
    },
    right: {
      x: 510,
      y: 872
    }
  };

  const position = positions[side];

  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      className={`absolute ${side === 'left' ? 'right-[60%]' : 'left-[60%]'}`}
      style={{
        top: `${position.y}px`,
        width: "35%"
      }}
    >
      <div className="relative p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
        <div className="inline-block rounded-lg bg-blue-500/10 px-3 py-1 text-sm font-semibold text-blue-500 mb-4">
          {year}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </motion.div>
  );
};

const Timeline = () => {
  return (
    <div className="min-h-screen my-24  p-8">
      <div className="w-full mx-auto relative">
        <div className="relative" style={{ height: "873px" }}>
          {/* SVG Timeline */}
          <svg 
            width="510" 
            height="873" 
            viewBox="0 0 510 873" 
            fill="none" 
            className="absolute left-1/2 -translate-x-1/2"
          >
            <path d="M318 272L318 785C318 833.049 356.951 872 405 872L414 872L510 872" stroke="#002FFF"/>
            <path d="M318 250L318 524C318 572.049 279.049 611 231 611L127 611" stroke="#002FFF"/>
            <path d="M3 0.333358C1.52725 0.333358 0.333343 1.52727 0.333344 3.00002C0.333344 4.47278 1.52725 5.66669 3 5.66669C4.47275 5.66669 5.66666 4.47278 5.66666 3.00002C5.66666 1.52727 4.47275 0.333358 3 0.333358ZM318.161 264L317.661 264L318.161 264ZM318.161 63.0001L317.661 63.0001L318.161 63.0001ZM317.661 63.0001L317.661 264L318.661 264L318.661 63.0001L317.661 63.0001ZM405.161 351.5L510 351.5L510 350.5L405.161 350.5L405.161 351.5ZM258.161 2.50001L3 2.50002L3 3.50002L258.161 3.50001L258.161 2.50001ZM317.661 264C317.661 312.325 356.836 351.5 405.161 351.5L405.161 350.5C357.388 350.5 318.661 311.773 318.661 264L317.661 264ZM318.661 63.0001C318.661 29.5868 291.574 2.50001 258.161 2.50001L258.161 3.50001C291.022 3.50001 317.661 30.1391 317.661 63.0001L318.661 63.0001Z" fill="#002FFF"/>
          </svg>

          {/* Left Card 1 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="absolute right-[60%]"
            style={{ top: "-83px", width: "35%" }}
          >
            
            <div className="relative ">
              <div className="inline-block ">
              <h1 className="text-3xl mt-16 text-start md:text-[54px] leading-[58px] font-bold mb-2 text-[#D9D9D9CC]" style={{
            "-webkit-text-stroke": "0.5px white",
          }} >
                <span>Our</span><br/><span className=''>History</span>
              </h1>
              </div>
            
              <p className="text-[#A9C5ED] md:text-[18px] lg:text-[22px] leading-[30.8px]">and incorporated in Delaware with a 
              mission to disrupt traditional revenue cycle management. Since then, we’ve been breaking the rules of RevCycle by bringing AI-driven innovation to denial recovery. </p>
            </div>
          </motion.div>

          {/* Right Card 1 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="absolute left-[74%]"
            style={{ top: "321px", width: "40%" }}
          >
            <h1 className='text-[#002FFF] text-[40px] font-bold'>
              2023
            </h1>
            <div className="relative p-6 rounded-xl  backdrop-blur-sm border border-[#0C0F27]">
            
              <h3 className="text-xl font-bold text-white mb-2">Rapid growth, recruiting top talent to expand our team.</h3>
              <p className="text-[#A9C5ED]">Aaftaab Corp experienced rapid growth, attracting top talent to build a world-class team and drive innovation in healthcare revenue management.</p>
            </div>
          </motion.div>

          {/* Left Card 2 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="absolute right-[52%]"
            style={{ top: "590px", width: "45%" }}
          >
             <h1 className='text-[#002FFF] text-center text-[40px] font-bold'>
              2023 - 2024
            </h1>
            <div className="relative p-6 rounded-xl  backdrop-blur-sm border border-[#0C0F27]">
              <h3 className="text-xl font-bold text-white mb-2">Aaftaab Corp incorporated in Delaware</h3>
              <p className="text-[#A9C5ED]">Aaftaab began its journey to transform healthcare revenue management by developing AI-driven solutions, leveraging advanced technology and top talent to address key industry challenges.</p>
            </div>
          </motion.div>

          {/* Right Card 2 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="absolute left-[75%]"
            style={{ top: "832px", width: "40%" }}
          >
             <h1 className='text-[#002FFF]  text-[40px] font-bold'>
              Today
            </h1>
            <div className="relative p-6 rounded-xl  backdrop-blur-sm border border-[#0C0F27]">
             
              <h3 className="text-xl font-bold text-white mb-2">Continuing to lead in AI-driven solutions
              </h3>
              <p className="text-[#A9C5ED]">Driving innovation to redefine revenue cycle management.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
export default Timeline;