import PrivateRoute from "../components/private-routes/PrivateRoutes";
import ReboundDash from "../components/demo-layout/rebound_dash";
import ReboundStatistics from "../components/demo-layout/rebound_dash/ReboundStatistics";
import ReboundDetailView from "../components/demo-layout/rebound_dash/ReboundDetailView";
import ArIntel from "../components/demo-layout/rebound_dash/ArIntel";
import AIDetail from "../components/demo-layout/rebound_dash/AIDetail";
import RCMGPT from "../components/demo-layout/rebound_dash/RCMGPT";
import DemoDash from "../demo/DemoDash";
import DetailView from "../demo/DetailView";

const AUTH_ROLES = ["demo", "admin", "user", "super-admin"];

const demoRoutes = [
  {
    path: "",
    element: <DemoDash />
  },
  {
    path: "detail/:token",
    element: <PrivateRoute role={AUTH_ROLES} element={DetailView} />
  },
];

export default demoRoutes;
