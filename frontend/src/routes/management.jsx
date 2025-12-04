import PrivateRoute from "../components/private-routes/PrivateRoutes";
import UserManagement from "../components/demo-layout/rebound_dash/UserManagement";

const managementRoutes = [
  {
    path: "",
    element: <PrivateRoute role={['admin']} element={UserManagement} />
  },
];

export default managementRoutes;