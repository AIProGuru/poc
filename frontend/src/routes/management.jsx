import PrivateRoute from "../components/private-routes/PrivateRoutes";
import ReboundDash from "../components/demo-layout/rebound_dash";
import { USER_MANAGEMENT_ROLES } from "../utils/roles";

const managementRoutes = [
  {
    path: "",
    element: <PrivateRoute role={USER_MANAGEMENT_ROLES} element={ReboundDash} />
  },
  {
    path: "users",
    element: <PrivateRoute role={USER_MANAGEMENT_ROLES} element={ReboundDash} />
  },
  {
    path: "users/new",
    element: <PrivateRoute role={USER_MANAGEMENT_ROLES} element={ReboundDash} />
  },
];

export default managementRoutes;
