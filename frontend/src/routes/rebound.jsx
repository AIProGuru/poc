import PrivateRoute from "../components/private-routes/PrivateRoutes";
import ReboundDash from "../components/demo-layout/rebound_dash";
import ReboundStatistics from "../components/demo-layout/rebound_dash/ReboundStatistics";
import ReboundDetailView from "../components/demo-layout/rebound_dash/ReboundDetailView";
import ArIntel from "../components/demo-layout/rebound_dash/ArIntel";
import AIDetail from "../components/demo-layout/rebound_dash/AIDetail";
import RCMGPT from "../components/demo-layout/rebound_dash/RCMGPT";

const AUTH_ROLES = ["demo", "admin", "user", "super-admin"];

const reboundRoutes = [
  {
    path: "",
    element: <PrivateRoute role={AUTH_ROLES} element={ReboundDash} />
  },
  {
    path: ":token",
    element: <PrivateRoute role={AUTH_ROLES} element={ReboundDash} />
  },
  {
    path: "denials",
    element: <PrivateRoute role={AUTH_ROLES} element={ReboundDash} />
  },
  {
    path: "denials/:token",
    element: <PrivateRoute role={AUTH_ROLES} element={ReboundDash} />
  },
  {
    path: "statistics",
    element: <PrivateRoute role={AUTH_ROLES} element={ReboundStatistics} />
  },
  {
    path: "detail/:token",
    element: <PrivateRoute role={AUTH_ROLES} element={ReboundDetailView} />
  },
  {
    path: "artificial-intelligence",
    element: <PrivateRoute role={AUTH_ROLES} element={ArIntel} />
  },
  {
    path: "artificial-intelligence/:token",
    element: <PrivateRoute role={AUTH_ROLES} element={AIDetail} />,
  },
  {
    path: 'rcmgpt',
    element: <PrivateRoute role={AUTH_ROLES} element={RCMGPT} />,
  }
];

export default reboundRoutes;
