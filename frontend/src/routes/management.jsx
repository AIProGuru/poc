import { Suspense, lazy } from "react";
import PrivateRoute from "../components/private-routes/PrivateRoutes";
import { USER_MANAGEMENT_ROLES } from "../utils/roles";

const ReboundDash = lazy(() => import("../components/demo-layout/rebound_dash"));
const suspense = (element) => <Suspense fallback={null}>{element}</Suspense>;

const managementRoutes = [
  {
    path: "",
    element: suspense(<PrivateRoute role={USER_MANAGEMENT_ROLES} element={ReboundDash} />)
  },
  {
    path: "users",
    element: suspense(<PrivateRoute role={USER_MANAGEMENT_ROLES} element={ReboundDash} />)
  },
  {
    path: "users/new",
    element: suspense(<PrivateRoute role={USER_MANAGEMENT_ROLES} element={ReboundDash} />)
  },
];

export default managementRoutes;
