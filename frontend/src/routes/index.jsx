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
    element: <PrivateRoute role={["admin"]} element={Demo} />,
    children: managementRoutes,
  },
  {
    path: "/demo",
    element: <PrivateRoute role={["demo", "admin"]} element={Demo} />,
    children: demoRoutes,
  },
  {
    path: "/rebound",
    element: <PrivateRoute role={["demo", "admin"]} element={Demo} />,
    children: reboundRoutes,
  },
  {
    path: "/medevolve",
    element: <PrivateRoute role={["demo", "admin"]} element={Demo} />,
    children: reboundRoutes,
  },
  {
    path: "/medevolve/resubmitted_claims",
    element: (
      <PrivateRoute role={["demo", "admin"]} element={ResubmittedClaims} />
    ),
    children: reboundRoutes,
  },

  {
    path: "/blog",
    element: <PrivateRoute role={["demo", "admin"]} element={Blog} />,
    children: reboundRoutes,
  },
  {
    path: "/blog/:id",
    element: <PrivateRoute role={["demo", "admin"]} element={BlogDetail} />,
    children: reboundRoutes,
  },

  // {
  //   path: "/rcmgpt",
  //   element: <PrivateRoute role={['demo', 'admin']} element={Demo} />,
  //   children: gptRoutes,
  // },
  {
    path: "/train",
    element: <PrivateRoute role={["admin"]} element={NormalChat} />,
  },
  {
    path: "/train",
    element: <PrivateRoute role={["admin"]} element={NormalChat} />,
  },
  {
    path: "/clientmanagement",
    element: <PrivateRoute role={["demo", "admin"]} element={ClientManagement} />,
  },
  {
    path: "/client/:clientId",
    element: <PrivateRoute role={["demo", "admin"]} element={ClientDashboard} />,
  },
  {
    path: "/client/:id/edit",
    element: <PrivateRoute role={["demo", "admin"]} element={Edit_client} />,
  },
  {
    // path: "/home",
    path: "/",
    element: <Home />
    // element: <PrivateRoute role={["demo", "admin"]} element={Home} />,
  },
  {
    path: "/signup",
    element: <PrivateRoute role={["demo", "admin"]} element={SignUp} />,
  },
  {
    path: "/contact",
    element: <Contact />
    // element: <PrivateRoute role={["demo", "admin"]} element={Contact} />,
  },
  {
    path: "/careers",
    element: <PrivateRoute role={["demo", "admin"]} element={Careers} />,
  },
  {
    path: "/clients/hospitals-and-health-systems",
    element: <PrivateRoute role={["demo", "admin"]} element={Hospitals} />,
  },
  {
    path: "/clients/physician-practices-and-providers",
    element: <PrivateRoute role={["demo", "admin"]} element={Physicians} />,
  },
  {
    path: "/clients/revenue-cycle-management-rcm-vendors",
    element: <PrivateRoute role={["demo", "admin"]} element={RCM} />,
  },
  {
    path: "/clients/practice-management-systems-and-ehr-vendors",
    element: <PrivateRoute role={["demo", "admin"]} element={PracticeManagement} />,
  },
  {
    path: "/clients/billing-agencies-msos-and-tpas",
    element: <PrivateRoute role={["demo", "admin"]} element={BillingAgencies} />,
  },
  {
    path: "/whitepaper",
    element: <PrivateRoute role={["demo", "admin"]} element={WhitePaper} />,
  },
  {
    path: "/apply/:token",
    element: <PrivateRoute role={["demo", "admin"]} element={Apply} />,
  },
  {
    path: "/privacy",
    element: <PrivateRoute role={["demo", "admin"]} element={Privacy} />,
  },
  {
    path: "/integrations",
    element: <PrivateRoute role={["demo", "admin"]} element={Integrations} />,
  },
  {
    path: "/signin",
    element: <SignIn />,
  },
  {
    path: "/features",
    element: <PrivateRoute role={["demo", "admin"]} element={Feature} />,
  },
  {
    path: "/about",
    element: <PrivateRoute role={["demo", "admin"]} element={About} />,
  },
  {
    path: "/calculate_savings",
    element: <PrivateRoute role={["demo", "admin"]} element={CalculateSavingsPage} />,
  },
  {
    path: "/verify_email",
    element: <PrivateRoute role={["demo", "admin"]} element={VerifyPage} />,
  },
  {
    path: "/update_password",
    element: <PrivateRoute role={["demo", "admin"]} element={UpdatePassword} />,
  },
  {
    path: "error-404",
    element: <PrivateRoute role={["demo", "admin"]} element={Error404} />,
  },
  {
    path: "/forgot-password",
    element: <PrivateRoute role={["demo", "admin"]} element={ForgotPassword} />,
  },
  {
    path: "/waiting",
    element: <PrivateRoute role={["demo", "admin"]} element={Waiting} />,
  },

  {
    path: "/verify_error",
    element: <Error404 message={"Verify error"} />,
  },
  {
    path: "*",
    element: <PrivateRoute role={["demo", "admin"]} element={Notfound} />,
  },
];

export default routesConfig;
