import PrivateRoute from "../components/private-routes/PrivateRoutes";
import ReboundDash from "../components/demo-layout/rebound_dash";
import ReboundStatistics from "../components/demo-layout/rebound_dash/ReboundStatistics";
import ReboundDetailView from "../components/demo-layout/rebound_dash/ReboundDetailView";
import ArIntel from "../components/demo-layout/rebound_dash/ArIntel";
import AIDetail from "../components/demo-layout/rebound_dash/AIDetail";
import RCMGPT from "../components/demo-layout/rebound_dash/RCMGPT";

const reboundRoutes = [
  {
    path: "",
    element: <PrivateRoute role={['demo', 'admin']} element={ReboundDash} />
  },
  {
    path: ":token",
    element: <PrivateRoute role={['demo', 'admin']} element={ReboundDash} />
  },
  {
    path: "statistics",
    element: <PrivateRoute role={['demo', 'admin']} element={ReboundStatistics} />
  },
  {
    path: "detail/:token",
    element: <PrivateRoute role={['demo', 'admin']} element={ReboundDetailView} />
  },
  {
    path: "artificial-intelligence",
    element: <PrivateRoute role={['demo', 'admin']} element={ArIntel} />
  },
  {
    path: "artificial-intelligence/:token",
    element: <PrivateRoute role={['demo', 'admin']} element={AIDetail} />,
  },
  {
    path: 'rcmgpt',
    element: <PrivateRoute role={['demo', 'admin']} element={RCMGPT} />,
  }
];

export default reboundRoutes;