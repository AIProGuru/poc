import { useContext, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setToggleMenu } from "../../redux/reducers/menu.reducer";
import { AccountContext } from "../../utils/Account";
import { useOnClickOutside } from "usehooks-ts";

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
            {/* <svg
              width="181"
              height="36"
              viewBox="0 0 181 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_2926_9685)">
                <mask
                  id="mask0_2926_9685"
                  className=" mask-type:luminance"
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="181"
                  height="36"
                >
                  <path d="M181 0H0V36H181V0Z" fill="white" />
                </mask>
                <g mask="url(#mask0_2926_9685)">
                  <path
                    d="M81.6342 24.7279C78.0353 24.7279 77.0625 23.4708 77.0625 21.4636V20.2998C77.0625 18.2222 77.9387 17.0379 81.4042 17.0379H90.6627V16.7628C90.6627 15.1875 90.0625 14.7783 88.5402 14.7783H85.1274V12.3574H88.554C92.5484 12.3574 94.1168 13.7736 94.1168 16.9219V19.9316C94.1168 23.5163 92.8474 24.7234 88.416 24.7234L81.6342 24.7279ZM90.6627 19.1382H81.7791C80.9696 19.1382 80.4867 19.4111 80.4867 20.3931V21.2386C80.4867 22.1046 81.0179 22.4002 81.8941 22.4002H88.3607C89.9705 22.4002 90.6605 22.0365 90.6605 20.1884L90.6627 19.1382Z"
                    fill="white"
                  />
                  <path
                    d="M102.651 24.7268C98.0099 24.7268 96.6484 23.3106 96.6484 19.3848V8.35547H100.098V12.3494H107.048C111.711 12.3494 113.073 13.7656 113.073 17.7118V19.378C113.073 23.3038 111.711 24.7177 107.048 24.7177L102.651 24.7268ZM109.623 17.8346C109.623 15.6886 109.092 15.2772 106.923 15.2772H100.089V19.3098C100.089 21.3397 100.595 21.8422 102.766 21.8422H106.905C109.076 21.8422 109.607 21.3397 109.607 19.2871L109.623 17.8346Z"
                    fill="white"
                  />
                  <path
                    d="M119.004 19.8013V20.3492C119.004 21.854 119.463 22.1268 121.073 22.1268H125.136V24.725H121.09C117.118 24.725 115.57 23.3111 115.57 20.0265V17.1645C115.57 13.5593 116.84 12.3477 121.25 12.3477H127.298C130.876 12.3477 131.87 13.7662 131.87 15.7256V19.8013H119.004ZM128.413 16.0143C128.413 15.1937 128.043 14.9868 127.004 14.9868H121.289C119.558 14.9868 119.004 15.171 119.004 16.9486V17.6101H128.413V16.0143Z"
                    fill="white"
                  />
                  <path
                    d="M140.246 24.7254C135.603 24.7254 134.242 23.3115 134.242 19.3857V17.7217C134.242 13.7733 135.603 12.3594 140.246 12.3594H144.425C149.089 12.3594 150.45 13.7733 150.45 17.7422V19.3834C150.45 23.3091 149.089 24.723 144.425 24.723L140.246 24.7254ZM147.009 17.8354C147.009 15.735 146.457 15.2781 143.964 15.2781H140.708C138.257 15.2781 137.682 15.7327 137.682 17.8354V19.297C137.682 21.3428 138.257 21.852 140.708 21.852H143.962C146.453 21.852 147.007 21.3475 147.007 19.297L147.009 17.8354Z"
                    fill="white"
                  />
                  <path
                    d="M153.661 24.7266C152.808 24.7266 152.484 24.431 152.484 23.6991V21.8282C152.484 21.119 152.808 20.8008 153.661 20.8008H154.796C155.671 20.8008 155.994 21.119 155.994 21.8282V23.6991C155.994 24.431 155.671 24.7266 154.796 24.7266H153.661Z"
                    fill="white"
                  />
                  <path
                    d="M162.416 24.728C158.819 24.728 157.844 23.471 157.844 21.4637V20.2998C157.844 18.2222 158.723 17.0379 162.183 17.0379H171.454V16.7628C171.454 15.1876 170.855 14.7784 169.33 14.7784H165.902V12.3574H169.319C173.314 12.3574 174.887 13.7737 174.887 16.922V19.9316C174.887 23.5164 173.616 24.7234 169.181 24.7234L162.416 24.728ZM171.454 19.1382H162.557C161.747 19.1382 161.259 19.4111 161.259 20.3931V21.2387C161.259 22.1048 161.791 22.4003 162.669 22.4003H169.136C170.746 22.4003 171.436 22.0366 171.436 20.1884L171.454 19.1382Z"
                    fill="white"
                  />
                  <path
                    d="M178.672 11.6369C177.817 11.6369 177.492 11.3164 177.492 10.5868V9.26152C177.492 8.53183 177.817 8.23633 178.672 8.23633H179.801C180.68 8.23633 181.001 8.53183 181.001 9.26152V10.5868C181.001 11.3164 180.68 11.6369 179.801 11.6369H178.672ZM177.492 12.6621H181.006V24.7212H177.492V12.6621Z"
                    fill="white"
                  />
                  <path
                    d="M75.2663 15.5007V19.3809C75.2663 23.3067 73.9048 24.7206 69.2158 24.7206H63.0067C58.3637 24.7206 57 23.3067 57 19.3809V14.4959C57 10.5701 58.3613 9.15625 63.0044 9.15625H67.1117V12.1432H63.1677C61.0635 12.1432 60.484 12.7592 60.484 14.6436V19.2446C60.484 21.2904 61.1118 21.745 63.1677 21.745H69.1123C71.0763 21.745 71.7685 21.3131 71.7685 19.1013V15.5007H75.2663Z"
                    fill="white"
                  />
                  <path
                    opacity="0.2"
                    d="M3.78827 26.7693C5.12438 31.8885 6.3317 32.8523 8.19443 34.3958C5.78209 33.0978 3.18806 30.245 2.38547 26.1782L0.1249 12.5462C-0.272942 8.24989 0.0628102 5.48801 3.39273 3.61719C2.29579 5.48801 1.69557 8.33627 2.01293 11.8233C2.02672 11.8323 2.44986 21.6501 3.78827 26.7693Z"
                    fill="white"
                  />
                  <path
                    opacity="0.5"
                    d="M12.4396 35.7564C6.57548 34.097 4.43678 25.7795 4.308 21.9379L3.61809 10.9335C3.40423 4.35497 5.22786 1.24302 11.2783 0.238281C7.67242 1.85676 6.52718 5.03691 6.70426 10.4675L7.20098 25.8226C7.38495 31.2692 8.73486 34.3675 12.4396 35.7564Z"
                    fill="white"
                  />
                  <path
                    d="M45.1014 17.5653V25.3237C45.1014 33.1752 42.3763 36.0075 33.0007 36.0075H20.5824C11.3009 36.0075 8.57812 33.1797 8.57812 25.3237V10.6799C8.57812 2.82845 11.3032 -0.00390625 20.5824 -0.00390625H28.8037V5.97677H19.9615C15.7577 5.97677 14.601 7.20882 14.601 10.9982V25.0486C14.601 29.1607 15.8497 30.0699 19.9615 30.0699H33.656C37.5815 30.0699 38.966 29.2062 38.966 24.7758V17.5653H45.1014Z"
                    fill="white"
                  />
                  <path
                    d="M32.7292 18.1242C32.6098 18.4917 32.4355 18.8397 32.2119 19.1561C32.1047 19.2994 31.988 19.4353 31.8623 19.563C30.2893 21.1966 28.7117 22.8318 27.1295 24.4685C27.1078 24.4931 27.0802 24.5119 27.0491 24.523C27.0194 24.5364 26.9873 24.5434 26.9547 24.5435C26.9215 24.5433 26.8887 24.5363 26.8582 24.523C26.8278 24.5119 26.8008 24.4931 26.7801 24.4685L21.9875 19.7494C21.6075 19.3932 21.2959 18.972 21.0676 18.506C21.017 18.3946 20.9687 18.2787 20.9297 18.1696H22.3992L23.7169 16.5215L25.5796 19.4766L26.2119 18.165H27.2606L28.4956 16.5306L30.2778 19.4857L30.8389 18.1423L32.7292 18.1242Z"
                    fill="white"
                  />
                  <path
                    d="M32.9274 16.5961V17.1211C32.8998 17.2962 32.8768 17.4734 32.8468 17.6462C32.8169 17.8086 32.7761 17.9688 32.725 18.1258H30.8416L30.2805 19.4898L28.4982 16.5346L27.2564 18.1668H26.2031L25.5708 19.4784L23.708 16.5233L22.3903 18.1713H20.9208C20.7105 17.5978 20.6319 16.9851 20.6909 16.3778C20.7502 15.6255 21.038 14.9084 21.5165 14.3206C21.7695 13.9906 22.0916 13.7183 22.4606 13.5222C22.8296 13.326 23.237 13.2107 23.6551 13.184C24.3215 13.161 24.9741 13.3747 25.4949 13.7864C25.9454 14.1175 26.3492 14.5066 26.6952 14.9434L26.7896 15.0593L26.8884 14.9298C27.3078 14.3619 27.838 13.8827 28.4476 13.5204C29.3973 12.993 30.3426 13.0658 31.2486 13.6409C32.1546 14.216 32.6859 15.1457 32.8584 16.2391L32.9274 16.5961Z"
                    fill="white"
                  />
                  <path
                    d="M30.2837 19.8987C30.2092 19.8987 30.136 19.8797 30.0711 19.8434C30.0062 19.8072 29.9519 19.755 29.9135 19.6918L28.4624 17.2914L27.6115 18.428C27.5712 18.4809 27.5192 18.5238 27.4593 18.5533C27.3995 18.5829 27.3334 18.5985 27.2666 18.5985H26.4847L25.9695 19.6669C25.9361 19.7354 25.8848 19.7938 25.8208 19.836C25.7568 19.8781 25.6826 19.9027 25.6058 19.9068C25.529 19.911 25.4524 19.8948 25.3842 19.8597C25.3158 19.8247 25.2584 19.7723 25.2175 19.7078L23.6768 17.2756L22.7385 18.4507C22.6984 18.5014 22.6471 18.5423 22.5885 18.5703C22.5298 18.5982 22.4655 18.6126 22.4005 18.6122H20.2894C20.1753 18.6122 20.0659 18.5674 19.9853 18.4876C19.9046 18.4079 19.8594 18.2998 19.8594 18.187C19.8594 18.0743 19.9046 17.9662 19.9853 17.8864C20.0659 17.8068 20.1753 17.762 20.2894 17.762H22.2004L23.3871 16.2753C23.4296 16.2219 23.4846 16.1794 23.5473 16.1514C23.6099 16.1232 23.6785 16.1105 23.7473 16.114C23.8159 16.1176 23.8828 16.1374 23.9422 16.1718C24.0016 16.2063 24.0517 16.2542 24.0884 16.3117L25.5372 18.6008L25.8316 17.9893C25.8668 17.9169 25.9219 17.856 25.9906 17.8133C26.0594 17.7707 26.1391 17.7482 26.2202 17.7484H27.0573L28.1634 16.2844C28.2055 16.2285 28.2609 16.1838 28.3246 16.1539C28.3884 16.1242 28.4587 16.1104 28.529 16.1138C28.5995 16.1172 28.668 16.1376 28.7286 16.1733C28.7891 16.209 28.8398 16.2589 28.8763 16.3185L30.2194 18.5371L30.4493 17.9712C30.4817 17.8931 30.5368 17.8264 30.6076 17.7795C30.6784 17.7325 30.7618 17.7075 30.8471 17.7075H32.9306C33.0447 17.7075 33.1541 17.7522 33.2347 17.832C33.3154 17.9116 33.3606 18.0198 33.3606 18.1325C33.3606 18.2452 33.3154 18.3533 33.2347 18.4331C33.1541 18.5128 33.0447 18.5576 32.9306 18.5576H31.1345L30.6747 19.6441C30.6441 19.717 30.5938 19.7803 30.5293 19.8267C30.4648 19.8733 30.3886 19.9013 30.309 19.9078L30.2837 19.8987Z"
                    fill="white"
                  />
                </g>
              </g>
              <defs>
                <clipPath id="clip0_2926_9685">
                  <rect width="181" height="36" fill="white" />
                </clipPath>
              </defs>
            </svg> */}
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
                  className={`flex items-center justify-between w-full text-neutral-800 rounded md:w-auto hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-600 md:p-0 dark:text-neutral-800 md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-blue-500 md:dark:hover:bg-transparent dark:border-gray-700 ${
                    activeDropdown === "mega-menu-full-dropdown-serve"
                      ? "text-blue-600"
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
                  className={`flex items-center justify-between w-full text-neutral-800 rounded md:w-auto hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-600 md:p-0 dark:text-neutral-800 md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-blue-500 md:dark:hover:bg-transparent dark:border-gray-700 ${
                    activeDropdown === "mega-menu-full-dropdown-resources"
                      ? "text-blue-600"
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
                  className={`flex items-center justify-between w-full text-neutral-800 rounded md:w-auto hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-600 md:p-0 dark:text-neutral-800 md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-blue-500 md:dark:hover:bg-transparent dark:border-gray-700 ${
                    activeDropdown === "mega-menu-full-dropdown-company"
                      ? "text-blue-600"
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
                  className="text-sm text-center h-[50px] font-poppins px-8 py-3 rounded-lg leading-6 w-fit"
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
                  className="text-sm text-center h-[50px] cursor-pointer font-poppins bg-gradient-to-r from-[#06060CCC] to-[#1219538F] px-8 py-3 rounded-lg leading-6 text-white w-[120px]"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="text-sm text-center h-[50px] cursor-pointer font-poppins bg-[#0048FF] px-6 py-3 rounded-lg leading-6 text-white w-[160px]"
                >
                  Start Free Trial
                </Link>
                <Link
                  to="/signin"
                  className="text-sm text-center h-[50px] cursor-pointer font-poppins bg-gradient-to-r from-[#06060CCC] to-[#1219538F] px-6 py-3 rounded-lg leading-6 text-white w-[100px]"
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
                  className="inline-flex font-medium items-center text-blue-600 hover:underline"
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
                    Read the latest news and articles from Aaftaab.
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
                    Learn more about how Aaftaab protects your data
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
              <svg
                width="180"
                height="36"
                viewBox="0 0 180 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_2104_12138)">
                  <path
                    d="M81.1832 24.7279C77.6041 24.7279 76.6367 23.4708 76.6367 21.4636V20.2998C76.6367 18.2222 77.508 17.0379 80.9544 17.0379H90.1618V16.7628C90.1618 15.1875 89.5649 14.7783 88.0509 14.7783H84.657V12.3574H88.0647C92.037 12.3574 93.5967 13.7736 93.5967 16.9219V19.9316C93.5967 23.5163 92.3344 24.7234 87.9274 24.7234L81.1832 24.7279ZM90.1618 19.1382H81.3273C80.5222 19.1382 80.042 19.4111 80.042 20.3931V21.2386C80.042 22.1046 80.5703 22.4002 81.4416 22.4002H87.8725C89.4734 22.4002 90.1595 22.0365 90.1595 20.1884L90.1618 19.1382Z"
                    fill="white"
                  />
                  <path
                    d="M102.083 24.7268C97.4684 24.7268 96.1144 23.3106 96.1144 19.3848V8.35547H99.5449V12.3494H106.456C111.094 12.3494 112.448 13.7656 112.448 17.7118V19.378C112.448 23.3038 111.094 24.7177 106.456 24.7177L102.083 24.7268ZM109.017 17.8346C109.017 15.6886 108.489 15.2772 106.333 15.2772H99.5358V19.3098C99.5358 21.3397 100.039 21.8422 102.198 21.8422H106.314C108.473 21.8422 109.002 21.3397 109.002 19.2871L109.017 17.8346Z"
                    fill="white"
                  />
                  <path
                    d="M118.346 19.8013V20.3492C118.346 21.854 118.803 22.1268 120.404 22.1268H124.445V24.725H120.421C116.471 24.725 114.932 23.3111 114.932 20.0265V17.1645C114.932 13.5593 116.194 12.3477 120.58 12.3477H126.595C130.153 12.3477 131.142 13.7662 131.142 15.7256V19.8013H118.346ZM127.704 16.0143C127.704 15.1937 127.336 14.9868 126.302 14.9868H120.619C118.897 14.9868 118.346 15.171 118.346 16.9486V17.6101H127.704V16.0143Z"
                    fill="white"
                  />
                  <path
                    d="M139.471 24.7254C134.854 24.7254 133.5 23.3115 133.5 19.3857V17.7217C133.5 13.7733 134.854 12.3594 139.471 12.3594H143.627C148.265 12.3594 149.618 13.7733 149.618 17.7422V19.3834C149.618 23.3091 148.265 24.723 143.627 24.723L139.471 24.7254ZM146.197 17.8354C146.197 15.735 145.648 15.2781 143.169 15.2781H139.931C137.493 15.2781 136.922 15.7327 136.922 17.8354V19.297C136.922 21.3428 137.493 21.852 139.931 21.852H143.166C145.644 21.852 146.195 21.3475 146.195 19.297L146.197 17.8354Z"
                    fill="white"
                  />
                  <path
                    d="M152.812 24.7266C151.964 24.7266 151.642 24.431 151.642 23.6991V21.8282C151.642 21.119 151.964 20.8008 152.812 20.8008H153.94C154.811 20.8008 155.132 21.119 155.132 21.8282V23.6991C155.132 24.431 154.811 24.7266 153.94 24.7266H152.812Z"
                    fill="white"
                  />
                  <path
                    d="M161.519 24.728C157.941 24.728 156.972 23.471 156.972 21.4637V20.2998C156.972 18.2222 157.846 17.0379 161.287 17.0379H170.507V16.7628C170.507 15.1876 169.911 14.7784 168.395 14.7784H164.985V12.3574H168.384C172.356 12.3574 173.921 13.7737 173.921 16.922V19.9316C173.921 23.5164 172.656 24.7234 168.246 24.7234L161.519 24.728ZM170.507 19.1382H161.658C160.853 19.1382 160.368 19.4111 160.368 20.3931V21.2387C160.368 22.1048 160.897 22.4003 161.77 22.4003H168.201C169.802 22.4003 170.489 22.0366 170.489 20.1884L170.507 19.1382Z"
                    fill="white"
                  />
                  <path
                    d="M177.685 11.6369C176.834 11.6369 176.512 11.3164 176.512 10.5868V9.26152C176.512 8.53183 176.834 8.23633 177.685 8.23633H178.808C179.682 8.23633 180.001 8.53183 180.001 9.26152V10.5868C180.001 11.3164 179.682 11.6369 178.808 11.6369H177.685ZM176.512 12.6621H180.006V24.7212H176.512V12.6621Z"
                    fill="white"
                  />
                  <path
                    d="M74.8504 15.5007V19.3809C74.8504 23.3067 73.4965 24.7206 68.8334 24.7206H62.6586C58.0412 24.7206 56.685 23.3067 56.685 19.3809V14.4959C56.685 10.5702 58.0389 9.15625 62.6563 9.15625H66.7409V12.1432H62.8187C60.726 12.1432 60.1498 12.7592 60.1498 14.6436V19.2446C60.1498 21.2904 60.7741 21.745 62.8187 21.745H68.7304C70.6835 21.745 71.3719 21.3131 71.3719 19.1013V15.5007H74.8504Z"
                    fill="white"
                  />
                  <path
                    d="M3.7673 26.7693C5.09602 31.8885 6.29668 32.8523 8.14911 34.3958C5.7501 33.0978 3.1704 30.245 2.37225 26.1782L0.124167 12.5462C-0.271477 8.24989 0.0624202 5.48801 3.37394 3.61719C2.28306 5.48801 1.68616 8.33627 2.00177 11.8233C2.01548 11.8323 2.43629 21.6501 3.7673 26.7693Z"
                    fill="white"
                  />
                  <path
                    d="M12.3709 35.7564C6.5391 34.097 4.41222 25.7795 4.28415 21.9379L3.59806 10.9335C3.38538 4.35497 5.19894 1.24302 11.2159 0.238281C7.62998 1.85676 6.49108 5.03691 6.66717 10.4675L7.16115 25.8226C7.34411 31.2692 8.68656 34.3675 12.3709 35.7564Z"
                    fill="white"
                  />
                  <path
                    d="M44.8522 17.5653V25.3237C44.8522 33.1752 42.1422 36.0075 32.8183 36.0075H20.4686C11.2385 36.0075 8.53069 33.1797 8.53069 25.3237V10.6799C8.53069 2.82845 11.2407 -0.00390625 20.4686 -0.00390625H28.6445V5.97677H19.8512C15.6706 5.97677 14.5203 7.20882 14.5203 10.9982V25.0486C14.5203 29.1607 15.7621 30.0699 19.8512 30.0699H33.47C37.3739 30.0699 38.7506 29.2062 38.7506 24.7758V17.5653H44.8522Z"
                    fill="white"
                  />
                  <path
                    d="M32.5483 18.1242C32.4296 18.4917 32.2563 18.8397 32.0339 19.1561C31.9273 19.2994 31.8112 19.4353 31.6862 19.563C30.1219 21.1966 28.553 22.8318 26.9796 24.4685C26.958 24.4931 26.9305 24.5119 26.8996 24.523C26.8701 24.5364 26.8382 24.5434 26.8058 24.5435C26.7727 24.5433 26.7401 24.5363 26.7098 24.523C26.6795 24.5119 26.6526 24.4931 26.6321 24.4685L21.866 19.7494C21.4881 19.3932 21.1782 18.972 20.9511 18.506C20.9009 18.3946 20.8528 18.2787 20.814 18.1696H22.2754L23.5858 16.5215L25.4382 19.4766L26.0671 18.165H27.11L28.3381 16.5306L30.1104 19.4857L30.6684 18.1423L32.5483 18.1242Z"
                    fill="white"
                  />
                  <path
                    d="M32.7454 16.5961V17.1211C32.718 17.2962 32.6951 17.4734 32.6653 17.6462C32.6355 17.8086 32.595 17.9688 32.5442 18.1258H30.6712L30.1132 19.4898L28.3407 16.5346L27.1058 18.1668H26.0583L25.4294 19.4784L23.577 16.5233L22.2665 18.1713H20.8051C20.596 17.5978 20.5179 16.9851 20.5765 16.3778C20.6355 15.6255 20.9217 14.9084 21.3976 14.3206C21.6492 13.9906 21.9695 13.7183 22.3365 13.5222C22.7035 13.326 23.1086 13.2107 23.5244 13.184C24.1871 13.161 24.8361 13.3747 25.354 13.7864C25.802 14.1175 26.2036 14.5066 26.5477 14.9434L26.6415 15.0593L26.7398 14.9298C27.1569 14.3619 27.6842 13.8827 28.2904 13.5204C29.2349 12.993 30.1749 13.0658 31.0759 13.6409C31.9769 14.216 32.5052 15.1457 32.6768 16.2391L32.7454 16.5961Z"
                    fill="white"
                  />
                  <path
                    d="M30.1164 19.8987C30.0422 19.8987 29.9694 19.8797 29.9049 19.8434C29.8404 19.8072 29.7864 19.755 29.7482 19.6918L28.3051 17.2914L27.4589 18.428C27.4188 18.4809 27.3671 18.5238 27.3076 18.5533C27.2481 18.5829 27.1824 18.5985 27.1159 18.5985H26.3383L25.826 19.6669C25.7928 19.7354 25.7417 19.7938 25.6781 19.836C25.6145 19.8781 25.5407 19.9027 25.4643 19.9068C25.3879 19.911 25.3117 19.8948 25.2439 19.8597C25.1759 19.8247 25.1188 19.7723 25.0782 19.7078L23.5459 17.2756L22.6128 18.4507C22.5729 18.5014 22.5219 18.5423 22.4637 18.5703C22.4053 18.5982 22.3414 18.6126 22.2767 18.6122H20.1772C20.0638 18.6122 19.955 18.5674 19.8748 18.4876C19.7946 18.4079 19.7496 18.2998 19.7496 18.187C19.7496 18.0743 19.7946 17.9662 19.8748 17.8864C19.955 17.8068 20.0638 17.762 20.1772 17.762H22.0777L23.2578 16.2753C23.3001 16.2219 23.3548 16.1794 23.4171 16.1514C23.4794 16.1232 23.5476 16.1105 23.616 16.114C23.6843 16.1176 23.7508 16.1374 23.8098 16.1718C23.8689 16.2063 23.9187 16.2542 23.9553 16.3117L25.3961 18.6008L25.6888 17.9893C25.7238 17.9169 25.7786 17.856 25.847 17.8133C25.9154 17.7707 25.9946 17.7482 26.0753 17.7484H26.9078L28.0078 16.2844C28.0496 16.2285 28.1048 16.1838 28.1681 16.1539C28.2316 16.1242 28.3014 16.1104 28.3714 16.1138C28.4415 16.1172 28.5095 16.1376 28.5698 16.1733C28.63 16.209 28.6804 16.2589 28.7168 16.3185L30.0524 18.5371L30.2811 17.9712C30.3132 17.8931 30.368 17.8264 30.4385 17.7795C30.5089 17.7325 30.5918 17.7075 30.6766 17.7075H32.7486C32.862 17.7075 32.9708 17.7522 33.051 17.832C33.1313 17.9116 33.1763 18.0198 33.1763 18.1325C33.1763 18.2452 33.1313 18.3533 33.051 18.4331C32.9708 18.5128 32.862 18.5576 32.7486 18.5576H30.9625L30.5052 19.6441C30.4748 19.717 30.4247 19.7803 30.3606 19.8267C30.2965 19.8733 30.2207 19.9013 30.1415 19.9078L30.1164 19.8987Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_2104_12138">
                    <rect width="180" height="36" fill="white" />
                  </clipPath>
                </defs>
              </svg>
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
                    className={`block text-[20px] font-semibold leading-7 font-poppins ${
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
                    className={`block text-[20px] font-semibold leading-7 font-poppins ${
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
                    className={`block text-[20px] font-semibold leading-7 font-poppins ${
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
                      <div className="text-sm w-full h-[50px] cursor-pointer text-center mt-16 font-bold font-poppins bg-gradient-to-r from-[#06060CCC] to-[#1219538F] px-8 py-3 rounded-lg leading-6 text-white">
                        <span className="">Log in</span>
                      </div>
                    </Link>
                  )}
                  {!isAuthenticated && (
                    <Link to="/signup">
                      <div className="text-sm text-center h-[50px] cursor-pointer font-bold font-poppins mt-5 bg-[#0048FF] px-8 py-3 rounded-lg leading-6 text-white">
                        <span className="">Start Free Trial</span>
                      </div>
                    </Link>
                  )}
                  {isAuthenticated && (
                    <div className="text-[24px] w-full h-[50px] text-left mt-16 font-bold font-poppins py-3 rounded-lg leading-6 mb-5">
                      <span className="">Hi {firstname}</span>
                    </div>
                  )}
                  {isAuthenticated && (
                    <Link to="#">
                      <button onClick={logout}>
                        <span className="text-sm text-center h-[50px] cursor-pointer font-bold font-poppins mt-5 bg-[#0048FF] px-8 py-3 rounded-lg leading-6 text-white">
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
