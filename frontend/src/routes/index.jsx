import Demo from "../pages/Demo";
import Home from "../pages/Home";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import reboundRoutes from "./rebound";
import managementRoutes from "./management";
import CalculateSavingsPage from "../pages/CalculageSaving";
import PrivateRoute from "../components/private-routes/PrivateRoutes";
import About from "../pages/About";
import Feature from "../pages/Feature";
import VerifyPage from "../pages/VerifyPage";
import Error404 from "../pages/Error404";
import ForgotPassword from "../pages/ForgotPassword";
import UpdatePassword from "../pages/UpdatePassword";
import Waiting from "../pages/Waiting";
import Contact from "../pages/Contact";
// import gptRoutes from "./gpt";
import NormalChat from "../components/demo-layout/normal_chat";
import Notfound from "../pages/Notfound";
import ResubmittedClaims from "../components/demo-layout/rebound_dash/Resubmitted_claims";
import Privacy from "../pages/Privacy";
import Careers from "../pages/Careers";
import Apply from "../pages/Apply";
import Integrations from "../pages/Integrations";
import WhitePaper from "../pages/WhitePaper";
import Blog from "../pages/Blog";
import BlogDetail from "../components/blog/blog_sub_page/BlogDetail";
import Clients from "../pages/Hospitals";
import Hospitals from "../pages/Hospitals";
import Physicians from "../pages/Physicians";
import RCM from "../pages/RCM";
import PracticeManagement from "../pages/PracticeManagement";
import BillingAgencies from "../pages/BillingAgencies";
import ClientManagement from "../pages/ClientManagement";
import ClientDashboard from "../pages/ClientDashboard";
import Edit_client from "../pages/Client/Edit_client";
import demoRoutes from "./demo";
import AccountSettings from "../pages/AccountSettings";
import { ALL_ROLES, CLIENT_MANAGEMENT_ROLES, USER_MANAGEMENT_ROLES } from "../utils/roles";

const AUTH_ROLES = ALL_ROLES;

const routesConfig = [
  {
    path: "/signin",
    element: <SignIn />,
  },
  // {
  //   path: "*",
  //   element: <Notfound />,
  // },
  {
    path: "/management",
    element: <PrivateRoute role={USER_MANAGEMENT_ROLES} element={Demo} />,
    children: managementRoutes,
  },
  {
    path: "/demo",
    element: <PrivateRoute role={AUTH_ROLES} element={Demo} />,
    children: demoRoutes,
  },
  {
    path: "/rebound",
    element: <PrivateRoute role={AUTH_ROLES} element={Demo} />,
    children: reboundRoutes,
  },
  {
    path: "/pilotcustomer",
    element: <PrivateRoute role={AUTH_ROLES} element={Demo} />,
    children: reboundRoutes,
  },
  {
    path: "/pilotcustomer/resubmitted_claims",
    element: (
      <PrivateRoute role={AUTH_ROLES} element={ResubmittedClaims} />
    ),
    children: reboundRoutes,
  },

  {
    path: "/blog",
    element: <PrivateRoute role={AUTH_ROLES} element={Blog} />,
    children: reboundRoutes,
  },
  {
    path: "/blog/:id",
    element: <PrivateRoute role={AUTH_ROLES} element={BlogDetail} />,
    children: reboundRoutes,
  },

  // {
  //   path: "/rcmgpt",
  //   element: <PrivateRoute role={['demo', 'admin']} element={Demo} />,
  //   children: gptRoutes,
  // },
  {
    path: "/train",
    element: <PrivateRoute role={USER_MANAGEMENT_ROLES} element={NormalChat} />,
  },
  {
    path: "/train",
    element: <PrivateRoute role={USER_MANAGEMENT_ROLES} element={NormalChat} />,
  },
  {
    path: "/clientmanagement",
    element: <PrivateRoute role={CLIENT_MANAGEMENT_ROLES} element={ClientManagement} />,
  },
  {
    path: "/client/:clientId",
    element: <PrivateRoute role={CLIENT_MANAGEMENT_ROLES} element={ClientDashboard} />,
  },
  {
    path: "/client/:id/edit",
    element: <PrivateRoute role={CLIENT_MANAGEMENT_ROLES} element={Edit_client} />,
  },
  {
    // path: "/home",
    path: "/",
    element: <Home />
    // element: <PrivateRoute role={AUTH_ROLES} element={Home} />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/contact",
    element: <Contact />
    // element: <PrivateRoute role={AUTH_ROLES} element={Contact} />,
  },
  {
    path: "/careers",
    element: <PrivateRoute role={AUTH_ROLES} element={Careers} />,
  },
  {
    path: "/clients/hospitals-and-health-systems",
    element: <PrivateRoute role={AUTH_ROLES} element={Hospitals} />,
  },
  {
    path: "/clients/physician-practices-and-providers",
    element: <PrivateRoute role={AUTH_ROLES} element={Physicians} />,
  },
  {
    path: "/clients/revenue-cycle-management-rcm-vendors",
    element: <PrivateRoute role={AUTH_ROLES} element={RCM} />,
  },
  {
    path: "/clients/practice-management-systems-and-ehr-vendors",
    element: <PrivateRoute role={AUTH_ROLES} element={PracticeManagement} />,
  },
  {
    path: "/clients/billing-agencies-msos-and-tpas",
    element: <PrivateRoute role={AUTH_ROLES} element={BillingAgencies} />,
  },
  {
    path: "/whitepaper",
    element: <PrivateRoute role={AUTH_ROLES} element={WhitePaper} />,
  },
  {
    path: "/apply/:token",
    element: <PrivateRoute role={AUTH_ROLES} element={Apply} />,
  },
  {
    path: "/privacy",
    element: <PrivateRoute role={AUTH_ROLES} element={Privacy} />,
  },
  {
    path: "/integrations",
    element: <PrivateRoute role={AUTH_ROLES} element={Integrations} />,
  },
  {
    path: "/signin",
    element: <SignIn />,
  },
  {
    path: "/features",
    element: <PrivateRoute role={AUTH_ROLES} element={Feature} />,
  },
  {
    path: "/about",
    element: <PrivateRoute role={AUTH_ROLES} element={About} />,
  },
  {
    path: "/calculate_savings",
    element: <PrivateRoute role={AUTH_ROLES} element={CalculateSavingsPage} />,
  },
  {
    path: "/verify_email",
    element: <PrivateRoute role={AUTH_ROLES} element={VerifyPage} />,
  },
  {
    path: "/update_password",
    element: <PrivateRoute role={AUTH_ROLES} element={UpdatePassword} />,
  },
  {
    path: "error-404",
    element: <PrivateRoute role={AUTH_ROLES} element={Error404} />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/waiting",
    element: <PrivateRoute role={AUTH_ROLES} element={Waiting} />,
  },

  {
    path: "/verify_error",
    element: <Error404 message={"Verify error"} />,
  },
  {
    path: "/account-settings",
    element: <PrivateRoute role={AUTH_ROLES} element={AccountSettings} />,
  },
  {
    path: "*",
    element: <PrivateRoute role={AUTH_ROLES} element={Notfound} />,
  },
];

export default routesConfig;
