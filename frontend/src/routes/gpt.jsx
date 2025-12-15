import PrivateRoute from "../components/private-routes/PrivateRoutes";
import RCMGPT from "../components/demo-layout/rebound_dash/GPT";

const AUTH_ROLES = ["demo", "admin", "user", "super-admin"];

const gptRoutes = [
  {
    path: "",
    element: <PrivateRoute role={AUTH_ROLES} element={RCMGPT} />
  },
];

export default gptRoutes;
