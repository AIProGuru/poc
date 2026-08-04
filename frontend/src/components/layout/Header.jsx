import { useContext, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setToggleMenu } from "../../redux/reducers/menu.reducer";
import { AccountContext } from "../../utils/Account";
import { useOnClickOutside } from "usehooks-ts";
import { getHelioLogoSrc } from "../../utils/helioLogo";

export default function Header(props) {
  const location = useLocation();
  const pathname = location.pathname;
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const firstname = useSelector((state) => state.auth.firstname);
  const lastname = useSelector((state) => state.auth.lastname);
  const menuState = useSelector((state) => state.menu.menuState);
  const [isFeatureOpen, setIsFeatureOpen] = useState(false);
  const [platformMob, setPlatformMob] = useState(false);
  const [serveMob, setServemob] = useState(false);
  const [ResourcesMob, SetResourcesMob] = useState(false);
  const [CompanyMob, setCompanyMob] = useState(false);

  const toggleFeature = () => {
    setIsFeatureOpen(!isFeatureOpen);
  };

  const toggleServeMob = () => {
    setServemob(!serveMob);
  };
  const toggleResourcesMob = () => {
    SetResourcesMob(!ResourcesMob);
  };

  const toggleCompanyMob = () => {
    setCompanyMob(!CompanyMob);
  };
  const toggleplatformMob = () => {
    setPlatformMob(!platformMob);
  };

  const [navbarState, setNavbarState] = useState(0);

  const navbarMenu = useRef(null);

  const closeNavbar = () => setNavbarState(0);

  useOnClickOutside(navbarMenu, closeNavbar);

  const { logout } = useContext(AccountContext);

  useEffect(() => {}, [isAuthenticated, firstname, lastname]);
  const togglePlatform = () => {
    setNavbarState(1);
  };
  const toggleServices = () => {
    setNavbarState(2);
  };
  const toggleResources = () => {
    setNavbarState(3);
  };
  const toggleCompany = () => {
    setNavbarState(4);
  };

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (location.hash === "#aidenial") {
      const targetElement = document.getElementById("aidenial");
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleDropdownToggle = (targetId) => {
    setActiveDropdown((prev) => (prev === targetId ? null : targetId));
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <header
      className={`fixed top-0 z-30 w-full transition-all duration-500 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-soft border-b border-neutral-200"
          : "bg-transparent"
      } flex justify-center items-center`}
    >
      {(pathname.startsWith("/demo") || pathname.startsWith("/rebound")) && (
        <div className="left-0">
          <span className="">
            <svg
              className="h-4 w-auto cursor-pointer"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              onClick={() => dispatch(setToggleMenu(!menuState))}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </span>
        </div>
      )}

      <nav
        className={`text-neutral-800 border-neutral-200 w-full ${
          scrolled
            ? "bg-white/90 backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="flex flex-row justify-between items-center h-[80px] sm:h-auto mx-auto w-full p-4 md:px-8">
          <Link
            to="/"
            className="flex items-center"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img
              src={getHelioLogoSrc(!scrolled)}
              alt="Helio RCM"
              className="h-9 w-auto"
              loading="lazy"
            />
          </Link>

          <button
            id="menu-toggle"
            type="button"
            className="inline-flex items-center lg:hidden  h-50 justify-center text-sm text-gray-500 rounded-lg  focus:outline-none focus:ring-2 "
            aria-controls="mega-menu-full"
            aria-expanded={mobileMenuOpen}
            onClick={handleMenuToggle}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              width="50"
              height="50"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="50" height="50" rx="8" fill="#0C0F27" />
              <rect
                width="50"
                height="50"
                rx="8"
                fill="url(#paint0_radial_2956_4856)"
                fillOpacity="0.8"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M16 18C16 17.4477 16.4477 17 17 17H33C33.5523 17 34 17.4477 34 18C34 18.5523 33.5523 19 33 19H17C16.4477 19 16 18.5523 16 18Z"
                fill="#EBEDF0"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M16 25C16 24.4477 16.4477 24 17 24H33C33.5523 24 34 24.4477 34 25C34 25.5523 33.5523 26 33 26H17C16.4477 26 16 25.5523 16 25Z"
                fill="#EBEDF0"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M16 32C16 31.4477 16.4477 31 17 31H33C33.5523 31 34 31.4477 34 32C34 32.5523 33.5523 33 33 33H17C16.4477 33 16 32.5523 16 32Z"
                fill="#EBEDF0"
              />
              <defs>
                <radialGradient
                  id="paint0_radial_2956_4856"
                  cx="0"
                  cy="0"
                  r="1"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="translate(43 57) rotate(-130.632) scale(102.12 166.161)"
                >
                  <stop stopColor="#06060C" />
                  <stop
                    offset="0.480667"
                    stopColor="#121953"
                    stopOpacity="0.7"
                  />
                  <stop offset="0.96" stopColor="#081050" stopOpacity="0.3" />
                </radialGradient>
              </defs>
            </svg>
          </button>

          <div
            id="mega-menu-full"
            className={`items-center justify-center font-medium max-w-[910px] w-[50%] mx-8  lg:flex hidden ${
              mobileMenuOpen ? "" : "hidden"
            }`}
          >
            <ul className="w-full flex flex-col p-4 md:p-0 border rounded-lg rtl:space-x-reverse md:flex-row md:mt-0 md:border-0  justify-between">

              <li>
                <button
                  data-target="mega-menu-full-dropdown-serve"
                  className={`flex items-center justify-between w-full text-neutral-800 rounded md:w-auto hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-gray-600 md:p-0 dark:text-neutral-800 md:dark:hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-500 md:dark:hover:bg-transparent dark:border-gray-700 ${
                    activeDropdown === "mega-menu-full-dropdown-serve"
                      ? "text-gray-600"
                      : ""
                  }`}
                  onClick={() =>
                    handleDropdownToggle("mega-menu-full-dropdown-serve")
                  }
                >
                  Who we serve
                  <svg
                    className="w-2.5 h-2.5 ms-2.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 4 4 4-4"
                    />
                  </svg>
                </button>
              </li>
              <li>
                <button
                  data-target="mega-menu-full-dropdown-resources"
                  className={`flex items-center justify-between w-full text-neutral-800 rounded md:w-auto hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-gray-600 md:p-0 dark:text-neutral-800 md:dark:hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-500 md:dark:hover:bg-transparent dark:border-gray-700 ${
                    activeDropdown === "mega-menu-full-dropdown-resources"
                      ? "text-gray-600"
                      : ""
                  }`}
                  onClick={() =>
                    handleDropdownToggle("mega-menu-full-dropdown-resources")
                  }
                >
                  Resources
                  <svg
                    className="w-2.5 h-2.5 ms-2.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 4 4 4-4"
                    />
                  </svg>
                </button>
              </li>
              <li>
                <button
                  data-target="mega-menu-full-dropdown-company"
                  className={`flex items-center justify-between w-full text-neutral-800 rounded md:w-auto hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-gray-600 md:p-0 dark:text-neutral-800 md:dark:hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-500 md:dark:hover:bg-transparent dark:border-gray-700 ${
                    activeDropdown === "mega-menu-full-dropdown-company"
                      ? "text-gray-600"
                      : ""
                  }`}
                  onClick={() =>
                    handleDropdownToggle("mega-menu-full-dropdown-company")
                  }
                >
                  Company
                  <svg
                    className="w-2.5 h-2.5 ms-2.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 4 4 4-4"
                    />
                  </svg>
                </button>
              </li>
            </ul>
          </div>
          <div className="md:flex space-x-4 w-fit hidden">
            {isAuthenticated ? (
              <>
                <span
                  className="text-sm text-center h-[50px] font-inter px-8 py-3 rounded-lg leading-6 w-fit"
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  Hi, {firstname} 👋
                </span>
                <button
                  onClick={logout}
                  className="text-sm text-center h-[50px] cursor-pointer font-inter bg-gradient-to-r from-[#06060CCC] to-[#1219538F] px-8 py-3 rounded-lg leading-6 text-white w-[120px]"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="text-sm text-center h-[50px] cursor-pointer font-inter bg-[#3b3f46] px-6 py-3 rounded-lg leading-6 text-white w-[160px]"
                >
                  Start Free Trial
                </Link>
                <Link
                  to="/signin"
                  className="text-sm text-center h-[50px] cursor-pointer font-inter bg-gradient-to-r from-[#06060CCC] to-[#1219538F] px-6 py-3 rounded-lg leading-6 text-white w-[100px]"
                >
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>



        <div
          id="mega-menu-full-dropdown-serve"
          className={`px-32 mt-1 border-y bg-white border-neutral-200 ${
            activeDropdown === "mega-menu-full-dropdown-serve" ? "" : "hidden"
          }`}
        >
          <div className="grid max-w-screen-xl px-4 py-5 mx-auto text-neutral-800 sm:grid-cols-3 md:px-6 gap-4">
            {/* Full-width Card */}
            <ul className="col-span-1">
              <li>
                <Link
                  to="/clients/hospitals-and-health-systems"
                  onClick={scrollToTop}
                  className="block p-3 rounded-lg hover:bg-gray-100"
                >
                  <div className="font-semibold">
                    Hospitals & Health Systems
                  </div>
                  <span className="text-sm text-neutral-600">
                    Learn more about Hospitals & Health Systems
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/clients/physician-practices-and-providers"
                  onClick={scrollToTop}
                  className="block p-3 rounded-lg hover:bg-gray-100"
                >
                  <div className="font-semibold">
                    Physician Practices & providers
                  </div>
                  <span className="text-sm text-neutral-600">
                    Learn more about Physician Practices & providers
                  </span>
                </Link>
              </li>
            </ul>

            {/* First Column */}
            <ul className="col-span-1">
              <li>
                <Link
                  to="/clients/revenue-cycle-management-rcm-vendors"
                  onClick={scrollToTop}
                  className="block p-3 rounded-lg hover:bg-gray-100"
                >
                  <div className="font-semibold">
                    Revenue Cycle Management (RCM) Vendors
                  </div>
                  <span className="text-sm text-neutral-600">
                    Learn more about Revenue Cycle Management
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/clients/practice-management-systems-and-ehr-vendors"
                  onClick={scrollToTop}
                  className="block p-3 rounded-lg hover:bg-gray-100"
                >
                  <div className="font-semibold">
                    Practice Management Systems & EHR vendors
                  </div>
                  <span className="text-sm text-neutral-600">
                    Learn more about Practice Management Systems & EHR vendors
                  </span>
                </Link>
              </li>
            </ul>

            {/* Second Column */}
            <ul className="col-span-1">
              <li>
                <Link
                  to="/clients/billing-agencies-msos-and-tpas"
                  onClick={scrollToTop}
                  className="block p-3 rounded-lg hover:bg-gray-100"
                >
                  <div className="font-semibold">
                    Billing Agencies, MSOs & TPAs
                  </div>
                  <span className="text-sm text-neutral-600">
                    Learn more about Billing Agencies, MSOs & TPAs
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          id="mega-menu-full-dropdown-resources"
          className={`px-32 mt-1 border-y bg-white border-neutral-200 ${
            activeDropdown === "mega-menu-full-dropdown-resources"
              ? ""
              : "hidden"
          }`}
        >
          <div className="grid max-w-screen-xl px-4 py-5 mx-auto text-neutral-800 sm:grid-cols-3 md:px-6 gap-4">
            {/* Full-width Card */}
            <div className="col-span-1 bg-neutral-50 p-4 rounded-lg">
              <div className="max-w-sm p-6">
                <Link to="#">
                  <h5 className="mb-2 text-lg font-semibold tracking-tight text-neutral-900">
                    AI is just one piece of healthcare’s RCM puzzle
                  </h5>
                </Link>
                <Link
                  to="/blog/3"
                  onClick={scrollToTop}
                  className="inline-flex font-medium items-center text-gray-600 hover:underline"
                >
                  Click to read the article
                  <svg
                    className="w-3 h-3 ms-2.5 rtl:rotate-[270deg]"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 18 18"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            <ul className="col-span-1">
              <li>
                <Link
                  to="/blog"
                  onClick={scrollToTop}
                  className="block p-3 rounded-lg hover:bg-gray-100"
                >
                  <div className="font-semibold">Blog</div>
                  <span className="text-sm text-neutral-600">
                    Read the latest news and articles from Helio RCM.
                  </span>
                </Link>
              </li>
              
            </ul>

            {/* Second Column */}
            <ul className="col-span-1">
              <li>
                <Link
                  to="/whitepaper"
                  onClick={scrollToTop}
                  className="block p-3 rounded-lg hover:bg-gray-100"
                >
                  <div className="font-semibold">White Paper</div>
                  <span className="text-sm text-neutral-600">
                    A comprehensive report that presents problem and solution.
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          id="mega-menu-full-dropdown-company"
          className={`px-32 mt-1 border-y bg-white border-neutral-200 ${
            activeDropdown === "mega-menu-full-dropdown-company" ? "" : "hidden"
          }`}
        >
          <div className="grid max-w-screen-xl px-4 py-5 mx-auto text-neutral-800 sm:grid-cols-3 md:px-6 gap-4">
            {/* Full-width Card */}
            <ul className="col-span-1">
              <li>
                <Link
                  to="/about"
                  onClick={scrollToTop}
                  className="block p-3 rounded-lg hover:bg-gray-100"
                >
                  <div className="font-semibold">About us</div>
                  <span className="text-sm text-neutral-600">
                    Learn more about us & our work
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/integrations"
                  onClick={scrollToTop}
                  className="block p-3 rounded-lg hover:bg-gray-100"
                >
                  <div className="font-semibold">Popular Integrations</div>
                  <span className="text-sm text-neutral-600">
                    Infomation about the Popular integrations we have
                  </span>
                </Link>
              </li>
            </ul>

            {/* First Column */}
            <ul className="col-span-1">
              <li>
                <Link
                  to="/privacy"
                  onClick={scrollToTop}
                  className="block p-3 rounded-lg hover:bg-gray-100"
                >
                  <div className="font-semibold">Data & Compliance</div>
                  <span className="text-sm text-neutral-600">
                    Learn more about how Helio RCM protects your data
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  onClick={scrollToTop}
                  className="block p-3 rounded-lg hover:bg-gray-100"
                >
                  <div className="font-semibold">Careers</div>
                  <span className="text-sm text-neutral-600">
                    Want to work with us , Join us now
                  </span>
                </Link>
              </li>
            </ul>

            {/* Second Column */}
            <ul className="col-span-1">
              
              <li>
                <Link
                  to="/contact"
                  onClick={scrollToTop}
                  className="block p-3 rounded-lg hover:bg-gray-100"
                >
                  <div className="font-semibold">Contact us</div>
                  <span className="text-sm text-neutral-600">
                    Need to contact us?
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-opacity-100 bg-[#0B0C14] z-[90] p-6 lg:hidden overflow-y-auto">
          <div className="flex flex-row justify-between items-center">
            <div>
              <img
                src={getHelioLogoSrc(true)}
                alt="Helio RCM"
                className="h-9 w-auto"
                loading="lazy"
              />
            </div>

            <div>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 z-50 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="50" height="50" rx="8" fill="#0C0F27" />
                  <rect
                    width="50"
                    height="50"
                    rx="8"
                    fill="url(#paint0_radial_2104_12140)"
                    fillOpacity="0.8"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M15.25 25C15.25 19.617 19.617 15.25 25 15.25C30.383 15.25 34.75 19.617 34.75 25C34.75 30.383 30.383 34.75 25 34.75C19.617 34.75 15.25 30.383 15.25 25ZM25 16.75C20.4455 16.75 16.75 20.4455 16.75 25C16.75 29.5545 20.4455 33.25 25 33.25C29.5545 33.25 33.25 29.5545 33.25 25C33.25 20.4455 29.5545 16.75 25 16.75Z"
                    fill="#EBEDF0"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M21.4697 21.4697C21.7626 21.1768 22.2374 21.1768 22.5303 21.4697L28.5303 27.4697C28.8232 27.7626 28.8232 28.2374 28.5303 28.5303C28.2374 28.8232 27.7626 28.8232 27.4697 28.5303L21.4697 22.5303C21.1768 22.2374 21.1768 21.7626 21.4697 21.4697Z"
                    fill="#EBEDF0"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M28.5303 21.4697C28.8232 21.7626 28.8232 22.2374 28.5303 22.5303L22.5303 28.5303C22.2374 28.8232 21.7626 28.8232 21.4697 28.5303C21.1768 28.2374 21.1768 27.7626 21.4697 27.4697L27.4697 21.4697C27.7626 21.1768 28.2374 21.1768 28.5303 21.4697Z"
                    fill="#EBEDF0"
                  />
                  <defs>
                    <radialGradient
                      id="paint0_radial_2104_12140"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(43 57) rotate(-130.632) scale(102.12 166.161)"
                    >
                      <stop stopColor="#06060C" />
                      <stop
                        offset="0.480667"
                        stopColor="#121953"
                        stopOpacity="0.7"
                      />
                      <stop
                        offset="0.96"
                        stopColor="#081050"
                        stopOpacity="0.3"
                      />
                    </radialGradient>
                  </defs>
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center  justify-end mt-10"></div>
          <div className="flow-root mt-4 ">
            <div className="overflow-y-auto h-screen hide-scrollbar w-full">
              <div className="space-y-12 py-2 transition-all duration-300 ease-in-out">




                <div
                  onClick={toggleServeMob}
                  className="cursor-pointer flex items-center justify-between"
                >
                  <span
                    className={`block text-[20px] font-semibold leading-7 font-inter ${
                      serveMob ? "text-[#002FFF]" : "text-neutral-800"
                    }`}
                  >
                    Who we serve
                  </span>
                  {serveMob ? (
                    <svg
                      width="15"
                      height="8"
                      viewBox="0 0 15 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-2"
                    >
                      <path
                        d="M7.42886 2.68612L2.47886 7.63612C2.38661 7.73163 2.27626 7.80781 2.15426 7.86022C2.03226 7.91263 1.90104 7.94021 1.76826 7.94137C1.63548 7.94252 1.5038 7.91722 1.3809 7.86694C1.25801 7.81666 1.14635 7.7424 1.05246 7.64851C0.958568 7.55462 0.884315 7.44297 0.834034 7.32007C0.783753 7.19717 0.758452 7.06549 0.759605 6.93272C0.760759 6.79994 0.788345 6.66872 0.840755 6.54671C0.893164 6.42471 0.969345 6.31436 1.06486 6.22212L6.72186 0.565118C6.90938 0.377647 7.16369 0.272331 7.42886 0.272331C7.69402 0.272331 7.94833 0.377647 8.13586 0.565118L13.7929 6.22212C13.8884 6.31436 13.9645 6.42471 14.017 6.54671C14.0694 6.66872 14.097 6.79994 14.0981 6.93272C14.0993 7.0655 14.074 7.19718 14.0237 7.32007C13.9734 7.44297 13.8991 7.55462 13.8053 7.64851C13.7114 7.74241 13.5997 7.81666 13.4768 7.86694C13.3539 7.91722 13.2222 7.94252 13.0895 7.94137C12.9567 7.94021 12.8255 7.91263 12.7035 7.86022C12.5814 7.80781 12.4711 7.73163 12.3789 7.63612L7.42886 2.68612Z"
                        fill="#002FFF"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="15"
                      height="8"
                      viewBox="0 0 15 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-2"
                    >
                      <path
                        d="M7.57114 5.31388L12.5211 0.363882C12.6134 0.268372 12.7237 0.19219 12.8457 0.139781C12.9677 0.0873716 13.099 0.0597853 13.2317 0.0586315C13.3645 0.0574777 13.4962 0.0827794 13.6191 0.13306C13.742 0.183341 13.8536 0.257594 13.9475 0.351487C14.0414 0.44538 14.1157 0.557032 14.166 0.679928C14.2162 0.802824 14.2415 0.934504 14.2404 1.06728C14.2392 1.20006 14.2117 1.33128 14.1592 1.45329C14.1068 1.57529 14.0307 1.68564 13.9351 1.77788L8.27814 7.43488C8.09062 7.62235 7.83631 7.72767 7.57114 7.72767C7.30598 7.72767 7.05167 7.62235 6.86414 7.43488L1.20714 1.77788C1.11163 1.68564 1.03545 1.57529 0.983042 1.45329C0.930633 1.33128 0.903047 1.20006 0.901893 1.06728C0.900739 0.934504 0.926041 0.802824 0.976322 0.679928C1.0266 0.557032 1.10086 0.44538 1.19475 0.351487C1.28864 0.257594 1.40029 0.183341 1.52319 0.13306C1.64609 0.0827794 1.77777 0.0574777 1.91054 0.0586315C2.04332 0.0597853 2.17454 0.0873716 2.29655 0.139781C2.41855 0.19219 2.5289 0.268372 2.62114 0.363882L7.57114 5.31388Z"
                        fill="white"
                      />
                    </svg>
                  )}
                </div>

                {serveMob && (
                  <div
                    className={`pl-6 border-l-2 w-[90%] border-[#16192D] ${
                      serveMob ? "animate-slide-down" : ""
                    }`}
                  >
                    <Link
                      to="/clients/hospitals-and-health-systems"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        scrollToTop();
                      }}
                    >
                      <span className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-neutral-800">
                        Hospitals and Health Systems
                      </span>
                    </Link>
                    <Link
                      to="/clients/physician-practices-and-providers"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        scrollToTop();
                      }}
                    >
                      <span className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-neutral-800">
                        Physician Practices and Providers
                      </span>
                    </Link>
                    <Link
                      to="/clients/revenue-cycle-management-rcm-vendors"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        scrollToTop();
                      }}
                    >
                      <span className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-neutral-800">
                        Revenue Cycle Management (RCM) Vendors
                      </span>
                    </Link>
                    <Link
                      to="/clients/practice-management-systems-and-ehr-vendors"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        scrollToTop();
                      }}
                    >
                      <span className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-neutral-800">
                        Practice Management Systems and EHR Vendors
                      </span>
                    </Link>
                    <Link
                      to="/clients/billing-agencies-msos-and-tpas"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        scrollToTop();
                      }}
                    >
                      <span className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-neutral-800">
                        Billing Agencies, MSOs, and TPAs
                      </span>
                    </Link>
                  </div>
                )}

                <div
                  onClick={toggleResourcesMob}
                  className="cursor-pointer flex items-center justify-between"
                >
                  <span
                    className={`block text-[20px] font-semibold leading-7 font-inter ${
                      ResourcesMob ? "text-[#002FFF]" : "text-neutral-800"
                    }`}
                  >
                    Resources
                  </span>
                  {ResourcesMob ? (
                    <svg
                      width="15"
                      height="8"
                      viewBox="0 0 15 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-2"
                    >
                      <path
                        d="M7.42886 2.68612L2.47886 7.63612C2.38661 7.73163 2.27626 7.80781 2.15426 7.86022C2.03226 7.91263 1.90104 7.94021 1.76826 7.94137C1.63548 7.94252 1.5038 7.91722 1.3809 7.86694C1.25801 7.81666 1.14635 7.7424 1.05246 7.64851C0.958568 7.55462 0.884315 7.44297 0.834034 7.32007C0.783753 7.19717 0.758452 7.06549 0.759605 6.93272C0.760759 6.79994 0.788345 6.66872 0.840755 6.54671C0.893164 6.42471 0.969345 6.31436 1.06486 6.22212L6.72186 0.565118C6.90938 0.377647 7.16369 0.272331 7.42886 0.272331C7.69402 0.272331 7.94833 0.377647 8.13586 0.565118L13.7929 6.22212C13.8884 6.31436 13.9645 6.42471 14.017 6.54671C14.0694 6.66872 14.097 6.79994 14.0981 6.93272C14.0993 7.0655 14.074 7.19718 14.0237 7.32007C13.9734 7.44297 13.8991 7.55462 13.8053 7.64851C13.7114 7.74241 13.5997 7.81666 13.4768 7.86694C13.3539 7.91722 13.2222 7.94252 13.0895 7.94137C12.9567 7.94021 12.8255 7.91263 12.7035 7.86022C12.5814 7.80781 12.4711 7.73163 12.3789 7.63612L7.42886 2.68612Z"
                        fill="#002FFF"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="15"
                      height="8"
                      viewBox="0 0 15 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-2"
                    >
                      <path
                        d="M7.57114 5.31388L12.5211 0.363882C12.6134 0.268372 12.7237 0.19219 12.8457 0.139781C12.9677 0.0873716 13.099 0.0597853 13.2317 0.0586315C13.3645 0.0574777 13.4962 0.0827794 13.6191 0.13306C13.742 0.183341 13.8536 0.257594 13.9475 0.351487C14.0414 0.44538 14.1157 0.557032 14.166 0.679928C14.2162 0.802824 14.2415 0.934504 14.2404 1.06728C14.2392 1.20006 14.2117 1.33128 14.1592 1.45329C14.1068 1.57529 14.0307 1.68564 13.9351 1.77788L8.27814 7.43488C8.09062 7.62235 7.83631 7.72767 7.57114 7.72767C7.30598 7.72767 7.05167 7.62235 6.86414 7.43488L1.20714 1.77788C1.11163 1.68564 1.03545 1.57529 0.983042 1.45329C0.930633 1.33128 0.903047 1.20006 0.901893 1.06728C0.900739 0.934504 0.926041 0.802824 0.976322 0.679928C1.0266 0.557032 1.10086 0.44538 1.19475 0.351487C1.28864 0.257594 1.40029 0.183341 1.52319 0.13306C1.64609 0.0827794 1.77777 0.0574777 1.91054 0.0586315C2.04332 0.0597853 2.17454 0.0873716 2.29655 0.139781C2.41855 0.19219 2.5289 0.268372 2.62114 0.363882L7.57114 5.31388Z"
                        fill="white"
                      />
                    </svg>
                  )}
                </div>

                {ResourcesMob && (
                  <div
                    className={`pl-6 border-l-2 w-[90%] border-[#16192D] ${
                      ResourcesMob ? "animate-slide-down" : ""
                    }`}
                  >
                    <Link
                      to="/blog"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        scrollToTop();
                      }}
                    >
                      <span className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-neutral-800">
                        Blog
                      </span>
                    </Link>
                    <Link
                      to="/whitepaper"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        scrollToTop();
                      }}
                    >
                      <span className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-neutral-800">
                        White Paper
                      </span>
                    </Link>
                  </div>
                )}

                <div
                  onClick={toggleCompanyMob}
                  className="cursor-pointer flex items-center justify-between"
                >
                  <span
                    className={`block text-[20px] font-semibold leading-7 font-inter ${
                      CompanyMob ? "text-[#002FFF]" : "text-neutral-800"
                    }`}
                  >
                    Company
                  </span>
                  {CompanyMob ? (
                    <svg
                      width="15"
                      height="8"
                      viewBox="0 0 15 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-2"
                    >
                      <path
                        d="M7.42886 2.68612L2.47886 7.63612C2.38661 7.73163 2.27626 7.80781 2.15426 7.86022C2.03226 7.91263 1.90104 7.94021 1.76826 7.94137C1.63548 7.94252 1.5038 7.91722 1.3809 7.86694C1.25801 7.81666 1.14635 7.7424 1.05246 7.64851C0.958568 7.55462 0.884315 7.44297 0.834034 7.32007C0.783753 7.19717 0.758452 7.06549 0.759605 6.93272C0.760759 6.79994 0.788345 6.66872 0.840755 6.54671C0.893164 6.42471 0.969345 6.31436 1.06486 6.22212L6.72186 0.565118C6.90938 0.377647 7.16369 0.272331 7.42886 0.272331C7.69402 0.272331 7.94833 0.377647 8.13586 0.565118L13.7929 6.22212C13.8884 6.31436 13.9645 6.42471 14.017 6.54671C14.0694 6.66872 14.097 6.79994 14.0981 6.93272C14.0993 7.0655 14.074 7.19718 14.0237 7.32007C13.9734 7.44297 13.8991 7.55462 13.8053 7.64851C13.7114 7.74241 13.5997 7.81666 13.4768 7.86694C13.3539 7.91722 13.2222 7.94252 13.0895 7.94137C12.9567 7.94021 12.8255 7.91263 12.7035 7.86022C12.5814 7.80781 12.4711 7.73163 12.3789 7.63612L7.42886 2.68612Z"
                        fill="#002FFF"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="15"
                      height="8"
                      viewBox="0 0 15 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-2"
                    >
                      <path
                        d="M7.57114 5.31388L12.5211 0.363882C12.6134 0.268372 12.7237 0.19219 12.8457 0.139781C12.9677 0.0873716 13.099 0.0597853 13.2317 0.0586315C13.3645 0.0574777 13.4962 0.0827794 13.6191 0.13306C13.742 0.183341 13.8536 0.257594 13.9475 0.351487C14.0414 0.44538 14.1157 0.557032 14.166 0.679928C14.2162 0.802824 14.2415 0.934504 14.2404 1.06728C14.2392 1.20006 14.2117 1.33128 14.1592 1.45329C14.1068 1.57529 14.0307 1.68564 13.9351 1.77788L8.27814 7.43488C8.09062 7.62235 7.83631 7.72767 7.57114 7.72767C7.30598 7.72767 7.05167 7.62235 6.86414 7.43488L1.20714 1.77788C1.11163 1.68564 1.03545 1.57529 0.983042 1.45329C0.930633 1.33128 0.903047 1.20006 0.901893 1.06728C0.900739 0.934504 0.926041 0.802824 0.976322 0.679928C1.0266 0.557032 1.10086 0.44538 1.19475 0.351487C1.28864 0.257594 1.40029 0.183341 1.52319 0.13306C1.64609 0.0827794 1.77777 0.0574777 1.91054 0.0586315C2.04332 0.0597853 2.17454 0.0873716 2.29655 0.139781C2.41855 0.19219 2.5289 0.268372 2.62114 0.363882L7.57114 5.31388Z"
                        fill="white"
                      />
                    </svg>
                  )}
                </div>

                {CompanyMob && (
                  <div
                    className={`pl-6 border-l-2 w-[90%] border-[#16192D] ${
                      CompanyMob ? "animate-slide-down" : ""
                    }`}
                  >
                    <Link
                      to="/about"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        scrollToTop();
                      }}
                    >
                      <span className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-neutral-800">
                        About us
                      </span>
                    </Link>
                    <Link
                      to="/contact"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-neutral-800">
                        Contact us
                      </span>
                    </Link>
                    <Link
                      to="/integrations"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        scrollToTop();
                      }}
                    >
                      <span className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-neutral-800">
                        Popular Integrations
                      </span>
                    </Link>
                    <Link
                      to="/privacy"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        scrollToTop();
                      }}
                    >
                      <span className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-neutral-800">
                        Data & Compliance
                      </span>
                    </Link>
                    <Link
                      to="/careers"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        scrollToTop();
                      }}
                    >
                      <span className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-neutral-800">
                        Careers
                      </span>
                    </Link>
                  </div>
                )}

                <div className="gap-y-10 md:hidden">
                  {!isAuthenticated && (
                    <Link to="/signin">
                      <div className="text-sm w-full h-[50px] cursor-pointer text-center mt-16 font-bold font-inter bg-gradient-to-r from-[#06060CCC] to-[#1219538F] px-8 py-3 rounded-lg leading-6 text-white">
                        <span className="">Log in</span>
                      </div>
                    </Link>
                  )}
                  {!isAuthenticated && (
                    <Link to="/signup">
                      <div className="text-sm text-center h-[50px] cursor-pointer font-bold font-inter mt-5 bg-[#3b3f46] px-8 py-3 rounded-lg leading-6 text-white">
                        <span className="">Start Free Trial</span>
                      </div>
                    </Link>
                  )}
                  {isAuthenticated && (
                    <div className="text-[24px] w-full h-[50px] text-left mt-16 font-bold font-inter py-3 rounded-lg leading-6 mb-5">
                      <span className="">Hi {firstname}</span>
                    </div>
                  )}
                  {isAuthenticated && (
                    <Link to="#">
                      <button onClick={logout}>
                        <span className="text-sm text-center h-[50px] cursor-pointer font-bold font-inter mt-5 bg-[#3b3f46] px-8 py-3 rounded-lg leading-6 text-white">
                          Log out
                        </span>
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

