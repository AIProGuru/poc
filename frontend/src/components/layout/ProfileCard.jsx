import React from "react";

const ProfileCard = ({ image, name, title }) => {
  return (
    <div className="border-2 border-primary-500 max-w-[337px] w-full rounded-3xl flex md:px-[35px] md:py-[45px] gap-4 px-2 py-4">
      <div className="h-[54px] w-[54px] rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
        <span className="text-white text-lg font-bold font-montserrat">
          {name.split(' ').map(n => n[0]).join('')}
        </span>
      </div>
      <div className="gap-2">
        <p className="font-bold text-[16px] text-neutral-800">
          {name}
        </p>
        <p className="text-[18px] text-primary-600">{title}</p>
      </div>
    </div>
  );
};

export default ProfileCard;
