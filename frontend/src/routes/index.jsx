import { Suspense, lazy } from "react";
import reboundRoutes from "./rebound";
import managementRoutes from "./management";
import profileRoutes from "./profile";
import PrivateRoute from "../components/private-routes/PrivateRoutes";
import demoRoutes from "./demo";
import { ALL_ROLES, USER_MANAGEMENT_ROLES } from "../utils/roles";

const Demo = lazy(() => import("../pages/Demo"));
const Home = lazy(() => import("../pages/Home"));
const SignIn = lazy(() => import("../pages/SignIn"));
const SignUp = lazy(() => import("../pages/SignUp"));
const CalculateSavingsPage = lazy(() => import("../pages/CalculageSaving"));
const About = lazy(() => import("../pages/About"));
const Feature = lazy(() => import("../pages/Feature"));
const VerifyPage = lazy(() => import("../pages/VerifyPage"));
const Error404 = lazy(() => import("../pages/Error404"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const UpdatePassword = lazy(() => import("../pages/UpdatePassword"));
const Waiting = lazy(() => import("../pages/Waiting"));
const Contact = lazy(() => import("../pages/Contact"));
const NormalChat = lazy(() => import("../components/demo-layout/normal_chat"));
const Notfound = lazy(() => import("../pages/Notfound"));
const ResubmittedClaims = lazy(() => import("../components/demo-layout/rebound_dash/Resubmitted_claims"));
const Privacy = lazy(() => import("../pages/Privacy"));
const Careers = lazy(() => import("../pages/Careers"));
const Apply = lazy(() => import("../pages/Apply"));
const Integrations = lazy(() => import("../pages/Integrations"));
const WhitePaper = lazy(() => import("../pages/WhitePaper"));
const Blog = lazy(() => import("../pages/Blog"));
const BlogDetail = lazy(() => import("../components/blog/blog_sub_page/BlogDetail"));
const Hospitals = lazy(() => import("../pages/Hospitals"));
const Physicians = lazy(() => import("../pages/Physicians"));
const RCM = lazy(() => import("../pages/RCM"));
const PracticeManagement = lazy(() => import("../pages/PracticeManagement"));
const BillingAgencies = lazy(() => import("../pages/BillingAgencies"));

const AUTH_ROLES = ALL_ROLES;
const suspense = (element) => <Suspense fallback={null}>{element}</Suspense>;

const routesConfig = [
  {
    path: "/signin",
    element: suspense(<SignIn />),
  },
  // {
  //   path: "*",
  //   element: <Notfound />,
  // },
  {
    path: "/management",
    element: suspense(<PrivateRoute role={USER_MANAGEMENT_ROLES} element={Demo} />),
    children: managementRoutes,
  },
  {
    path: "/demo",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={Demo} />),
    children: demoRoutes,
  },
  {
    path: "/rebound",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={Demo} />),
    children: reboundRoutes,
  },
  {
    path: "/pilotcustomer",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={Demo} />),
    children: reboundRoutes,
  },
  {
    path: "/betacustomer",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={Demo} />),
    children: reboundRoutes,
  },
  {
    path: "/pilotcustomer/resubmitted_claims",
    element: suspense(
      <PrivateRoute role={AUTH_ROLES} element={ResubmittedClaims} />
    ),
    children: reboundRoutes,
  },
  {
    path: "/betacustomer/resubmitted_claims",
    element: suspense(
      <PrivateRoute role={AUTH_ROLES} element={ResubmittedClaims} />
    ),
    children: reboundRoutes,
  },

  {
    path: "/blog",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={Blog} />),
    children: reboundRoutes,
  },
  {
    path: "/blog/:id",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={BlogDetail} />),
    children: reboundRoutes,
  },

  // {
  //   path: "/rcmgpt",
  //   element: <PrivateRoute role={['demo', 'admin']} element={Demo} />,
  //   children: gptRoutes,
  // },
  {
    path: "/train",
    element: suspense(<PrivateRoute role={USER_MANAGEMENT_ROLES} element={NormalChat} />),
  },
  {
    path: "/train",
    element: suspense(<PrivateRoute role={USER_MANAGEMENT_ROLES} element={NormalChat} />),
  },
  {
    // path: "/home",
    path: "/",
    element: suspense(<Home />)
    // element: <PrivateRoute role={AUTH_ROLES} element={Home} />,
  },
  {
    path: "/signup",
    element: suspense(<SignUp />),
  },
  {
    path: "/contact",
    element: suspense(<Contact />)
    // element: <PrivateRoute role={AUTH_ROLES} element={Contact} />,
  },
  {
    path: "/careers",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={Careers} />),
  },
  {
    path: "/clients/hospitals-and-health-systems",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={Hospitals} />),
  },
  {
    path: "/clients/physician-practices-and-providers",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={Physicians} />),
  },
  {
    path: "/clients/revenue-cycle-management-rcm-vendors",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={RCM} />),
  },
  {
    path: "/clients/practice-management-systems-and-ehr-vendors",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={PracticeManagement} />),
  },
  {
    path: "/clients/billing-agencies-msos-and-tpas",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={BillingAgencies} />),
  },
  {
    path: "/whitepaper",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={WhitePaper} />),
  },
  {
    path: "/apply/:token",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={Apply} />),
  },
  {
    path: "/privacy",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={Privacy} />),
  },
  {
    path: "/integrations",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={Integrations} />),
  },
  {
    path: "/signin",
    element: suspense(<SignIn />),
  },
  {
    path: "/features",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={Feature} />),
  },
  {
    path: "/about",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={About} />),
  },
  {
    path: "/calculate_savings",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={CalculateSavingsPage} />),
  },
  {
    path: "/verify_email",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={VerifyPage} />),
  },
  {
    path: "/update_password",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={UpdatePassword} />),
  },
  {
    path: "error-404",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={Error404} />),
  },
  {
    path: "/forgot-password",
    element: suspense(<ForgotPassword />),
  },
  {
    path: "/waiting",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={Waiting} />),
  },

  {
    path: "/verify_error",
    element: suspense(<Error404 message={"Verify error"} />),
  },
  ...profileRoutes,
  {
    path: "*",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={Notfound} />),
  },
];

export default routesConfig;
