import React, { useState, useContext, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AccountContext } from "../../utils/Account";
import { setAppTitle, setTheme, setKeyword, setCurrentPage, setPart1Loading, setPart2Loading, setTableLoading, setExtraFilter } from "../../redux/reducers/app.reducer";
import AdvancedSearch from "./AdvancedSearch";
import {
  Backdrop,
  Popover,
  Typography,
  IconButton,
  Switch,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { canAccessClientManagement, canAccessGovernanceManagement, canAccessUserManagement } from "../../utils/roles";

const Header = () => {
  const role = useSelector((state) => state.auth.role);
  const firstname = useSelector((state) => state.auth.firstname);
  const lastname = useSelector((state) => state.auth.lastname);
  const useremail = useSelector((state) => state.auth.email);
  const appTitle = useSelector((state) => state.app.title);
  const theme = useSelector((state) => state.app.theme);
  const isDarkMode = theme === "dark";
  const { logout } = useContext(AccountContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuShow, setMenuShow] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const keyword = useSelector((state) => state.app.keyword);
  const inputKeywordRef = useRef();
  const menuButtonRef = useRef(null);

  const filterByKeyword = () => {
    dispatch(setExtraFilter({}));
    dispatch(setPart1Loading(true));
    dispatch(setPart2Loading(true));
    dispatch(setTableLoading(true));
    dispatch(setKeyword(inputKeywordRef.current.value));
    dispatch(setCurrentPage(1));
  };

  useEffect(() => {
    if (inputKeywordRef.current) {
      inputKeywordRef.current.value = keyword;
    }
  }, [keyword]);

  const handleMenuClick = (event) => {
    setAnchorEl(menuButtonRef.current || event.currentTarget);
    setMenuShow(true);
  };

  const handleKeywordKeyDown = (e) => {
    if (e.key === 'Enter') {
      filterByKeyword();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMenuShow(false);
    if (menuButtonRef.current) {
      menuButtonRef.current.focus();
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    dispatch(setTheme(savedTheme));
    document.body.classList.toggle("dark-mode", savedTheme === "dark");
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.body.classList.toggle("dark-mode", theme === "dark");
  }, [theme]);

  const toggleDarkMode = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    dispatch(setTheme(newTheme));
  };

  const headerBg = isDarkMode ? "text-white" : "text-black";

  return (
    <div
      className={`flex my-5 ml-0 sm:ml-0 justify-between w-full ${headerBg}`}
    >
      <div className="flex flex-col">
        <div
          className="flex sm:hidden pt-2 pb-9 cursor-pointer"
          onClick={() => navigate("/")}
        >
          {/* mobile logo placeholder */}
        </div>
      </div>
      <div />
      <div className="items-center hidden sm:flex gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                <svg className="block w-[18px] h-[18px]" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.98913 15.2496C11.6327 15.2496 14.5864 12.2959 14.5864 8.6524C14.5864 5.00885 11.6327 2.05518 7.98913 2.05518C4.34558 2.05518 1.39191 5.00885 1.39191 8.6524C1.39191 12.2959 4.34558 15.2496 7.98913 15.2496Z" stroke="#9598B0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15.2808 15.9441L13.8919 14.5552" stroke="#9598B0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <input
                placeholder="Search by Claim ID"
                className={`text-sm rounded-lg py-2.5 px-10 pl-10 w-72 ${theme === 'dark' ? "bg-[#27282D] text-white border border-gray-600" : "text-black bg-white border border-gray-300"}`}
                ref={inputKeywordRef}
                defaultValue={keyword}
                onKeyDown={handleKeywordKeyDown}
              />
            </div>
            <AdvancedSearch />
          </div>
        </div>
        
        <div className="font-inter hidden sm:flex text-[28px] font-semibold relative cursor-pointer select-none">
          <button
            type="button"
            className={`flex  w-full h-[48px] font-semibold text-[16px] font-inter justify-between pr-2 items-center gap-2 pl-2 ${menuShow ? "rounded-t-lg" : "rounded-lg"
              }`}
            onClick={handleMenuClick}
            ref={menuButtonRef}
          >
            <img src="/man.svg" width={32} height={32} />
          </button>
          <Backdrop
            open={menuShow}
            onClick={handleClose}
            sx={{
              zIndex: (theme) => theme.zIndex.drawer + 1,
              backdropFilter: "blur(5px)",
            }}
          />
          <Popover
            open={menuShow}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            PaperProps={{
              sx: {
                p: 2,
                borderRadius: 5,
                minWidth: "200px",
                border: `1px solid ${theme === "dark" ? "#2A2F38" : "#E2E8F0"}`,
                backgroundColor: theme === "dark" ? "#151619" : "#FFFFFF",
                color: theme === "dark" ? "white" : "#0F172A",
              },
            }}
          >
            <div
              className={`flex flex-col w-[220px] gap-y-4 ${theme === "dark" ? "bg-[#151619] text-white" : "bg-white text-slate-900"}`}
            >
              <div className="flex flex-col items-start gap-1">
                <Typography variant="h6">{`${firstname} ${lastname}`}</Typography>
                <Typography variant="body2" color={theme === "dark" ? "white" : "#334155"}>{`${useremail}`}</Typography>
              </div>
              <div
                className={`flex items-center rounded-lg p-1 w-full ${theme === "dark" ? "bg-[#191A1D]" : "bg-[#F3F4F6]"}`}
              >
                <button
                  className={`flex items-center justify-center flex-1 h-10 rounded-lg text-sm font-semibold transition-colors ${!isDarkMode ? "bg-white text-slate-900" : "text-slate-400"
                    }`}
                  onClick={() => dispatch(setTheme("light"))}
                >
                  <svg
                    width="21"
                    height="20"
                    viewBox="0 0 21 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10.2501 1.04297C10.5953 1.04297 10.8751 1.32279 10.8751 1.66797V3.33464C10.8751 3.67981 10.5953 3.95964 10.2501 3.95964C9.9049 3.95964 9.62508 3.67981 9.62508 3.33464V1.66797C9.62508 1.32279 9.9049 1.04297 10.2501 1.04297ZM3.30729 3.09804C3.54021 2.84329 3.93554 2.82559 4.19029 3.05851L6.04197 4.7515C6.29672 4.98442 6.31442 5.37975 6.0815 5.6345C5.84858 5.88925 5.45325 5.90695 5.1985 5.67403L3.34682 3.98104C3.09207 3.74812 3.07437 3.35279 3.30729 3.09804ZM17.1929 3.09804C17.4258 3.35279 17.4081 3.74812 17.1533 3.98104L15.3017 5.67403C15.0469 5.90695 14.6516 5.88925 14.4187 5.6345C14.1857 5.37975 14.2034 4.98442 14.4582 4.7515L16.3099 3.05851C16.5646 2.82559 16.96 2.84329 17.1929 3.09804ZM10.2501 6.45964C8.29407 6.45964 6.70841 8.04529 6.70841 10.0013C6.70841 11.9573 8.29407 13.543 10.2501 13.543C12.2061 13.543 13.7917 11.9573 13.7917 10.0013C13.7917 8.04529 12.2061 6.45964 10.2501 6.45964ZM5.45841 10.0013C5.45841 7.35494 7.60372 5.20964 10.2501 5.20964C12.8964 5.20964 15.0417 7.35494 15.0417 10.0013C15.0417 12.6477 12.8964 14.793 10.2501 14.793C7.60372 14.793 5.45841 12.6477 5.45841 10.0013ZM1.29175 10.0013C1.29175 9.65612 1.57157 9.3763 1.91675 9.3763H3.58341C3.92859 9.3763 4.20841 9.65612 4.20841 10.0013C4.20841 10.3465 3.92859 10.6263 3.58341 10.6263H1.91675C1.57157 10.6263 1.29175 10.3465 1.29175 10.0013ZM16.2917 10.0013C16.2917 9.65612 16.5716 9.3763 16.9167 9.3763H18.5834C18.9286 9.3763 19.2084 9.65612 19.2084 10.0013C19.2084 10.3465 18.9286 10.6263 18.5834 10.6263H16.9167C16.5716 10.6263 16.2917 10.3465 16.2917 10.0013ZM14.438 14.189C14.6821 13.9449 15.0778 13.9449 15.3219 14.189L17.1736 16.0409C17.4176 16.285 17.4176 16.6807 17.1735 16.9248C16.9294 17.1689 16.5337 17.1688 16.2896 16.9247L14.438 15.0728C14.1939 14.8287 14.1939 14.433 14.438 14.189ZM6.0623 14.1891C6.30638 14.4332 6.30638 14.8289 6.0623 15.073L4.21045 16.9248C3.96637 17.1689 3.57065 17.1689 3.32657 16.9248C3.08249 16.6807 3.08249 16.285 3.32657 16.0409L5.17842 14.1891C5.4225 13.945 5.81823 13.945 6.0623 14.1891ZM10.2501 16.043C10.5953 16.043 10.8751 16.3228 10.8751 16.668V18.3346C10.8751 18.6798 10.5953 18.9596 10.2501 18.9596C9.9049 18.9596 9.62508 18.6798 9.62508 18.3346V16.668C9.62508 16.3228 9.9049 16.043 10.2501 16.043Z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="pl-2">Light</span>
                </button>
                <button
                  className={`flex items-center justify-center flex-1 h-10 rounded-lg text-sm font-semibold transition-colors ${isDarkMode ? "text-white bg-[#151619]" : "text-gray-400"
                    }`}
                  onClick={toggleDarkMode}
                >
                  {theme === "dark" ? (
                    <svg
                      width="21"
                      height="20"
                      viewBox="0 0 21 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M9.93051 2.33595C6.05828 2.74481 3.04102 6.0207 3.04102 10.0013C3.04102 14.2585 6.49215 17.7096 10.7493 17.7096C14.73 17.7096 18.0058 14.6924 18.4147 10.8201C17.3091 12.2237 15.5932 13.1263 13.666 13.1263C10.3293 13.1263 7.62435 10.4214 7.62435 7.08464C7.62435 5.15745 8.52698 3.44155 9.93051 2.33595ZM1.79102 10.0013C1.79102 5.05375 5.8018 1.04297 10.7493 1.04297C11.3465 1.04297 11.6455 1.51902 11.6967 1.89819C11.746 2.26295 11.6111 2.72685 11.1919 2.98019C9.80156 3.82031 8.87435 5.34449 8.87435 7.08464C8.87435 9.731 11.0197 11.8763 13.666 11.8763C15.4062 11.8763 16.9303 10.9491 17.7705 9.55877C18.0238 9.1395 18.4877 9.00467 18.8525 9.05393C19.2316 9.10514 19.7077 9.40411 19.7077 10.0013C19.7077 14.9489 15.6969 18.9596 10.7493 18.9596C5.8018 18.9596 1.79102 14.9489 1.79102 10.0013Z"
                        fill="currentColor"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="21"
                      height="20"
                      viewBox="0 0 21 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M9.93124 2.33595C6.05901 2.74481 3.04175 6.0207 3.04175 10.0013C3.04175 14.2585 6.49289 17.7096 10.7501 17.7096C14.7307 17.7096 18.0066 14.6924 18.4154 10.8201C17.3098 12.2237 15.5939 13.1263 13.6667 13.1263C10.33 13.1263 7.62508 10.4214 7.62508 7.08464C7.62508 5.15745 8.52771 3.44155 9.93124 2.33595ZM1.79175 10.0013C1.79175 5.05375 5.80253 1.04297 10.7501 1.04297C11.3473 1.04297 11.6462 1.51902 11.6975 1.89819C11.7467 2.26295 11.6119 2.72685 11.1926 2.98019C9.80229 3.82031 8.87508 5.34449 8.87508 7.08464C8.87508 9.731 11.0204 11.8763 13.6667 11.8763C15.4069 11.8763 16.9311 10.9491 17.7712 9.55877C18.0245 9.1395 18.4884 9.00467 18.8532 9.05393C19.2324 9.10514 19.7084 9.40411 19.7084 10.0013C19.7084 14.9489 15.6976 18.9596 10.7501 18.9596C5.80253 18.9596 1.79175 14.9489 1.79175 10.0013Z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                  <span className="pl-2">Dark</span>
                </button>
              </div>
              {canAccessUserManagement(role) && (
                <div
                  className={`flex items-center gap-2 h-[48px] cursor-pointer pl-2 ${theme === "dark" ? "bg-[#151619] text-white" : "bg-white text-slate-900"}`}
                  onClick={() => {
                    handleClose();
                    dispatch(setAppTitle("User Management"));
                    navigate("/management");
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.02818 8.21832C6.95874 8.21137 6.87541 8.21137 6.79902 8.21832C5.14624 8.16276 3.83374 6.80859 3.83374 5.14193C3.83374 3.44054 5.20874 2.05859 6.91707 2.05859C8.61846 2.05859 10.0004 3.44054 10.0004 5.14193C9.99346 6.80859 8.68096 8.16276 7.02818 8.21832Z"
                      stroke="#686B7E"
                      stroke-width="1.3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M12.0622 3.44531C13.4094 3.44531 14.4928 4.53559 14.4928 5.87587C14.4928 7.18837 13.4511 8.25781 12.1525 8.30642C12.0969 8.29948 12.0344 8.29948 11.9719 8.30642"
                      stroke="#686B7E"
                      stroke-width="1.3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M3.55607 10.7773C1.87552 11.9023 1.87552 13.7357 3.55607 14.8537C5.46579 16.1315 8.59774 16.1315 10.5075 14.8537C12.188 13.7287 12.188 11.8954 10.5075 10.7773C8.60468 9.50651 5.47274 9.50651 3.55607 10.7773Z"
                      stroke="#686B7E"
                      stroke-width="1.3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M13.4028 14.5573C13.9028 14.4531 14.3751 14.2517 14.7639 13.9531C15.8473 13.1406 15.8473 11.8003 14.7639 10.9878C14.382 10.6962 13.9167 10.5017 13.4237 10.3906"
                      stroke="#686B7E"
                      stroke-width="1.3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>

                  <span className={`text-[14px] font-regular font-inter ${theme === "dark" ? "bg-[#151619] text-white" : "bg-white text-slate-900"}`}>
                    User Management
                  </span>
                </div>
              )}

              {canAccessClientManagement(role) && (
                <div
                  className={`flex items-center gap-2 h-[48px] cursor-pointer pl-2 ${theme === "dark" ? "bg-[#151619] text-white" : "bg-white text-slate-900"}`}
                  onClick={() => {
                    handleClose();
                    dispatch(setAppTitle("Client Management"));
                    navigate("/clientmanagement");
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.5 10.833C7.96024 10.833 8.33333 10.4599 8.33333 9.99967C8.33333 9.53944 7.96024 9.16634 7.5 9.16634C7.03976 9.16634 6.66667 9.53944 6.66667 9.99967C6.66667 10.4599 7.03976 10.833 7.5 10.833Z"
                      stroke="#686B7E"
                      stroke-width="1.4"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M12.5 10.833C12.9602 10.833 13.3333 10.4599 13.3333 9.99967C13.3333 9.53944 12.9602 9.16634 12.5 9.16634C12.0398 9.16634 11.6667 9.53944 11.6667 9.99967C11.6667 10.4599 12.0398 10.833 12.5 10.833Z"
                      stroke="#686B7E"
                      stroke-width="1.4"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M7.5 6.66699C7.96024 6.66699 8.33333 6.29389 8.33333 5.83366C8.33333 5.37342 7.96024 5.00033 7.5 5.00033C7.03976 5.00033 6.66667 5.37342 6.66667 5.83366C6.66667 6.29389 7.03976 6.66699 7.5 6.66699Z"
                      stroke="#686B7E"
                      stroke-width="1.4"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M12.5 6.66699C12.9602 6.66699 13.3333 6.29389 13.3333 5.83366C13.3333 5.37342 12.9602 5.00033 12.5 5.00033C12.0398 5.00033 11.6667 5.37342 11.6667 5.83366C11.6667 6.29389 12.0398 6.66699 12.5 6.66699Z"
                      stroke="#686B7E"
                      stroke-width="1.4"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M7.5 15.0003C7.96024 15.0003 8.33333 14.6272 8.33333 14.167C8.33333 13.7068 7.96024 13.3337 7.5 13.3337C7.03976 13.3337 6.66667 13.7068 6.66667 14.167C6.66667 14.6272 7.03976 15.0003 7.5 15.0003Z"
                      stroke="#686B7E"
                      stroke-width="1.4"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M12.5 15.0003C12.9602 15.0003 13.3333 14.6272 13.3333 14.167C13.3333 13.7068 12.9602 13.3337 12.5 13.3337C12.0398 13.3337 11.6667 13.7068 11.6667 14.167C11.6667 14.6272 12.0398 15.0003 12.5 15.0003Z"
                      stroke="#686B7E"
                      stroke-width="1.4"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M16.6667 2.5H3.33333C2.875 2.5 2.5 2.875 2.5 3.33333V16.6667C2.5 17.125 2.875 17.5 3.33333 17.5H16.6667C17.125 17.5 17.5 17.125 17.5 16.6667V3.33333C17.5 2.875 17.125 2.5 16.6667 2.5Z"
                      stroke="#686B7E"
                      stroke-width="1.4"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>

                  <span className={`text-[14px] font-regular font-inter ${theme === "dark" ? "bg-[#151619] text-white" : "bg-white text-slate-900"}`}>
                    Client Management
                  </span>
                </div>
              )}

              {canAccessGovernanceManagement(role) && (
                <div
                  className={`flex items-center gap-2 h-[48px] cursor-pointer pl-2 ${theme === "dark" ? "bg-[#151619] text-white" : "bg-white text-slate-900"}`}
                  onClick={() => {
                    handleClose();
                    dispatch(setAppTitle("Governance Management"));
                    navigate("/governance-management");
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.0003 2.5L15.8337 5.41667V9.79167C15.8337 13.025 13.342 16.05 10.0003 17.5C6.65866 16.05 4.16699 13.025 4.16699 9.79167V5.41667L10.0003 2.5Z"
                      stroke="#686B7E"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.33301 9.58301L9.37467 10.6247L11.8747 8.12467"
                      stroke="#686B7E"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <span className={`text-[14px] font-regular font-inter ${theme === "dark" ? "bg-[#151619] text-white" : "bg-white text-slate-900"}`}>
                    Governance Management
                  </span>
                </div>
              )}

              {canAccessGovernanceManagement(role) && (
                <div
                  className={`flex items-center gap-2 h-[48px] cursor-pointer pl-2 ${theme === "dark" ? "bg-[#151619] text-white" : "bg-white text-slate-900"}`}
                  onClick={() => {
                    handleClose();
                    dispatch(setAppTitle("Appeal Templates"));
                    navigate("/appeal-templates");
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.66699 2.5H11.667L15.8337 6.66667V15.8333C15.8337 16.2936 15.4606 16.6667 15.0003 16.6667H6.66699C6.20675 16.6667 5.83366 16.2936 5.83366 15.8333V3.33333C5.83366 2.8731 6.20675 2.5 6.66699 2.5Z"
                      stroke="#686B7E"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M11.667 2.5V6.66667H15.8337"
                      stroke="#686B7E"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.33301 10H13.333"
                      stroke="#686B7E"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.33301 12.916H11.6663"
                      stroke="#686B7E"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <span className={`text-[14px] font-regular font-inter ${theme === "dark" ? "bg-[#151619] text-white" : "bg-white text-slate-900"}`}>
                    Appeal Templates
                  </span>
                </div>
              )}

              <div
                className={`flex items-center gap-2 h-[48px] cursor-pointer pl-2 ${theme === "dark" ? "bg-[#151619] text-white" : "bg-white text-slate-900"}`}
                onClick={() => {
                  handleClose();
                  dispatch(setAppTitle("Account Settings"));
                  navigate("/account-settings");
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.0013 12.0846C11.1519 12.0846 12.0846 11.1519 12.0846 10.0013C12.0846 8.85071 11.1519 7.91797 10.0013 7.91797C8.85071 7.91797 7.91797 8.85071 7.91797 10.0013C7.91797 11.1519 8.85071 12.0846 10.0013 12.0846Z"
                    stroke="#686B7E"
                    stroke-width="1.4"
                    stroke-miterlimit="10"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M3.05859 10.6112V9.38899C3.05859 8.66677 3.64887 8.06955 4.37804 8.06955C5.63498 8.06955 6.14887 7.18066 5.51693 6.09038C5.15582 5.46538 5.37109 4.65288 6.00304 4.29177L7.20443 3.60427C7.75304 3.27788 8.46137 3.47233 8.78776 4.02094L8.86415 4.15288C9.48915 5.24316 10.5169 5.24316 11.1489 4.15288L11.2253 4.02094C11.5516 3.47233 12.26 3.27788 12.8086 3.60427L14.01 4.29177C14.6419 4.65288 14.8572 5.46538 14.4961 6.09038C13.8641 7.18066 14.378 8.06955 15.635 8.06955C16.3572 8.06955 16.9544 8.65983 16.9544 9.38899V10.6112C16.9544 11.3334 16.3641 11.9307 15.635 11.9307C14.378 11.9307 13.8641 12.8195 14.4961 13.9098C14.8572 14.5418 14.6419 15.3473 14.01 15.7084L12.8086 16.3959C12.26 16.7223 11.5516 16.5279 11.2253 15.9793L11.1489 15.8473C10.5239 14.7571 9.49609 14.7571 8.86415 15.8473L8.78776 15.9793C8.46137 16.5279 7.75304 16.7223 7.20443 16.3959L6.00304 15.7084C5.37109 15.3473 5.15582 14.5348 5.51693 13.9098C6.14887 12.8195 5.63498 11.9307 4.37804 11.9307C3.64887 11.9307 3.05859 11.3334 3.05859 10.6112Z"
                    stroke="#686B7E"
                    stroke-width="1.4"
                    stroke-miterlimit="10"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>

                <span className={`text-[14px] font-regular font-inter ${theme === "dark" ? "bg-[#151619] text-white" : "bg-white text-slate-900"}`}>
                  Account Settings
                </span>
              </div>
              <div
                className={`flex items-center gap-2 h-[48px] cursor-pointer pl-2 ${theme === "dark" ? "bg-[#151619] text-white" : "bg-white text-slate-900"}`}
                onClick={() => {
                  handleClose();
                  logout();
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.7776 11.8212L15.5554 10.0434L13.7776 8.26562"
                    stroke="#686B7E"
                    stroke-width="1.25"
                    stroke-miterlimit="10"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M8.44458 10.043H15.5071"
                    stroke="#686B7E"
                    stroke-width="1.25"
                    stroke-miterlimit="10"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M9.83339 15.5564C6.76394 15.5564 4.27783 13.4731 4.27783 10.0009C4.27783 6.52865 6.76394 4.44531 9.83339 4.44531"
                    stroke="#686B7E"
                    stroke-width="1.25"
                    stroke-miterlimit="10"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span
                  className={`text-[14px] ${theme === "dark"
                      ? "bg-[#151619] text-white"
                      : "bg-white text-black"
                    } font-regular font-inter`}
                >
                  Logout
                </span>
              </div>
            </div>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default Header;
