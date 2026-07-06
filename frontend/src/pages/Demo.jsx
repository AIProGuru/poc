import React from "react";

import { Outlet } from "react-router";
import { useSelector } from "react-redux";
import MySidebar from "../components/demo-layout/Sidebar";
import Header from '../components/demo-layout/Header';
import SupportWidget from "../components/demo-layout/SupportWidget";

const Demo = () => {
  const sidebarExpanded = useSelector((state) => state.menu.menuState);
  const theme = useSelector((state) => state.app.theme);
  return (
    <div
      className={`w-full h-screen flex overflow-hidden relative ${
        theme === "dark" ? "bg-[#1e1f24]" : "bg-slate-50"
      }`}
    >
      <div
        className={`shrink-0 h-screen overflow-hidden transition-[width] duration-300 ease-in-out w-20 ${
          sidebarExpanded ? "md:w-[308px]" : "md:w-20"
        } ${theme === "dark" ? "bg-[#1F2024]" : "bg-white"}`}
      >
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
        <SupportWidget />
      </div>
    </div>
  );
};

export default Demo;
