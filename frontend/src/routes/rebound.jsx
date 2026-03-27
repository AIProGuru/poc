import { Suspense, lazy } from "react";
import PrivateRoute from "../components/private-routes/PrivateRoutes";
import { ALL_ROLES } from "../utils/roles";

const ReboundDash = lazy(() => import("../components/demo-layout/rebound_dash"));
const ReboundStatistics = lazy(() => import("../components/demo-layout/rebound_dash/ReboundStatistics"));
const ReboundDetailView = lazy(() => import("../components/demo-layout/rebound_dash/ReboundDetailView"));
const ArIntel = lazy(() => import("../components/demo-layout/rebound_dash/ArIntel"));
const AIDetail = lazy(() => import("../components/demo-layout/rebound_dash/AIDetail"));

const AUTH_ROLES = ALL_ROLES;
const suspense = (element) => <Suspense fallback={null}>{element}</Suspense>;

const reboundRoutes = [
  {
    path: "",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={ReboundDash} />)
  },
  {
    path: ":token",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={ReboundDash} />)
  },
  {
    path: "denials",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={ReboundDash} />)
  },
  {
    path: "denials/:token",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={ReboundDash} />)
  },
  {
    path: "statistics",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={ReboundStatistics} />)
  },
  {
    path: "detail/:token",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={ReboundDetailView} />)
  },
  {
    path: "artificial-intelligence",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={ArIntel} />)
  },
  {
    path: "artificial-intelligence/:token",
    element: suspense(<PrivateRoute role={AUTH_ROLES} element={AIDetail} />),
  },
];

export default reboundRoutes;
