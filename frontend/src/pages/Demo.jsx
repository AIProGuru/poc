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
    <div className="w-full h-screen flex overflow-hidden relative">
      <div className="shrink-0 h-screen overflow-hidden w-[72px] md:w-auto">
        <MySidebar />
      </div>
      <div
        className={`${
          theme === "dark" ? "bg-[#1e1f24] text-white" : "bg-slate-50 text-slate-900"
        } overflow-x-hidden grow flex flex-col`}
      >
        <Header />
        <div className="flex-1 overflow-y-auto content-scrollbar">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Demo;
