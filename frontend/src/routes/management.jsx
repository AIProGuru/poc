import PrivateRoute from "../components/private-routes/PrivateRoutes";
import ReboundDash from "../components/demo-layout/rebound_dash";

const managementRoutes = [
  {
    path: "",
    element: <PrivateRoute role={['admin']} element={ReboundDash} />
  },
];

export default managementRoutes;
