import React from "react";

import { Outlet } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import MySidebar from "../components/demo-layout/Sidebar";
import Header from '../components/demo-layout/Header';
import { setToggleMenu } from "../redux/reducers/menu.reducer";

const Demo = () => {
  const menuState = useSelector((state) => state.menu.menuState);
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.app.theme);
  console.log(theme)
  return (
    <>
      {!menuState && <div className="flex cursor-pointer rounded-lg border border-solid h-[36px] w-[36px] absolute left-0 top-10 z-50 justify-center items-center"
        onClick={() => dispatch(setToggleMenu(true))}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.5 16.5V1.5M1.5 9H13.1667M13.1667 9L7.33333 3.16667M13.1667 9L7.33333 14.8333" stroke="#1A3F59" strokeWidth={"1.66667"} strokeLinecap={"round"} strokeLinejoin={"round"} />
        </svg>
      </div>
      }
      <div className="w-full h-full flex relative">

        {/* Original sidebar hidden for dashboard */}
        <div className={`${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-black'} overflow-x-auto grow flex flex-col`}>
          <Outlet />
        </div>
        
      </div>
    </>
  );
};

export default Demo;
