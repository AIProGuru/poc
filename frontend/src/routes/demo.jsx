import { Suspense, lazy } from "react";
import PrivateRoute from "../components/private-routes/PrivateRoutes";
import { ALL_ROLES } from "../utils/roles";

const DemoDash = lazy(() => import("../demo/DemoDash"));
const DetailView = lazy(() => import("../demo/DetailView"));

const AUTH_ROLES = ALL_ROLES;
const suspense = (element) => <Suspense fallback={null}>{element}</Suspense>;

const demoRoutes = [
  {
    path: "",
    element: suspense(<DemoDash />)
  },
  {
    path: "detail/:token",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={DetailView} />)
  },
];

export default demoRoutes;
